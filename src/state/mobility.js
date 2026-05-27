// ─── 45-WORKOUT v2: mobility ───

function getMobCheckKey(phaseIdx, routineIdx) {
  const p = phaseIdx !== undefined ? phaseIdx : mobPhaseView;
  const r = routineIdx !== undefined ? routineIdx : mobRoutineView;
  return `${todayStr()}_p${p}_r${r}`;
}

function getMobChecks(phaseIdx, routineIdx) {
  return S.mobChecks[getMobCheckKey(phaseIdx, routineIdx)] || {};
}

function setMobCheck(idx, val, phaseIdx, routineIdx) {
  const pi = phaseIdx !== undefined ? phaseIdx : mobPhaseView;
  const ri = routineIdx !== undefined ? routineIdx : mobRoutineView;
  const k = getMobCheckKey(pi, ri);
  if (!S.mobChecks[k]) S.mobChecks[k] = {};
  S.mobChecks[k][idx] = val;
  const routine = MOB_DATA[pi].routines[ri];
  const checks = S.mobChecks[k];
  const allDone = routine.items.every((_,i) => checks[i]);
  if (allDone) {
    if (!S.mobHistory) S.mobHistory = [];
    const routineName = MOB_DATA[pi].routineLabel[ri];
    const entry = {
      date: todayStr(),
      phase: pi,
      routine: ri,
      phaseName: MOB_DATA[pi].phase,
      routineName,
    };
    if (!S.mobHistory.find(e => e.date === entry.date && e.phase === pi && e.routine === ri)) {
      S.mobHistory.push(entry);
    }
  }
  saveState();
}
