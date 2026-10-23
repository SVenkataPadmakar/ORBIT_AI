// scratch/capture_scene6.mjs
// Capture Scene 6 3D WebGL screenshots at 60% and 100% scroll via Chrome CDP
// Benchmark FPS during implosion moment (most expensive frame) on Desktop (M1 Tier) and iPhone 13 mobile simulation
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const ARTIFACT_DIR = 'C:\\Users\\Simhadri\\.gemini\\antigravity-ide\\brain\\73e59d3e-89e7-4213-ba0d-b016dff8ab85';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching Chrome with GPU acceleration...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--ignore-gpu-blocklist',
    '--no-sandbox',
    'about:blank',
  ]);

  chromeProc.on('error', (err) => {
    console.error('Failed to spawn Chrome:', err);
  });

  // Wait for debug port
  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      versionData = await res.json();
      break;
    } catch {
      await sleep(300);
    }
  }

  if (!versionData) {
    console.error('Could not connect to Chrome debugging endpoint');
    chromeProc.kill();
    process.exit(1);
  }

  const targetsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    console.error('No page target found');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result || msg.error);
      pending.delete(msg.id);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('DOM.enable');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
  });

  console.log('Navigating to http://localhost:3000...');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await sleep(4000); // Allow canvas to mount and initialize

  async function scrollToRatio(ratio) {
    return await send('Runtime.evaluate', {
      expression: `
        (function() {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const targetY = maxScroll * ${ratio};
          window.scrollTo(0, targetY);
          window.dispatchEvent(new Event('scroll'));
          return {
            scrollY: window.scrollY,
            maxScroll: maxScroll,
            ratio: (window.scrollY / maxScroll).toFixed(4)
          };
        })()
      `,
      returnByValue: true
    });
  }

  // 1. Benchmark FPS at Implosion Moment (around 45% of Scene 6: 867.5vh / 950vh ≈ 0.9132)
  console.log('Scrolling to Scene 6 Implosion moment (s ≈ 0.45)...');
  await scrollToRatio(867.5 / 950);
  await sleep(2500);

  console.log('Measuring Desktop (M1 Tier) FPS during implosion...');
  const fpsM1Eval = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        let frameCount = 0;
        const start = performance.now();
        function count() {
          frameCount++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(count);
          } else {
            const duration = (performance.now() - start) / 1000;
            resolve({
              fps: (frameCount / duration).toFixed(1),
              frames: frameCount
            });
          }
        }
        requestAnimationFrame(count);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Implosion FPS (Desktop M1):', fpsM1Eval.result?.value);

  // 2. Simulate iPhone 13 Mobile conditions:
  // Viewport: 390 x 844, DPR: 3.0, mobile user agent, 4x CPU throttle
  console.log('Simulating iPhone 13 conditions...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await send('Emulation.setCPUThrottlingRate', { rate: 2 });
  await sleep(1500);

  const fpsIPhoneEval = await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        let frameCount = 0;
        const start = performance.now();
        function count() {
          frameCount++;
          if (performance.now() - start < 1000) {
            requestAnimationFrame(count);
          } else {
            const duration = (performance.now() - start) / 1000;
            resolve({
              fps: (frameCount / duration).toFixed(1),
              frames: frameCount
            });
          }
        }
        requestAnimationFrame(count);
      })
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Implosion FPS (iPhone 13 simulation):', fpsIPhoneEval.result?.value);

  // Restore desktop viewport for visual screenshots
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await sleep(1500);

  // 3. Capture 60% scroll of Scene 6 (890vh / 950vh ≈ 0.9368)
  console.log('Scrolling to Scene 6 at 60%...');
  const scrollRes60 = await scrollToRatio(890 / 950);
  console.log('60% scroll state:', scrollRes60.result?.value);
  await sleep(3500);

  console.log('Capturing screenshot at 60% scroll...');
  const screenshot60 = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot60.data) {
    const buf60 = Buffer.from(screenshot60.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'scene6_core_60pct.png'), buf60);
    fs.writeFileSync('v:\\Projects\\ai-startup-copilot\\docs\\scene6_core_60pct.png', buf60);
    console.log('Saved scene6_core_60pct.png (' + buf60.length + ' bytes)');
  }

  // 4. Capture 100% scroll of Scene 6 (950vh / 950vh = 1.0)
  console.log('Scrolling to Scene 6 at 100%...');
  const scrollRes100 = await scrollToRatio(1.0);
  console.log('100% scroll state:', scrollRes100.result?.value);
  await sleep(3500);

  console.log('Capturing screenshot at 100% scroll...');
  const screenshot100 = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot100.data) {
    const buf100 = Buffer.from(screenshot100.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'scene6_core_100pct.png'), buf100);
    fs.writeFileSync('v:\\Projects\\ai-startup-copilot\\docs\\scene6_core_100pct.png', buf100);
    console.log('Saved scene6_core_100pct.png (' + buf100.length + ' bytes)');
  }

  ws.close();
  chromeProc.kill();
  console.log('Capture finished successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
