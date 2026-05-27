// ─── 45-WORKOUT v2: toast ───
// Queued toast notification system.
// Only one toast shows at a time; subsequent calls enqueue and drain on completion.
// Fixes the E2-7 bug where rapid set logging caused toasts to remove each other.

const _toastQueue = [];
let _toastActive = false;

function showToast(msg, type = 'info', durationMs = 2850) {
  _toastQueue.push({msg, type, durationMs});
  if (!_toastActive) _drainToastQueue();
}

function _drainToastQueue() {
  if (!_toastQueue.length) { _toastActive = false; return; }
  _toastActive = true;
  const {msg, type, durationMs} = _toastQueue.shift();
  const container = document.getElementById('toast-container');
  if (!container) { _drainToastQueue(); return; }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  // Animate in
  requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('toast-visible'); }); });
  setTimeout(() => {
    t.classList.remove('toast-visible');
    setTimeout(() => {
      t.remove();
      _drainToastQueue();
    }, 300); // match CSS transition
  }, durationMs);
}
