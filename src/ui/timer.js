// ─── 45-WORKOUT v2: timer ───
// Rest timer (wall-clock based, background-safe) and session clock
// ─── TIMER — sticky floating bar, auto-starts on set tick ────────────────────
let timer={running:false,elapsed:0,target:0,iv:null,label:'',startTime:null};
let sessionStartTime=null;

function startTimer(secs,label){
  if(timer.iv)clearInterval(timer.iv);
  // Force fresh DOM build on next renderStickyTimer call
  const bar=document.getElementById('sticky-timer');
  if(bar)bar.innerHTML='';
  timer={running:true,elapsed:0,target:secs,iv:null,label:label||'',startTime:Date.now()};
  timer.iv=setInterval(()=>{
    if(timer.running&&timer.startTime){timer.elapsed=Math.floor((Date.now()-timer.startTime)/1000);}
    if(timer.elapsed>=timer.target){
      clearInterval(timer.iv);timer.running=false;
      try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.6);o.start();o.stop(a.currentTime+0.6);}catch(e){}
      setTimeout(()=>{if(!timer.running){timer.target=0;renderStickyTimer();}},2500);
    }
    renderStickyTimer();
  },1000);
  renderStickyTimer();
}

function stopTimer(){
  if(timer.iv)clearInterval(timer.iv);
  timer={running:false,elapsed:0,target:0,iv:null,label:'',startTime:null};
  renderStickyTimer();
}

function renderStickyTimer(){
  let bar=document.getElementById('sticky-timer');
  if(!bar){bar=document.createElement('div');bar.id='sticky-timer';bar.style.cssText='position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;z-index:150';document.body.appendChild(bar);}
  if(!timer.target){bar.innerHTML='';return;}
  const rem=Math.max(0,timer.target-timer.elapsed);
  const m=Math.floor(rem/60),s=rem%60;
  const pct=Math.min(100,Math.round(timer.elapsed/timer.target*100));
  const done=rem===0;
  const countTxt=done?'GO':m+':'+String(s).padStart(2,'0');
  // First render — build structure once; subsequent ticks only update the changing nodes
  if(!bar.querySelector('.rest-strip')){
    bar.innerHTML=`<div class="rest-strip${done?' done':''}">
      <div class="rest-strip-fill" style="width:${pct}%"></div>
      <div class="rest-strip-inner">
        <div class="rest-strip-icon" style="flex-shrink:0;font-size:20px;color:var(--accent)">⏱</div>
        <div style="flex:1;min-width:0">
          <div class="rest-strip-label" style="color:var(--accent)">REST</div>
          <div class="rest-strip-count">${countTxt}</div>
        </div>
        <div class="rest-strip-btns">
          <button onclick="addTimerTime(15)">+15s</button>
          <button onclick="stopTimer()">SKIP</button>
        </div>
      </div>
    </div>`;
    return;
  }
  // Subsequent ticks — patch only what changed
  bar.querySelector('.rest-strip-fill').style.width=pct+'%';
  bar.querySelector('.rest-strip-count').textContent=countTxt;
  if(done){
    const strip=bar.querySelector('.rest-strip');
    if(!strip.classList.contains('done')){
      strip.classList.add('done');
      bar.querySelector('.rest-strip-label').textContent='REST COMPLETE';
      bar.querySelector('.rest-strip-label').style.color='var(--success)';
      bar.querySelector('.rest-strip-count').style.color='var(--success)';
      bar.querySelector('.rest-strip-icon').innerHTML='✓';
      bar.querySelector('.rest-strip-icon').style.color='var(--success)';
      const btns=bar.querySelector('.rest-strip-btns');
      if(btns)btns.style.display='none';
    }
  }
}
function addTimerTime(d){if(timer.target>0)timer.target+=d;}

// ─── SCREEN WAKE LOCK ──────────────────────────────────────────────────────────
// Keeps screen on during active session. Released when session ends or
// browser auto-releases on tab hide; re-acquired on visibilitychange.
let _wakeLock=null;
async function acquireWakeLock(){
  if(!('wakeLock' in navigator)) return;
  try{
    _wakeLock=await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release',()=>{_wakeLock=null;});
  }catch(e){}
}
function releaseWakeLock(){
  if(_wakeLock){try{_wakeLock.release();}catch(e){}_wakeLock=null;}
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&sessionStartTime&&!_wakeLock) acquireWakeLock();
});

// ─── SESSION CLOCK ─────────────────────────────────────────────────────────────
function startSessionClock(){
  if(!sessionStartTime) sessionStartTime=Date.now();
  if(window._sessionClockIv) clearInterval(window._sessionClockIv);
  window._sessionClockIv=setInterval(renderSessionClock,5000);
  acquireWakeLock();
  renderSessionClock();
}
function renderSessionClock(){
  const el=document.getElementById('session-clock');
  if(!el) return;
  if(!sessionStartTime){
    el.innerHTML=`<button class="btn btn-sm" onclick="startSessionClock()" style="font-size:11px;padding:4px 10px">▶ Start session timer</button>`;
    return;
  }
  const elapsed=Math.floor((Date.now()-sessionStartTime)/1000);
  const m=Math.floor(elapsed/60),s=elapsed%60;
  const over45=elapsed>2700,near45=elapsed>2400;
  const col=over45?'var(--red)':near45?'var(--amber)':'var(--muted)';
  el.innerHTML=`<span style="font-family:var(--mono);font-size:12px;color:${col}">⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} / 45:00</span> <button onclick="resetSessionClock();renderSessionClock()" style="background:none;border:none;color:var(--muted);font-size:11px;cursor:pointer;padding:0 4px">reset</button>`;
}
function resetSessionClock(){
  sessionStartTime=null;
  if(window._sessionClockIv) clearInterval(window._sessionClockIv);
  releaseWakeLock();
}

