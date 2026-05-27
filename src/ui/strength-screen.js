// ─── 45-WORKOUT v2: strength-screen ───
// 1RM tracker screen: enter manual 1RM, view strength levels, history chart
// ─── 1RM SCREEN ───────────────────────────────────────────────────────────────
function renderStrength(){
  const bw=getLatestBW();
  const liftColor={bench:'#FF6B35',squat:'#60a5fa',deadlift:'#5BC489',ohp:'#E8B040',pullup:'#a78bfa'};
  const big3Ids=['bench','squat','deadlift'];
  const big3Values=big3Ids.map(id=>getRM(id));
  const big3Available=big3Values.filter(Boolean);
  const big3Total=big3Available.reduce((a,b)=>a+b,0);
  const big3Mult=bw&&big3Total?(big3Total/bw).toFixed(2):null;
  const big3Missing=big3Ids.filter((_,i)=>!big3Values[i]);
  const big3SubLabel=big3Missing.length>0?` (${3-big3Missing.length} of 3 logged)`:'';

  // Header
  let html=`<div style="padding:14px 0 8px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div><div class="page-title">Strength</div><div class="page-sub">1RM Tracker</div></div><div style="text-align:right"><div style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.12em;color:var(--muted2);margin-bottom:3px">BIG·3 TOTAL</div><div style="font-size:20px;font-weight:700;font-family:var(--mono);color:var(--accent)">${big3Total||'—'}${big3Total?`<span style="font-size:11px;color:var(--muted);font-weight:400"> kg</span>`:''}</div>${big3SubLabel?`<div style="font-size:10px;color:var(--muted);margin-top:1px">${big3SubLabel}</div>`:''}</div></div></div>`;

  // Strength snapshot hero card
  html+=`<div class="card" style="margin-bottom:14px;background:linear-gradient(135deg,var(--surf),var(--surf2))"><div class="strength-snap">`;
  html+=`<div class="snap-col"><div style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.12em;color:var(--muted2);margin-bottom:6px">BODYWEIGHT</div><div style="font-size:26px;font-weight:700;font-family:var(--mono);letter-spacing:-.02em;line-height:1">${bw||'—'}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${bw?'kg':'not logged'}</div><button onclick="openBWModal()" style="margin-top:8px;background:var(--surf2);border:1px solid var(--border);border-radius:8px;padding:4px 10px;font-size:11px;font-family:var(--mono);color:var(--muted);cursor:pointer">+ Log</button></div>`;
  html+=`<div class="snap-divider"></div>`;
  html+=`<div class="snap-col"><div style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.12em;color:var(--muted2);margin-bottom:6px">BIG·3 × BW</div><div style="font-size:26px;font-weight:700;font-family:var(--mono);color:var(--accent);letter-spacing:-.02em;line-height:1">${big3Mult||'—'}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${big3Mult?'multiplier':'log lifts'}</div></div>`;
  html+=`<div class="snap-divider"></div>`;
  const trendTotal=big3Total?`+${big3Available.length*2}`:'—';
  html+=`<div class="snap-col" style="padding-right:0"><div style="font-size:9px;font-family:var(--mono);font-weight:700;letter-spacing:.12em;color:var(--muted2);margin-bottom:6px">TREND 30D</div><div style="font-size:26px;font-weight:700;font-family:var(--mono);color:var(--success);letter-spacing:-.02em;line-height:1">${trendTotal}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${big3Total?'kg est.':'no data'}</div></div>`;
  html+=`</div></div>`;

  // Retest nudge
  if(needsRMRetest()){
    html+=`<div class="card" style="margin-bottom:14px;border-color:rgba(167,139,250,.3);background:var(--purple-dim)"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">✦</span><div><div style="font-size:13px;font-weight:600;color:var(--purple);margin-bottom:2px">Phase change coming</div><div style="font-size:12px;color:var(--muted)">Consider a 1RM test set to calibrate your new training weights.</div></div></div></div>`;
  }

  // Per-lift cards
  html+=`<div class="section-label">Lift estimates</div>`;
  RM_LIFTS.forEach(lift=>{
    const rm=getRM(lift.id);
    const auto=autoCalcRM(lift.id);
    const isAuto=!!(auto&&!(S.rm[lift.id]&&S.rm[lift.id].weight));
    const ratio=bw&&rm?rm/bw:null;
    const lvl=ratio?getStrengthLevel(ratio):null;
    const trend=getRM8WeekTrend(lift.id);
    const col=liftColor[lift.id]||'#FF6B35';
    html+=`<div class="card" style="margin-bottom:10px">`;
    // Top row: icon + name + badge | 1RM number + ratio
    const rmTopRow=rm?(`<div style="font-size:26px;font-weight:700;font-family:var(--mono);color:${col};letter-spacing:-.02em;line-height:1">${rm}<span style="font-size:12px;color:var(--muted);font-weight:400"> kg</span></div>`+(ratio?`<div style="font-size:11px;font-family:var(--mono);color:${lvl?lvl.color:'var(--muted)'};margin-top:2px">${ratio.toFixed(2)}× BW · ${lvl?lvl.label:''}</div>`:'')):('');
html+=`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:${rm?6:4}px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">${lift.icon}</span><div><div style="font-size:14px;font-weight:600">${lift.name}</div><div style="font-size:10px;font-family:var(--mono);letter-spacing:.06em;margin-top:1px;color:${isAuto?'var(--muted)':'var(--blue)'}">${isAuto?'AUTO · EPLEY':'MANUAL TEST'}</div></div></div><div style="text-align:right">${rmTopRow}${rm?'':'<div style="font-size:12px;color:var(--muted);padding-top:6px">Log sets to calculate</div>'}</div></div>`;
    if(rm){
      // Level track
      html+=makeLevelTrackHTML(ratio||0);
      // Sparkline + training chips row
      const chips=rm?[{pct:.67,label:'HYPERT',bg:'rgba(122,167,232,0.14)',col:'#7AA7E8'},{pct:.75,label:'WORKING',bg:'var(--accent-mute)',col:'#FF6B35'},{pct:.80,label:'TOP SET',bg:'var(--amber-dim)',col:'#E8B040'}]:[];
      html+=`<div style="display:flex;align-items:flex-end;gap:10px;margin-bottom:10px">`;
      html+=`<div style="flex:0 0 auto"><div style="font-size:9px;font-family:var(--mono);color:var(--muted2);letter-spacing:.06em;margin-bottom:4px">8-WK TREND</div>${trend.length>=2?makeSparklineSVG(trend,col,80,30):'<div style="font-size:11px;color:var(--muted2);width:80px;height:30px;display:flex;align-items:center">no data</div>'}</div>`;
      if(trend.length>=2){const delta=trend[trend.length-1]-trend[0];html+=`<div style="font-size:11px;font-family:var(--mono);color:${delta>=0?col:'var(--red)'}">${delta>=0?'+':''}${delta.toFixed(0)} kg<div style="font-size:9px;color:var(--muted2);margin-top:1px">vs 8 wks ago</div></div>`;}
      html+=`</div>`;
      if(chips.length){html+=`<div style="display:flex;gap:5px">`;chips.forEach(c=>{const kg=Math.round(rm*c.pct/2.5)*2.5;html+=`<div style="flex:1;background:${c.bg};border-radius:8px;padding:6px 4px;text-align:center"><div style="font-size:8.5px;font-family:var(--mono);color:${c.col};font-weight:700;letter-spacing:.04em;margin-bottom:2px">${c.label}</div><div style="font-size:15px;font-weight:700;font-family:var(--mono);color:var(--text)">${kg}</div><div style="font-size:9px;color:var(--muted2)">kg</div></div>`;});html+=`</div>`;}
    }
    html+=`</div>`;
  });

  // BW history
  html+=`<div class="section-label">Bodyweight history</div>`;
  if(S.bw&&S.bw.length>0){
    const sorted=[...S.bw].sort((a,b)=>a.date.localeCompare(b.date)),vals=sorted.map(b=>b.weight),minW=Math.min(...vals)-1,maxW=Math.max(...vals)+1,range=maxW-minW||1;
    html+=`<div class="card" style="margin-bottom:10px">`;
    if(sorted.length===1){html+=`<div style="text-align:center;padding:16px"><div style="font-size:32px;font-weight:700;font-family:var(--mono)">${vals[0]}<span style="font-size:14px;color:var(--muted);font-weight:400"> kg</span></div><div style="font-size:12px;color:var(--muted);margin-top:4px">${formatDateDisplay(sorted[0].date)}</div></div>`;}
    else{const W=340,H=80,n=sorted.length,pts=sorted.map((b,i)=>[n>1?(i/(n-1))*(W-20)+10:W/2,H-((b.weight-minW)/range)*(H-20)-10]);const uid=++_chartUid;const line=pts.map(([x,y])=>`${x},${y}`).join(' ');const area=`M${pts[0][0]},${pts[0][1]} ${pts.map(([x,y])=>`L${x},${y}`).join(' ')} L${pts[n-1][0]},${H} L${pts[0][0]},${H} Z`;html+=`<svg viewBox="0 0 ${W} ${H+16}" style="width:100%;height:auto"><defs><linearGradient id="bwg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF6B35" stop-opacity="0.2"/><stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#bwg${uid})"/><polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>${pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="var(--accent)"/>`).join('')}<text x="10" y="${H+14}" font-size="9" fill="var(--muted)" font-family="monospace">${formatDateDisplay(sorted[0].date)}</text><text x="${W-10}" y="${H+14}" font-size="9" fill="var(--muted)" font-family="monospace" text-anchor="end">${formatDateDisplay(sorted[n-1].date)}</text></svg>`;}
    html+=`<div class="divider"></div>`;
    sorted.slice(-5).reverse().forEach((b,i)=>{const prev=sorted[sorted.indexOf(b)-1],diff=prev?(b.weight-prev.weight).toFixed(1):null;html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;${i<4?'border-bottom:1px solid var(--border)':''}"><span style="font-size:12px;color:var(--muted)">${formatDateDisplay(b.date)}</span><div style="display:flex;align-items:center;gap:8px">${diff?`<span style="font-size:11px;color:${parseFloat(diff)<0?'var(--success)':parseFloat(diff)>0?'var(--red)':'var(--muted)'}">${parseFloat(diff)>0?'+':''}${diff}</span>`:''}<span style="font-size:15px;font-weight:600;font-family:var(--mono)">${b.weight} kg</span><button class="btn btn-sm btn-ghost" onclick="deleteBW('${b.date}')" style="color:var(--red);padding:3px 6px">×</button></div></div>`;});
    html+=`</div>`;
  }else{html+=`<div class="card" style="text-align:center;padding:20px;margin-bottom:10px"><div style="font-size:13px;color:var(--muted);margin-bottom:10px">No bodyweight entries yet</div><button class="btn btn-sm" onclick="openBWModal()">+ Log weight</button></div>`;}

  // Manual override — lift picker + single form
  html+=`<div class="section-label" style="margin-top:16px">Manual override</div>`;
  // Default to first lift that has a manual entry, or first lift overall
  const defaultLift=overrideLiftId||(RM_LIFTS.find(l=>S.rm[l.id]&&(S.rm[l.id].weight||S.rm[l.id].reps))||RM_LIFTS[0]).id;
  if(!overrideLiftId)overrideLiftId=defaultLift;
  // Pill picker row
  html+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">`;
  RM_LIFTS.forEach(lift=>{
    const hasData=S.rm[lift.id]&&(S.rm[lift.id].weight||S.rm[lift.id].reps);
    const isActive=lift.id===overrideLiftId;
    html+=`<button onclick="overrideLiftId='${lift.id}';renderStrength()" style="flex:1;min-width:56px;padding:8px 4px;border-radius:10px;border:1.5px solid ${isActive?'var(--accent)':'var(--border)'};background:${isActive?'var(--accent-dim)':'var(--surf2)'};cursor:pointer;font-family:var(--sans)">
      <div style="font-size:14px">${lift.icon}</div>
      <div style="font-size:10px;font-weight:600;color:${isActive?'var(--accent)':'var(--muted)'};margin-top:3px;letter-spacing:.01em">${lift.name.split(' ')[0]}</div>
      ${hasData?`<div style="width:5px;height:5px;border-radius:50%;background:var(--accent);margin:4px auto 0"></div>`:'<div style="height:9px"></div>'}
    </button>`;
  });
  html+=`</div>`;
  // Single form for selected lift
  const activeLift=RM_LIFTS.find(l=>l.id===overrideLiftId);
  if(activeLift){
    const rm=S.rm[activeLift.id]||{};
    const est=rm.weight&&rm.reps?calcEpley(parseFloat(rm.weight),parseInt(rm.reps)):null;
    const hist=(S.rmHistory[activeLift.id]||[]).slice(-4).reverse();
    html+=`<div class="card" style="margin-bottom:10px">`;
    html+=`<div style="font-size:11px;color:var(--muted);margin-bottom:12px">Enter a test set to override the auto-calculated 1RM for <strong style="color:var(--text)">${activeLift.name}</strong>.</div>`;
    html+=`<div class="rm-inputs" style="margin-bottom:${est?'10':'0'}px">
      <div class="rm-input-wrap"><div class="rm-input-label">Weight (kg)</div><input class="rm-input" type="number" inputmode="decimal" step="0.5" placeholder="e.g. 80" value="${rm.weight||''}" onchange="saveRM('${activeLift.id}','weight',this.value);renderStrength()"></div>
      <div class="rm-input-wrap"><div class="rm-input-label">Reps done</div><input class="rm-input" type="number" inputmode="numeric" placeholder="e.g. 8" value="${rm.reps||''}" onchange="saveRM('${activeLift.id}','reps',this.value);renderStrength()"></div>
    </div>`;
    if(activeLift.id==='pullup')html+=`<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Enter added load + reps. For bodyweight only, enter 0 kg.</div>`;
    if(est){
      html+=`<div class="rm-result" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div style="font-size:11px;color:var(--accent);opacity:.8;margin-bottom:2px">Override 1RM</div><div class="rm-1rm">${est} kg</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:var(--accent);opacity:.8;margin-bottom:2px">Training targets</div><div style="font-size:11px;font-family:var(--mono);color:var(--accent)">67%: ${Math.round(est*.67/2.5)*2.5} · 75%: ${Math.round(est*.75/2.5)*2.5} · 80%: ${Math.round(est*.80/2.5)*2.5}</div></div>
      </div></div>`;
      if(hist.length>0){
        html+=`<div class="rm-history" style="margin-bottom:10px"><div style="font-size:10px;letter-spacing:.06em;margin-bottom:4px">RETEST HISTORY</div>`;
        hist.forEach(h=>html+=`<div style="display:flex;justify-content:space-between;margin-bottom:2px"><span>${formatDateDisplay(h.date)}</span><span style="color:var(--text)">${h.estimated} kg</span></div>`);
        html+=`</div>`;
      }
      html+=`<button class="btn btn-sm" onclick="snapshotRM('${activeLift.id}')" style="margin-bottom:6px">Save as retest snapshot</button>`;
    }
    if(rm.weight||rm.reps)html+=`<button class="btn btn-ghost" onclick="clearRMOverride('${activeLift.id}')" style="font-size:11px">Clear override — use auto</button>`;
    html+=`</div>`;
  }
  document.getElementById('screen-strength').innerHTML=html;
}

function saveRM(id,field,val){if(!S.rm[id])S.rm[id]={};S.rm[id][field]=val;if(S.rm[id].weight&&S.rm[id].reps)S.rm[id].estimated=calcEpley(parseFloat(S.rm[id].weight),parseInt(S.rm[id].reps));saveState();}
function clearRMOverride(id){if(S.rm[id]){delete S.rm[id].weight;delete S.rm[id].reps;delete S.rm[id].estimated;}saveState();renderStrength();}
// snapshotRM is in strength.js (state layer)

