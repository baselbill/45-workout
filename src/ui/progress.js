// ─── 45-WORKOUT v2: progress ───
// Progress screen: weekly volume chart, KPI tiles, strength snapshot
// ─── MONTHLY REPORT HELPERS ───────────────────────────────────────────────────
let progressViewMonth=null; // 'YYYY-MM'; null = current month
let prSectionExpanded=false;
let overrideLiftId=null; // which lift is selected in the manual override picker
function getCurrentMonthStr(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function shiftMonth(monthStr,delta){const[y,m]=monthStr.split('-').map(Number);const d=new Date(y,m-1+delta,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function formatMonthDisplay(monthStr){const[y,m]=monthStr.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});}

// PRs in month: weight PRs for weighted exercises, rep PRs for always-bodyweight exercises.
// "PR" means: bestWeight (or bestReps for BW-only) exceeds all prior history before this month entry.
function getPRsInMonth(monthStr){
  const prs=[];
  Object.entries(S.exHistory||{}).forEach(([exName,hist])=>{
    if(!hist||!hist.length) return;
    const sorted=[...hist].sort((a,b)=>a.date.localeCompare(b.date));
    const isAlwaysBW=sorted.every(e=>!e.bestWeight||e.bestWeight===0);
    let runningBest=0,monthPR=null;
    for(const e of sorted){
      const metric=isAlwaysBW?(e.bestReps||0):(e.bestWeight||0);
      if(metric>runningBest&&metric>0){
        runningBest=metric;
        if(e.date.startsWith(monthStr)) monthPR={exName,value:metric,isBW:isAlwaysBW,date:e.date};
      }
    }
    if(monthPR) prs.push(monthPR);
  });
  return prs.sort((a,b)=>a.date.localeCompare(b.date));
}

function getMonthlyStats(monthStr){
  let workouts=0;
  // E2-2: Use explicit dateKey to avoid false positives from empty-string coercion
  Object.values(S.logs||{}).forEach(log=>{
    const dateKey=log._scheduledDate||log._completedDate;
    if(log._completed&&dateKey&&dateKey.startsWith(monthStr)) workouts++;
  });
  const mobility=(S.mobHistory||[]).filter(e=>e.date.startsWith(monthStr)).length;
  const setsByEx={};let totalSets=0;
  Object.entries(S.exHistory||{}).forEach(([exName,hist])=>{
    let total=0;
    hist.forEach(e=>{if(e.date.startsWith(monthStr)) total+=(e.sets||[]).length;});
    if(total>0){setsByEx[exName]=total;totalSets+=total;}
  });
  const topExercises=Object.entries(setsByEx).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const prs=getPRsInMonth(monthStr);
  return{workouts,mobility,totalSets,topExercises,prs};
}

function progressMonthChange(delta){
  const cur=progressViewMonth||getCurrentMonthStr();
  const next=shiftMonth(cur,delta);
  if(next>getCurrentMonthStr()) return;
  progressViewMonth=next;
  prSectionExpanded=false;
  renderProgress();
}

// Sum sets per muscle group for the given month. Returns array sorted by sets desc,
// preserving MUSCLE_GROUPS order for ties. "Other" is included only if non-zero.
function getMuscleDistribution(monthStr){
  const counts={};MUSCLE_GROUPS.forEach(g=>counts[g.name]=0);
  Object.entries(S.exHistory||{}).forEach(([exName,hist])=>{
    const muscle=EX_TO_MUSCLE[exName]||'Other';
    hist.forEach(e=>{if(e.date.startsWith(monthStr)) counts[muscle]+=(e.sets||[]).length;});
  });
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  const arr=MUSCLE_GROUPS.map(g=>({name:g.name,color:g.color,sets:counts[g.name],pct:total>0?counts[g.name]/total*100:0})).filter(g=>g.sets>0);
  arr.sort((a,b)=>b.sets-a.sets);
  return{segments:arr,total};
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function renderProgress(){
  const sched=getSchedule();
  let totalSets=0,sessComp=0,awaySess=0,onTgt=0,chkd=0;
  const wkSets={};
  for(let w=1;w<=16;w++){wkSets[w]=0;for(let di=0;di<3;di++){const l=getLog(w,di);if(l._completed){sessComp++;if(l._awayMode)awaySess++;}const ph=P.phases[phaseFor(w)],d=ph.days[di];d.exercises.forEach((ex,ei)=>{const el=l[ei]||{},rec=getExRec(ex);for(let si=0;si<ex.sets;si++){const s=el[si]||{};if(s.done){totalSets++;wkSets[w]++;}if(rec&&s.weight){chkd++;const wv=parseFloat(s.weight);if(Math.abs(wv-rec.kg)<=rec.kg*.07)onTgt++;}}});}}
  const pct=Math.round(sessComp/48*100);
  const mobHistory=S.mobHistory||[];
  let mobStreak=0;const td=new Date(todayStr()+'T00:00:00');for(let i=0;i<30;i++){const dd=new Date(td);dd.setDate(dd.getDate()-i);const ds=dateStr(dd);if(mobHistory.some(e=>e.date===ds))mobStreak++;else if(i>0)break;}

  const monthStr=progressViewMonth||getCurrentMonthStr();
  const isCurrentMonth=monthStr===getCurrentMonthStr();
  const prevMonthStr=shiftMonth(monthStr,-1);
  const mStats=getMonthlyStats(monthStr);
  const pStats=getMonthlyStats(prevMonthStr);

  // Current week
  const nextS=getNextPendingSession();
  const curWeek=sched.find(s=>s.date===todayStr())?.week||(nextS?nextS.week:16);

  // Header
  let html=`<div style="padding:14px 0 8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div><div class="page-title">Progress</div><div class="page-sub">16-week program</div></div><button class="btn btn-sm" onclick="openBWModal()">+ Weight</button></div></div>`;

  // Month selector
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><button class="btn btn-sm" onclick="progressMonthChange(-1)">←</button><div style="text-align:center"><div style="font-size:14px;font-weight:600">${formatMonthDisplay(monthStr)}</div><div style="font-size:10px;color:var(--muted)">vs ${formatMonthDisplay(prevMonthStr)}</div></div><button class="btn btn-sm" onclick="progressMonthChange(1)" style="${isCurrentMonth?'visibility:hidden':''}">→</button></div>`;

  // 4-up KPI tiles
  const delta=(a,b)=>a-b;
  const dSign=(n)=>n>0?`<span style="color:var(--success);font-size:10px;margin-left:4px">+${n}</span>`:n<0?`<span style="color:var(--red);font-size:10px;margin-left:4px">${n}</span>`:'';
  const kpis=[
    {label:'WORKOUTS',val:mStats.workouts,d:delta(mStats.workouts,pStats.workouts),stripe:'var(--accent)',icon:'⚡'},
    {label:'NEW PRs',val:mStats.prs.length,d:delta(mStats.prs.length,getPRsInMonth(prevMonthStr).length),stripe:'var(--amber)',icon:'⭐'},
    {label:'SETS',val:mStats.totalSets,d:delta(mStats.totalSets,pStats.totalSets),stripe:'var(--success)',icon:'💪'},
    {label:'MOBILITY',val:mStats.mobility,d:delta(mStats.mobility,pStats.mobility),stripe:'var(--purple)',icon:'🧘'},
  ];
  html+=`<div class="kpi-grid">`;
  kpis.forEach(k=>{
    html+=`<div class="kpi-tile"><div class="kpi-stripe" style="background:${k.stripe}"></div><div class="kpi-inner"><div style="font-size:11px;font-family:var(--mono);font-weight:700;letter-spacing:.12em;color:var(--muted2);margin-bottom:8px">${k.label}</div><div style="font-size:30px;font-weight:700;font-family:var(--mono);letter-spacing:-.02em;line-height:1;color:var(--text)">${k.val}${dSign(k.d)}</div></div></div>`;
  });
  html+=`</div>`;

  // Empty state
  if(mStats.workouts===0&&mStats.mobility===0&&mStats.totalSets===0){
    html+=`<div style="font-size:12px;color:var(--muted);text-align:center;padding:8px 0 12px">No activity logged${isCurrentMonth?' yet this month':' in this month'}. <span style="color:var(--accent);text-decoration:underline;cursor:pointer" onclick="showScreen('today',document.querySelectorAll('.nav-item')[0])">Log your first session in the Today tab →</span></div>`;
  }

  // Muscle distribution donut
  const muscle=getMuscleDistribution(monthStr);
  if(muscle.total>0){
    html+=`<div class="section-label">Muscle distribution</div><div class="card" style="margin-bottom:14px">`;
    const r=40,cx=50,cy=50,sw=14,circ=2*Math.PI*r;
    let cumAngle=0,segs='';
    muscle.segments.forEach(s=>{const segC=s.pct/100*circ;segs+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}" stroke-dasharray="${segC.toFixed(2)} ${(circ-segC).toFixed(2)}" transform="rotate(${(cumAngle-90).toFixed(2)} ${cx} ${cy})"/>`;cumAngle+=s.pct/100*360;});
    html+=`<div style="display:flex;align-items:center;gap:16px"><svg viewBox="0 0 100 100" style="width:120px;height:120px;flex-shrink:0"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surf2)" stroke-width="${sw}"/>${segs}<text x="50" y="49" text-anchor="middle" font-size="14" font-weight="600" fill="var(--text)" font-family="monospace">${muscle.total}</text><text x="50" y="60" text-anchor="middle" font-size="7" fill="var(--muted)">sets</text></svg><div style="flex:1;min-width:0">${muscle.segments.map(s=>`<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:12px"><span style="width:9px;height:9px;border-radius:2px;background:${s.color};flex-shrink:0;display:inline-block"></span><span style="flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</span><span style="font-family:var(--mono);color:var(--muted);font-size:11px">${s.sets} · ${Math.round(s.pct)}%</span></div>`).join('')}</div></div>`;
    html+=`</div>`;
  }

  // New PRs this month — collapsible
  if(mStats.prs.length>0){
    html+=`<div class="card" style="margin-bottom:14px;padding:0;overflow:hidden">`;
    html+=`<button onclick="prSectionExpanded=!prSectionExpanded;renderProgress()" style="width:100%;background:none;border:none;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;text-align:left">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:16px">🏆</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text)">${mStats.prs.length} new PR${mStats.prs.length>1?'s':''}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:1px">${formatMonthDisplay(monthStr)}</div>
        </div>
      </div>
      <span style="font-size:18px;color:var(--muted);transition:transform .2s;display:inline-block;transform:rotate(${prSectionExpanded?'90':'0'}deg)">›</span>
    </button>`;
    if(prSectionExpanded){
      html+=`<div style="border-top:1px solid var(--border);padding:8px 14px 12px">`;
      mStats.prs.forEach((pr,i)=>{
        const muscleColor=MUSCLE_GROUPS.find(g=>EX_TO_MUSCLE[pr.exName]===g.name)?.color||'var(--amber)';
        const display=pr.isBW?`${pr.value} reps`:`${pr.value} kg`;
        html+=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0;${i<mStats.prs.length-1?'border-bottom:1px solid var(--border)':''}">
          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
            <span style="width:3px;height:28px;border-radius:2px;background:${muscleColor};flex-shrink:0;display:inline-block"></span>
            <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pr.exName}</div><div style="font-size:10px;color:var(--muted);margin-top:1px">${formatDateDisplay(pr.date)}</div></div>
          </div>
          <div style="font-size:14px;font-weight:700;font-family:var(--mono);color:var(--amber);flex-shrink:0">${display}</div>
        </div>`;
      });
      html+=`</div>`;
    }
    html+=`</div>`;
  }

  // 16-week volume bars
  html+=`<div class="section-label">Volume · 16 weeks</div><div class="card" style="margin-bottom:14px">`;
  html+=makeVolumeBarsSVG(wkSets,curWeek);
  // Week number labels (every 4)
  html+=`<div style="display:flex;gap:3px;margin-bottom:6px">`;
  for(let w=1;w<=16;w++){html+=`<div style="flex:1;text-align:center;font-size:8px;font-family:var(--mono);color:${w===curWeek?'var(--accent)':'var(--muted2)'}">${w%4===1||w===16?w:''}</div>`;}
  html+=`</div>`;
  // Phase legend
  html+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">`;
  [{c:'#6B6B72',l:'P1'},{c:'#60a5fa',l:'P2'},{c:'#FF6B35',l:'P3'},{c:'#E8B040',l:'P4'},{c:'#a78bfa',l:'Deload'}].forEach(x=>
    html+=`<span style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)"><span style="width:8px;height:8px;border-radius:2px;background:${x.c};display:inline-block"></span>${x.l}</span>`);
  html+=`</div></div>`;

  // Strength trend
  const keyLifts=['Barbell Bench Press','Barbell Back Squat','Barbell Deadlift'];
  const liftColors2={'Barbell Bench Press':'#FF6B35','Barbell Back Squat':'#60a5fa','Barbell Deadlift':'#5BC489'};
  const availLifts=keyLifts.filter(n=>S.exHistory[n]&&S.exHistory[n].length>=2);
  if(availLifts.length>0){
    html+=`<div class="section-label">Strength trend</div><div class="card" style="margin-bottom:14px">`;
    availLifts.forEach((exName,i,arr)=>{
      const hist=[...S.exHistory[exName]].sort((a,b)=>a.date.localeCompare(b.date));
      const pts=hist.map(h=>h.sets.reduce((b,s)=>calcEpley(s.weight||0,s.reps||1)>b?calcEpley(s.weight||0,s.reps||1):b,0)).filter(v=>v>0);
      if(pts.length<2)return;
      const col=liftColors2[exName]||'#FF6B35';
      const delta=pts[pts.length-1]-pts[0];
      const shortName=exName.replace('Barbell ','');
      html+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}"><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;margin-bottom:2px">${shortName}</div><div style="font-size:10px;font-family:var(--mono);color:${delta>=0?'var(--success)':'var(--red)'}">${delta>=0?'+':''}${delta.toFixed(0)} kg · wk 1 → now</div></div>${makeSparklineSVG(pts,col,72,28)}<div style="text-align:right;flex-shrink:0;min-width:44px"><div style="font-size:16px;font-weight:700;font-family:var(--mono);color:${col}">${pts[pts.length-1]}</div><div style="font-size:9px;color:var(--muted2)">kg est.</div></div></div>`;
    });
    html+=`</div>`;
  }

  // Phase overview
  html+=`<div class="section-label">Phase overview</div><div class="card" style="margin-bottom:14px">`;
  [{label:'Phase 1',sub:'Foundation · Wks 1–4',start:1,end:4,col:'#8B8B92'},{label:'Phase 2',sub:'Volume · Wks 5–8',start:5,end:8,col:'#60a5fa'},{label:'Phase 3',sub:'Hypertrophy · Wks 9–12',start:9,end:12,col:'#FF6B35'},{label:'Phase 4',sub:'Peak · Wks 13–15',start:13,end:15,col:'#E8B040'},{label:'Deload',sub:'Week 16',start:16,end:16,col:'#a78bfa'}].forEach((ph,i,arr)=>{
    let phD=0,phT=0;for(let w=ph.start;w<=ph.end;w++)for(let d=0;d<3;d++){phT++;if(isSessionDone(w,d))phD++;}
    const phPct=Math.round(phD/phT*100);
    const isCur=curWeek>=ph.start&&curWeek<=ph.end;
    html+=`<div style="padding:9px 0;${i<arr.length-1?'border-bottom:1px solid var(--border)':''}"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px"><div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${ph.col};flex-shrink:0;display:inline-block${isCur?';box-shadow:0 0 0 2px rgba(255,255,255,.15)':''}"></span><div><div style="font-size:13px;font-weight:${isCur?'600':'500'};color:${isCur?'var(--text)':'var(--muted)'}">${ph.label}</div><div style="font-size:10px;color:var(--muted2)">${ph.sub}</div></div></div><span style="font-size:12px;font-family:var(--mono);color:${phD===phT?'var(--success)':isCur?ph.col:'var(--muted)'}">${phD}/${phT}</span></div><div class="prog-track"><div class="prog-fill" style="width:${phPct}%;background:${ph.col}"></div></div></div>`;
  });
  html+=`</div>`;

  // Lifetime totals
  html+=`<div class="section-label">Lifetime</div>`;
  html+=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">`;
  [{v:sessComp,l:'Sessions'},{v:pct+'%',l:'Complete'},{v:totalSets,l:'Total sets'},{v:mobHistory.length,l:'Mobility'}].forEach(x=>
    html+=`<div style="background:var(--surf);border:1px solid var(--border);border-radius:12px;padding:10px 8px;text-align:center"><div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--text);letter-spacing:-.02em">${x.v}</div><div style="font-size:9px;color:var(--muted);margin-top:3px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">${x.l}</div></div>`);
  html+=`</div>`;

  if(awaySess>0)html+=`<div class="alert alert-orange" style="margin-bottom:12px">✈ ${awaySess} session${awaySess>1?'s':''} completed in away mode — all count toward your progress.</div>`;

  html+=`<div class="divider"></div><button class="btn btn-ghost btn-danger" onclick="if(confirm('Reset ALL data? Cannot be undone.')){localStorage.removeItem('${STORE_KEY}');location.reload()}">Reset all data</button>`;
  document.getElementById('screen-progress').innerHTML=html;
}
function openBWModal(){document.getElementById('bw-date').value=todayStr();document.getElementById('bw-input').value='';openModal('modal-bw');}
function saveBW(){const w=parseFloat(document.getElementById('bw-input').value),d=document.getElementById('bw-date').value;if(!w||!d){alert('Please enter weight and date');return;}if(!S.bw)S.bw=[];S.bw=S.bw.filter(e=>e.date!==d);S.bw.push({date:d,weight:w});S.bw.sort((a,b)=>a.date.localeCompare(b.date));saveState();closeModal('modal-bw');renderStrength();}
function deleteBW(date){S.bw=(S.bw||[]).filter(e=>e.date!==date);saveState();renderStrength();}

