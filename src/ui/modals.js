// ─── 45-WORKOUT v2: modals ───
// Modal lifecycle manager with reference counter to prevent scroll unlock conflicts.
// The depth counter prevents the E2-1 bug: closing one overlay (ref panel or modal)
// while another is still open would incorrectly restore scroll.

let _modalDepth = 0;

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  if (++_modalDepth === 1) document.getElementById('main').style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  if (--_modalDepth <= 0) {
    _modalDepth = 0;
    document.getElementById('main').style.overflow = '';
  }
}

function closeAllModals() {
  _modalDepth = 0;
  document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
  document.getElementById('main').style.overflow = '';
}

// showConfirm(title, body, onOk, onCancel)
// Injects content into #modal-confirm and opens it.
// Both callbacks close the modal before executing.
function showConfirm(title, body, onOk, onCancel) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent = body;
  const okBtn = document.getElementById('confirm-ok');
  // Replace button to clear any previous listeners
  const fresh = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(fresh, okBtn);
  fresh.onclick = () => {
    closeModal('modal-confirm');
    if (onOk) onOk();
  };
  // Cancel button via modal-overlay onclick or the "Cancel" button
  const modal = document.getElementById('modal-confirm');
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal('modal-confirm');
      if (onCancel) onCancel();
    }
  };
  // Wire up Cancel button if present
  const cancelBtn = modal.querySelector('.btn-ghost');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeModal('modal-confirm');
      if (onCancel) onCancel();
    };
  }
  openModal('modal-confirm');
}

// Reference panel (exercise form guide — slides up from bottom)
function openRef(name) {
  const ref = EXREF[name];
  if (!ref) return;
  let html = `<div class="row" style="margin-bottom:16px">
    <div>
      <div class="ref-title">${name}</div>
      ${ref.sets ? `<div class="ref-detail">${ref.sets}</div>` : ''}
    </div>
    <button class="btn btn-sm btn-ghost" onclick="closeRef()">✕</button>
  </div>`;
  if (ref.steps) {
    html += `<div class="ref-section">How to do it</div><ol class="ref-steps">`;
    ref.steps.forEach(s => html += `<li><span>${s}</span></li>`);
    html += `</ol>`;
  }
  if (ref.cue) html += `<div class="ref-section">Key cue</div><div class="ref-cue">💡 ${ref.cue}</div>`;
  if (ref.mistake) html += `<div class="ref-section">Most common mistake</div><div class="ref-mistake">⚠ ${ref.mistake}</div>`;
  if (ref.search) {
    const q = encodeURIComponent(ref.search + ' tutorial');
    html += `<div class="ref-section">Watch a demo</div>
      <a href="https://www.youtube.com/results?search_query=${q}" class="ref-link" target="_blank">
        ▶ Search YouTube: "${ref.search}"
      </a>`;
  }
  html += `<button class="btn btn-ghost" onclick="closeRef()" style="margin-top:8px">Close</button>`;
  document.getElementById('ref-inner').innerHTML = html;
  document.getElementById('ref-panel').classList.add('open');
  if (++_modalDepth === 1) document.getElementById('main').style.overflow = 'hidden';
}

function closeRef() {
  document.getElementById('ref-panel').classList.remove('open');
  if (--_modalDepth <= 0) {
    _modalDepth = 0;
    document.getElementById('main').style.overflow = '';
  }
}
