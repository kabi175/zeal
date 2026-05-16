# Zeal — Feature Implementation Plan

> **Stack recap:** Next.js 15 App Router · TypeScript · Supabase (auth + postgres + realtime) · TanStack Query v5 · Tailwind CSS v4 · shadcn/ui (Radix) · framer-motion · jsPDF (already installed)

---

## Overview of Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Tutor Question Management (in Expert Dashboard) | **To build** |
| 2 | Courses + Auto-Certificate on Completion | **To build** |
| 3 | Tutor Registration Profile + Student "Find Tutors" Search Page | **To build** |

---

## 1. Database Schema Changes

### 1.1 New ENUMs

```sql
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE lesson_content_type AS ENUM ('video', 'text', 'quiz');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');
```

### 1.2 Tutor Public Profile (extend existing `experts` table)

```sql
ALTER TABLE experts
  ADD COLUMN IF NOT EXISTS hourly_rate        numeric(8,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subjects           text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages          text[]        DEFAULT '{"English"}',
  ADD COLUMN IF NOT EXISTS profile_headline   text,
  ADD COLUMN IF NOT EXISTS rating             numeric(3,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews      integer       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability_json  jsonb         DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_photo_url  text,
  ADD COLUMN IF NOT EXISTS is_public          boolean       DEFAULT false;

-- GIN index for fast subject array overlap queries
CREATE INDEX idx_experts_subjects ON experts USING GIN (subjects);
```

### 1.3 Question Bank

```sql
CREATE TABLE questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id       uuid REFERENCES courses(id) ON DELETE SET NULL,
  topic_tag       text,
  difficulty      question_difficulty NOT NULL DEFAULT 'medium',
  question_text   text NOT NULL,
  option_a        text NOT NULL,
  option_b        text NOT NULL,
  option_c        text NOT NULL,
  option_d        text NOT NULL,
  correct_option  char(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expert manages own questions" ON questions FOR ALL
  USING (expert_id = auth.uid()) WITH CHECK (expert_id = auth.uid());

CREATE POLICY "Students read questions via enrolled course" ON questions FOR SELECT
  USING (
    course_id IN (
      SELECT course_id FROM enrollments
      WHERE student_id = auth.uid() AND status != 'dropped'
    )
  );
```

### 1.4 Courses, Modules, Lessons

```sql
CREATE TABLE courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  subject       text,
  thumbnail_url text,
  price         numeric(8,2) NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id       uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title           text NOT NULL,
  content_type    lesson_content_type NOT NULL DEFAULT 'text',
  content_url     text,
  content_body    text,
  order_index     integer NOT NULL DEFAULT 0,
  duration_secs   integer DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Junction table: which questions belong to which lesson (quiz lessons)
CREATE TABLE lesson_questions (
  lesson_id   uuid REFERENCES lessons(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (lesson_id, question_id)
);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expert manages own courses" ON courses FOR ALL
  USING (expert_id = auth.uid()) WITH CHECK (expert_id = auth.uid());
CREATE POLICY "Anyone reads published courses" ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Expert manages modules" ON modules FOR ALL
  USING (course_id IN (SELECT id FROM courses WHERE expert_id = auth.uid()));
CREATE POLICY "Enrolled student reads modules" ON modules FOR SELECT
  USING (course_id IN (SELECT course_id FROM enrollments WHERE student_id = auth.uid()));

CREATE POLICY "Expert manages lessons" ON lessons FOR ALL
  USING (module_id IN (
    SELECT m.id FROM modules m JOIN courses c ON c.id = m.course_id
    WHERE c.expert_id = auth.uid()
  ));
CREATE POLICY "Enrolled student reads lessons" ON lessons FOR SELECT
  USING (module_id IN (
    SELECT m.id FROM modules m
    JOIN enrollments e ON e.course_id = m.course_id
    WHERE e.student_id = auth.uid()
  ));
```

### 1.5 Enrollments & Lesson Progress

```sql
CREATE TABLE enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status       enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at  timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (student_id, course_id)
);

CREATE TABLE lesson_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id    uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student manages own enrollments" ON enrollments FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Expert reads enrollments for own courses" ON enrollments FOR SELECT
  USING (course_id IN (SELECT id FROM courses WHERE expert_id = auth.uid()));

CREATE POLICY "Student manages own progress" ON lesson_progress FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
```

### 1.6 Certificates

```sql
CREATE TABLE certificates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_code   text NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  expert_id   uuid NOT NULL REFERENCES profiles(id),
  issued_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student reads own certificates" ON certificates FOR SELECT
  USING (student_id = auth.uid());
CREATE POLICY "Expert reads certs for own courses" ON certificates FOR SELECT
  USING (expert_id = auth.uid());
```

### 1.7 Auto-Certificate Trigger

```sql
CREATE OR REPLACE FUNCTION check_course_completion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_course_id uuid;
  v_total     integer;
  v_done      integer;
  v_expert_id uuid;
BEGIN
  SELECT m.course_id INTO v_course_id
  FROM lessons l JOIN modules m ON m.id = l.module_id
  WHERE l.id = NEW.lesson_id;

  SELECT COUNT(*) INTO v_total
  FROM lessons l JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id;

  SELECT COUNT(*) INTO v_done
  FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  JOIN modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id AND lp.student_id = NEW.student_id;

  IF v_done >= v_total THEN
    UPDATE enrollments
    SET status = 'completed', completed_at = now()
    WHERE student_id = NEW.student_id AND course_id = v_course_id;

    SELECT expert_id INTO v_expert_id FROM courses WHERE id = v_course_id;

    INSERT INTO certificates (student_id, course_id, expert_id)
    VALUES (NEW.student_id, v_course_id, v_expert_id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lesson_completed
  AFTER INSERT ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION check_course_completion();
```

### 1.8 Tutor Reviews

```sql
CREATE TABLE tutor_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (expert_id, student_id)
);

ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student manages own review" ON tutor_reviews FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Anyone reads reviews" ON tutor_reviews FOR SELECT USING (true);

-- Trigger to keep experts.rating + total_reviews in sync
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE experts
  SET rating = (SELECT AVG(rating) FROM tutor_reviews WHERE expert_id = NEW.expert_id),
      total_reviews = (SELECT COUNT(*) FROM tutor_reviews WHERE expert_id = NEW.expert_id)
  WHERE user_id = NEW.expert_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_upserted
  AFTER INSERT OR UPDATE ON tutor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();
```

---

## 2. TypeScript Type Updates

**`types/database.ts`** — Add row/insert/update types for: `questions`, `courses`, `modules`, `lessons`, `lesson_questions`, `enrollments`, `lesson_progress`, `certificates`, `tutor_reviews`. Add new ENUMs: `question_difficulty`, `lesson_content_type`, `enrollment_status`.

**`types/app.ts`** — Export: `Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `Certificate`, `Question`, `TutorReview`, `TutorPublicProfile`.

---

## 3. New Files to Create

### Services

| File | Purpose |
|---|---|
| `services/questions.ts` | `listQuestions`, `upsertQuestion`, `deleteQuestion` |
| `services/courses.ts` | `listExpertCourses`, `upsertCourse`, `upsertModule`, `upsertLesson`, `deleteCourse` |
| `services/enrollments.ts` | `enrollStudent`, `getEnrollmentWithProgress`, `markLessonComplete` |
| `services/certificates.ts` | `getCertificate`, `listStudentCertificates` |
| `services/tutors.ts` | `searchTutors` (with filters), `getTutorProfile`, `upsertTutorProfile` |
| `services/reviews.ts` | `submitReview`, `listTutorReviews` |

### Lib

| File | Purpose |
|---|---|
| `lib/certificate-pdf.ts` | jsPDF certificate generator (same dynamic-import pattern as `lib/report-pdf.ts`) |

### Expert Dashboard — Question Bank

| File | Purpose |
|---|---|
| `components/expert/question-bank.tsx` | Tab content: wraps table + form |
| `components/expert/question-form.tsx` | Modal form: create/edit question (zod + react-hook-form) |
| `components/expert/question-table.tsx` | Table with difficulty/topic filters |

### Expert Dashboard — Course Builder

| File | Purpose |
|---|---|
| `components/expert/course-list.tsx` | Grid of expert's courses with publish toggle |
| `components/expert/course-form.tsx` | Create/edit course modal |
| `components/expert/module-editor.tsx` | Accordion editor for modules |
| `components/expert/lesson-editor.tsx` | Inline lesson form inside module accordion |

### Expert — Tutor Public Profile Setup

| File | Purpose |
|---|---|
| `app/(expert)/expert/profile/page.tsx` | Tutor profile setup page |
| `components/expert/tutor-profile-form.tsx` | Bio, subjects, hourly rate, languages, availability grid, photo URL, headline |

### Student — Course Pages

| File | Purpose |
|---|---|
| `app/(student)/courses/page.tsx` | Enrolled + available courses grid |
| `app/(student)/courses/[courseId]/page.tsx` | Course detail: modules/lessons sidebar + content viewer |
| `app/(student)/courses/[courseId]/certificate/page.tsx` | Certificate preview + PDF download |
| `components/student/course-card.tsx` | Course card with thumbnail, progress bar, tutor name |
| `components/student/lesson-viewer.tsx` | Renders video embed or markdown content |
| `components/student/course-progress-sidebar.tsx` | Module/lesson list with checkmarks |
| `hooks/use-course-progress.ts` | TanStack Query hooks for enrollment + lesson_progress |

### Tutor Search — Public Pages

| File | Purpose |
|---|---|
| `app/(marketing)/tutors/page.tsx` | "Find Tutors" search page with filters |
| `app/(marketing)/tutors/[id]/page.tsx` | Tutor detail: profile, courses, reviews, Book button |
| `components/tutors/tutor-card.tsx` | Photo, name, subjects, rate, star rating, CTA |
| `components/tutors/tutor-filters.tsx` | Subject select, price range, rating filter, availability toggle |
| `components/tutors/tutor-profile-detail.tsx` | Full profile component for `/tutors/[id]` |
| `components/tutors/tutor-review-list.tsx` | Review cards with stars |
| `components/tutors/tutor-review-form.tsx` | Submit review (students only) |
| `hooks/use-tutor-search.ts` | TanStack Query hook wrapping `services/tutors.ts` |

### API Routes

| File | Purpose |
|---|---|
| `app/api/certificates/[id]/route.ts` | GET: verify cert by `cert_code` — returns JSON for public cert verification |

---

## 4. Existing Files to Modify

| File | Change |
|---|---|
| `types/database.ts` | Add all new table types + ENUMs |
| `types/app.ts` | Export new convenience types |
| `middleware.ts` | Add `/tutors` to `PUBLIC_ROUTES`; add `/expert/profile` to `EXPERT_ROUTES` |
| `components/expert/expert-dashboard.tsx` | Add "Question Bank" and "Courses" tabs |
| `app/(expert)/layout.tsx` | Add nav link "My Profile" → `/expert/profile` |
| `app/(student)/layout.tsx` | Add nav link "Courses" → `/courses` |
| `components/layout/navbar.tsx` | Add "Find Tutors" link to marketing nav |

---

## 5. Implementation Phases

### Phase 1 — Database (Day 1–2)
1. Run ENUMs migration
2. `ALTER TABLE experts` for public profile columns + GIN index
3. Create `questions` table + RLS
4. Create `courses`, `modules`, `lessons`, `lesson_questions` tables + RLS
5. Create `enrollments`, `lesson_progress`, `certificates` tables + RLS + completion trigger
6. Create `tutor_reviews` table + rating trigger
7. Update `types/database.ts` and `types/app.ts`

### Phase 2 — Services Layer (Day 3–4)
8. `services/questions.ts`
9. `services/courses.ts`
10. `services/enrollments.ts`
11. `services/certificates.ts`
12. `services/tutors.ts`
13. `services/reviews.ts`

### Phase 3 — Certificate PDF (Day 5)
14. `lib/certificate-pdf.ts` — dynamic jsPDF import, renders: Zeal header, cert code, student name, course name, tutor name, date, decorative border

### Phase 4 — Expert Dashboard Extensions (Day 6–8)
15. Question Bank components + wire into `expert-dashboard.tsx`
16. Course Builder components + wire into `expert-dashboard.tsx`
17. `components/expert/tutor-profile-form.tsx` + profile page

### Phase 5 — Student Course Experience (Day 9–11)
18. `hooks/use-course-progress.ts`
19. Course card, lesson viewer, progress sidebar
20. `/courses`, `/courses/[courseId]`, `/courses/[courseId]/certificate` pages

### Phase 6 — Tutor Search Pages (Day 12–14)
21. `hooks/use-tutor-search.ts`
22. Tutor card + filter components
23. `/tutors` page
24. Tutor profile detail, reviews, review form
25. `/tutors/[id]` page

### Phase 7 — Wiring & Routes (Day 15)
26. Update `middleware.ts`
27. Update navbar + layout sidebars
28. `app/api/certificates/[id]/route.ts`

### Phase 8 — QA & Polish (Day 16–17)
29. End-to-end: enroll → complete all lessons → trigger fires → certificate appears → PDF downloads
30. RLS audit: student can't see another student's progress; expert can only manage own content
31. Mobile responsive pass on tutor cards and course sidebar

---

## 6. Key Design Decisions

### Certificate Generation — jsPDF (already installed)
Use same dynamic-import pattern as `lib/report-pdf.ts`. No new dependencies needed.

### Tutor Search — Supabase with GIN index
Use `.contains()` for subject array overlap, `.gte()/.lte()` for price/rating range, `.ilike()` for name search. GIN index on `experts.subjects` handles array queries efficiently.

### Book Session CTA
`/tutors/[id]` "Book Session" button redirects to existing `/counselling?expertId=<id>` — wires into the existing session booking flow without duplication.

### Module/Lesson Ordering
Integer `order_index` (not linked-list). Batch-update all rows when reordering.

### TanStack Query Key Conventions
```
["questions", expertId]          — question bank
["courses", expertId]            — expert course list
["course", courseId]             — single course with modules+lessons
["enrollment", studentId, courseId] — progress
["tutors", filtersHash]          — search results
["tutor", tutorId]               — single profile
["certificates", studentId]      — student cert list
```
