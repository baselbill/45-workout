// ─── 45-WORKOUT v2: store ───

const STORE_KEY = 'wkapp_v2';

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function loadState() {
  try {
    const r = localStorage.getItem(STORE_KEY);
    if (r) return JSON.parse(r);
  } catch(e) {}
  return {
    logs: {},
    rm: {},
    rmHistory: {},
    bw: [],
    startDate: null,
    trainingDays: [1,3,5],
    mobChecks: {},
    mobHistory: [],
    awayMode: false,
    exHistory: {},
  };
}

function saveState() {
  try {
    const t = {
      _v: 2,
      logs: S.logs,
      rm: S.rm,
      rmHistory: S.rmHistory,
      bw: S.bw,
      startDate: S.startDate,
      trainingDays: S.trainingDays,
      mobChecks: S.mobChecks,
      mobHistory: S.mobHistory || [],
      awayMode: S.awayMode,
      exHistory: S.exHistory || {},
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(t));
  } catch(e) {}
}

// Check for v1 data and prompt migration
function checkMigration() {
  const raw = localStorage.getItem('wkapp_v7');
  if (raw && !localStorage.getItem(STORE_KEY)) {
    // v1 data exists, no v2 data — will be handled by setup screen
    return true; // has v1 data
  }
  return false;
}

let S = loadState();

// Validate all critical state fields on load — prevents crashes from corrupted/legacy data
if (!S.rmHistory) S.rmHistory = {};
if (!S.mobChecks) S.mobChecks = {};
if (!S.mobHistory) S.mobHistory = [];
if (!S.exHistory) S.exHistory = {};
if (S.awayMode === undefined) S.awayMode = false;
if (!S.logs || typeof S.logs !== 'object') S.logs = {};
if (!S.rm || typeof S.rm !== 'object') S.rm = {};
if (!S.trainingDays || !Array.isArray(S.trainingDays) || S.trainingDays.length === 0) S.trainingDays = [1,3,5];
// Validate startDate format on load
if (S.startDate && !isValidDate(S.startDate)) S.startDate = null;

// ─── DATE UTILITIES ───────────────────────────────────────────────────────────
function dateStr(d) {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function todayStr() { return dateStr(new Date()); }
function formatDateDisplay(ds) {
  if (!ds) return '—';
  const d = new Date(ds + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'});
}
function getLatestBW() {
  if (!S.bw || !S.bw.length) return null;
  const sorted = [...S.bw].sort((a,b) => b.date.localeCompare(a.date));
  return sorted[0].weight;
}
