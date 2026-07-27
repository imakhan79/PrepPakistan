-- Allow staff to see student performance for analytics dashboards,
-- scoped so a teacher/institute admin can't see arbitrary students'
-- attempts outside their own content or institute.

create policy "staff view institute students attempts"
  on quiz_attempts for select using (
    exists (
      select 1 from profiles staff_p
      join profiles student_p on student_p.id = quiz_attempts.student_id
      where staff_p.id = auth.uid()
        and staff_p.role in ('teacher', 'institute_admin')
        and staff_p.institute_id is not null
        and staff_p.institute_id = student_p.institute_id
    )
  );

create policy "staff view attempts on own quizzes"
  on quiz_attempts for select using (
    exists (select 1 from quizzes q where q.id = quiz_attempts.quiz_id and q.created_by = auth.uid())
  );
