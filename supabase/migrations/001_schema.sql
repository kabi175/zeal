-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type app_role as enum ('student', 'expert', 'admin');
create type gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
create type session_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type stress_category as enum ('low', 'mild', 'moderate', 'high', 'severe');
create type message_sender as enum ('student', 'expert', 'ai');

-- ============================================================
-- COLLEGES
-- ============================================================
create table colleges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  state text,
  country text default 'India',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  gender gender_type,
  college_id uuid references colleges(id) on delete set null,
  department text,
  year_of_study smallint check (year_of_study between 1 and 6),
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- USER ROLES (roles never stored on profiles)
-- ============================================================
create table user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

-- ============================================================
-- EXPERTS
-- ============================================================
create table experts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  college_id uuid references colleges(id) on delete set null,
  specialization text[],
  qualifications text,
  years_experience smallint default 0,
  available_slots jsonb default '[]',
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
create table assessments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references auth.users(id) on delete cascade,
  expert_id uuid references auth.users(id) on delete set null,
  score integer not null check (score between 0 and 100),
  category stress_category not null,
  communication_score integer check (communication_score between 0 and 100),
  teamwork_score integer check (teamwork_score between 0 and 100),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ASSESSMENT ANSWERS
-- ============================================================
create table assessment_answers (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id smallint not null check (question_id between 1 and 20),
  answer_value smallint not null check (answer_value between 1 and 5),
  created_at timestamptz not null default now(),
  unique(assessment_id, question_id)
);

-- ============================================================
-- SESSIONS (counselling)
-- ============================================================
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references auth.users(id) on delete cascade,
  expert_id uuid not null references auth.users(id) on delete cascade,
  title text,
  scheduled_at timestamptz not null,
  duration_minutes smallint not null default 60,
  status session_status not null default 'scheduled',
  meeting_url text,
  notes_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_type message_sender not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTES (expert notes on students)
-- ============================================================
create table notes (
  id uuid primary key default uuid_generate_v4(),
  expert_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  content text not null,
  is_private boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_user_roles_user_id on user_roles(user_id);
create index idx_user_roles_role on user_roles(role);
create index idx_profiles_college_id on profiles(college_id);
create index idx_profiles_email on profiles(email);
create index idx_assessments_student_id on assessments(student_id);
create index idx_assessments_completed_at on assessments(completed_at desc);
create index idx_sessions_student_id on sessions(student_id);
create index idx_sessions_expert_id on sessions(expert_id);
create index idx_sessions_scheduled_at on sessions(scheduled_at);
create index idx_messages_session_id on messages(session_id);
create index idx_messages_created_at on messages(created_at);
create index idx_notes_student_id on notes(student_id);
create index idx_notes_expert_id on notes(expert_id);

-- ============================================================
-- SECURITY DEFINER FUNCTION: has_role
-- ============================================================
create or replace function has_role(user_uuid uuid, check_role app_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from user_roles
    where user_id = user_uuid
      and role = check_role
  );
$$;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_experts_updated_at
  before update on experts
  for each row execute function update_updated_at();

create trigger trg_colleges_updated_at
  before update on colleges
  for each row execute function update_updated_at();

create trigger trg_sessions_updated_at
  before update on sessions
  for each row execute function update_updated_at();

create trigger trg_notes_updated_at
  before update on notes
  for each row execute function update_updated_at();
