-- Exam categories: organizes subjects into Pakistan's major exam tracks

create table exam_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text,
  icon text,
  color text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table subjects add column category_id uuid references exam_categories(id);
create index subjects_category_idx on subjects(category_id);

alter table exam_categories enable row level security;

create policy "exam categories readable by all signed in"
  on exam_categories for select using (auth.uid() is not null);
create policy "admins manage exam categories"
  on exam_categories for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

insert into exam_categories (key, title, description, icon, color, order_index) values
  ('academic', 'Academic', 'School & college coursework, from matric to intermediate', '📚', '#18b077', 1),
  ('university_admission', 'University Admission', 'Entry tests — MDCAT, ECAT, NUST NET, and more', '🎓', '#6a47f8', 2),
  ('government', 'Government Services', 'CSS, PMS, and other civil services examinations', '🏛️', '#f59e0b', 3),
  ('military', 'Military & Defence', 'ISSB, cadet college, and armed forces entry tests', '🪖', '#0ea5e9', 4),
  ('professional', 'Professional & Board Exams', 'Medical, engineering, law, and other licensing boards', '💼', '#ec4899', 5),
  ('recruitment', 'Recruitment Tests', 'NTS, PPSC, FPSC, and other public-sector recruitment exams', '📝', '#ef4444', 6);
