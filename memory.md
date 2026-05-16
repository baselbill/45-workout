# 45-Workout — Project Memory

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
