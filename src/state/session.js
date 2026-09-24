// ─── 45-WORKOUT v2: session ───

function phaseFor(w) { return w <= 4 ? 0 : w <= 8 ? 1 : w <= 12 ? 2 : 3; }
function dayKey(w, d) { return `w${w}d${d}`; }
function getLog(w, d) { return S.logs[dayKey(w,d)] || {}; }
function setLog(w, d, data) { S.logs[dayKey(w,d)] = data; saveState(); }
function isSessionDone(w, d) { return !!(S.logs[dayKey(w,d)] || {})._completed; }

// Map of calendar date -> {week, dayIdx, log} for every completed session, keyed by the
// ACTUAL date the work was done (_completedDate), not the day it was originally scheduled
// for. Used by the calendar/streak/stats views so a late or early completion is recorded
// on the day it really happened, not the day it was supposed to happen.
function getCompletionsByDate() {
  const map = {};
  Object.entries(S.logs || {}).forEach(([key, log]) => {
    if (!log || !log._completed) return;
    const date = log._completedDate || log._scheduledDate;
    if (!date) return;
    const m = key.match(/^w(\d+)d(\d+)$/);
    if (!m) return;
    map[date] = { week: parseInt(m[1], 10), dayIdx: parseInt(m[2], 10), log };
  });
  return map;
}

function completeSession(w, di, schedDate) {
  const today = todayStr();
  // Guard against string 'null' or invalid dates from onclick interpolation
  if (schedDate === 'null' || typeof schedDate !== 'string' || !isValidDate(schedDate)) {
    schedDate = null;
  }
  if (schedDate && schedDate > today) { showToast('Cannot complete future sessions', 'error'); return; }
  // Validate date strings before storing
  const safeScheduledDate = (schedDate && isValidDate(schedDate)) ? schedDate : today;
  const l = getLog(w, di);
  l._completed = true;
  l._completedDate = today;
  l._awayMode = S.awayMode;
  l._scheduledDate = safeScheduledDate;
  setLog(w, di, l);
  // Use the same resolved exercise list that was shown to the user
  const pi = phaseFor(w);
  const day = P.phases[pi].days[di];
  const resolvedExercises = day.exercises.map(ex => {
    if (S.awayMode) { const sub = getAwayExercise(ex); return sub ? {...sub, originalName: ex.n} : ex; }
    return ex;
  });
  resolvedExercises.forEach((ex, ei) => {
    const exLog = l[ei] || {};
    const sets = Object.values(exLog).filter(s => s && typeof s === 'object' && 'done' in s);
    // Always record under the gym exercise name (ex.originalName for away subs, ex.n for gym).
    // This ensures exHistory keys match between gym and away sessions so PRs and last-session
    // lookups work correctly regardless of which mode the user was in.
    if (sets.length) recordExerciseHistory(ex.originalName || ex.n, sets, w);
  });
  // Auto-calculate 1RM from history after recording
  RM_LIFTS.forEach(lift => {
    const auto = autoCalcRM(lift.id);
    if (auto && (!S.rm[lift.id] || !S.rm[lift.id].weight)) {
      if (!S.rm[lift.id]) S.rm[lift.id] = {};
      S.rm[lift.id]._auto = auto;
    }
  });
  // Clear session PR tracking
  Object.keys(sessionPRsFlashed).forEach(k => {
    if (k.startsWith(dayKey(w,di))) delete sessionPRsFlashed[k];
  });
  saveState();
  resetSessionClock();
  // Keep showing the session that was just completed (its read-only "Undo completion" view)
  // instead of clearing viewingSession. With it cleared, renderToday() falls through to
  // getNextPendingSession() — since THIS session is now done, that's a different, upcoming
  // session with nothing logged yet, so the screen would silently swap to a blank checklist
  // right as the user finishes, with zero confirmation that anything completed. That read as
  // "the button doesn't do anything" even though the session was in fact marked done.
  viewingSession = { week: w, dayIdx: di };
  window.scrollTo(0, 0);
  renderToday();
}

function uncompleteSession(w, di) {
  const l = getLog(w, di);
  delete l._completed;
  delete l._completedDate;
  delete l._scheduledDate;
  delete l._awayMode;
  setLog(w, di, l);
  renderToday();
}

// Slide the program start date forward so today becomes the next session.
// Called from the "Missed workouts" modal.
function slideProgramForward() {
  const missed = getMissedSessions();
  if (!missed.length) { closeModal('modal-missed'); return; }
  showConfirm(
    'Slide schedule to today?',
    'This shifts your entire schedule so today becomes your next session. Your logged workouts are kept.',
    () => {
      const firstMissed = missed[0].date;
      const td = new Date(todayStr() + 'T00:00:00');
      const ed = new Date(firstMissed + 'T00:00:00');
      const diff = Math.round((td - ed) / 86400000);
      const ns = new Date(S.startDate + 'T00:00:00');
      ns.setDate(ns.getDate() + diff);
      S.startDate = dateStr(ns);
      // Invalidate schedule cache
      S._sc = null;
      saveState();
      closeModal('modal-missed');
      renderToday();
    }
  );
}
