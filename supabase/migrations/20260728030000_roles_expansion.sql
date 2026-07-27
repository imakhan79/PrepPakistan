-- Expand roles: teacher, parent, institute_admin. Adds institutes
-- (multi-tenant orgs), parent-student links, and institute-scoped
-- subject visibility.

alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'teacher', 'parent', 'student', 'institute_admin'));

create table institutes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table profiles add column institute_id uuid references institutes(id);
alter table subjects add column institute_id uuid references institutes(id);

create index profiles_institute_idx on profiles(institute_id);
create index subjects_institute_idx on subjects(institute_id);

create table parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id)
);

create index parent_links_parent_idx on parent_links(parent_id);
create index parent_links_student_idx on parent_links(student_id);

alter table institutes enable row level security;
alter table parent_links enable row level security;

-- Staff = platform admin, teacher, or institute admin (content management rights)
create function is_staff(uid uuid) returns boolean as $$
  select exists (select 1 from profiles where id = uid and role in ('admin', 'teacher', 'institute_admin'));
$$ language sql security definer stable;

-- A subject is visible if it's global (no institute), belongs to the
-- viewer's own institute, or the viewer is a platform admin.
create function subject_visible(sid uuid) returns boolean as $$
  select exists (
    select 1 from subjects s
    where s.id = sid
    and (
      s.institute_id is null
      or s.institute_id = (select institute_id from profiles where id = auth.uid())
      or is_admin(auth.uid())
    )
  );
$$ language sql security definer stable;

-- institutes
create policy "institutes readable by all signed in"
  on institutes for select using (auth.uid() is not null);
create policy "authenticated users can create an institute"
  on institutes for insert with check (auth.uid() is not null);
create policy "institute owners and admins manage institutes"
  on institutes for update using (created_by = auth.uid() or is_admin(auth.uid()));
create policy "institute owners and admins delete institutes"
  on institutes for delete using (created_by = auth.uid() or is_admin(auth.uid()));

-- parent_links
create policy "parents manage own links"
  on parent_links for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());
create policy "linked students can view their links"
  on parent_links for select using (student_id = auth.uid());
create policy "admins read all parent links"
  on parent_links for select using (is_admin(auth.uid()));

-- subjects: replace admin-only visibility/management with institute-aware staff rules
drop policy "subjects readable by all signed in" on subjects;
drop policy "admins manage subjects" on subjects;

create policy "subjects readable within scope"
  on subjects for select using (
    auth.uid() is not null and (
      institute_id is null or institute_id = (select institute_id from profiles where id = auth.uid()) or is_admin(auth.uid())
    )
  );
create policy "staff manage subjects in scope"
  on subjects for all using (
    is_staff(auth.uid()) and (
      institute_id is null or institute_id = (select institute_id from profiles where id = auth.uid()) or is_admin(auth.uid())
    )
  ) with check (
    is_staff(auth.uid()) and (
      institute_id is null or institute_id = (select institute_id from profiles where id = auth.uid()) or is_admin(auth.uid())
    )
  );

-- notes/lectures/flashcards/quizzes: follow parent subject's visibility
drop policy "notes readable by all signed in" on notes;
drop policy "admins manage notes" on notes;
create policy "notes readable within subject scope"
  on notes for select using (auth.uid() is not null and subject_visible(subject_id));
create policy "staff manage notes in scope"
  on notes for all using (is_staff(auth.uid()) and subject_visible(subject_id))
  with check (is_staff(auth.uid()) and subject_visible(subject_id));

drop policy "lectures readable by all signed in" on lectures;
drop policy "admins manage lectures" on lectures;
create policy "lectures readable within subject scope"
  on lectures for select using (auth.uid() is not null and subject_visible(subject_id));
create policy "staff manage lectures in scope"
  on lectures for all using (is_staff(auth.uid()) and subject_visible(subject_id))
  with check (is_staff(auth.uid()) and subject_visible(subject_id));

drop policy "flashcards readable by all signed in" on flashcards;
drop policy "admins manage flashcards" on flashcards;
create policy "flashcards readable within subject scope"
  on flashcards for select using (auth.uid() is not null and subject_visible(subject_id));
create policy "staff manage flashcards in scope"
  on flashcards for all using (is_staff(auth.uid()) and subject_visible(subject_id))
  with check (is_staff(auth.uid()) and subject_visible(subject_id));

drop policy "quizzes readable by all signed in" on quizzes;
drop policy "admins manage quizzes" on quizzes;
create policy "quizzes readable within subject scope"
  on quizzes for select using (auth.uid() is not null and subject_visible(subject_id));
create policy "staff manage quizzes in scope"
  on quizzes for all using (is_staff(auth.uid()) and subject_visible(subject_id))
  with check (is_staff(auth.uid()) and subject_visible(subject_id));

-- questions: follow the quiz's subject visibility
drop policy "questions readable by all signed in" on questions;
drop policy "admins manage questions" on questions;
create policy "questions readable within quiz scope"
  on questions for select using (
    auth.uid() is not null and subject_visible((select subject_id from quizzes where id = questions.quiz_id))
  );
create policy "staff manage questions in scope"
  on questions for all using (
    is_staff(auth.uid()) and subject_visible((select subject_id from quizzes where id = questions.quiz_id))
  ) with check (
    is_staff(auth.uid()) and subject_visible((select subject_id from quizzes where id = questions.quiz_id))
  );

-- quiz_attempts: allow linked parents to view their child's attempts
create policy "parents view linked students attempts"
  on quiz_attempts for select using (
    exists (select 1 from parent_links pl where pl.parent_id = auth.uid() and pl.student_id = quiz_attempts.student_id)
  );
