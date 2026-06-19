/**
 * INDOT Solar Suitability – interaction driver
 *
 * Usage:
 *   node driver.mjs screenshot [phase1|phase2] [out.png]
 *   node driver.mjs smoke [phase1|phase2]
 *
 * Requires both backend and frontend services to already be running.
 * See SKILL.md for how to start them.
 *
 * Playwright is invoked through the global npx cache – no local install needed.
 * Browser binaries must be installed once:  npx playwright install chromium
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PW_CACHE = 'C:/Users/Scarecrow/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules';

// Resolve playwright from npx cache so no local dep is needed.
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = await import(`file:///${PW_CACHE}/playwright/index.mjs`));
} catch (e) {
  console.error('playwright not found in npx cache. Run: npx playwright install chromium');
  process.exit(1);
}

const [, , cmd = 'screenshot', target = 'phase1', outArg] = process.argv;

const CONFIGS = {
  phase1: {
    url: 'http://127.0.0.1:5173',
    apiBase: 'http://127.0.0.1:8000',
    healthPath: '/health',
    readySelector: '.leaflet-container',
    defaultOut: 'phase1_screenshot.png',
  },
  phase2: {
    url: 'http://127.0.0.1:5174',
    apiBase: 'http://127.0.0.1:8010',
    healthPath: '/health',
    readySelector: 'main',
    defaultOut: 'phase2_screenshot.png',
  },
};

const cfg = CONFIGS[target];
if (!cfg) {
  console.error(`Unknown target "${target}". Use "phase1" or "phase2".`);
  process.exit(1);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function smokePhase1() {
  const health = await fetchJSON(`${cfg.apiBase}/health`);
  console.log('health:', JSON.stringify(health));
  if (health.status !== 'ok') throw new Error('health check failed');

  const stats = await fetchJSON(`${cfg.apiBase}/api/stats`);
  console.log(`stats: ${stats.feature_count} features, ${stats.layer_count} layers`);

  const layer = await fetchJSON(`${cfg.apiBase}/api/layers/facility_scored`);
  console.log(`facility_scored: ${layer.features.length} features`);

  console.log('Phase 1 API smoke: PASS');
}

async function smokePhase2() {
  const health = await fetchJSON(`${cfg.apiBase}/health`);
  console.log('health:', JSON.stringify(health));
  if (health.status !== 'ok') throw new Error('health check failed');

  const autosave = await fetchJSON(`${cfg.apiBase}/api/autosave`);
  console.log('autosave:', JSON.stringify(autosave));

  console.log('Phase 2 API smoke: PASS');
}

async function screenshot() {
  const outPath = outArg ?? cfg.defaultOut;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log(`navigating to ${cfg.url} …`);
  await page.goto(cfg.url, { waitUntil: 'networkidle', timeout: 20000 });

  try {
    await page.waitForSelector(cfg.readySelector, { timeout: 8000 });
  } catch {
    console.warn(`selector "${cfg.readySelector}" not found – screenshotting anyway`);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`screenshot saved → ${outPath}`);
  await browser.close();
}

try {
  if (cmd === 'smoke') {
    if (target === 'phase1') await smokePhase1();
    else await smokePhase2();
  } else if (cmd === 'screenshot') {
    await screenshot();
  } else {
    console.error(`Unknown command "${cmd}". Use "screenshot" or "smoke".`);
    process.exit(1);
  }
} catch (err) {
  console.error('FAIL:', err.message);
  process.exit(1);
}
