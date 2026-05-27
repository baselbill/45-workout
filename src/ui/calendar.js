// ─── 45-WORKOUT v2: calendar ───
// Calendar screen: monthly view, session navigation, missed sessions
// ─── CHART / VISUAL HELPERS ───────────────────────────────────────────────────
let _chartUid=0;

function makeSparklineSVG(pts,color,W,H){
  W=W||80;H=H||30;
  if(!pts||pts.length<2)return`<div style="width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center"><span style="font-size:10px;color:var(--muted2)">—</span></div>`;
  const uid=++_chartUid;
  const min=Math.min(...pts),max=Math.max(...pts),range=max-min||1;
  const coords=pts.map((v,i)=>{
    const x=(i/(pts.length-1))*(W-6)+3;
    const y=H-4-((v-min)/range)*(H-8);
    return[x,y];
  });
  const line=coords.map(([x,y])=>`${x},${y}`).join(' ');
  const last=coords[coords.length-1];
  const area=`M${coords[0][0]},${coords[0][1]} ${coords.map(([x,y])=>`L${x},${y}`).join(' ')} L${last[0]},${H} L${coords[0][0]},${H} Z`;
  return`<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px;display:block;flex-shrink:0">
    <defs><linearGradient id="spk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.25"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#spk${uid})"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="2.5" fill="${color}"/>
  </svg>`;
}

function makeLevelTrackHTML(ratio){
  const maxR=1.5;
  const pos=Math.min(0.98,Math.max(0.02,(ratio||0)/maxR));
  return`<div class="level-track-wrap"><div class="level-track-dot" style="left:${(pos*100).toFixed(1)}%;background:${ratio>=1.25?'#FF6B35':ratio>=1.0?'#E8B040':ratio>=0.75?'#5BC489':'#7AA7E8'}"></div></div>
  <div style="display:flex;justify-content:space-between;font-size:8.5px;font-family:var(--mono);color:var(--muted2);letter-spacing:.04em;margin-bottom:6px"><span>NOVICE</span><span>INTER</span><span>ADVANCED</span><span>ELITE</span></div>`;
}

function getRM8WeekTrend(liftId){
  const exMap={bench:['Barbell Bench Press','DB Bench Press'],squat:['Barbell Back Squat'],deadlift:['Barbell Deadlift','Barbell Romanian Deadlift'],ohp:['Dumbbell Seated Shoulder Press','DB Arnold Press'],pullup:['Weighted Wide Grip Pull-Up']};
  const names=exMap[liftId]||[];
  const byDate={};
  names.forEach(n=>{
    (S.exHistory[n]||[]).forEach(e=>{
      const best=(e.sets||[]).reduce((b,s)=>{const est=s.weight&&s.reps?calcEpley(parseFloat(s.weight),parseInt(s.reps)):0;return est>b?est:b;},0);
      if(best>0)byDate[e.date]=Math.max(byDate[e.date]||0,best);
    });
  });
  return Object.keys(byDate).sort().slice(-8).map(k=>byDate[k]);
}

function makeVolumeBarsSVG(wkSets,currentWeek){
  const phColor=w=>w<=4?'#6B6B72':w<=8?'#60a5fa':w<=12?'#FF6B35':w<=15?'#E8B040':'#a78bfa';
  const vals=Object.values(wkSets);
  const maxV=Math.max(...vals,1);
  const barW=13,gap=4,H=64,W=16*(barW+gap)-gap+4;
  let rects='';
  for(let w=1;w<=16;w++){
    const v=wkSets[w]||0;
    const x=2+(w-1)*(barW+gap);
    const h=v>0?Math.max(4,(v/maxV)*(H-6)):3;
    const y=H-h;
    const col=v>0?phColor(w):(w>currentWeek?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.09)');
    const isCur=w===currentWeek;
    rects+=`<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="2" fill="${isCur?'#FF6B35':col}"/>`;
    if(isCur&&v>0)rects+=`<rect x="${x}" y="${y}" width="${barW}" height="${Math.min(h*.4,8)}" rx="2" fill="rgba(255,255,255,0.18)"/>`;
  }
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block">${rects}</svg>`;
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
let calViewMonth=null;
function renderCalendar(){
  if(!calViewMonth){const n=new Date();calViewMonth={year:n.getFullYear(),month:n.getMonth()};}
  const{year,month}=calViewMonth,sched=getSchedule(),today=todayStr();
  const firstDay=new Date(year,month,1),lastDay=new Date(year,month+1,0),daysInMonth=lastDay.getDate(),startDow=firstDay.getDay();
  const monthName=firstDay.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const streak=getTrainingStreak();
  const mobDoneSet=new Set((S.mobHistory||[]).map(e=>e.date));

  // Phase journey strip
  const phDefs=[
    {label:'P1',name:'Foundation',start:1,end:4,color:'#8B8B92'},
    {label:'P2',name:'Volume',start:5,end:8,color:'#60a5fa'},
    {label:'P3',name:'Hypertrophy',start:9,end:12,color:'#FF6B35'},
    {label:'P4',name:'Peak',start:13,end:15,color:'#E8B040'},
    {label:'↻',name:'Deload',start:16,end:16,color:'#a78bfa'},
  ];
  const nextS=getNextPendingSession();
  const curWeek=sched.find(s=>s.date===today)?.week||(nextS?nextS.week:null);
  let sessComp=0;
  for(let w=1;w<=16;w++)for(let di=0;di<3;di++)if(isSessionDone(w,di))sessComp++;

  let phaseStrip='<div style="margin:14px 0 4px">';
  phaseStrip+='<div style="display:flex;gap:3px;height:7px;border-radius:4px;overflow:hidden;margin-bottom:5px">';
  phDefs.forEach(ph=>{
    const weeks=ph.end-ph.start+1;
    const allDone=[...Array(weeks)].every((_,i)=>[0,1,2].every(di=>isSessionDone(ph.start+i,di)));
    const isCur=curWeek&&curWeek>=ph.start&&curWeek<=ph.end;
    const anyDone=[...Array(weeks)].some((_,i)=>[0,1,2].some(di=>isSessionDone(ph.start+i,di)));
    const bg=allDone?'rgba(91,196,137,0.55)':isCur?ph.color:anyDone?'rgba(91,196,137,0.2)':'rgba(255,255,255,0.07)';
    phaseStrip+=`<div style="flex:${weeks};background:${bg};border-radius:2px"></div>`;
  });
  phaseStrip+='</div><div style="display:flex;gap:3px;margin-bottom:10px">';
  phDefs.forEach(ph=>{
    const isCur=curWeek&&curWeek>=ph.start&&curWeek<=ph.end;
    const weeks=ph.end-ph.start+1;
    phaseStrip+=`<div style="flex:${weeks};text-align:center"><span style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.06em;color:${isCur?ph.color:'var(--muted2)'}">${ph.label}</span></div>`;
  });
  phaseStrip+=`</div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:14px"><span style="color:var(--muted)">${sessComp} / 48 sessions</span><span style="color:var(--accent);font-family:var(--mono);font-weight:700">${Math.round(sessComp/48*100)}%</span></div></div>`;

  // Header
  let html=`<div style="padding:14px 0 4px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div><div class="page-title">Calendar</div><div class="page-sub">16-week training schedule</div></div>${streak>0?`<div style="display:flex;align-items:center;gap:6px;background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:5px 12px"><span>🔥</span><span style="font-size:14px;font-weight:700;font-family:var(--mono);color:var(--accent)">${streak}</span></div>`:''}</div>${phaseStrip}</div>`;

  // This-week strip
  const nowD=new Date(),weekStart=new Date(nowD);
  weekStart.setDate(nowD.getDate()-nowD.getDay());
  const dowL=['Su','Mo','Tu','We','Th','Fr','Sa'];
  html+=`<div class="section-label" style="margin-top:0">This week</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px">`;
  for(let i=0;i<7;i++){
    const dd=new Date(weekStart);dd.setDate(weekStart.getDate()+i);
    const ds=dateStr(dd),isT=ds===today;
    const sess=sched.find(s=>s.date===ds),hasMob=mobDoneSet.has(ds);
    let bg='var(--surf2)',col='var(--muted2)',ring='',oc='',lbl='';
    if(sess){
      const log=getLog(sess.week,sess.dayIdx);
      const done=log._completed;
      if(done){bg='rgba(91,196,137,0.15)';col='var(--success)';}
      else if(isT){bg='var(--accent)';col='#1A0800';}
      else if(ds<today){bg='rgba(231,106,106,0.10)';col='var(--red)';}
      else{bg='rgba(255,255,255,0.05)';col='var(--muted)';}
      oc=`onclick="jumpTo(${sess.week},${sess.dayIdx});showScreenById('today')"`;
      lbl=sess.dayIdx===1?'L':'U';
    }else if(hasMob){bg='rgba(167,139,250,0.12)';col='var(--purple)';lbl='◆';oc=`onclick="showScreen('mobility',document.querySelectorAll('.nav-item')[4])"`;
    }else if(isT){ring='box-shadow:inset 0 0 0 1.5px var(--accent);';col='var(--accent)';}
    html+=`<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="font-size:9px;font-family:var(--mono);color:var(--muted2);letter-spacing:.04em">${dowL[i]}</span><div style="width:100%;aspect-ratio:1;border-radius:8px;background:${bg};${ring}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:${oc?'pointer':'default'}" ${oc}><span style="font-size:12px;font-weight:700;font-family:var(--mono);color:${col}">${dd.getDate()}</span>${lbl?`<span style="font-size:8px;color:${col};opacity:.85">${lbl}</span>`:''}</div></div>`;
  }
  html+=`</div>`;

  // Month navigation + grid
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><button class="btn btn-sm" onclick="calPrevMonth()">←</button><span style="font-size:14px;font-weight:600">${monthName}</span><button class="btn btn-sm" onclick="calNextMonth()">→</button></div>`;
  html+=`<div class="cal-grid">`;
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=>html+=`<div class="cal-hdr">${d}</div>`);
  for(let i=0;i<startDow;i++)html+=`<div class="cal-day"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const date=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const entry=sched.find(s=>s.date===date),isToday=date===today,isFut=date>today;
    const hasMobDone=mobDoneSet.has(date);
    let cls='',label='';
    if(entry){
      const doneLog=S.logs[dayKey(entry.week,entry.dayIdx)]||{};
      // E1-1: A session appears as "completed" on its SCHEDULED date.
      // Primary check: _scheduledDate===date (set by completeSession() since v7).
      // Fallback: legacy data without _scheduledDate uses _completedDate===date.
      // This correctly handles late completions (scheduled Wed, done Thu) by always
      // rendering completion on the scheduled date, not the actual completion date.
      const done=!!doneLog._completed&&(doneLog._scheduledDate===date||(!doneLog._scheduledDate&&doneLog._completedDate===date)),wasAway=!!doneLog._awayMode;
      cls=done?(wasAway?'completed-away':'completed'):isToday?'today-workout':isFut?'has-workout future':'missed has-workout';
      label=(entry.dayIdx===1?'L':'U')+(entry.dayIdx+1)+(wasAway&&done?' ✈':'');
    }else if(isToday){cls='today-rest';label=hasMobDone?'◆':'';
    }else if(!isFut){label=hasMobDone?'◆':'';if(hasMobDone)cls='has-workout';}
    const oc=entry?`onclick="jumpTo(${entry.week},${entry.dayIdx});showScreenById('today')"`:hasMobDone?`onclick="showScreen('mobility',document.querySelectorAll('.nav-item')[4])"`:'' ;
    html+=`<div class="cal-day ${cls}" ${oc} style="${hasMobDone&&!entry?'border:1px solid rgba(167,139,250,.4);background:rgba(167,139,250,.08)':''}"><span>${d}</span>${label?`<span style="font-size:8px;margin-top:1px;opacity:.85">${label}</span>`:''}</div>`;
  }
  html+=`</div>`;

  // Legend
  html+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 14px;font-size:11px">`;
  [{c:'var(--accent)',l:'Today'},{c:'rgba(91,196,137,.15)',l:'Done'},{c:'rgba(167,139,250,.08)',l:'Mobility'},{c:'rgba(231,106,106,.10)',l:'Missed'},{c:'rgba(255,255,255,.05)',l:'Upcoming'}].forEach(x=>
    html+=`<span style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:2px;background:${x.c};display:inline-block;border:1px solid rgba(255,255,255,.1)"></span><span style="color:var(--muted)">${x.l}</span></span>`);
  html+=`</div>`;

  // Upcoming sessions
  const allUpcoming=sched.filter(s=>s.date>=today&&!isSessionDone(s.week,s.dayIdx));
  const upcoming=allUpcoming.slice(0,5);
  html+=`<div class="section-label">Upcoming</div>`;
  if(!upcoming.length){html+=`<div class="card" style="text-align:center;padding:16px;color:var(--muted);font-size:13px">Program complete 🎉</div>`;}
  else upcoming.forEach(s=>{
    const ph=P.phases[phaseFor(s.week)],day=ph.days[s.dayIdx],isT=s.date===today;
    const dd2=new Date(s.date+'T00:00:00');
    const dow2=dd2.toLocaleDateString('en-GB',{weekday:'short'});
    const dayN=dd2.getDate();
    const typeBg=s.dayIdx===1?'rgba(96,165,250,0.14)':'var(--accent-dim)';
    const typeCol=s.dayIdx===1?'var(--blue)':'var(--accent)';
    html+=`<div class="card" style="cursor:pointer;padding:12px;margin-bottom:8px;${isT?'border-color:rgba(91,196,137,.35)':''}" onclick="jumpTo(${s.week},${s.dayIdx});showScreenById('today')"><div style="display:flex;align-items:center;gap:10px"><div style="text-align:center;min-width:34px"><div style="font-size:17px;font-weight:700;font-family:var(--mono);line-height:1;color:var(--text)">${dayN}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">${dow2}</div></div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:${typeBg};color:${typeCol};font-family:var(--mono)">${s.dayIdx===1?'L':'U'}${s.dayIdx+1}</span><span style="font-size:11px;color:var(--muted);font-family:var(--mono)">Wk ${s.week} · ${ph.short}</span>${isT?'<span class="badge badge-green" style="margin-left:auto">Today</span>':''}</div><div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${day.name}</div></div><span style="font-size:16px;color:var(--muted)">›</span></div></div>`;
  });
  if(allUpcoming.length>5){html+=`<div style="font-size:11px;color:var(--muted);text-align:center;padding:6px 0 4px">Showing 5 of ${allUpcoming.length} upcoming sessions.</div>`;}

  // Program start row
  if(S.startDate){
    const startD=new Date(S.startDate+'T00:00:00'),daysIn=Math.floor((new Date(today+'T00:00:00')-startD)/86400000);
    html+=`<div class="card" style="margin-top:6px;padding:12px"><div style="display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;margin-bottom:3px">Program started</div><div style="font-size:14px;font-weight:500">${formatDateDisplay(S.startDate)} <span style="font-size:12px;color:var(--muted);font-weight:400">· day ${daysIn}</span></div></div><button class="btn btn-sm" onclick="changeStartDate()">Change</button></div></div>`;
  }

  document.getElementById('screen-calendar').innerHTML=html;
}
function calPrevMonth(){calViewMonth.month--;if(calViewMonth.month<0){calViewMonth.month=11;calViewMonth.year--;}renderCalendar();}
function calNextMonth(){calViewMonth.month++;if(calViewMonth.month>11){calViewMonth.month=0;calViewMonth.year++;}renderCalendar();}
function changeStartDate(){showPrompt('Change program start date',S.startDate,(d)=>{if(/^\d{4}-\d{2}-\d{2}$/.test(d)){S.startDate=d;S._sc=null;saveState();renderCalendar();}else showToast('Invalid date format','error');});}

