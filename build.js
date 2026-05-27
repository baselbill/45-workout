#!/usr/bin/env node
// ─── BUILD SCRIPT ────────────────────────────────────────────────────────────
// Concatenates all src/*.js files (in dependency order) + styles.css,
// then inlines them into index.template.html → dist/index.html
//
// Usage:
//   node build.js          — single build
//   node build.js --watch  — watch src/ for changes and rebuild (Node >= 20)

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = __dirname;
const SRC      = path.join(ROOT, 'src');
const TEMPLATE = path.join(ROOT, 'index.template.html');
const OUT      = path.join(ROOT, 'dist', 'index.html');

// JS bundle order: dependency order must be respected
// (data first, then state, then ui, then app)
const JS_ORDER = [
  'data/program.js',
  'data/away-subs.js',
  'data/ex-ref.js',
  'state/store.js',
  'state/schedule.js',
  'state/session.js',
  'state/strength.js',
  'state/history.js',
  'state/mobility.js',
  'ui/modals.js',
  'ui/timer.js',
  'ui/toast.js',
  'ui/setup.js',
  'ui/nav.js',
  'ui/today.js',
  'ui/calendar.js',
  'ui/strength-screen.js',
  'ui/progress.js',
  'ui/mobility-screen.js',
  'app.js',
];

function build() {
  const startMs = Date.now();

  // Read template
  if (!fs.existsSync(TEMPLATE)) {
    console.error('ERROR: index.template.html not found');
    process.exit(1);
  }
  let html = fs.readFileSync(TEMPLATE, 'utf8');

  // Inline CSS
  const cssPath = path.join(SRC, 'styles.css');
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '/* styles.css not yet written */';
  html = html.replace('<!-- CSS -->', `<style>\n${css}\n</style>`);

  // Concatenate JS in dependency order
  const jsParts = [];
  for (const rel of JS_ORDER) {
    const filePath = path.join(SRC, rel);
    if (fs.existsSync(filePath)) {
      const src = fs.readFileSync(filePath, 'utf8');
      jsParts.push(`// ─── ${rel} ───\n${src}`);
    } else {
      jsParts.push(`// ─── ${rel} (not yet written) ───`);
    }
  }

  let js = jsParts.join('\n\n');

  // Escape </script> inside JS string literals to prevent HTML parser breakage
  // Replace literal </script> (case-insensitive) with <\/script>
  js = js.replace(/<\/script>/gi, '<\\/script>');

  html = html.replace('<!-- JS -->', `<script>\n${js}\n</script>`);

  // ── Structural sanity checks ──────────────────────────────────────────────
  // Catch common authoring mistakes before shipping a broken build.
  const checks = [
    { pattern: /:root\s*\{/,       label: ':root{ block (CSS custom properties)' },
    { pattern: /<style>/,           label: '<style> tag (CSS inlined)' },
    { pattern: /<\/style>/,         label: '</style> closing tag' },
    { pattern: /<script>/,          label: '<script> tag (JS inlined)' },
    { pattern: /<\/script>/,        label: '</script> closing tag' },
    { pattern: /id="screen-today"/, label: '#screen-today element' },
    { pattern: /id="nav"/,          label: '#nav element' },
  ];
  const failed = checks.filter(c => !c.pattern.test(html));
  if (failed.length) {
    console.error('BUILD FAILED — structural checks did not pass:');
    failed.forEach(c => console.error(`  ✗ Missing: ${c.label}`));
    process.exit(1);
  }

  // Ensure dist/ exists
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');

  const sizeKB = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`✓ Built dist/index.html  ${sizeKB} KB  (${Date.now() - startMs}ms)`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
build();

if (process.argv.includes('--watch')) {
  console.log('Watching src/ for changes… (Ctrl+C to stop)');
  // Node >= 20 supports recursive:true on Linux
  fs.watch(SRC, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`  ${eventType}: ${filename}`);
      try {
        build();
      } catch (e) {
        console.error('Build error:', e.message);
      }
    }
  });
  // Also watch the template
  fs.watch(TEMPLATE, () => {
    console.log('  template changed');
    try { build(); } catch (e) { console.error('Build error:', e.message); }
  });
}
