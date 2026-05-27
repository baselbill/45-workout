// ─── 45-WORKOUT v2: today ───
// Today screen: workout logging, away mode toggle, rest day mobility view
// FIX (E2-4): warmupCollapsed persists across re-renders via module-level variable.
// FIX (E2-1): openModal/closeModal use depth counter — see modals.js.
// FIX (E2-7): completeSession/uncompleteSession moved to session.js; showToast in toast.js.

// ─── AWAY MODE TOGGLE ─────────────────────────────────────────────────────────
function toggleAwayMode(){
  // Check if any sets are already logged (done:true) in the current session
  if(viewingSession||getTodaySession()){
    const sess=viewingSession||getTodaySession();
    const log=getLog(sess.week,sess.dayIdx);
    const hasDoneSets=Object.values(log).some(exLog=>typeof exLog==='object'&&exLog&&Object.values(exLog).some(s=>s&&s.done));
    if(hasDoneSets&&!confirm('Switching away mode will swap exercises. Continue?'))return;
  }
  S.awayMode=!S.awayMode;
  saveState();
  renderToday();
}

// ─── TODAY ────────────────────────────────────────────────────────────────────
let viewingSession=null;
let _missedBannerDismissedCount=-1; // count at time of dismiss; -1 means not dismissed
function dismissMissedBanner(){_missedBannerDismissedCount=getMissedSessions().length;renderToday();}
// E2-4: Persist warmup collapsed state across renderToday() calls (logging a set triggers re-render).
// Without this, the warmup section snaps back open on every set tick.
let warmupCollapsed=false;

// ─── COACH LINES ─────────────────────────────────────────────────────────────
// Motivational phrases that cycle every 12 s during an active workout session.
const _COACH_LINES=[
  "Focus on form — every clean rep compounds.",
  "Show up. The rest follows.",
  "Progressive overload is the only rule.",
  "Consistency beats intensity over a year.",
  "Every session moves the needle.",
  "Technique today, weight tomorrow.",
  "Your future self is watching.",
  "Grip it. Own it. One more clean rep.",
  "Rest is where strength is built.",
  "Small weights today, heavy weights later.",
];
let _verseCache=[..._COACH_LINES].sort(()=>Math.random()-.5);
let _coachLineIdx=0;
let _coachLineInterval=null;
function startCoachLine(){
  if(_coachLineInterval)return;
  _coachLineInterval=setInterval(()=>{
    _coachLineIdx=(_coachLineIdx+1)%_verseCache.length;
    const el=document.getElementById('coach-line-text');
    if(!el)return;
    el.style.opacity='0';
    setTimeout(()=>{if(!el.isConnected)return;el.textContent=_verseCache[_coachLineIdx];el.style.opacity='1';},200);
  },12000);
}
function stopCoachLine(){clearInterval(_coachLineInterval);_coachLineInterval=null;}

// ─── REST DAY MOBILITY ────────────────────────────────────────────────────────
// On rest days the Today tab shows a mobility routine aligned to the user's
// last completed workout, instead of teasing the next workout's exercises.
let restMobPhase=-1, restMobRoutine=-1;
function getLastCompletedSession(){
  const t=todayStr();
  return getSchedule()
    .filter(s=>s.date<t&&isSessionDone(s.week,s.dayIdx))
    .sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}
// Consecutive days (counting back from today) with either a completed workout
// or a completed mobility routine. A blank "today" doesn't break the streak.
// Note: i===0 is today. If today has no entry, the loop doesn't break (i>0 guard),
// so yesterday's entry still starts the count. This is intentional — rest days
// between workout days should not reset the streak.
function getTrainingStreak(){
  const sessSet=new Set();
  // E2-2: Use an explicit dateKey variable to avoid adding undefined/empty-string to the Set
  // if both _scheduledDate and _completedDate are missing (legacy data without either field).
  Object.values(S.logs||{}).forEach(log=>{
    const dateKey=log._scheduledDate||log._completedDate;
    if(log._completed&&dateKey)sessSet.add(dateKey);
  });
  const mobSet=new Set((S.mobHistory||[]).map(e=>e.date));
  const td=new Date(todayStr()+'T00:00:00');
  let streak=0;
  for(let i=0;i<60;i++){
    const dd=new Date(td);dd.setDate(dd.getDate()-i);
    const ds=dateStr(dd);
    if(sessSet.has(ds)||mobSet.has(ds))streak++;
    else if(i>0)break;
  }
  return streak;
}
function routineForDayIdx(di){
  // Day 1 (idx 0) horizontal push/pull → upper (B). Day 2 (idx 1) lower → A. Day 3 (idx 2) vertical push/pull → upper (B).
  return di===1?0:1;
}
function switchRestMobRoutine(i){restMobRoutine=i;expandedMob=-1;renderToday();}
function toggleRestMobCheck(i){
  const wasComplete=MOB_DATA[restMobPhase].routines[restMobRoutine].items.every((_,idx)=>getMobChecks(restMobPhase,restMobRoutine)[idx]);
  setMobCheck(i,!getMobChecks(restMobPhase,restMobRoutine)[i],restMobPhase,restMobRoutine);
  renderToday();
  const nowComplete=MOB_DATA[restMobPhase].routines[restMobRoutine].items.every((_,idx)=>getMobChecks(restMobPhase,restMobRoutine)[idx]);
  if(!wasComplete&&nowComplete){document.getElementById('main').scrollTo({top:0,behavior:'smooth'});showToast('Mobility routine complete — logged!');}
}
function toggleRestMobExpand(i){expandedMob=expandedMob===i?-1:i;renderToday();}
function clearRestMobChecks(){
  S.mobChecks[getMobCheckKey(restMobPhase,restMobRoutine)]={};
  if(S.mobHistory) S.mobHistory=S.mobHistory.filter(e=>!(e.date===todayStr()&&e.phase===restMobPhase&&e.routine===restMobRoutine));
  saveState();renderToday();
}

function renderRestDayToday(missed){
  const lastSess=getLastCompletedSession();
  const next=getNextPendingSession();
  const phaseRefSess=lastSess||next;
  const phaseIdx=phaseRefSess?phaseFor(phaseRefSess.week):0;

  // Initialize / re-sync rest-day routine selection
  if(restMobRoutine===-1||restMobPhase!==phaseIdx){
    restMobRoutine=lastSess?routineForDayIdx(lastSess.dayIdx):2;
    restMobPhase=phaseIdx;
  }

  const phaseData=MOB_DATA[restMobPhase];
  const routine=phaseData.routines[restMobRoutine];
  const checks=getMobChecks(restMobPhase,restMobRoutine);
  const totalItems=routine.items.length;
  const checkedCount=Object.values(checks).filter(Boolean).length;
  const pct=Math.round(checkedCount/totalItems*100);
  const today=todayStr();

  let html='';

  // Missed banner (mirrors workout-day rendering)
  if(missed.length>0&&missed.length!==_missedBannerDismissedCount&&!viewingSession)
    html+=`<div class="missed-banner"><div class="row" style="margin-bottom:6px;align-items:center"><span style="font-size:13px;font-weight:500;color:var(--red);flex:1">⚠ ${missed.length} missed session${missed.length>1?'s':''}</span><button class="btn btn-sm" onclick="openMissedModal()" style="border-color:var(--red);color:var(--red)">Review</button><button onclick="dismissMissedBanner()" aria-label="Dismiss" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:18px;padding:0 4px;line-height:1;opacity:.7">×</button></div><div style="font-size:12px;color:var(--red);opacity:.8">Tap Review to slide your program forward</div></div>`;

  // Header
  const lastInfo=lastSess
    ? `After ${P.phases[phaseFor(lastSess.week)].days[lastSess.dayIdx].name}`
    : 'No completed sessions yet';
  html+=`<div class="page-header"><div class="row"><div><div class="page-title">Rest day · Mobility</div><div class="page-sub">${formatDateDisplay(today)} · ${lastInfo}</div></div><div style="display:flex;gap:6px;align-items:center"><span class="badge badge-blue">Rest</span><button class="btn btn-sm" onclick="openWeekPicker()" style="font-size:11px">Jump</button></div></div></div>`;

  // Next workout preview
  if(next) html+=`<div class="alert alert-blue" style="margin-bottom:10px;font-size:12px">Next workout: ${formatDateDisplay(next.date)} · Wk ${next.week} Day ${next.dayIdx+1}</div>`;

  html+=`<div class="alert alert-amber" style="margin-bottom:12px">Rest day mobility — non-negotiable for 45+. The suggested routine complements your last workout. Switch routines if you'd rather focus elsewhere.</div>`;

  // Routine tabs
  const suggestedRoutine=lastSess?routineForDayIdx(lastSess.dayIdx):2;
  html+=`<div class="section-label">Routine</div><div style="display:flex;gap:8px;margin-bottom:14px">`;
  phaseData.routineLabel.forEach((label,ri)=>{
    const isSuggested=ri===suggestedRoutine, isActive=ri===restMobRoutine;
    html+=`<button style="flex:1;padding:10px 6px;border-radius:var(--r-sm);border:1px solid ${isActive?'var(--accent)':isSuggested?'var(--amber)':'var(--border)'};background:${isActive?'var(--accent-dim)':isSuggested?'var(--amber-dim)':'transparent'};color:${isActive?'var(--accent)':isSuggested?'var(--amber)':'var(--muted)'};cursor:pointer;font-size:12px;font-weight:500;font-family:var(--sans);line-height:1.4;text-align:center" onclick="switchRestMobRoutine(${ri})">
      <strong>${['A','B','C'][ri]}</strong><br><span style="font-size:10px">${['Lower','Upper+T-spine','Full Flow'][ri]}</span>${isSuggested&&!isActive?'<br><span style="font-size:9px;opacity:.7">suggested</span>':''}
    </button>`;
  });
  html+=`</div>`;

  // Routine info + progress ring
  const r2=22,circ=2*Math.PI*r2,dash=circ*(pct/100),gap=circ-dash;
  html+=`<div class="card" style="margin-bottom:14px"><div class="row" style="margin-bottom:6px"><div><div style="font-size:14px;font-weight:500;color:var(--text)">${phaseData.routineLabel[restMobRoutine]}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${routine.focus}</div><div style="font-size:11px;font-family:var(--mono);color:var(--accent);margin-top:3px">${routine.dur} · ${phaseData.routineSuggest[restMobRoutine]}</div></div>
  <svg class="mob-ring" viewBox="0 0 56 56"><circle cx="28" cy="28" r="${r2}" fill="none" stroke="var(--surf2)" stroke-width="5"/><circle cx="28" cy="28" r="${r2}" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}" stroke-dashoffset="${(circ/4).toFixed(1)}" stroke-linecap="round"/><text x="28" y="33" text-anchor="middle" font-size="12" font-weight="600" font-family="monospace" fill="var(--text)">${pct}%</text></svg></div>
  <div style="font-size:11px;color:var(--muted)">${checkedCount} of ${totalItems} done today</div>
  ${pct===100?`<div class="alert alert-green" style="margin-top:10px;margin-bottom:0">✓ Routine complete — logged!</div>`:''}</div>`;

  // Exercise checklist
  routine.items.forEach((item,i)=>{
    const checked=!!checks[i],expanded=expandedMob===i,ref=EXREF[item.n];
    html+=`<div class="mob-check-card${checked?' checked':''}${expanded?' expanded':''}">
      <div class="mob-check-row" onclick="toggleRestMobCheck(${i})">
        <div class="mob-checkbox">${checked?'✓':''}</div>
        <div style="flex:1"><div class="mob-check-name">${item.n}${item.isNew?` <span class="badge badge-amber" style="font-size:10px;padding:1px 5px">new</span>`:''}</div><div class="mob-check-meta">${item.sets}×${item.hold}</div></div>
        <button class="help-btn" style="margin-left:0" onclick="event.stopPropagation();toggleRestMobExpand(${i})">${expanded?'▲':'▼'}</button>
      </div>`;
    if(item.note) html+=`<div style="font-size:12px;color:var(--muted);margin:8px 0 0;padding-top:8px;border-top:1px solid var(--border)">${item.note}</div>`;
    if(expanded&&ref){
      html+=`<div class="mob-detail">`;
      if(ref.steps){html+=`<ol class="mob-steps">`;ref.steps.forEach(s=>html+=`<li><span>${s}</span></li>`);html+=`</ol>`;}
      if(ref.cue) html+=`<div style="font-size:12px;color:var(--accent);background:var(--accent-dim);border-radius:6px;padding:8px;margin-top:8px">💡 ${ref.cue}</div>`;
      if(ref.mistake) html+=`<div style="font-size:12px;color:var(--red);background:var(--red-dim);border-radius:6px;padding:8px;margin-top:6px">⚠ ${ref.mistake}</div>`;
      if(ref.search){const q=encodeURIComponent(ref.search+' how to');html+=`<a href="https://www.youtube.com/results?search_query=${q}" class="ref-link" style="margin-top:8px" target="_blank">▶ Watch on YouTube</a>`;}
      html+=`</div>`;
    }
    html+=`</div>`;
  });

  if(checkedCount<totalItems) html+=`<button class="btn btn-ghost" onclick="clearRestMobChecks()">Reset today's checklist</button>`;
  html+=`<div style="height:8px"></div>`;

  document.getElementById('screen-today').innerHTML=html;
  resetSessionClock(); // no session timer on rest days
  renderStickyTimer();
}

// showToast is in toast.js; openModal/closeModal are in modals.js

function renderToday(){
  if(!S.startDate){
    // Show a "Set up program" card on the Today screen instead of just the modal
    const el=document.getElementById('screen-today');
    el.innerHTML=`<div class="page-header"><div class="page-title">Today</div><div class="page-sub">Get started with your 16-week program</div></div>
    <div class="card" style="text-align:center;padding:32px 20px;border-color:rgba(255,107,53,.3);background:var(--accent-dim);cursor:pointer" onclick="initSetup()">
      <div style="font-size:36px;margin-bottom:12px">🏋️</div>
      <div style="font-size:17px;font-weight:700;color:var(--accent);margin-bottom:6px">Set up your program →</div>
      <div style="font-size:13px;color:var(--muted)">Tap to choose your start date and training days.</div>
    </div>`;
    initSetup();
    return;
  }
  const missed=getMissedSessions();
  const todaySess=getTodaySession();
  const next=getNextPendingSession();

  // Rest day: no scheduled session today and not viewing a specific session.
  // Show mobility routine aligned to last completed workout.
  if(!todaySess&&!viewingSession){
    return renderRestDayToday(missed);
  }

  let sess=viewingSession;
  if(!sess){if(todaySess&&!isSessionDone(todaySess.week,todaySess.dayIdx))sess={week:todaySess.week,dayIdx:todaySess.dayIdx};else if(next)sess={week:next.week,dayIdx:next.dayIdx};else sess={week:16,dayIdx:2};}
  const w=sess.week,di=sess.dayIdx,pi=phaseFor(w),phase=P.phases[pi],day=phase.days[di],log=getLog(w,di);
  const sched=getSchedule(),schedEntry=sched.find(s=>s.week===w&&s.dayIdx===di),schedDate=schedEntry?schedEntry.date:null;
  const isDeload=w===16,today=todayStr(),isToday=schedDate===today,isFuture=schedDate&&schedDate>today,alreadyCompleted=!!log._completed&&(log._scheduledDate===schedDate||(!log._scheduledDate&&log._completedDate===schedDate)),wasAway=!!log._awayMode;
  const rmRetest=needsRMRetest();

  // Build exercise list — away mode swaps equipment exercises
  const exercises=day.exercises.map(ex=>{
    if(S.awayMode){const sub=getAwayExercise(ex);return sub||ex;}
    return ex;
  });

  let doneSets=0,totalSets=0;
  // E1-8: Cap each exercise set count at 20 to guard against corrupted ex.sets values
  exercises.forEach((ex,ei)=>{const sc=Math.min(ex.sets||0,20);totalSets+=sc;const el=log[ei]||{};for(let si=0;si<sc;si++)if(el[si]&&el[si].done)doneSets++;});
  const pct=totalSets>0?Math.round(doneSets/totalSets*100):0,allDone=pct===100&&!alreadyCompleted;

  let html='';

  // Missed banner
  if(missed.length>0&&missed.length!==_missedBannerDismissedCount&&!viewingSession)html+=`<div class="missed-banner"><div class="row" style="margin-bottom:6px;align-items:center"><span style="font-size:13px;font-weight:500;color:var(--red);flex:1">⚠ ${missed.length} missed session${missed.length>1?'s':''}</span><button class="btn btn-sm" onclick="openMissedModal()" style="border-color:var(--red);color:var(--red)">Review</button><button onclick="dismissMissedBanner()" aria-label="Dismiss" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:18px;padding:0 4px;line-height:1;opacity:.7">×</button></div><div style="font-size:12px;color:var(--red);opacity:.8">Tap Review to slide your program forward</div></div>`;

  // ── BRAND HEADER ──────────────────────────────────────────────────────────────
  // STR·45 disc mark (inline SVG)
  const discSvg=`<svg width="26" height="26" viewBox="0 0 100 100" style="display:block;flex-shrink:0"><circle cx="50" cy="50" r="47" fill="none" stroke="#FF6B35" stroke-width="3"/>${Array.from({length:32}).map((_,i)=>{const a=(i/32)*Math.PI*2,x1=50+Math.cos(a)*44.5,y1=50+Math.sin(a)*44.5,x2=50+Math.cos(a)*41.5,y2=50+Math.sin(a)*41.5;return`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FF6B35" stroke-width="0.8" opacity="0.55"/>`;}).join('')}<circle cx="50" cy="50" r="4.5" fill="#0E0E10" stroke="#FF6B35" stroke-width="1.2"/><text x="50" y="39" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-weight="700" font-size="22" fill="#FF6B35" letter-spacing="-1">45</text><text x="50" y="74" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-weight="600" font-size="7" fill="#FF6B35" opacity="0.85" letter-spacing="2">STR</text></svg>`;

  html+=`<div class="brand-strip">
    <div class="brand-mark">
      ${discSvg}
      <div class="wordmark"><span class="wordmark-str">STR</span><span class="wordmark-dot">·</span><span class="wordmark-45">45</span></div>
    </div>
    <div id="session-clock"></div>
  </div>`;

  // Week / day title row
  html+=`<div style="margin-bottom:14px">
    <div style="font-size:11px;font-weight:600;letter-spacing:.08em;color:var(--muted2);text-transform:uppercase;margin-bottom:4px">Week ${w} · Day ${di+1} of 3</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
      <div style="font-size:22px;font-weight:700;letter-spacing:-.01em;line-height:1.1">${(()=>{const[h,...r]=day.name.split(' — ');return r.length?h+' <span style="color:var(--muted);font-weight:500;font-size:18px">('+r.join(' — ')+')</span>':h;})()}</div>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">${isToday?'<span class="badge badge-green">Today</span>':''}${isFuture?'<span class="badge badge-blue">Coming</span>':''}${alreadyCompleted?(wasAway?'<span class="badge badge-orange">✈ Away</span>':'<span class="badge badge-green">Done ✓</span>'):''}<button class="btn btn-sm" onclick="openWeekPicker()" style="font-size:11px;padding:5px 10px">Jump</button></div>
    </div>
  </div>`;

  // Segmented progress bar (per exercise)
  if(!alreadyCompleted){
    html+=`<div class="seg-prog" style="margin-bottom:6px">`;
    exercises.forEach((ex,ei)=>{
      const exLog=log[ei]||{};
      const doneCnt=Object.values(exLog).filter(s=>s&&s.done).length;
      const pctEx=Math.round(doneCnt/ex.sets*100);
      const isCur=ei===exercises.findIndex((_,i)=>{const el2=log[i]||{};return Object.values(el2).filter(s=>s&&s.done).length<exercises[i].sets;});
      const fillColor=pctEx===100?'var(--success)':isCur?'var(--accent)':'var(--muted)';
      html+=`<div class="seg-prog-item"><div class="seg-prog-fill" style="width:${pctEx}%;background:${fillColor}"></div>${isCur&&pctEx<100?`<div style="position:absolute;right:0;top:0;bottom:0;width:3px;background:var(--accent);box-shadow:0 0 6px var(--accent)"></div>`:''}</div>`;
    });
    html+=`</div><div style="display:flex;justify-content:space-between;margin-bottom:14px"><span style="font-size:11px;color:var(--muted2);font-family:var(--mono)">${doneSets}/${totalSets} sets · ${pct}%</span><span style="font-size:11px;color:var(--muted2)">${phase.short} · ${day.est}</span></div>`;
  }

  // ── COACH LINE ────────────────────────────────────────────────────────────────
  if(!alreadyCompleted){
    html+=`<div class="coach-line"><span style="font-size:13px;color:var(--accent);flex-shrink:0">✦</span><span class="coach-line-text" id="coach-line-text" style="transition:opacity .2s">${_verseCache[_coachLineIdx]}</span></div>`;
  }

  // ── MOMENTUM TILES ────────────────────────────────────────────────────────────
  if(!alreadyCompleted){
    const sessionVol=getSessionVolume(w,di);
    const streak=getTrainingStreak();
    // Volume vs last same session (rough: compare to prev week same day if exists)
    const vsLastVol=(()=>{
      if(w<=1)return null;
      const prevLog=getLog(w-1,di);
      let prevVol=0;
      Object.values(prevLog).forEach(exLog=>{
        if(typeof exLog!=='object'||!exLog)return;
        Object.values(exLog).forEach(s=>{if(s&&s.done&&s.weight&&s.reps)prevVol+=parseFloat(s.weight)*parseInt(s.reps);});
      });
      if(!prevVol)return null;
      return sessionVol-Math.round(prevVol);
    })();
    const volDisplay=sessionVol>=1000?(sessionVol/1000).toFixed(1):sessionVol;
    const volUnit=sessionVol>=1000?'t':'kg';
    html+=`<div class="momentum-grid">
      <div class="momentum-tile"><div class="momentum-tile-accent"></div><div class="momentum-label">Volume</div><div style="display:flex;align-items:baseline;gap:2px"><span class="momentum-value">${volDisplay}</span><span class="momentum-unit">${volUnit}</span></div><div class="momentum-sub">this session</div></div>
      <div class="momentum-tile"><div class="momentum-label">VS LAST</div><div style="display:flex;align-items:baseline;gap:2px"><span class="momentum-value sm" style="${vsLastVol===null?'':'color:'+(vsLastVol>=0?'var(--success)':'var(--red)')}">${vsLastVol===null?'—':(vsLastVol>=0?'+':'')+vsLastVol}</span>${vsLastVol!==null?`<span class="momentum-unit">kg</span>`:''}</div><div class="momentum-sub">wk-on-wk</div></div>
      <div class="momentum-tile"><div class="momentum-label">Streak</div><div style="display:flex;align-items:baseline;gap:2px"><span class="momentum-value sm">${streak}</span></div><div class="momentum-sub">sessions</div></div>
    </div>`;
  }

  // Away mode toggle
  const bw=getLatestBW();
  let awayLvlStr='';
  if(S.awayMode&&bw){const benchRM=getRM('bench');if(benchRM){const lvl=getStrengthLevel(benchRM/bw);awayLvlStr=` · ${lvl.label}`;}}
  html+=`<div class="away-toggle-wrap${S.awayMode?' on':''}">
    <span class="away-toggle-label">${S.awayMode?`✈ Away · BW substitutions active${awayLvlStr}`:'✈ Away from gym'}</span>
    <div class="toggle-switch${S.awayMode?' on':''}" onclick="toggleAwayMode()"><div class="toggle-knob"></div></div>
  </div>`;
  if(isDeload)html+=`<div class="alert alert-blue">Deload week — reduced intensity, same exercises.</div>`;
  if(day.note&&!S.awayMode)html+=`<div class="alert alert-amber">${day.note}</div>`;

  // Phase change nudge — shown before warmup so it's visible without scrolling
  if(rmRetest)html+=`<div class="alert alert-purple" style="margin-bottom:10px">Phase change coming — consider retesting your 1RM. <span onclick="showScreen('strength',document.querySelectorAll('.nav-item')[2])" style="color:var(--purple);text-decoration:underline;cursor:pointer">Go to 1RM →</span></div>`;

  // Warmup — collapsible. State persists across re-renders via module-level warmupCollapsed.
  // E2-4 / E2-10: Using the warmupCollapsed variable (not inline DOM state) preserves the
  // collapsed state across renderToday() calls that happen on every set tick.
  const awayWarmup="5 min of jumping jacks, high knees, or brisk walk · arm circles × 10 · hip circles × 10 · bodyweight squat × 10";
  html+=`<button class="warmup-box" onclick="warmupCollapsed=!warmupCollapsed;this.nextElementSibling.style.display=warmupCollapsed?'none':'block'"><span style="display:flex;align-items:center;gap:8px"><span style="color:var(--amber);font-size:15px">🔥</span><span style="font-weight:500;color:var(--text);font-size:13px">Warmup</span><span style="font-size:11px;color:var(--muted2);font-family:var(--mono)">~3 min</span></span><span style="color:var(--muted);font-size:16px">›</span></button><div style="display:${warmupCollapsed?'none':'block'};padding:0 4px 14px;font-size:13px;color:var(--muted);line-height:1.6">${S.awayMode?awayWarmup:day.warmup}</div>`;

  // Exercises
  exercises.forEach((ex,ei)=>{
    const exLog=log[ei]||{};
    const exAllDone=!alreadyCompleted&&Object.values(exLog).filter(v=>v&&v.done).length>=ex.sets;
    const rec=ex.isAway?null:getExRec(ex);
    const ref=EXREF[ex.n];
    const isAway=!!ex.isAway;

    html+=`<div class="ex-card${exAllDone?' done':''}${isAway?' away-ex':''}">`;
    // For away exercises, fold the strength level into the detail line as a small badge
    const awayLvlBadge=isAway&&ex.ratio!=null?`<span style="font-size:10px;font-family:var(--mono);color:${getStrengthLevel(ex.ratio).color};margin-left:6px">${getStrengthLevel(ex.ratio).label}</span>`:'';
    html+=`<div class="row" style="align-items:flex-start"><div style="flex:1"><div class="ex-name">${ex.n}${ex.ss?'<span class="ss-badge">superset</span>':''}${isAway?'<span class="away-badge">✈</span>':''}</div><div class="ex-detail">${ex.sets} sets · ${ex.reps} · ${ex.load}${ex.rest>0?' · '+ex.rest+'s rest':''}${awayLvlBadge}</div></div>${ref?`<button class="help-btn" aria-label="How to do this exercise" title="How to do this exercise" onclick="openRef('${ex.n.replace(/'/g,"\\'")}')">?</button>`:''}</div>`;

    // Weight rec — gym only; away exercises need no separate box
    if(!isAway&&rec){
      html+=`<div class="ex-rec">🎯 Target: <strong>${rec.kg} kg</strong>&nbsp;·&nbsp;${rec.pct}% of ${rec.rm} kg 1RM</div>`;
    }else if(!isAway&&LIFT_TO_RM[ex.n]&&!getRM(LIFT_TO_RM[ex.n])){
      html+=`<div class="alert alert-blue" style="margin:6px 0;font-size:11px;padding:6px 10px">Enter your 1RM in the 1RM tab to get weight targets</div>`;
    }

    // Notes: gym cues don't apply to away substitutions
    if(!isAway) html+=`<div class="ex-note">${ex.note}</div>`;

    if(!alreadyCompleted){
      // Last session reference
      const lastSess = getLastSession(ex.n);
      const prData = getPR(ex.n);
      if(lastSess){
        const lastSetsStr = lastSess.sets.slice(0,3).map(s=>isBWOnly(ex.load)?`${s.reps}r`:`${s.weight}kg×${s.reps}`).join(' · ');
        html+=`<div style="font-size:11px;color:var(--muted);background:var(--surf2);border-radius:6px;padding:6px 10px;margin:4px 0 8px;display:flex;align-items:center;justify-content:space-between">
          <span>Last: ${lastSetsStr}</span>
          ${prData&&prData.date===lastSess.date?'<span style="color:var(--amber);font-size:10px">★ PR</span>':''}
        </div>`;
      }

      const bwOnly = isBWOnly(ex.load)||isAway;
      const timeBased = isTimeBased(ex.reps);

      // Header row — columns depend on exercise type
      if(timeBased){
        html+=`<div class="sets-area"><div class="set-hdr" style="grid-template-columns:30px 1fr 1fr 44px"><span class="set-hdr-lbl">SET</span><span class="set-hdr-lbl">DURATION</span><span class="set-hdr-lbl">DONE</span><span></span></div>`;
      }else if(bwOnly){
        html+=`<div class="sets-area"><div class="set-hdr" style="grid-template-columns:30px 1fr 44px"><span class="set-hdr-lbl">SET</span><span class="set-hdr-lbl">REPS</span><span></span></div>`;
      }else{
        html+=`<div class="sets-area"><div class="set-hdr"><span class="set-hdr-lbl">SET</span><span class="set-hdr-lbl">WEIGHT</span><span class="set-hdr-lbl">REPS</span><span></span></div>`;
      }

      // Find first undone set (for active-set highlight)
      // E1-8: Cap at 20 sets to prevent infinite render loops from corrupted data
      const setCount=Math.min(ex.sets||0,20);
      let firstUndone=-1;
      for(let si=0;si<setCount;si++){if(!(exLog[si]&&exLog[si].done)){firstUndone=si;break;}}

      for(let si=0;si<setCount;si++){
        const s=exLog[si]||{};
        const isDone=!!s.done;
        const isActive=!isDone&&si===firstUndone;
        const tgt=rec?rec.kg:null;
        const wv=parseFloat(s.weight)||0;
        // Auto-carry display: pre-fill from previous set; tgt only as placeholder for set 1
        const prevS=si>0?(exLog[si-1]||{}):{};
        const inputW=s.weight||(si>0&&prevS.weight?prevS.weight:'');
        const inputR=s.reps||(si>0&&prevS.reps?prevS.reps:'');
        const wtPlaceholder=tgt?`${tgt}kg`:'kg';
        // Base for steppers — use displayed value so carry/target is the step-from point
        const stepWBase=parseFloat(inputW)||(tgt||0);
        const stepRBase=parseInt(inputR)||0;

        // vs-last computation
        let vsLastHtml='';
        if(!bwOnly&&!timeBased&&lastSess&&lastSess.sets[si]){
          const ls=lastSess.sets[si];
          const lw=parseFloat(ls.weight)||0,lr=parseInt(ls.reps)||0;
          const cw=parseFloat(inputW)||0,cr=parseInt(inputR)||0;
          if(ls.weight){
            let tag='';
            if(isDone&&cw>0&&(cw>lw||(cw===lw&&cr>lr))) tag=`<span class="set-beat">BEAT</span>`;
            else if(!isDone&&cw>0&&(cw>lw||(cw===lw&&cr>lr))) tag=`<span class="set-beating">BEATING</span>`;
            vsLastHtml=`<div class="set-vs-last"><span>Last: ${lw?lw+'kg×':''} ${lr}r</span>${tag}</div>`;
          }
        }else if(bwOnly&&lastSess&&lastSess.sets[si]){
          const ls=lastSess.sets[si];
          const lr=parseInt(ls.reps)||0,cr=parseInt(inputR)||0;
          const tag=(lr&&cr>lr&&!isDone)?`<span class="set-beating">BEATING</span>`:'';
          if(lr) vsLastHtml=`<div class="set-vs-last"><span>Last: ${lr}r</span>${tag}</div>`;
        }

        const numClass=isDone?'done':isActive?'active':'';
        const checkClass=isDone?'done-check':isActive?'active-check':'';
        const rowClass=isDone?'done-set':isActive?'active-set':'';
        const checkIcon=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isDone?3:2.5}" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        const exKey=ex.n.replace(/'/g,"\\'");

        if(timeBased){
          html+=`<div class="set-row ${rowClass}" style="grid-template-columns:30px 1fr 1fr 44px">
            <div class="set-num ${numClass}">${si+1}</div>
            <div style="font-size:12px;font-family:var(--mono);color:var(--accent);background:var(--accent-dim);border-radius:6px;padding:4px 8px;text-align:center">${ex.reps}</div>
            <input class="set-input" type="number" inputmode="numeric" placeholder="sec held" value="${s.reps||''}" onchange="logField(${w},${di},${ei},${si},'reps',this.value)">
            <button class="set-check ${checkClass}" onclick="toggleDone(${w},${di},${ei},${si},${ex.rest||0},'${exKey}')">${checkIcon}</button>
          </div>`;
        }else if(bwOnly){
          html+=`<div class="set-row ${rowClass}" style="grid-template-columns:30px 1fr 44px">
            <div class="set-num ${numClass}">${si+1}</div>
            <div class="set-stepper">
              <button onclick="stepReps(${w},${di},${ei},${si},-1,${stepRBase})" ${isDone?'disabled':''}>−</button>
              <input class="set-val-input${isDone?' done-val':''}" type="number" inputmode="numeric" placeholder="reps" value="${inputR}" ${isDone?'readonly':''} onchange="logField(${w},${di},${ei},${si},'reps',this.value)">
              <button onclick="stepReps(${w},${di},${ei},${si},1,${stepRBase})" ${isDone?'disabled':''}>+</button>
            </div>
            <button class="set-check ${checkClass}" onclick="toggleDone(${w},${di},${ei},${si},${ex.rest||0},'${exKey}')">${checkIcon}</button>
          </div>
          ${vsLastHtml}`;
        }else{
          html+=`<div class="set-row ${rowClass}">
            <div class="set-num ${numClass}">${si+1}</div>
            <div class="set-stepper">
              <button onclick="stepWeight(${w},${di},${ei},${si},-2.5,${stepWBase})" ${isDone?'disabled':''}>−</button>
              <input class="set-val-input${isDone?' done-val':''}" type="number" inputmode="decimal" placeholder="${wtPlaceholder}" value="${inputW}" ${isDone?'readonly':''} onchange="logField(${w},${di},${ei},${si},'weight',this.value)">
              <button onclick="stepWeight(${w},${di},${ei},${si},2.5,${stepWBase})" ${isDone?'disabled':''}>+</button>
            </div>
            <div class="set-stepper">
              <button onclick="stepReps(${w},${di},${ei},${si},-1,${stepRBase})" ${isDone?'disabled':''}>−</button>
              <input class="set-val-input${isDone?' done-val':''}" type="number" inputmode="numeric" placeholder="reps" value="${inputR}" ${isDone?'readonly':''} onchange="logField(${w},${di},${ei},${si},'reps',this.value)">
              <button onclick="stepReps(${w},${di},${ei},${si},1,${stepRBase})" ${isDone?'disabled':''}>+</button>
            </div>
            <button class="set-check ${checkClass}" onclick="toggleDone(${w},${di},${ei},${si},${ex.rest||0},'${exKey}')">${checkIcon}</button>
          </div>
          ${vsLastHtml}`;
        }
      }
      html+=`</div>`;
      if(exAllDone) html+=`<div class="ex-done-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>All sets complete</div>`;
    }else{
      let hasData=false;
      // E1-8: Cap at 20 sets to guard against corrupted data
      const setCountDone=Math.min(ex.sets||0,20);
      for(let si=0;si<setCountDone;si++){const s=exLog[si]||{};if(s.weight||s.reps)hasData=true;}
      if(hasData){
        html+=`<div class="sets-area">`;
        for(let si=0;si<setCountDone;si++){
          const s=exLog[si]||{};
          if(s.weight||s.reps) html+=`<div style="display:flex;gap:8px;font-size:12px;font-family:var(--mono);color:var(--muted);margin-bottom:4px"><span style="color:var(--muted2);width:24px">${si+1}</span>${s.weight?`<span style="color:var(--text)">${s.weight}kg</span><span style="color:var(--muted2)">×</span>`:''}<span style="color:var(--text)">${s.reps||'—'} reps</span>${s.done?'<span style="color:var(--success)">✓</span>':''}</div>`;
        }
        html+=`</div>`;
      }
    }
    html+=`</div>`;
  });

  // Manual timer override (for between exercises etc)
  if(!alreadyCompleted){
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:10px 0;margin-top:4px">
      <span style="font-size:11px;color:var(--muted)">Manual timer:</span>
      <button class="btn btn-sm" onclick="startTimer(60,'Manual')">60s</button>
      <button class="btn btn-sm" onclick="startTimer(90,'Manual')">90s</button>
      <button class="btn btn-sm" onclick="startTimer(120,'Manual')">2 min</button>
    </div>`;
  }

  if(allDone&&schedDate)html+=`<button class="complete-btn" onclick="completeSession(${w},${di},'${schedDate}')"${isFuture?' disabled style="opacity:.5;cursor:not-allowed"':''}>Mark session complete →</button>`;
  if(alreadyCompleted)html+=`<button class="btn" onclick="uncompleteSession(${w},${di})" style="color:var(--muted)">Undo completion</button>`;

  document.getElementById('screen-today').innerHTML=html;
  if(alreadyCompleted){ resetSessionClock(); stopCoachLine(); }
  else { renderSessionClock(); startCoachLine(); }
  renderStickyTimer();
}

function logField(w,di,ei,si,f,v){
  // E1-9: Validate input before storing — ignore NaN and negative values
  const parsed=f==='weight'?parseFloat(v):parseInt(v);
  if(isNaN(parsed)||parsed<0)return;
  const l=getLog(w,di);if(!l[ei])l[ei]={};if(!l[ei][si])l[ei][si]={};
  l[ei][si][f]=parsed;setLog(w,di,l);
}

// Track within-session PRs to avoid repeated flashes for same weight
const sessionPRsFlashed = {};

function toggleDone(w,di,ei,si,restSecs,exName){
  const l=getLog(w,di);
  if(!l[ei])l[ei]={};
  if(!l[ei][si])l[ei][si]={};
  const wasDone=l[ei][si].done;
  // Auto-carry weight+reps from previous set when marking done with no values entered
  if(!wasDone&&!l[ei][si].weight&&!l[ei][si].reps&&si>0&&l[ei][si-1]){
    if(l[ei][si-1].weight) l[ei][si].weight=String(l[ei][si-1].weight);
    if(l[ei][si-1].reps) l[ei][si].reps=String(l[ei][si-1].reps);
  }
  l[ei][si].done=!wasDone;
  setLog(w,di,l);
  if(!wasDone&&restSecs>0) startTimer(restSecs, exName||'Rest');
  if(!wasDone){
    const thisWeight=l[ei][si].weight?parseFloat(l[ei][si].weight):null;
    const thisReps=l[ei][si].reps?parseInt(l[ei][si].reps):null;
    const sessionKey=`${dayKey(w,di)}_${exName}`;
    let isPR=false;
    if(thisWeight&&exName){
      const alreadyFlashed=sessionPRsFlashed[sessionKey]>=thisWeight;
      if(!alreadyFlashed){
        const pr=getPR(exName);
        if(!pr||thisWeight>pr.bestWeight){isPR=true;sessionPRsFlashed[sessionKey]=thisWeight;}
      }
    }
    // Compute vs-last % for the flash
    let vsLast=null;
    if(exName){
      const lastS=getLastSession(exName);
      if(lastS&&lastS.sets&&lastS.sets[si]){
        const ls=lastS.sets[si];
        const curVol=(thisWeight||1)*(thisReps||0);
        const lastVol=(ls.weight||1)*(ls.reps||0);
        if(lastVol>0&&curVol>0) vsLast=Math.round((curVol-lastVol)/lastVol*100);
      }
    }
    showSetFlash(thisWeight,thisReps,isPR,vsLast);
    if(isPR) showPRFlash(exName,thisWeight,thisReps);
  }
  renderToday();
}

function stepWeight(w,di,ei,si,delta,base){
  const l=getLog(w,di);
  if(!l[ei])l[ei]={};
  if(!l[ei][si])l[ei][si]={};
  if(l[ei][si].done)return;
  const cur=parseFloat(l[ei][si].weight)||(base||0);
  l[ei][si].weight=Math.max(0,Math.round((cur+delta)*4)/4);
  setLog(w,di,l);
  renderToday();
}

function stepReps(w,di,ei,si,delta,base){
  const l=getLog(w,di);
  if(!l[ei])l[ei]={};
  if(!l[ei][si])l[ei][si]={};
  if(l[ei][si].done)return;
  const cur=parseInt(l[ei][si].reps)||(base||0);
  l[ei][si].reps=Math.max(0,cur+delta);
  setLog(w,di,l);
  renderToday();
}

function showPRFlash(exName, weight, reps){
  // Remove any existing flash
  const old=document.querySelector('.flash-overlay');if(old)old.remove();
  const el=document.createElement('div');
  el.className='flash-overlay';
  const isPR=true;
  el.innerHTML=`<div class="flash-box" style="background:linear-gradient(135deg,var(--accent),#FFA257);border:1px solid var(--accent);box-shadow:0 16px 48px rgba(255,107,53,.4)">
    <div class="flash-icon" style="background:rgba(0,0,0,.18);color:#1A0800">🏆</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:11px;font-family:var(--mono);font-weight:700;letter-spacing:.14em;color:#1A0800;margin-bottom:3px">NEW PR · LOCKED IN</div>
      <div style="font-size:18px;font-weight:700;color:#1A0800;letter-spacing:-.01em;font-family:var(--mono);font-variant-numeric:tabular-nums">${weight?weight+' kg × ':''} ${reps||''} ${exName}</div>
    </div>
  </div>`;
  document.body.appendChild(el);
  // E2-7: Guard with parentNode so rapid PRs don't remove a newer flash element
  setTimeout(()=>{if(el.parentNode)el.remove();},1800);
}
function showSetFlash(weight, reps, isPR, vsLast){
  const old=document.querySelector('.flash-overlay');if(old)old.remove();
  const el=document.createElement('div');
  el.className='flash-overlay';
  const addedVol=weight&&reps?Math.round(weight*reps):0;
  if(isPR){
    el.innerHTML=`<div class="flash-box" style="background:linear-gradient(135deg,var(--accent),#FFA257);border:1px solid var(--accent);box-shadow:0 16px 48px rgba(255,107,53,.4)">
      <div class="flash-icon" style="background:rgba(0,0,0,.18);color:#1A0800">🏆</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;font-family:var(--mono);font-weight:700;letter-spacing:.14em;color:#1A0800;margin-bottom:3px">NEW PR · LOCKED IN</div>
        <div style="font-size:18px;font-weight:700;color:#1A0800;font-family:var(--mono);font-variant-numeric:tabular-nums">${weight?weight+' kg × ':''}${reps}</div>
      </div>
    </div>`;
  }else{
    el.innerHTML=`<div class="flash-box" style="background:rgba(31,31,36,.96);border:1px solid var(--border2);box-shadow:0 16px 48px rgba(0,0,0,.5)">
      <div class="flash-icon" style="background:var(--success-dim);color:var(--success)">✓</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;font-family:var(--mono);font-weight:700;letter-spacing:.14em;color:var(--success);margin-bottom:3px">SET LOCKED IN</div>
        <div style="font-size:18px;font-weight:700;color:var(--text);font-family:var(--mono);font-variant-numeric:tabular-nums">${weight?weight+' kg × ':''}${reps}${addedVol>0?`<span style="font-size:12px;font-weight:400;opacity:.6;margin-left:6px;font-family:var(--sans)">+${addedVol} kg</span>`:''}
        </div>
        ${vsLast&&vsLast>0?`<div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:3px;display:flex;align-items:center;gap:4px">▲ +${vsLast}% vs last time</div>`:''}
      </div>
    </div>`;
  }
  document.body.appendChild(el);
  // E2-7: Guard with parentNode so rapid set logs don't remove a newer flash element
  setTimeout(()=>{if(el.parentNode)el.remove();},1800);
}

// completeSession and uncompleteSession are in session.js

function openMissedModal(){const m=getMissedSessions();let html=`<div class="alert alert-amber" style="margin-bottom:12px">You have ${m.length} unlogged session${m.length>1?'s':''} in the past. Tap "Slide schedule to today" to realign your schedule to today.</div>`;m.forEach(s=>{const ph=P.phases[phaseFor(s.week)],d=ph.days[s.dayIdx];html+=`<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);align-items:center"><span class="badge badge-red">Wk ${s.week}</span><div><div style="font-size:13px;color:var(--text)">${d.name}</div><div style="font-size:11px;color:var(--muted)">${formatDateDisplay(s.date)}</div></div></div>`;});if(m.length>5)html+=`<div style="font-size:11px;color:var(--muted);text-align:center;padding:8px 0">↑ Scroll to see all ${m.length} missed sessions</div>`;document.getElementById('modal-missed-body').innerHTML=html;openModal('modal-missed');}

function openWeekPicker(){
  const sched=getSchedule(),today=todayStr(),grid=document.getElementById('week-picker-grid');
  // Build phase-labelled grid
  let h='';
  const phaseNames=['Phase 1: Wks 1–4','Phase 2: Wks 5–8','Phase 3: Wks 9–12','Phase 4: Wks 13–16'];
  const phaseStarts=[1,5,9,13];
  for(let w=1;w<=16;w++){
    // Insert phase header before start of each phase.
    // E2-11: grid-column:1/-1 spans all columns regardless of count, so this is safe
    // as long as the parent grid keeps grid-template-columns:repeat(4,1fr) (week-grid class).
    if(phaseStarts.includes(w)){
      const phIdx=phaseStarts.indexOf(w);
      h+=`<div style="grid-column:1/-1;font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);margin:${phIdx===0?'0':'8px'} 0 4px">${phaseNames[phIdx]}</div>`;
    }
    for(let di=0;di<3;di++){const e=sched.find(s=>s.week===w&&s.dayIdx===di),done=isSessionDone(w,di),isT=e&&e.date===today,isCurr=viewingSession&&viewingSession.week===w&&viewingSession.dayIdx===di;h+=`<div class="week-cell${done?' done':isT||isCurr?' current':w===16?'':''}" onclick="jumpTo(${w},${di})" style="font-size:10px"><span class="wn" style="font-size:12px">W${w}</span><span>D${di+1}</span></div>`;}
  }
  grid.innerHTML=h;
  openModal('week-picker-modal');
}
function jumpTo(w,di){viewingSession={week:w,dayIdx:di};warmupCollapsed=false;closeModal('week-picker-modal');window.scrollTo(0,0);renderToday();}

