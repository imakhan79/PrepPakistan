-- Leaderboard: security-definer aggregate so students can see ranked
-- standings without RLS exposing each other's raw quiz_attempts rows.

create function public.leaderboard()
returns table (
  student_id uuid,
  full_name text,
  avatar_url text,
  total_score bigint,
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
    coalesce(round(avg(case when a.total > 0 then (a.score::numeric / a.total) * 100 end)), 0) as avg_pct
  from profiles p
  left join quiz_attempts a on a.student_id = p.id
  where p.role = 'student'
  group by p.id, p.full_name, p.avatar_url
  having count(a.id) > 0
  order by total_score desc, avg_pct desc
  limit 50;
$$;

grant execute on function public.leaderboard() to authenticated;
