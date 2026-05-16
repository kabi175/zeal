-- ============================================================
-- NEW ENUMS
-- ============================================================
create type question_difficulty as enum ('easy', 'medium', 'hard');
create type lesson_content_type as enum ('video', 'text', 'quiz');
create type enrollment_status as enum ('active', 'completed', 'dropped');

-- ============================================================
-- EXPERTS TABLE (create if not exists, then add new columns)
-- ============================================================
create table if not exists experts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  qualifications     text,
  years_experience   integer default 0,
  hourly_rate        numeric(8,2) default 0,
  subjects           text[] default '{}',
  languages          text[] default '{"English"}',
  profile_headline   text,
  rating             numeric(3,2) default 0,
  total_reviews      integer default 0,
  availability_json  jsonb default '{}',
  profile_photo_url  text,
  is_public          boolean default false,
  is_active          boolean default true,
  created_at         timestamptz not null default now(),
  unique (user_id)
);

alter table experts
  add column if not exists hourly_rate        numeric(8,2)  default 0,
  add column if not exists subjects           text[]        default '{}',
  add column if not exists languages          text[]        default '{"English"}',
  add column if not exists profile_headline   text,
  add column if not exists rating             numeric(3,2)  default 0,
  add column if not exists total_reviews      integer       default 0,
  add column if not exists availability_json  jsonb         default '{}',
  add column if not exists profile_photo_url  text,
  add column if not exists is_public          boolean       default false;

alter table experts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'experts' and policyname = 'Expert manages own profile') then
    create policy "Expert manages own profile" on experts for all
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'experts' and policyname = 'Anyone reads public experts') then
    create policy "Anyone reads public experts" on experts for select
      using (is_public = true);
  end if;
end $$;

create index if not exists idx_experts_subjects on experts using gin (subjects);
create index if not exists idx_experts_is_public on experts(is_public);

-- ============================================================
-- COURSES
-- ============================================================
create table courses (
  id            uuid primary key default gen_random_uuid(),
  expert_id     uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  subject       text,
  thumbnail_url text,
  price         numeric(8,2) not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- MODULES
-- ============================================================
create table modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- LESSONS
-- ============================================================
create table lessons (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references modules(id) on delete cascade,
  title           text not null,
  content_type    lesson_content_type not null default 'text',
  content_url     text,
  content_body    text,
  order_index     integer not null default 0,
  duration_secs   integer default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- QUESTIONS
-- ============================================================
create table questions (
  id              uuid primary key default gen_random_uuid(),
  expert_id       uuid not null references auth.users(id) on delete cascade,
  course_id       uuid references courses(id) on delete set null,
  topic_tag       text,
  difficulty      question_difficulty not null default 'medium',
  question_text   text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  correct_option  char(1) not null check (correct_option in ('A','B','C','D')),
  explanation     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- LESSON QUESTIONS (junction: quiz lessons reference questions)
-- ============================================================
create table lesson_questions (
  lesson_id   uuid not null references lessons(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  order_index integer not null default 0,
  primary key (lesson_id, question_id)
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
create table enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references courses(id) on delete cascade,
  status       enrollment_status not null default 'active',
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, course_id)
);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
create table lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
create table certificates (
  id          uuid primary key default gen_random_uuid(),
  cert_code   text not null unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  student_id  uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  expert_id   uuid not null references auth.users(id),
  issued_at   timestamptz not null default now(),
  unique (student_id, course_id)
);

-- ============================================================
-- TUTOR REVIEWS
-- ============================================================
create table tutor_reviews (
  id          uuid primary key default gen_random_uuid(),
  expert_id   uuid not null references auth.users(id) on delete cascade,
  student_id  uuid not null references auth.users(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (expert_id, student_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_courses_expert_id on courses(expert_id);
create index idx_courses_subject on courses(subject);
create index idx_courses_is_published on courses(is_published);
create index idx_modules_course_id on modules(course_id);
create index idx_lessons_module_id on lessons(module_id);
create index idx_questions_expert_id on questions(expert_id);
create index idx_questions_course_id on questions(course_id);
create index idx_enrollments_student_id on enrollments(student_id);
create index idx_enrollments_course_id on enrollments(course_id);
create index idx_lesson_progress_student_id on lesson_progress(student_id);
create index idx_certificates_student_id on certificates(student_id);
create index idx_tutor_reviews_expert_id on tutor_reviews(expert_id);

-- ============================================================
-- UPDATED_AT HELPER (create if not already defined)
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create trigger trg_courses_updated_at
  before update on courses
  for each row execute function update_updated_at();

create trigger trg_questions_updated_at
  before update on questions
  for each row execute function update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table questions enable row level security;
alter table lesson_questions enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table certificates enable row level security;
alter table tutor_reviews enable row level security;

-- Courses
create policy "Expert manages own courses" on courses for all
  using (expert_id = auth.uid()) with check (expert_id = auth.uid());
create policy "Anyone reads published courses" on courses for select
  using (is_published = true);

-- Modules
create policy "Expert manages modules" on modules for all
  using (course_id in (select id from courses where expert_id = auth.uid()));
create policy "Enrolled student reads modules" on modules for select
  using (course_id in (select course_id from enrollments where student_id = auth.uid()));

-- Lessons
create policy "Expert manages lessons" on lessons for all
  using (module_id in (
    select m.id from modules m join courses c on c.id = m.course_id
    where c.expert_id = auth.uid()
  ));
create policy "Enrolled student reads lessons" on lessons for select
  using (module_id in (
    select m.id from modules m
    join enrollments e on e.course_id = m.course_id
    where e.student_id = auth.uid()
  ));

-- Questions
create policy "Expert manages own questions" on questions for all
  using (expert_id = auth.uid()) with check (expert_id = auth.uid());
create policy "Students read questions via enrolled course" on questions for select
  using (
    course_id in (
      select course_id from enrollments
      where student_id = auth.uid() and status != 'dropped'
    )
  );

-- Lesson questions
create policy "Expert manages lesson_questions" on lesson_questions for all
  using (lesson_id in (
    select l.id from lessons l
    join modules m on m.id = l.module_id
    join courses c on c.id = m.course_id
    where c.expert_id = auth.uid()
  ));
create policy "Enrolled student reads lesson_questions" on lesson_questions for select
  using (lesson_id in (
    select l.id from lessons l
    join modules m on m.id = l.module_id
    join enrollments e on e.course_id = m.course_id
    where e.student_id = auth.uid()
  ));

-- Enrollments
create policy "Student manages own enrollments" on enrollments for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Expert reads enrollments for own courses" on enrollments for select
  using (course_id in (select id from courses where expert_id = auth.uid()));

-- Lesson progress
create policy "Student manages own progress" on lesson_progress for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Certificates
create policy "Student reads own certificates" on certificates for select
  using (student_id = auth.uid());
create policy "Expert reads certs for own courses" on certificates for select
  using (expert_id = auth.uid());
create policy "Service role inserts certificates" on certificates for insert
  with check (true);

-- Tutor reviews
create policy "Student manages own review" on tutor_reviews for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Anyone reads reviews" on tutor_reviews for select using (true);

-- ============================================================
-- AUTO-CERTIFICATE TRIGGER
-- ============================================================
create or replace function check_course_completion()
returns trigger language plpgsql security definer as $$
declare
  v_course_id uuid;
  v_total     integer;
  v_done      integer;
  v_expert_id uuid;
begin
  select m.course_id into v_course_id
  from lessons l join modules m on m.id = l.module_id
  where l.id = new.lesson_id;

  select count(*) into v_total
  from lessons l join modules m on m.id = l.module_id
  where m.course_id = v_course_id;

  select count(*) into v_done
  from lesson_progress lp
  join lessons l on l.id = lp.lesson_id
  join modules m on m.id = l.module_id
  where m.course_id = v_course_id and lp.student_id = new.student_id;

  if v_done >= v_total then
    update enrollments
    set status = 'completed', completed_at = now()
    where student_id = new.student_id and course_id = v_course_id;

    select expert_id into v_expert_id from courses where id = v_course_id;

    insert into certificates (student_id, course_id, expert_id)
    values (new.student_id, v_course_id, v_expert_id)
    on conflict (student_id, course_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_lesson_completed
  after insert on lesson_progress
  for each row execute function check_course_completion();

-- ============================================================
-- RATING SYNC TRIGGER
-- ============================================================
create or replace function update_tutor_rating()
returns trigger language plpgsql security definer as $$
begin
  update experts
  set rating = (select round(avg(rating)::numeric, 2) from tutor_reviews where expert_id = new.expert_id),
      total_reviews = (select count(*) from tutor_reviews where expert_id = new.expert_id)
  where user_id = new.expert_id;
  return new;
end;
$$;

create trigger on_review_upserted
  after insert or update on tutor_reviews
  for each row execute function update_tutor_rating();
