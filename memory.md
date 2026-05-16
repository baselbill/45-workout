# 45-Workout — Project Memory

## UX Review (2026-05-16)

### Critical
1. **Setup flow has no recovery** — accidental modal dismiss leaves user with blank screen and no way back. No onboarding card in main UI.
2. **Silent success on setup** — page just changes, no confirmation or "Welcome to Week 1" moment.

### High
3. **Modal scroll conflict** — main area scrolls underneath open modals on mobile; two nested scroll areas.
4. **Missed sessions banner keeps reappearing** — × dismiss is temporary, no explanation why it comes back. "Slide program forward" is unexplained.
5. **Completed set rows look broken** — disabled steppers give no visual feedback; looks like a UI bug.
6. **Away mode toggle has no confirmation** — silently swaps all exercises mid-workout on single tap.

### Medium
7. **Week picker is 48 unlabelled cells** — no phase headers, dense, easy to tap wrong week.
8. **Progress KPI tiles too cramped** — 4 tiles at 9px labels on 375px phone.
9. **Empty states have no call to action** — "No activity yet" with no link or direction.
10. **Slide program forward has no warning** — permanently shifts 16-week schedule with no confirm dialog.
11. **Big 3 Total disappears if any lift missing** — should show partial (2 of 3 logged).

### Low
- Warmup collapsed by default; extra tap every session
- PR flash doesn't indicate auto-dismiss
- Upcoming sessions list silently truncates at 5
- Phase change nudge buried mid-scroll
- "?" buttons have no aria-label or tooltip
- Mobility completion alert easy to miss if scrolled down

---

## Engineering Review (2026-05-16)

### Critical Issues (fix soon)
1. **Calendar date logic still fragile** (line 1962) — Late completions (scheduled Wed, done Thu) won't show as done on Wed. The `_scheduledDate===date` check doesn't handle "completed late but for this scheduled day."
2. **Training days not validated on load** — If `S.trainingDays` is corrupted/null in localStorage, `buildSchedule()` returns `[]` silently and all sessions disappear with no error.
3. **Schedule cache never expires across days** — Invalidated only on `startDate`/`trainingDays` change, not on date change. App open past midnight shows stale sessions.

### High Issues
4. **Away mode history recorded under substitute name** — Completing in away mode logs history as "Push-Up" not "Bench Press". PRs and "last session" break when returning to gym.
5. **Training streak edge case** — Rest days with no mobility can cause streak to count back from wrong anchor point.

### Medium Issues
6. **Multiple mobility routines same day collide** — Mob checks keyed by date; completing two routines overwrites the first in history.
7. **Away rep targets use deadlift 1RM for horizontal pulls** — `pull_h` and `hinge` both map to deadlift, which is biomechanically wrong for rows.

### Low Issues
8. No upper bound on `ex.sets` loop — crafted localStorage data could hang the renderer.
9. No input validation on weight/reps fields — malformed strings silently parsed.

---

## Session Review (2026-05-16)

### What Was Done
1. **Bug Investigation** — Identified why Friday's workout was showing as completed on Saturday. Root cause: `completeSession()` didn't validate that sessions matched their scheduled dates.
2. **Initial Fix Attempt** — Fixed the bug in workout_app_v7.html:
   - Added date validation to prevent completing future sessions
   - Stores both `_scheduledDate` and `_completedDate` for accuracy
   - Created PR #1, got it merged, then updated index.html to sync with v7
3. **UI Design Crisis** — Discovered that copying v7 to index.html overwrote newer UI improvements from commits like "Redesign Calendar, 1RM, and Progress screens"
4. **UI Restoration** — Restored index.html to the current design and reapplied the bug fix
5. **Logic Bug Fix** — Found that the date validation logic was inverted:
   - Original (wrong): `doneLog._completedDate>=date` — showed Friday as done if completed on Saturday or later
   - Corrected: `doneLog._scheduledDate===date||(!doneLog._scheduledDate&&doneLog._completedDate===date)` — only shows session as done on its scheduled date
6. **Documentation** — Created CLAUDE.md (technical) and memory.md (user-facing context)

### Key Learnings
- **Workflow Note:** When fixing a bug that affects the production file (index.html), update both the version file AND index.html in the same PR. Don't merge and then update separately.
- **File Version Management:** Always verify which file is the "current" production version before overwriting. v7 was outdated; newer work had been done on index.html directly.
- **Date Comparison Logic:** Must be precise with date comparisons. Using `>=` instead of `===` completely inverted the intended behavior.
- **Backward Compatibility:** Old data may not have _scheduledDate field, so validation must fall back to _completedDate for legacy records.
- **Storage Design:** Dual-field approach (`_scheduledDate` + `_completedDate`) is cleaner than trying to infer dates from completion status alone.

### Current Status
- ✅ Bug correctly fixed and deployed to main
- ✅ UI design preserved and restored
- ✅ Calendar date validation logic corrected
- ✅ Code changes committed and pushed
- ✅ Documentation complete
- ✅ All issues resolved

### Issues Encountered & Resolved
1. **UI Overwrite:** Mistakenly copied older v7 to index.html, losing newer UI improvements → Restored from git history
2. **Inverted Logic:** Date validation was backward (showing future completions on past dates) → Fixed comparison logic
3. **Deployment Order:** Updated production after merge instead of before → Documented for future workflow

## Project Purpose
A strength training program tracker for Bill Zhou's 16-week training cycle. Logs workouts, tracks progression, manages away-mode (bodyweight-only) sessions, and provides statistics on consistency and strength.

## Key Workflows

### User Flow
1. **Setup** — Enter program start date and training days (which days of week to train)
2. **Daily** — Log exercises and sets; mark session complete when done
3. **Away Mode** — Toggle for travel/gym closures (substitutes bodyweight exercises)
4. **Tracking** — Monitor 1RM progression, exercise PRs, and monthly stats
5. **Calendar** — View program at a glance, jump to any week

### Data Storage
Everything saves to browser localStorage automatically via `saveState()`. Data includes:
- Session logs (all workouts and sets)
- Exercise history (every set logged)
- 1RM values (manual or auto-calculated)
- Bodyweight tracking
- Mobility completion records
- Training streak

## Recent Discoveries & Fixes

### Bug: Workout Completion Date Validation (Fixed in v7)
**Issue:** If you viewed a past or future session and marked it complete, it would show that date as completed even though you completed it on a different date. Example: Friday's workout showing as done when you actually worked out on Saturday.

**Root Cause:** Sessions were stored by week/dayIndex only. The `completeSession()` function didn't validate that you were completing today's session—you could complete any session from any date.

**Solution Implemented:**
- Added date validation to `completeSession(w, di, schedDate)`
- Prevents completing future sessions (button disabled with warning)
- Stores both scheduled date and completion date
- Calendar validates that completion matches scheduled date
- Stats/streak count by scheduled date

**Workflow Impact:** Users should now complete sessions on the day they're scheduled (or same day/next day for makeup). The app prevents accidental completion of wrong dates.

## Known Limitations
- No cloud sync (localStorage only—data lost if browser cache cleared)
- No multi-device sync
- Single user per browser
- No way to edit completed sets (only undo and re-log)

## Future Considerations
- Export data (CSV, JSON)
- Dark mode toggle (currently always dark)
- Customizable exercise names/substitutions
- Deload week auto-reduction logic
- Mobile app (currently PWA-optimized)

## Deployment
- **Production:** index.html (deployed/shared)
- **Development:** Edit workout_app_v*.html, sync to index.html before pushing
- **Testing:** Open index.html locally in browser
