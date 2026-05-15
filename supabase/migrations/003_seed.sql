-- ============================================================
-- SEED: Demo college
-- ============================================================
insert into colleges (id, name, city, state)
values (
  '00000000-0000-0000-0000-000000000001',
  'Zeal Demo University',
  'Chennai',
  'Tamil Nadu'
);

-- NOTE: Auth users are created via Supabase dashboard or API.
-- After creating auth users, run:
--
--   insert into profiles (id, full_name, email, college_id, department, year_of_study)
--   values ('<auth-user-uuid>', 'Demo Student', 'student@demo.com', '00000000-0000-0000-0000-000000000001', 'Computer Science', 2);
--
--   insert into user_roles (user_id, role) values ('<auth-user-uuid>', 'student');
--
-- Repeat for expert and admin users.
