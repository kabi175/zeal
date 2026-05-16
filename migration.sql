-- colleges (must exist before profiles references it)
create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
alter table public.colleges enable row level security;
create policy "Anyone can read colleges" on public.colleges for select using (true);
create policy "Service role full access on colleges" on public.colleges using (true) with check (true);

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  gender text,
  college_id uuid references public.colleges(id) on delete set null,
  department text,
  year_of_study text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role full access on profiles" on public.profiles using (true) with check (true);

-- user_roles
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student'
);
alter table public.user_roles enable row level security;
create policy "Users can view own role" on public.user_roles for select using (auth.uid() = user_id);
create policy "Service role full access on user_roles" on public.user_roles using (true) with check (true);

-- assessments
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  score numeric not null,
  category text not null,
  communication_score numeric,
  teamwork_score numeric,
  completed_at timestamptz not null default now()
);
alter table public.assessments enable row level security;
create policy "Students view own assessments" on public.assessments for select using (auth.uid() = student_id);
create policy "Students insert own assessments" on public.assessments for insert with check (auth.uid() = student_id);
create policy "Admins/experts view all assessments" on public.assessments for select using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin', 'expert'))
);

-- assessment_answers
create table public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id integer not null,
  answer_value integer not null
);
alter table public.assessment_answers enable row level security;
create policy "Inherit assessment access" on public.assessment_answers for select using (
  exists (select 1 from public.assessments a where a.id = assessment_id and a.student_id = auth.uid())
);
create policy "Students insert answers" on public.assessment_answers for insert with check (
  exists (select 1 from public.assessments a where a.id = assessment_id and a.student_id = auth.uid())
);

-- sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  expert_id uuid references auth.users(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz default now()
);
alter table public.sessions enable row level security;
create policy "Students view own sessions" on public.sessions for select using (auth.uid() = student_id);
create policy "Experts view own sessions" on public.sessions for select using (auth.uid() = expert_id);
create policy "Service role full access on sessions" on public.sessions using (true) with check (true);
