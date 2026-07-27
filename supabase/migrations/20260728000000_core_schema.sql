-- PrepPakistan core schema: profiles, subjects, content, quizzes, attempts

create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'student')) default 'student',
  avatar_url text,
  grade_level text,
  created_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  color text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table lectures (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  title text not null,
  video_url text not null,
  duration_minutes int,
  description text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  front text not null,
  back text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  title text not null,
  type text not null check (type in ('quiz', 'mock_exam')) default 'quiz',
  duration_minutes int not null default 15,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text,
  order_index int not null default 0
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  answers jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index quiz_attempts_student_idx on quiz_attempts(student_id);
create index questions_quiz_idx on questions(quiz_id);
create index notes_subject_idx on notes(subject_id);
create index lectures_subject_idx on lectures(subject_id);
create index flashcards_subject_idx on flashcards(subject_id);
create index quizzes_subject_idx on quizzes(subject_id);

-- Row Level Security

alter table profiles enable row level security;
alter table subjects enable row level security;
alter table notes enable row level security;
alter table lectures enable row level security;
alter table flashcards enable row level security;
alter table quizzes enable row level security;
alter table questions enable row level security;
alter table quiz_attempts enable row level security;

create function is_admin(uid uuid) returns boolean as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$ language sql security definer stable;

-- profiles
create policy "profiles are viewable by everyone signed in"
  on profiles for select using (auth.uid() is not null);
create policy "users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- subjects (admins manage, everyone reads)
create policy "subjects readable by all signed in"
  on subjects for select using (auth.uid() is not null);
create policy "admins manage subjects"
  on subjects for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- notes
create policy "notes readable by all signed in"
  on notes for select using (auth.uid() is not null);
create policy "admins manage notes"
  on notes for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- lectures
create policy "lectures readable by all signed in"
  on lectures for select using (auth.uid() is not null);
create policy "admins manage lectures"
  on lectures for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- flashcards
create policy "flashcards readable by all signed in"
  on flashcards for select using (auth.uid() is not null);
create policy "admins manage flashcards"
  on flashcards for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- quizzes
create policy "quizzes readable by all signed in"
  on quizzes for select using (auth.uid() is not null);
create policy "admins manage quizzes"
  on quizzes for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- questions (readable by all signed in; correct answers only meaningfully hidden client-side during attempt)
create policy "questions readable by all signed in"
  on questions for select using (auth.uid() is not null);
create policy "admins manage questions"
  on questions for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- quiz_attempts (students manage their own; admins can read all)
create policy "students manage own attempts"
  on quiz_attempts for all using (auth.uid() = student_id) with check (auth.uid() = student_id);
create policy "admins read all attempts"
  on quiz_attempts for select using (is_admin(auth.uid()));
