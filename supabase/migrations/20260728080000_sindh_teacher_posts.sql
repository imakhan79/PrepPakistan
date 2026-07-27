-- Additional Sindh teacher recruitment post categories (SE&LD/STS/SPSC),
-- alongside the Teaching License Test/PST/JEST/EST/SST/HST already seeded.

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('Subject Specialist', 'Sindh subject specialist teacher recruitment exam (secondary/higher secondary level).', '🍎'),
  ('Early Childhood Teacher (ECT)', 'Early Childhood Education teacher recruitment exam.', '🍎'),
  ('College Lecturer', 'Lecturer recruitment exam for Sindh government colleges.', '🎓'),
  ('Education Officer', 'Education Officer recruitment exam (SE&LD).', '🏛️'),
  ('Assistant Education Officer', 'Assistant Education Officer recruitment exam (SE&LD).', '🏛️'),
  ('Headmaster / Headmistress', 'School headmaster/headmistress recruitment and promotion exam.', '🏫')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'recruitment') c
where exists (select 1 from profiles where role in ('admin', 'teacher', 'institute_admin'));
