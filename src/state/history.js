// ─── 45-WORKOUT v2: history ───

// exHistory[exName] = [{date, week, sets:[{weight,reps}], bestWeight, bestReps, volume}]
// NOTE: callers must always pass the gym exercise name. Away-sub resolution is
// handled by the caller (completeSession passes ex.originalName || ex.n).
function recordExerciseHistory(exName, sets, week) {
  if (!S.exHistory) S.exHistory = {};
  if (!S.exHistory[exName]) S.exHistory[exName] = [];
  const validSets = sets.filter(s => s && s.done && (s.weight || s.reps));
  if (!validSets.length) return;
  const entry = {
    date: todayStr(),
    week,
    sets: validSets.map(s => ({weight: parseFloat(s.weight)||0, reps: parseInt(s.reps)||0})),
    bestWeight: Math.max(...validSets.map(s => parseFloat(s.weight)||0)),
    bestReps: Math.max(...validSets.map(s => parseInt(s.reps)||0)),
    volume: validSets.reduce((a,s) => a + (parseFloat(s.weight)||1) * (parseInt(s.reps)||0), 0),
  };
  // Remove existing entry for same date
  S.exHistory[exName] = S.exHistory[exName].filter(e => e.date !== todayStr());
  S.exHistory[exName].push(entry);
  // Keep last 20 entries per exercise
  if (S.exHistory[exName].length > 20) S.exHistory[exName] = S.exHistory[exName].slice(-20);
}

function getLastSession(exName) {
  const hist = (S.exHistory[exName] || []);
  if (hist.length < 2) return null; // need at least 2 — today and a previous
  // Return most recent entry that isn't today
  const prev = [...hist].filter(e => e.date !== todayStr()).sort((a,b) => b.date.localeCompare(a.date));
  return prev[0] || null;
}

function getPR(exName) {
  const hist = S.exHistory[exName] || [];
  if (!hist.length) return null;
  return hist.reduce((best,e) => e.bestWeight > best.bestWeight ? e : best, hist[0]);
}

// Epley formula: 1RM = weight × (1 + reps/30)
function calcEpley(weight, reps) {
  const w = parseFloat(weight) || 0, r = parseInt(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w);
  return Math.round(w * (1 + r/30));
}

// Auto-calculate 1RM from exercise history (best logged set per lift)
function autoCalcRM(liftId) {
  // Find all exercises that map to this liftId
  const exNames = Object.keys(LIFT_TO_RM).filter(k => LIFT_TO_RM[k] === liftId);
  let bestEstimate = 0;
  exNames.forEach(name => {
    const hist = S.exHistory[name] || [];
    hist.forEach(entry => {
      entry.sets.forEach(s => {
        if (s.weight > 0 && s.reps > 0) {
          const est = calcEpley(s.weight, s.reps);
          if (est > bestEstimate) bestEstimate = est;
        }
      });
    });
  });
  return bestEstimate || null;
}

// BW-only loads — no weight field needed
function isBWOnly(load) {
  return /^BW$|^Band$|^Light band$|^Moderate cable$|^Light cable$|^Heavy DB$|^BW \/ band$/i.test((load||'').trim());
}

// Time-based reps — show seconds input not reps
function isTimeBased(reps) {
  return typeof reps === 'string' && /sec/i.test(reps);
}

function timeInputPlaceholder(reps) {
  // Extract seconds from strings like "35 sec/side", "60 sec"
  const m = (reps||'').match(/(\d+)\s*sec/i);
  return m ? `${m[1]}s target` : 'sec';
}
