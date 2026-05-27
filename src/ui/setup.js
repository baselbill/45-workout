// ─── 45-WORKOUT v2: setup ───
// First-run wizard: set start date and training days
// ─── SETUP ────────────────────────────────────────────────────────────────────
function initSetup(){
  document.getElementById('setup-date').value=todayStr();
  const dp=document.getElementById('day-picker');
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let selected=[1,3,5];
  dp.innerHTML='';
  [1,2,3,4,5,6,0].forEach(d=>{
    const b=document.createElement('button');
    b.className='btn btn-sm'+(selected.includes(d)?' btn-primary':'');
    b.textContent=dayNames[d];
    b.onclick=()=>{
      const i=selected.indexOf(d);
      if(i>-1){if(selected.length<=3)return;selected.splice(i,1);b.className='btn btn-sm';}
      else{if(selected.length>=3){const old=selected.shift();dp.querySelectorAll('button').forEach(x=>{if(parseInt(x.dataset.d)===old)x.className='btn btn-sm';});}selected.push(d);b.className='btn btn-sm btn-primary';}
      S.trainingDays=selected;
    };
    b.dataset.d=d;
    dp.appendChild(b);
  });
  S.trainingDays=selected;
  openModal('modal-setup');
}
function saveSetup(){const v=document.getElementById('setup-date').value;if(!v){alert('Please pick a start date');return;}S.startDate=v;S._sc=null;saveState();closeModal('modal-setup');renderToday();showToast('Program started! Week 1, Day 1 ready.');}

// toggleAwayMode is in today.js
