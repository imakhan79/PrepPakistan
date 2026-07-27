-- Require student approval before a parent link grants data access.

alter table parent_links add column status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

-- Replace the blanket "parents manage own links" policy with narrower
-- ones: parents can create/view/withdraw requests, but only the
-- linked student can approve or reject them.
drop policy "parents manage own links" on parent_links;

create policy "parents create link requests"
  on parent_links for insert with check (parent_id = auth.uid());
create policy "parents view own link requests"
  on parent_links for select using (parent_id = auth.uid());
create policy "parents withdraw own link requests"
  on parent_links for delete using (parent_id = auth.uid());
create policy "students respond to link requests"
  on parent_links for update using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Only approved links grant read access to a student's attempts.
drop policy "parents view linked students attempts" on quiz_attempts;
create policy "parents view linked students attempts"
  on quiz_attempts for select using (
    exists (
      select 1 from parent_links pl
      where pl.parent_id = auth.uid() and pl.student_id = quiz_attempts.student_id and pl.status = 'approved'
    )
  );
