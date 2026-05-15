-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table colleges enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table experts enable row level security;
alter table assessments enable row level security;
alter table assessment_answers enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
alter table notes enable row level security;

-- ============================================================
-- HELPER: get current user's college_id
-- ============================================================
create or replace function get_my_college_id()
returns uuid
language sql
security definer
stable
as $$
  select college_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- COLLEGES POLICIES
-- ============================================================
create policy "Anyone can read colleges"
  on colleges for select
  using (true);

create policy "Admins can manage colleges"
  on colleges for all
  using (has_role(auth.uid(), 'admin'));

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "Experts can read profiles of their students"
  on profiles for select
  using (
    has_role(auth.uid(), 'expert') and
    exists (
      select 1 from sessions s
      where s.expert_id = auth.uid()
        and s.student_id = profiles.id
    )
  );

create policy "Admins can read profiles in their college"
  on profiles for select
  using (
    has_role(auth.uid(), 'admin') and
    college_id = get_my_college_id()
  );

-- ============================================================
-- USER ROLES POLICIES
-- ============================================================
create policy "Users can read own roles"
  on user_roles for select
  using (user_id = auth.uid());

create policy "Admins can read all roles in college"
  on user_roles for select
  using (has_role(auth.uid(), 'admin'));

create policy "Service role can manage user_roles"
  on user_roles for all
  using (auth.role() = 'service_role');

-- ============================================================
-- EXPERTS POLICIES
-- ============================================================
create policy "Anyone can view active experts"
  on experts for select
  using (is_active = true);

create policy "Expert can update own record"
  on experts for update
  using (user_id = auth.uid());

create policy "Admins can manage experts"
  on experts for all
  using (has_role(auth.uid(), 'admin'));

-- ============================================================
-- ASSESSMENTS POLICIES
-- ============================================================
create policy "Students can view own assessments"
  on assessments for select
  using (student_id = auth.uid());

create policy "Students can insert own assessments"
  on assessments for insert
  with check (student_id = auth.uid());

create policy "Experts can view assessments of assigned students"
  on assessments for select
  using (
    has_role(auth.uid(), 'expert') and
    exists (
      select 1 from sessions s
      where s.expert_id = auth.uid()
        and s.student_id = assessments.student_id
    )
  );

create policy "Admins can view assessments in their college"
  on assessments for select
  using (
    has_role(auth.uid(), 'admin') and
    exists (
      select 1 from profiles p
      where p.id = assessments.student_id
        and p.college_id = get_my_college_id()
    )
  );

-- ============================================================
-- ASSESSMENT ANSWERS POLICIES
-- ============================================================
create policy "Students can view own answers"
  on assessment_answers for select
  using (
    exists (
      select 1 from assessments a
      where a.id = assessment_answers.assessment_id
        and a.student_id = auth.uid()
    )
  );

create policy "Students can insert own answers"
  on assessment_answers for insert
  with check (
    exists (
      select 1 from assessments a
      where a.id = assessment_answers.assessment_id
        and a.student_id = auth.uid()
    )
  );

create policy "Experts can view answers of assigned students"
  on assessment_answers for select
  using (
    has_role(auth.uid(), 'expert') and
    exists (
      select 1 from assessments a
      join sessions s on s.student_id = a.student_id
      where a.id = assessment_answers.assessment_id
        and s.expert_id = auth.uid()
    )
  );

-- ============================================================
-- SESSIONS POLICIES
-- ============================================================
create policy "Students can view own sessions"
  on sessions for select
  using (student_id = auth.uid());

create policy "Students can insert own sessions"
  on sessions for insert
  with check (student_id = auth.uid());

create policy "Experts can view assigned sessions"
  on sessions for select
  using (expert_id = auth.uid());

create policy "Experts can update assigned sessions"
  on sessions for update
  using (expert_id = auth.uid());

create policy "Admins can manage all sessions in college"
  on sessions for all
  using (
    has_role(auth.uid(), 'admin') and
    exists (
      select 1 from profiles p
      where p.id = sessions.student_id
        and p.college_id = get_my_college_id()
    )
  );

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================
create policy "Session participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from sessions s
      where s.id = messages.session_id
        and (s.student_id = auth.uid() or s.expert_id = auth.uid())
    )
  );

create policy "Session participants can insert messages"
  on messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from sessions s
      where s.id = messages.session_id
        and (s.student_id = auth.uid() or s.expert_id = auth.uid())
    )
  );

-- ============================================================
-- NOTES POLICIES
-- ============================================================
create policy "Experts can manage own notes"
  on notes for all
  using (expert_id = auth.uid());

create policy "Students can view non-private notes about them"
  on notes for select
  using (student_id = auth.uid() and is_private = false);
