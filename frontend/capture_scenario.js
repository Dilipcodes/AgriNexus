import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : (fs.existsSync(CHROME_PATH) ? CHROME_PATH : null);

if (!executablePath) {
  console.error("Neither Edge nor Chrome executable found!");
  process.exit(1);
}

async function run() {
  console.log("Using browser at:", executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 880 });

  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait for app to mount
  await page.waitForSelector('body');
  await new Promise(r => setTimeout(r, 1000));

  // Let's navigate to Screen 7 by setting currentScreen or clicking navigation
  // In the bottom nav or by clicking through screens
  console.log("Navigating to Screen 7...");
  // Let's see if we can trigger handleNavigate or evaluate in window
  await page.evaluate(() => {
    // If React dev tools or state updater is accessible, or click navigation buttons
    // Let's look for buttons on screen
  });

  // Let's click "Start Analysis" or "Detect Field" to go through screens or directly navigate
  // Wait, let's see what is on Screen 1:
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Screen 1 text sample:", text.slice(0, 100));

  // Let's click forward or evaluate navigation
  // On Screen 1, there is a button to proceed
  const startBtn = await page.$('button');
  if (startBtn) {
    console.log("Clicking start button...");
    await startBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }

  // Take screenshot of home
  await page.screenshot({ path: path.join('test_screenshots', 'screen_nav_test.png') });
  console.log("Navigation test screenshot saved.");

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
