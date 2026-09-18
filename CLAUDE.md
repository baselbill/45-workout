# 45-Workout — Codebase Documentation

## Project Overview
A 16-week strength training program tracker built as a single-page HTML application. Users log workouts, track exercises, manage 1RM (one-rep max), monitor mobility routines, and view progress through calendar and statistics views.

## Architecture

### Entry Point
- **index.html** — Main production file. Always keep this synchronized with the latest version.
- **workout_app_v*.html** — Versioned development files. Currently on v7.

### Structure
Single HTML file (~2400 lines) containing:
- Embedded CSS (minified)
- Embedded JavaScript (all logic)
- No external dependencies except Google Fonts

### Core Data Model
Stored in `S` (global state object) in localStorage:
- `S.startDate` — Program start date (YYYY-MM-DD)
- `S.trainingDays` — Days of week when user trains (0-6)
- `S.logs` — Session data by `dayKey(week, dayIndex)` → exercise sets
- `S.exHistory` — Exercise history for each lift
- `S.rm` — One-rep max values (manual or auto-calculated)
- `S.bw` — Bodyweight tracking
- `S.awayMode` — Boolean for bodyweight-only sessions
- `S.mobChecks` — Mobility routine completion tracking
- `S.mobHistory` — Completed mobility sessions

### Key Functions

#### Schedule & Time
- `dateStr(d)` — Format date as YYYY-MM-DD
- `todayStr()` — Today's date
- `buildSchedule()` — Generate 48-session schedule from start date and training days
- `getSchedule()` — Get cached schedule
- `getTodaySession()` — Get today's scheduled session
- `getNextPendingSession()` — Next incomplete session

#### Session Management
- `dayKey(w, d)` — Generate key for week/dayIndex (e.g., "w1d0")
- `getLog(w, d)` — Get session log for week/dayIndex
- `setLog(w, d, data)` — Update session log
- `completeSession(w, di, schedDate)` — Mark session complete with validation
- `uncompleteSession(w, di)` — Revert completion
- `isSessionDone(w, d)` — Check if session is completed

#### Exercise Data
- `recordExerciseHistory(exName, sets, week)` — Log exercise completion
- `getLastSession(exName)` — Get previous session data for exercise
- `getExRec(ex)` — Calculate target weight from 1RM

#### Rendering
- `renderToday()` — Main session/rest day view
- `renderCalendar()` — Monthly calendar view
- `renderStrength()` — 1RM tracker
- `renderProgress()` — Stats and charts

## Recent Fixes

### Set Logging Lost Weight/Reps ("null") (Current)
**Bug:** Ticking a set sometimes logged nothing, or logged reps but not weight. Only fix was to untick and redo.
**Root cause:** Three compounding issues.
- Inputs committed on `onchange` (fires on blur only), but `toggleDone()` reads state directly. Every set tick and stepper tap calls `renderToday()`, which replaces `innerHTML` — a typed-but-unblurred value was discarded with the old DOM node.
- The auto-carry in `toggleDone()` required **both** weight and reps to be empty, so touching one field dropped the other.
- The carried value shown in sets 2+ was computed at render time only — displayed, but never in state until committed.
**Fix:**
- `logField()` commits on `oninput` (per keystroke), and an emptied box now clears the field instead of stranding the old value.
- `toggleDone()` blurs the active set input first, then carries weight and reps **independently**.
- Render pre-fill is null-aware (`!=null`, not truthiness) so a logged `0` displays and what the box shows is exactly what gets committed.
- `showSetFlash()`/`showPRFlash()` build their text via `setValueText()` — a missing value can no longer render as the literal string "null".

### Weight/Reps Numbers Clipped in Set Rows (Current)
**Bug:** Entered numbers were cut off — a 3+ character weight showed only its first digit.
**Root cause:** The global `input[type=number]` rule (specificity 0,1,1) outranked `.set-val-input` (0,1,0), forcing 12px horizontal padding, 14px font and a border onto the stepper inputs. That left ~31px of text area inside a ~55px box.
**Fix:**
- Global form-input rule now excludes `.set-val-input`/`.set-input` via `:not()`, so the in-row controls keep their own borderless, zero-padding styling.
- `.set-row` columns re-proportioned `28px 1.1fr .9fr 44px` (weight needs 5 chars, reps 2), stepper buttons 36→32px, stepper padding 4→2px, input 17→16px (DESIGN.md allows 15–17px).
- Inline `grid-template-columns` in today.js replaced with a `.bw-cols` class so header and rows can't drift apart.
- Completed sets were rendered at 0.7 × 0.5 = **0.35** opacity. Now only the disabled +/− buttons dim; the logged numbers stay readable.

### Rest Timer Strip Was Transparent (Current)
**Bug:** Page content scrolled visibly through the rest timer, making both unreadable.
**Root cause:** `.rest-strip` background was `var(--accent-mute)` — 8% alpha — on a `position:fixed` element.
**Fix:** Opaque `var(--surf)` background; the accent identity comes from the border and the progress fill.

### Last-Session Reference Never Appeared (Current)
**Bug:** "Last: …" and the per-set vs-last comparison stayed hidden until an exercise had two prior sessions.
**Root cause:** `getLastSession()` bailed on `hist.length < 2`; filtering out today's entry is the only guard actually needed.
**Fix:** Removed the length check.

### Slide Schedule to Today Modal
**Bug:** "Slide schedule to today" button showed native `confirm()` dialog that didn't respond to clicks.
**Root cause:** Native `confirm()` dialog is unreliable on mobile, doesn't layer properly with custom modals.
**Fix:**
- Added `showConfirm(title, body, onOk)` reusable confirmation modal function
- Created `modal-confirm` HTML element styled to match app design
- `slideProgramForward()` now uses custom modal instead of native `confirm()`
- Provides consistent UX and works reliably across all devices

### Cool Down Timer Background Running (Current)
**Bug:** Rest timer paused when app lost focus (browser tab inactive).
**Root cause:** Used `setInterval()` with counter; browsers throttle intervals when tab is inactive.
**Fix:**
- Added `startTime` field to timer, set to `Date.now()` when starting
- Calculate elapsed time from actual time: `(Date.now() - startTime) / 1000` instead of counter
- `setInterval()` still runs for UI updates, but elapsed calculation is always from wall clock
- Timer continues running accurately in background; correct when app returns to focus

### Workout Completion Date Validation (v7)
**Bug:** Sessions marked complete on wrong dates would still show as completed on their scheduled date.
**Root cause:** No validation that completion matched scheduled date.
**Fix:**
- `completeSession()` now validates scheduled date and prevents future completions
- Stores both `_scheduledDate` (when session was scheduled) and `_completedDate` (when user marked it complete)
- Calendar checks that `_scheduledDate === date` to display completion
- Training streak and stats count by scheduled date

## Development Notes

### When Adding Features
1. Keep the single-file structure for simplicity
2. Use existing patterns: `dayKey()`, `getLog()`/`setLog()`, `renderX()` screens
3. All data persists via `saveState()` → localStorage
4. Test by opening index.html locally — no build step needed

### Testing Workflow
1. Edit index.html (or v7)
2. Open in browser
3. Once stable, copy to index.html if working on v*
4. Commit with detailed message
5. Push to main

### Colors & Theme
Dark theme (GitHub-inspired):
- `--bg: #0f1117` — Background
- `--accent: #4ade80` — Success/complete (green)
- `--orange: #fb923c` — Away mode
- `--red: #f87171` — Missed
- `--amber: #fbbf24` — Warning
- `--blue: #60a5fa` — Info
- `--purple: #a78bfa` — Deload/special

## Files & Workflow
- **index.html** — Main production file (generated by `node build.js`, copied from dist/)
- **src/** — Modular source: data/, state/, ui/, app.js, styles.css
- **index.template.html** — HTML shell; `node build.js` inlines CSS+JS → dist/index.html
- **build.js** — Build script (Node.js, no dependencies). `node build.js` or `npm run build`.
- **DESIGN.md** — Design system source of truth (see below)
- **CLAUDE.md** — This file (codebase docs)
- **archive/** — Old v2–v7 single-file versions (for reference only)

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
Font choices, colors, spacing, border radius, and aesthetic direction are all defined there.
Do not deviate without explicit user approval.

Key design rules:
- Body font: **Geist** (loaded from Google Fonts). Fallback: Inter, then system fonts.
- Numeric/data font: **JetBrains Mono** (rest timer, weight inputs, rep counters).
- Border radius: `--r: 10px` for cards/modals, `--r-sm: 6px` for buttons/inputs.
- Color accent: `--accent: #FF6B35` (orange). One accent, used sparingly.
- Aesthetic: Industrial/Utilitarian. No decorative flourishes, no gradient CTAs, no bubbly radius.
