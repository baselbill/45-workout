// ─── 45-WORKOUT v2: schedule ───

function buildSchedule() {
  if (!S.startDate || !S.trainingDays) return [];
  const start = new Date(S.startDate + 'T00:00:00');
  const days = [...S.trainingDays].sort((a,b) => a-b);
  const sessions = [];
  let count = 0;
  let d = new Date(start);
  let itr = 0;
  while (count < 48 && itr < 500) {
    itr++;
    const dow = d.getDay();
    if (days.includes(dow)) {
      sessions.push({
        date: dateStr(d),
        week: Math.floor(count/3) + 1,
        dayIdx: count % 3,
        sessionIdx: count,
      });
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return sessions;
}

// Cache invalidates when startDate, trainingDays, or calendar date changes.
// The date check ensures the cache expires at midnight for users who keep the
// app open overnight — without it, getTodaySession() would return stale results.
let _schedCache = null;
let _schedCacheDate = null;
let _schedCacheStart = null;
let _schedCacheDays = null;

function getSchedule() {
  const today = todayStr();
  const daysKey = JSON.stringify(S.trainingDays);
  if (
    !_schedCache ||
    _schedCacheDate !== today ||
    _schedCacheStart !== S.startDate ||
    _schedCacheDays !== daysKey
  ) {
    _schedCache = buildSchedule();
    _schedCacheDate = today;
    _schedCacheStart = S.startDate;
    _schedCacheDays = daysKey;
  }
  return _schedCache;
}

function getTodaySession() {
  return getSchedule().find(s => s.date === todayStr()) || null;
}

function getNextPendingSession() {
  const t = todayStr();
  for (const s of getSchedule()) {
    if (s.date >= t && !isSessionDone(s.week, s.dayIdx)) return s;
  }
  return null;
}

function getMissedSessions() {
  const t = todayStr();
  return getSchedule().filter(s => s.date < t && !isSessionDone(s.week, s.dayIdx));
}
