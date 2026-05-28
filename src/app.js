// ─── 45-WORKOUT v2: app ───
// Application initialization and entry point.
// All modules are loaded above this file (see build.js for order).

// ─── ORIENTATION LOCK ────────────────────────────────────────────────────────
// Keep portrait during active lifting. Works on installed PWAs; silently
// no-ops on regular browser tabs where the API is unavailable or rejected.
(function(){
  function _lockPortrait(){
    if(screen.orientation&&screen.orientation.lock){
      screen.orientation.lock('portrait').catch(()=>{});
    }
  }
  _lockPortrait();
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible') _lockPortrait();
  });
})();

// ─── V1 DATA MIGRATION ───────────────────────────────────────────────────────
// Detect v1 localStorage data (stored under 'wkapp_v7') and prompt user.
// Both confirm and cancel paths clear v1 data — v1 schema is incompatible with v2.
(function checkV1Migration() {
  if (!S.startDate && checkMigration()) {
    showConfirm(
      'Start fresh?',
      'This is v2 of the app — rebuilt from scratch. Your previous data isn\'t compatible with the new format. Start fresh? (Your old data will be cleared.)',
      () => {
        localStorage.removeItem('wkapp_v7');
        S.startDate = null;
        saveState();
        initSetup();
      },
      () => {
        // User declined but data is still incompatible — clear v1 and show setup
        localStorage.removeItem('wkapp_v7');
        initSetup();
      }
    );
    return;
  }
  // Normal startup: setup wizard or today screen
  if (!S.startDate) {
    initSetup();
  } else {
    renderToday();
  }
})();
