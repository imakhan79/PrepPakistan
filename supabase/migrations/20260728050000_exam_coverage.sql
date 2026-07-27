-- Seed real named Pakistani exams as subjects under each exam category.
-- Attributed to the earliest existing staff account (admin/teacher/
-- institute_admin) since subjects.created_by is required.

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('MDCAT', 'Medical & Dental College Admission Test — the national entry test for MBBS/BDS programs.', '🩺'),
  ('NUMS', 'National University of Medical Sciences entry test for medical and allied health programs.', '🏥'),
  ('ECAT', 'Engineering College Admission Test — required for engineering admissions in Punjab.', '⚙️'),
  ('NUST NET', 'NUST Entry Test for undergraduate admissions across engineering, business, and sciences.', '🎓'),
  ('FAST', 'FAST-NU entry test (NU Test) for BS programs in computing, engineering, and business.', '💻'),
  ('COMSATS', 'COMSATS University entry test (NTS-based) for undergraduate admissions.', '🎓'),
  ('UET', 'University of Engineering & Technology entry test for engineering programs.', '🏗️'),
  ('NED', 'NED University of Engineering & Technology entry test.', '⚙️'),
  ('GIKI', 'Ghulam Ishaq Khan Institute entry test for engineering and computer science.', '💡'),
  ('PIEAS', 'Pakistan Institute of Engineering & Applied Sciences entry test.', '⚛️'),
  ('IBA', 'Institute of Business Administration Karachi aptitude test (IBA-AT) for admissions.', '📊'),
  ('LUMS', 'LUMS Common Admission Test (LCAT) for undergraduate admissions.', '🎓')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'university_admission') c;

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('CSS', 'Central Superior Services exam — Pakistan''s premier civil service recruitment exam conducted by FPSC.', '🏛️'),
  ('PMS', 'Provincial Management Service exam for provincial civil service positions.', '🏛️')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'government') c;

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('FPSC', 'Federal Public Service Commission recruitment tests for federal government posts.', '🏛️'),
  ('PPSC', 'Punjab Public Service Commission recruitment tests.', '🏛️'),
  ('KPPSC', 'Khyber Pakhtunkhwa Public Service Commission recruitment tests.', '🏛️'),
  ('SPSC', 'Sindh Public Service Commission recruitment tests.', '🏛️'),
  ('BPSC', 'Balochistan Public Service Commission recruitment tests.', '🏛️'),
  ('NTS', 'National Testing Service — general and subject-specific tests (NAT/GAT) used across public and private recruitment.', '📝'),
  ('STS', 'Sindh Testing Service recruitment tests for Sindh government positions.', '📝'),
  ('ETEA', 'Educational Testing & Evaluation Agency — KP''s recruitment and admission testing body.', '📝'),
  ('Teaching License Test', 'Provincial teaching license/certification exam required to teach in public schools.', '🍎'),
  ('PST', 'Primary School Teacher recruitment exam.', '🍎'),
  ('JEST', 'Junior Elementary School Teacher recruitment exam.', '🍎'),
  ('EST', 'Elementary School Teacher recruitment exam.', '🍎'),
  ('SST', 'Secondary School Teacher recruitment exam.', '🍎'),
  ('HST', 'Higher Secondary Teacher recruitment exam.', '🍎')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'recruitment') c;

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('ISSB', 'Inter-Services Selection Board assessment for commissioned officer candidates.', '🪖'),
  ('PMA', 'Pakistan Military Academy Long Course entry exam.', '🪖'),
  ('Army', 'Pakistan Army entry tests for various commissioning schemes.', '🪖'),
  ('Navy', 'Pakistan Navy entry tests for cadet and officer recruitment.', '⚓'),
  ('Air Force', 'Pakistan Air Force entry tests for cadet and officer recruitment.', '✈️'),
  ('Police', 'Provincial police recruitment and promotion exams.', '👮'),
  ('ASF', 'Airport Security Force recruitment tests.', '🛂'),
  ('FIA', 'Federal Investigation Agency recruitment tests.', '🕵️')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'military') c;

insert into subjects (title, description, icon, color, category_id, institute_id, created_by)
select v.title, v.description, v.icon, c.color, c.id, null,
  (select id from profiles where role in ('admin', 'teacher', 'institute_admin') order by created_at asc limit 1)
from (values
  ('ACCA', 'Association of Chartered Certified Accountants professional qualification exams.', '💼'),
  ('CA', 'Chartered Accountancy exams conducted by ICAP.', '📈'),
  ('CFA', 'Chartered Financial Analyst exams (Levels I-III).', '📉'),
  ('IELTS', 'International English Language Testing System — for study, work, and migration abroad.', '🌍'),
  ('TOEFL', 'Test of English as a Foreign Language — for university admissions abroad.', '🌍')
) as v(title, description, icon)
cross join (select id, color from exam_categories where key = 'professional') c;
