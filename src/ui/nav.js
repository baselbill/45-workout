// ─── 45-WORKOUT v2: nav ───
// Navigation: screen switching and scroll management
// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function showScreen(id,btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  window.scrollTo(0,0);
  if(id==='today')renderToday();
  if(id==='calendar')renderCalendar();
  if(id==='strength')renderStrength();
  if(id==='progress')renderProgress();
  if(id==='mobility'){mobRoutineView=-1;expandedMob=-1;renderMobility();}
}
function showScreenById(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((b,i)=>b.classList.toggle('active',['today','calendar','strength','progress','mobility'][i]===id));
  document.getElementById('screen-'+id).classList.add('active');
  window.scrollTo(0,0);
  if(id==='today')renderToday();
  if(id==='calendar')renderCalendar();
  if(id==='strength')renderStrength();
  if(id==='progress')renderProgress();
  if(id==='mobility'){mobRoutineView=-1;expandedMob=-1;renderMobility();}
}
