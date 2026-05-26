# 45-Workout — Product Requirements

## Overview
A 16-week strength training program tracker built as a single-page HTML application. Users log workouts, track exercises, manage 1RM (one-rep max), monitor mobility routines, and view progress through calendar and statistics views.

## Core Features

### 1. 16-Week Strength Training Program
- Structured program lasting 16 weeks (48 sessions total)
- User selects 3 training days per week during setup
- Program is pre-designed with scheduled exercises for each session
- Sessions are indexed and scheduled from the program start date

### 2. Today Screen (Workout Logging)
- Display today's scheduled session or indicate rest day
- Exercise card interface with:
  - Exercise name and muscle group details
  - Target weights/rep ranges (calculated from 1RM)
  - Set-by-set logging UI with reps and weight inputs
  - Stepper controls for adjusting reps/weight per set
  - "1 rep short" or "beat last" notifications comparing to previous sessions
  - Rest timer between sets that continues running in background when app loses focus
  - Visual completion status (checkmark, green highlighting)
  - Help/reference button for exercise form guidance
- Complete session button when all exercises are finished
- Session can only be marked complete on its scheduled date
- Tracks both scheduled date and completion date

### 3. Calendar View
- Monthly calendar display showing:
  - Completed sessions (green checkmark)
  - Missed sessions (red mark)
  - Rest days
  - Current day highlighting
- Modal for managing missed sessions ("Slide schedule to today" option)
- Jump to any session in the 16-week program
- Week picker for quickly navigating

### 4. 1RM Tracker (Strength Screen)
- Track one-rep max for multiple lifts:
  - Bench Press
  - Squat
  - Deadlift
  - Pull-ups
  - OHP (Overhead Press)
- Features:
  - Manual 1RM entry
  - Auto-calculate from logged lifts
  - Display strength level relative to bodyweight
  - View historical progression
  - Strength level badges (Building, Intermediate, Strong, Very Strong)

### 5. Progress Screen (Statistics)
- Weekly volume tracking:
  - Total weight × reps per week
  - Visual volume bars showing trend across weeks
  - Strength snapshot with current 1RMs
- Progress tracking:
  - Visualize progression across the 16-week program
  - KPI tiles with charts

### 6. Mobility Routine Tracking
- Mobility checklist with:
  - Expandable detail cards for each routine
  - Step-by-step instructions
  - Visual checkboxes
  - Completion state styling
- Track completion history
- Required for balanced training recovery

### 7. Away Mode (Bodyweight Training)
- Enable when traveling without gym access
- Automatically substitutes exercises with bodyweight/minimal equipment alternatives
- Intelligent rep/set recommendations based on:
  - User's strength level (1RM/bodyweight ratio)
  - Exercise movement pattern
  - 4 strength buckets: Building, Intermediate, Strong, Very Strong
- Coverage:
  - 40+ exercises with substitution patterns
  - Patterns: push_h, push_v, pull_h, pull_v, hinge, squat, core, isolation
  - Multiple alternatives per exercise with detailed cues
  - Includes equipment-free or minimal-equipment suggestions
- Features:
  - Detailed notes on form and loading for each substitute
  - Alternative exercises if primary substitute isn't suitable
  - Specifically designed for travel scenarios

### 8. Exercise Reference Library
- Comprehensive form guides with:
  - Step-by-step instructions
  - Performance cues/tips
  - Common mistakes to avoid
  - Search functionality
- In-app reference panel that:
  - Opens from exercise cards via help button
  - Slides up from bottom (modal-style)
  - Includes video link suggestions where applicable
- Full library covers all 48 session exercises

### 9. Bodyweight Logging
- Log bodyweight entries with:
  - Weight value (kg, decimal support)
  - Date of measurement
  - Historical tracking
- Used for 1RM/bodyweight ratio calculations in Away Mode

### 10. Data Persistence
- All data saved locally in browser localStorage:
  - Program start date
  - Training days selection
  - Session logs (exercises, sets, reps, weights)
  - 1RM values
  - Bodyweight history
  - Mobility completion tracking
  - Away mode status
- No account/login required
- Data persists across browser sessions
- No external API calls or synchronization

### 11. Program Management
- Setup wizard on first visit:
  - Select program start date
  - Choose 3 training days per week
- Program controls:
  - "Slide schedule to today" modal (with confirmation) to reset missed sessions without losing logged data
  - Uncomplete sessions if logged incorrectly
  - Revert session completion state

### 12. Mobile-First Design
- Responsive layout:
  - Optimized for phones (max-width 480px, up to 480px container)
  - Center-aligned layout with safe areas for notch/home indicator
- Dark theme with accessible colors:
  - Background: `#0f1117`
  - Surface: `#17171b`
  - Accent (primary): `#ff6b35`
  - Success (complete): `#5bc489`
  - Text: `#eaeaec`
- Touch-friendly interface:
  - 44px minimum touch targets
  - Tap-highlight removal for smooth interactions
  - Smooth scrolling and animations
- Bottom navigation:
  - 5 main sections: Today, Calendar, 1RM, Progress, Mobility
  - Fixed bottom nav with icon + label
  - Persistent across all screens
- Works offline:
  - No external dependencies except Google Fonts
  - Fully functional without internet
  - Single HTML file deployment

### 13. Session Completion Validation
- Prevents marking sessions complete on wrong dates
- Tracks both:
  - `_scheduledDate`: when session was scheduled
  - `_completedDate`: when user marked it complete
- Validation ensures:
  - Sessions can only be marked complete on their scheduled date
  - No future completions allowed
  - Calendar displays completion only on scheduled date
- Training streak and stats count by scheduled date

### 14. Real-Time Rest Timer
- Starts between sets during workout logging
- Continues running in background when app loses focus
- Uses wall-clock time (Date.now()) instead of counter for accuracy
- Provides audio/visual countdown
- Recovers correctly when returning to app

### 15. Confirmation Dialogs
- Custom modal-based confirmations (not native browser dialogs):
  - "Slide schedule to today" requires explicit confirmation
  - Consistent styling with app design
  - Reliable across all devices and browsers

## Technical Architecture

### Single-Page Application
- All code in one HTML file (~2400 lines)
- Embedded CSS (minified)
- Embedded JavaScript (all logic)
- No build step required — open index.html in browser
- No external dependencies except Google Fonts

### Data Model (localStorage key `S`)
- `S.startDate` — Program start date (YYYY-MM-DD)
- `S.trainingDays` — Array of days of week when user trains (0-6)
- `S.logs` — Session data by `dayKey(week, dayIndex)` → exercise sets
- `S.exHistory` — Exercise history for each lift
- `S.rm` — One-rep max values (bench, squat, deadlift, pullup, ohp)
- `S.bw` — Bodyweight tracking with dates
- `S.awayMode` — Boolean flag for bodyweight-only sessions
- `S.mobChecks` — Mobility routine completion tracking
- `S.mobHistory` — Completed mobility sessions

## File Structure
- **index.html** — Production file (keep in sync with latest version)
- **workout_app_v*.html** — Versioned development backups
- **CLAUDE.md** — Codebase documentation
- **PRODUCT_REQUIREMENTS.md** — This file
- **memory.md** — User notes and decisions

## Non-Goals
- Cloud synchronization or account systems
- Multi-device sync (single device, browser-only)
- Social features or sharing
- Advanced analytics beyond basic progress charts
- External integrations (MyFitnessPal, Strava, etc.)
