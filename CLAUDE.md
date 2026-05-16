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
- **index.html** — Keep in sync with latest v* (currently v7)
- **workout_app_v*.html** — Versioned backups for experimenting
- **CLAUDE.md** — This file (codebase docs)
- **memory.md** — User-facing notes and decisions
