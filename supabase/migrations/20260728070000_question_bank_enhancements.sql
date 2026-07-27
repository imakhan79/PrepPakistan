-- Rich question-bank fields (type, difficulty, Bloom's level, marks,
-- negative marking, topic/chapter/tags) and quiz format taxonomy, to
-- support recruitment-exam-style question banks (e.g. Sindh teacher
-- recruitment: JEST/PST/HST/Subject Specialist/etc.).

alter table quizzes add column format text not null default 'quiz'
  check (format in (
    'quiz', 'full_mock', 'subject_wise', 'chapter_wise', 'topic_wise',
    'daily_quiz', 'weekly_assessment', 'timed_challenge', 'previous_paper', 'custom'
  ));

alter table questions add column question_type text not null default 'single_mcq'
  check (question_type in (
    'single_mcq', 'multiple_mcq', 'true_false', 'assertion_reason',
    'matching', 'fill_blank', 'scenario', 'case_study', 'image_based', 'diagram'
  ));
alter table questions add column difficulty text not null default 'medium'
  check (difficulty in ('easy', 'medium', 'hard'));
alter table questions add column bloom_level text
  check (bloom_level in ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'));
alter table questions add column topic text;
alter table questions add column chapter text;
alter table questions add column tags text[] not null default '{}';
alter table questions add column marks numeric not null default 1;
alter table questions add column negative_marking numeric not null default 0;
alter table questions add column correct_indices int[];
alter table questions add column correct_text text;
alter table questions add column image_url text;
alter table questions add column reference text;
alter table questions add column previous_exam_year text;

-- Scores/totals can now be fractional (marks-weighted, negative marking).
alter table quiz_attempts alter column score type numeric using score::numeric;
alter table quiz_attempts alter column total type numeric using total::numeric;

-- leaderboard() must be redefined since sum(numeric) no longer matches
-- its old bigint return type for total_score.
drop function leaderboard();
create function public.leaderboard()
returns table (
  student_id uuid,
  full_name text,
  avatar_url text,
  total_score numeric,
  total_attempts bigint,
  avg_pct numeric
)
language sql
security definer
stable
as $$
  select
    p.id as student_id,
    p.full_name,
    p.avatar_url,
    coalesce(sum(a.score), 0) as total_score,
    count(a.id) as total_attempts,
    coalesce(round(avg(case when a.total > 0 then (a.score / a.total) * 100 end)), 0) as avg_pct
  from profiles p
  left join quiz_attempts a on a.student_id = p.id
  where p.role = 'student'
  group by p.id, p.full_name, p.avatar_url
  having count(a.id) > 0
  order by total_score desc, avg_pct desc
  limit 50;
$$;

grant execute on function public.leaderboard() to authenticated;
