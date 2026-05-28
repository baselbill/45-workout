# Design System — Strength·45

## Product Context
- **What this is:** A 16-week strength training program tracker. Users log sets and reps, track 1RM, run rest timers, and review session history.
- **Who it's for:** Solo strength athletes who take training seriously. Not beginners, not casual gym-goers.
- **Space/industry:** Fitness PWA / personal training tool
- **Project type:** Mobile-first single-page web app (PWA)
- **North star:** *"Serious instrument"* — first impression should be precision tooling, not a wellness app.

---

## Aesthetic Direction
- **Direction:** Industrial / Utilitarian
- **Decoration level:** Minimal — typography, spacing, and data hierarchy carry the weight. No ornament.
- **Mood:** The app should feel like something a powerlifter would trust with their programming. Dense but readable. Purposeful. No softness.
- **Reference posture:** Closer to a training log and a stopwatch than a fitness brand.

---

## Typography

- **Body / UI:** `Geist` (400/500/600/700) — replaces Inter. Neutral grotesque with slightly more structural character. Tabular numerals baked in, which suits data-heavy screens.
- **Numbers / Data / Timer:** `JetBrains Mono` (400/500/600/700) — rest timer, weight inputs, rep counters. Monospaced so numbers don't reflow mid-set.
- **Fallback stack:** `'Geist','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`
- **Loading:** Google Fonts CDN — `family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700`

| Role | Font | Weight | Size |
|------|------|--------|------|
| Hero / session title | Geist | 700 | 22–24px |
| Body text | Geist | 400 | 14–16px |
| Labels / badges | Geist | 500–600 | 10–13px |
| Rest timer (large) | JetBrains Mono | 600 | 40–64px |
| Weight / reps inputs | JetBrains Mono | 500 | 15–17px |
| Code / technical | JetBrains Mono | 400 | 13px |

---

## Color

**Approach:** Restrained — one accent + semantic colors. Color is rare and meaningful.

| Variable | Hex | Role |
|----------|-----|------|
| `--bg` | `#0E0E10` | Page background |
| `--surf` | `#17171B` | Card / surface background |
| `--surf2` | `#1F1F24` | Elevated surface (modals, popovers) |
| `--border` | `rgba(255,255,255,0.06)` | Default border |
| `--border2` | `rgba(255,255,255,0.12)` | Prominent border / input |
| `--text` | `#EAEAEC` | Primary text |
| `--muted` | `#8B8B92` | Secondary / supporting text |
| `--muted2` | `#5A5A62` | Placeholder / disabled text |
| `--accent` | `#FF6B35` | Primary action, highlight, CTA |
| `--accent-dim` | `rgba(255,107,53,0.14)` | Accent background tint |
| `--success` | `#5BC489` | Completed session, set logged |
| `--amber` | `#E8B040` | Warning, near-miss |
| `--blue` | `#60a5fa` | Info, neutral secondary action |
| `--red` | `#E76A6A` | Error, missed session |
| `--purple` | `#a78bfa` | Deload week, special sessions |

**Dark mode:** This app is dark-mode only. `--bg` is near-black, not pure black, to soften contrast slightly.

---

## Spacing

- **Base unit:** 4px
- **Density:** Compact-to-comfortable. Data-heavy screens lean compact; rest / completion screens breathe more.
- **Scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48

Standard gaps in use:
- Card padding: 14px vertical / 16px horizontal
- Screen padding: 16px horizontal
- Section gap: 24–32px
- Bottom nav clearance: 110px

---

## Layout

- **Approach:** Grid-disciplined with single-column mobile layout
- **Max width:** 480px (centered on larger screens)
- **Border radius:** `--r: 10px` (cards, modals) / `--r-sm: 6px` (buttons, inputs, badges)
- **Design rationale:** Tighter radius reads as precision tooling rather than consumer softness. Still rounds enough to avoid harsh edges on a touch target.

---

## Motion

- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Transitions:** 150ms ease for color/opacity state changes (`.15s` in CSS)
- **Toast enter/exit:** `opacity` + `transform: translateY` — 300ms
- **Scale feedback:** active presses `scale(.98)` for 150ms
- **Coach line crossfade:** 200ms opacity fade when rotating phrases
- **No scroll animations. No entrance choreography. No decorative motion.**

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-27 | Initial design system created | /design-consultation — north star "serious instrument" |
| 2026-05-27 | Geist replaces Inter as body font | More structural character; tabular numerals; suits a precision tool |
| 2026-05-27 | Border radius tightened: 14px→10px, 10px→6px | Crisper, less bubbly; reinforces utilitarian aesthetic |
| 2026-05-27 | JetBrains Mono retained for all numeric display | Already in use; excellent tabular rendering; reads as engineering precision |
| 2026-05-27 | Colors unchanged | Dark palette is already correct for the aesthetic; no change needed |
