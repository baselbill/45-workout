// ─── 45-WORKOUT v2: strength ───
// 1RM lookups and exercise prescription calculation.
// parsePct, RM_LIFTS, PHASE_CHANGE_WEEKS are in program.js (data layer).
// calcEpley, autoCalcRM are in history.js.

// Calculate total volume (kg × reps) for a completed session
function getSessionVolume(w, di) {
  const l = getLog(w, di);
  let vol = 0;
  Object.values(l).forEach(exLog => {
    if (typeof exLog !== 'object' || !exLog) return;
    Object.values(exLog).forEach(s => {
      if (s && s.done && s.weight && s.reps) vol += parseFloat(s.weight) * parseInt(s.reps);
    });
  });
  return Math.round(vol);
}

function getRM(id) {
  // Manual override takes priority, then auto-calc from history
  const rm = S.rm[id];
  if (rm && rm.weight && rm.reps) return calcEpley(parseFloat(rm.weight), parseInt(rm.reps));
  return autoCalcRM(id);
}

function getExRec(ex) {
  const lid = LIFT_TO_RM[ex.n];
  if (!lid) return null;
  const pct = parsePct(ex.load);
  if (!pct) return null;
  const rm = getRM(lid);
  if (!rm) return null;
  return {kg: Math.round(rm * pct / 2.5) * 2.5, pct: Math.round(pct * 100), rm};
}

function needsRMRetest() {
  const next = getNextPendingSession();
  if (!next) return false;
  if (PHASE_CHANGE_WEEKS.includes(next.week) && next.dayIdx === 0) {
    return !S.rm[`phase_retest_${next.week}`];
  }
  return false;
}

// Save a snapshot of current 1RM entry to history (called from strength screen)
function snapshotRM(id) {
  const rm = S.rm[id];
  if (!rm || !rm.weight || !rm.reps) return;
  if (!S.rmHistory[id]) S.rmHistory[id] = [];
  S.rmHistory[id].push({
    date: todayStr(),
    weight: parseFloat(rm.weight),
    reps: parseInt(rm.reps),
    estimated: calcEpley(parseFloat(rm.weight), parseInt(rm.reps)),
  });
  const next = getNextPendingSession();
  if (next && PHASE_CHANGE_WEEKS.includes(next.week)) S.rm[`phase_retest_${next.week}`] = true;
  saveState();
  renderStrength();
}
