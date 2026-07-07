# Self-Learning Module (Student Content Studio) — Specification

> **Status:** living spec · last updated 2026-07-07
> **Owner:** product/eng · **Module ID:** `learn`
> Amendments v1.1: lesson flow revised (slides → untimed quiz → completion → next);
> gamification **deferred** (progression metrics only).
> v1.2 (2026-07-07): **P1 + P2 built** — Learn Home, scroll+dwell completion,
> quiz attempts, analytics, Revision Hub (SRS/formulas/PYQ), mastery model +
> Mastery Map, check-in grading. Backend: 4 new tables + 6 endpoints (SQL migration
> `sql/09_self_learning.sql`, applied to live DB). Gamification (P4) still deferred.

---

## Build Status Ledger

The single source of truth for what is real vs. planned. Update this table with every change.

| Area | Item | Status |
|---|---|---|
| Courses list | Mobile-first list, semester filter chips, lesson badges | ✅ Built |
| Course syllabus | Progress hero (n/m lessons · %), unit filter chips, per-subtopic **artifact chips** (📖 notes · 🖥 slides · ❓ quiz), read/quiz progression chips | ✅ Built |
| Lesson reader | Golden notes renderer (structured shapes, callouts, KaTeX, Mermaid, stepped reveals, flashcards, pause-and-think) | ✅ Built |
| Lesson flow | **Continue-this-lesson rail**: slide pack card → ▶ Present (auto-opens presentation), untimed quiz card, completion (auto on quiz finish OR manual "Mark as completed"), Next → next subtopic / **Back to topic** on last | ✅ Built |
| Slides viewer | Deck cards + full-screen Present mode (`?present=1` deep link) | ✅ Built |
| Quiz player | Untimed MCQ + short answer, score → `/student/progress` | ✅ Built |
| Progression metrics | Read %, per-lesson completed state, quiz best score, course progress bar | ✅ Built |
| Mobile shell | Bottom tab bar, auth deep-link/refresh fix, responsive reader | ✅ Built |
| Learn Home | `/student/home` — resume ContinueCard, this-week strip, revision-due card, per-course mastery rings | ✅ Built |
| Auto-completion | Scroll ≥85% + dwell ≥40% of reading time; 15s telemetry flush; resume pointer | ✅ Built |
| Quiz attempts | `quiz_attempts` table (attempt history) via `/student/quiz/attempts` | ✅ Built |
| Analytics events | `/student/events` batch + `track()` client (home/lesson/quiz/card/checkin events) | ✅ Built |
| Revision Hub | `/student/revision/{id}` — flashcard SRS (SM-2-lite), formula sheet, PYQ practice by band, weak topics | ✅ Built |
| Check-in grading | pause-and-think Got-it/Missed-it → `learn_checkin_answered` event | ✅ Built |
| Mastery model | Computed per topic (0.5 read + 0.3 quiz + 0.2 completion), rolled to course; Mastery Map screen | ✅ Built |
| Notifications | Streak-risk / cards-due nudges (in-app first) | ⬜ Pending (P3) |
| Offline | Service-worker lesson cache, review queue | ⬜ Pending (P3) |
| Gamification | XP, streaks, badges, celebrations | 🚫 Deferred by decision (2026-07-07) — design kept in §8 appendix |

---

## 1 — Module Overview

```
Module Name:        Learn (Self-Learning Module)
Module ID:          learn
Navigation Tab:     Courses (bottom tab; rename → "Learn" when Learn Home ships)
Module Type:        Core
Priority:           P0 Critical
Target Users:       All enrolled students (mobile-first)
Screens:            7 + 1 overlay
```

**Purpose:** Turn the published-content viewer into a complete learning loop — learn → check → recall → review → mastery — so a student can pass university exams and placement screens from this module alone.

**Success metrics**
- Primary: weekly active learners / enrolled ≥ 60%; lesson completion ≥ 70%
- Secondary: median lessons/week ≥ 3; revision sessions/week ≥ 2; quiz first-attempt avg ≥ 65%; D7 retention ≥ 40%
- Guardrails: reader load < 1.5 s on 4G; faculty approval flow unchanged; section-dwell never regresses after content updates

**Dependencies:** content pipeline (approved notes/slides/quiz — done, critic-gated), auth, `/student/*` API. Downstream: faculty dashboards (section dwell), future placement-prep module.

---

## 2 — Screen Inventory

| ID | Screen | Type | Entry | Exit | Status |
|---|---|---|---|---|---|
| SCR-01 | Learn Home | List | tab, app open | SCR-02/03 | ⬜ (courses list built; resume card pending) |
| SCR-02 | Course Syllabus | Detail | SCR-01 | SCR-03/06/07 | ✅ |
| SCR-03 | Lesson Reader (notes) | Detail | SCR-02, resume | SCR-04/05, next lesson | ✅ |
| SCR-04 | Slides Viewer + Present | Overlay | SCR-03 rail | SCR-03/05 | ✅ |
| SCR-05 | Quiz Player (untimed) | Form | SCR-03 rail | SCR-03, SCR-02 | ✅ |
| SCR-06 | Revision Hub | List | SCR-02 | flashcards, formulas, PYQ | ⬜ P2 |
| SCR-07 | Mastery Map | Detail | SCR-02 | SCR-03 (weakest topic) | ⬜ P2 |
| OVL-01 | Lesson Complete | Overlay | completion | next / quiz / back | ⬜ P1 (inline pill built; overlay pending) |

---

## 3 — User Flows

### FLOW 1: Lesson flow (v1.1 — BUILT)

```
Trigger: student opens a subtopic's notes from the syllabus
1. Reads notes (outcome ticks, check-ins, stepped examples)
2. Bottom rail "Continue this lesson":
   a. Slide pack card (if deck approved) → View slides | ▶ Present (full-screen)
   b. Quiz card (if quiz approved) — "No timer — attempt when you feel ready"
3. Completion:
   - finishing the quiz auto-completes the lesson (score + completed both recorded), OR
   - student taps "Mark as completed" manually
   → "✓ Lesson completed" pill; syllabus chips update (n/m read, ✓ quiz s/t)
4. Footer: Next → next subtopic's notes; LAST subtopic → "Back to topic"
Conditionality: cards render only for approved artifacts; no quiz → manual mark only.
Edge: content unpublished mid-read → friendly block + back to syllabus (never blank).
```

### FLOW 2: Daily return session (pending Learn Home)
Continue card restores last lesson at last position → FLOW 1. Streak/nudge copy deferred with gamification; the card itself is progression, not gamification.

### FLOW 3: Exam revision (pending Revision Hub)
Due flashcards (SRS) → formula sheet → PYQ practice by marks band → weak-topic deep links.

### FLOW 4: Failure paths (built where applicable)
Progress POST failures are non-blocking (fire-and-forget + local state); 404 lesson → syllabus; refresh restores auth + position (auth hydration fixed).

---

## 4 — Component Notes (key, as built)

```
LessonReader (student mode of WinTeachConceptReader)
├── Sticky header (breadcrumb · title · meta · artifact tabs · lesson picker)
├── NotesArticle (structured + legacy tolerant; PointList/steps/callouts/KaTeX/Mermaid)
│   ├── OutcomeChecklist — ticks on scroll (useReadFraction)
│   └── Pause & think — reveal cards (grading pending P2)
├── StudentNextUp rail — slide pack / quiz / completion    ← v1.1 core
└── Footer — Prev · Next | "Back to topic" (last)
```

New components use DS v4 tokens; tap targets ≥ 44 px; celebrations (deferred) must honor `prefers-reduced-motion`.

---

## 5 — Data Models

**Exists:** `student_progress` (topic, concept, artifact_type, status viewed/completed, quiz_score/total) — powers everything built so far. `concept_artifacts.content` already carries flashcards, practice questions (graded), formulas, pause-and-think.

**Pending (P1/P2):**

```ts
QuizAttempt   { userId, topicId, conceptId, attemptNo, score, total,
                answers[{qIndex, picked, correct}], durationSec, createdAt }
FlashcardReview { userId, courseId, topicId, conceptId, cardKey,
                bucket 0..4, dueAt, reviews, lapses }        // SM-2-lite: 0,1,3,7,21 days
LearnerState  { userId, resume{courseId,topicId,conceptId,scrollPct},
                weeklyGoalMinutes }                          // streak fields deferred
```

Mastery (P2, computed not stored): per topic = 0.5·read + 0.3·bestQuiz + 0.2·checkins; rolled up to unit/course/CO, cached 5 min.

---

## 6 — API Contracts

**Exists:** `GET /student/courses` · `GET /student/courses/{id}` (units→topics + progress) · `POST /student/progress`.

**Pending:**

```
GET  /student/home                      → resume, weekly minutes, due_cards, courses+mastery   (P1)
POST /student/quiz/attempts             → attempt record (replaces bare score-only post)       (P1)
POST /student/events   (batched)        → analytics                                            (P1)
GET  /student/revision/{courseId}       → due cards, formula sheet, PYQ, weak topics           (P2)
POST /student/flashcards/review         → {card_key, again|got_it} → next due                  (P2)
GET  /student/courses/{id}/mastery      → topic/unit/CO breakdown                              (P2)
```

Caching: `/home` 60 s; revision payload ETag on notes version hash (auto-invalidates on republish).

---

## 7 — Client State

Built: local lesson state in the reader (markedDone, localQuiz) seeded from `studentCourse.progress`, optimistic on writes. Pending: `winnify_resume` + `winnify_pending_events` localStorage keys, dwell timer (visibility-aware), retry queue.

Completion rule (pending upgrade): today = quiz finish or manual mark. P1 adds scroll ≥ 85 % AND dwell ≥ 0.4 × reading_time — server recomputes from telemetry (anti-cheat).

---

## 8 — Progression Metrics (gamification DEFERRED)

**In scope now (built):** lessons read n/m per topic, per-lesson ✓ completed, best quiz score chip, course % bar. P2 adds mastery % and weak-topic surfacing.

**Deferred appendix (do not build yet):** XP ledger with dedupe refKeys, streaks with single freeze token, badge set (First Lesson / 7-Day / Course 100 % / Quiz Ace), celebration overlays. Anti-farming rules documented in v1.0 chat spec; revisit after retention baseline exists.

---

## 9 — Navigation & Routing

```
/home/courses                                → courses list (SCR-01 shell)
/home/courses/:id                            → syllabus (SCR-02)
/home/courses/:id/topic/:tid/notes/:cid      → reader (SCR-03)
/home/courses/:id/topic/:tid/slides/:cid     → slides; ?present=1 auto-opens Present
/home/courses/:id/topic/:tid/quiz/:cid       → quiz
```
Back-stack: reader back → syllabus; Present dismiss → slides view. Hard refresh restores session (auth hydration fix, 2026-07-06). Tab bar hidden only in Present mode.

---

## 10 — Empty / Error States

| Scenario | Treatment | Status |
|---|---|---|
| Nothing published | "Faculty is preparing content" | ✅ (course/topic views) |
| Artifact not approved for a concept | Card simply absent from rail | ✅ |
| Lesson unavailable (revoked) | Friendly block + back | ✅ reader empty-state |
| Progress write fails | Optimistic UI, silent retry-less (P1: queue) | ✅ / queue ⬜ |
| Session expired | Re-auth → return to position | ✅ |
| 0 cards due (P2) | "Ahead of schedule" + weak-topic quiz offer | ⬜ |

---

## 11 — Accessibility & i18n

Tap targets ≥ 44 px (rail buttons comply); outcome ticks + completion pill need `aria-live="polite"` (pending); KaTeX aria-labels from source TeX (pending); reduced-motion honored by reveal animations (built). New UI strings through a translatable map from P1 onward.

---

## 12 — Analytics (pending P1)

Events `learn_*`: home_viewed, lesson_opened/completed, section_dwell, checkin_answered, quiz_submitted, card_reviewed, next_lesson_tapped. Funnel: opened → completed → quiz → review. Section-dwell aggregates surface in the faculty dashboard **per note version** — closes the loop with the generation critic.

---

## 13 — Notifications (P3)

In-app first: revision-due and continue-lesson nudges, ≤ 1/day/module, opt-out in Profile. Push only after opt-in baseline.

---

## 14 — Security & Privacy

All learn tables keyed by JWT user id; students read approved artifacts only (enforced server-side, verified); no new PII; events rate-limited 6/min; analytics retention 180 d.

---

## 15 — Roadmap

| Phase | Scope | Effort | Gate |
|---|---|---|---|
| ~~P0~~ | Lesson flow v1.1 (rail, present deep link, completion, chips) | done 2026-07-07 | shipped ✅ |
| P1 | Learn Home + resume · scroll+dwell completion · QuizAttempt table · events endpoint | ~1 wk | completion measurable end-to-end |
| P2 | Revision Hub (SRS + formulas + PYQ) · check-in grading · mastery model + Mastery Map | ~2–3 wk | D7 baseline; SRS review rate |
| P3 | Notifications · offline · exam mode · dwell→faculty dashboard | ~2 wk | dwell data in revise loop |
| P4 | Gamification (deferred design, §8 appendix) | — | only after P2 retention baseline |

**DoD each phase:** unit tests on completion/SRS math; API integration tests; a11y pass on new components; this ledger updated.

---

### The three bets (unchanged)

1. **Completion is earned, not clicked** — scroll+dwell (P1) converts the reader into a learning system.
2. **Revision Hub is the moat** — SRS + formula sheet + PYQ is assembly, not generation; the content already exists per concept.
3. **Section-dwell closes the content loop** — students silently tell faculty which sections fail; the critic + versioning already consume it.
