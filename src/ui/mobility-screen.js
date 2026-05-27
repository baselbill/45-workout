// ─── 45-WORKOUT v2: mobility-screen ───
// Mobility routine screen: expandable routines, step-by-step instructions
// ─── MOBILITY ─────────────────────────────────────────────────────────────────
let mobPhaseView=-1, mobRoutineView=-1, expandedMob=-1;

function getAutoRoutine() {
  // Suggest routine based on day of week: Mon/Thu=A, Tue/Fri=B, Wed/Sat/Sun=C
  const dow = new Date().getDay();
  if(dow===1||dow===4) return 0; // Mon/Thu → A (lower)
  if(dow===2||dow===5) return 1; // Tue/Fri → B (upper/thoracic)
  return 2; // Wed/Sat/Sun → C (full body flow)
}

function renderMobility(){
  // Phase always follows the current program week — no manual switching
  const n=getNextPendingSession();
  mobPhaseView = n ? phaseFor(n.week) : phaseFor(16);
  if(mobRoutineView===-1){mobRoutineView=getAutoRoutine();}
  const phaseData=MOB_DATA[mobPhaseView];
  const routine=phaseData.routines[mobRoutineView];
  const checks=getMobChecks(mobPhaseView,mobRoutineView);
  const totalItems=routine.items.length;
  const checkedCount=Object.values(checks).filter(Boolean).length;
  const pct=Math.round(checkedCount/totalItems*100);

  let html=`<div class="page-header"><div class="row"><div><div class="page-title">Mobility</div><div class="page-sub">3 rotating routines · mandatory rest days</div></div><span class="badge badge-green">${phaseData.phase}</span></div></div>`;
  html+=`<div class="alert alert-amber" style="margin-bottom:12px">Do a routine on every rest day — non-negotiable for 45+. Three routines rotate through the week so you get variety and full-body coverage. Tap ▼ on any exercise to see instructions.</div>`;

  // Routine tabs A/B/C only — no phase switching
  html+=`<div class="section-label">Today's routine</div><div style="display:flex;gap:8px;margin-bottom:14px">`;
  phaseData.routineLabel.forEach((label,ri)=>{
    const isAuto=ri===getAutoRoutine(), isActive=ri===mobRoutineView;
    html+=`<button style="flex:1;padding:10px 6px;border-radius:var(--r-sm);border:1px solid ${isActive?'var(--accent)':isAuto?'var(--amber)':'var(--border)'};background:${isActive?'var(--accent-dim)':isAuto?'var(--amber-dim)':'transparent'};color:${isActive?'var(--accent)':isAuto?'var(--amber)':'var(--muted)'};cursor:pointer;font-size:12px;font-weight:500;font-family:var(--sans);line-height:1.4;text-align:center" onclick="switchMobRoutine(${ri})">
      <strong>${['A','B','C'][ri]}</strong><br><span style="font-size:10px">${['Lower','Upper+T-spine','Full Flow'][ri]}</span>${isAuto&&!isActive?'<br><span style="font-size:9px;opacity:.7">suggested</span>':''}
    </button>`;
  });
  html+=`</div>`;

  // Routine info + progress ring
  const r2=22,circ=2*Math.PI*r2,dash=circ*(pct/100),gap=circ-dash;
  html+=`<div class="card" style="margin-bottom:14px"><div class="row" style="margin-bottom:6px"><div><div style="font-size:14px;font-weight:500;color:var(--text)">${phaseData.routineLabel[mobRoutineView]}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${routine.focus}</div><div style="font-size:11px;font-family:var(--mono);color:var(--accent);margin-top:3px">${routine.dur} · ${phaseData.routineSuggest[mobRoutineView]}</div></div>
  <svg class="mob-ring" viewBox="0 0 56 56"><circle cx="28" cy="28" r="${r2}" fill="none" stroke="var(--surf2)" stroke-width="5"/><circle cx="28" cy="28" r="${r2}" fill="none" stroke="var(--accent)" stroke-width="5" stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}" stroke-dashoffset="${(circ/4).toFixed(1)}" stroke-linecap="round"/><text x="28" y="33" text-anchor="middle" font-size="12" font-weight="600" font-family="monospace" fill="var(--text)">${pct}%</text></svg></div>
  <div style="font-size:11px;color:var(--muted)">${checkedCount} of ${totalItems} done today</div>
  ${pct===100?`<div class="alert alert-green" style="margin-top:10px;margin-bottom:0">✓ Routine complete — logged!</div>`:''}</div>`;

  // Exercises
  routine.items.forEach((item,i)=>{
    const checked=!!checks[i],expanded=expandedMob===i,ref=EXREF[item.n];
    html+=`<div class="mob-check-card${checked?' checked':''}${expanded?' expanded':''}">
      <div class="mob-check-row" onclick="toggleMobCheck(${i})">
        <div class="mob-checkbox">${checked?'✓':''}</div>
        <div style="flex:1"><div class="mob-check-name">${item.n}${item.isNew?` <span class="badge badge-amber" style="font-size:10px;padding:1px 5px">new</span>`:''}</div><div class="mob-check-meta">${item.sets}×${item.hold}</div></div>
        <button class="help-btn" style="margin-left:0" onclick="event.stopPropagation();toggleMobExpand(${i})">${expanded?'▲':'▼'}</button>
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

  if(checkedCount<totalItems) html+=`<button class="btn btn-ghost" onclick="clearMobChecks()">Reset today's checklist</button>`;
  html+=`<div style="height:8px"></div>`;
  document.getElementById('screen-mobility').innerHTML=html;
}
function toggleMobCheck(i){
  const wasComplete=MOB_DATA[mobPhaseView].routines[mobRoutineView].items.every((_,idx)=>getMobChecks(mobPhaseView,mobRoutineView)[idx]);
  setMobCheck(i,!getMobChecks(mobPhaseView,mobRoutineView)[i]);
  renderMobility();
  const nowComplete=MOB_DATA[mobPhaseView].routines[mobRoutineView].items.every((_,idx)=>getMobChecks(mobPhaseView,mobRoutineView)[idx]);
  if(!wasComplete&&nowComplete){document.getElementById('main').scrollTo({top:0,behavior:'smooth'});showToast('Mobility routine complete — logged!');}
}
function toggleMobExpand(i){expandedMob=expandedMob===i?-1:i;renderMobility();}
function clearMobChecks(){
  S.mobChecks[getMobCheckKey(mobPhaseView,mobRoutineView)]={};
  if(S.mobHistory) S.mobHistory=S.mobHistory.filter(e=>!(e.date===todayStr()&&e.phase===mobPhaseView&&e.routine===mobRoutineView));
  saveState();renderMobility();
}
function switchMobRoutine(i){mobRoutineView=i;expandedMob=-1;renderMobility();}
