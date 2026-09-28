const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots');

async function clickByText(page, selector, text) {
  const success = await page.evaluate((selector, text) => {
    const elements = Array.from(document.querySelectorAll(selector));
    const el = elements.find(e => e.textContent.includes(text));
    if (el) {
      el.click();
      return true;
    }
    return false;
  }, selector, text);

  if (!success) {
    throw new Error(`Element <${selector}> containing "${text}" not found.`);
  }
}

async function runTests() {
  console.log("===============================================================");
  console.log("   AGRINEXUS: VERIFYING 9 SCREENS + 2 NEW SPECIALIZED MODULES   ");
  console.log("===============================================================\n");

  const consoleErrors = [];
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`   ⚠️ Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log(`   ⚠️ Page Error: ${err.message}`);
  });

  try {
    // PART A: Verify Existing 9-Screen Flow
    console.log("--- PART A: Verifying Existing 9-Screen Farmer Flow ---");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.innerText.includes('Find the right crop'));
    console.log("   ✅ Screen 1: Home Page rendered.");

    await clickByText(page, 'button', 'Detect My Land');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Select Your Farm'));
    console.log("   ✅ Screen 2: Detect & Select Land rendered.");

    await clickByText(page, 'button', 'Analyze This Land');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Analyzing Your Land'));
    console.log("   ✅ Screen 3: Analyzing Screen rendered.");

    await clickByText(page, 'button', 'Report');
    await new Promise(r => setTimeout(r, 800));
    await page.waitForFunction(() => document.body.innerText.includes('Land Analysis Report'));
    console.log("   ✅ Screen 4: Land Analysis Report rendered.");

    await clickByText(page, 'button', 'View Full Analysis');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Local Cropping Pattern'));
    console.log("   ✅ Screen 5: Local Cropping Pattern rendered.");

    await clickByText(page, 'button', 'View Market & Mandi Prices');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Nearby Mandi Prices'));
    console.log("   ✅ Screen 6: Nearby Mandi Prices rendered.");

    await clickByText(page, 'button', 'See Recommended Crops');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Top Recommended Crops'));
    console.log("   ✅ Screen 7: Crop Recommendation rendered.");

    await clickByText(page, 'h4', 'Rice');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Rice - Detailed Information'));
    console.log("   ✅ Screen 8: Crop Details rendered.");

    await clickByText(page, 'button', 'Ask FarmAI Questions');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.includes('Ask FarmAI'));
    console.log("   ✅ Screen 9: Ask FarmAI Copilot rendered.");

    // PART B: Module 1 — Crop Disease Detection
    console.log("\n--- PART B: Testing Module 1 — Crop Disease Detection ---");
    // Switch to Disease AI
    await clickByText(page, 'button', 'Disease AI');
    await new Promise(r => setTimeout(r, 800));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('crop disease detection'));
    console.log("   ✅ Screen loaded: Crop Disease Detection.");

    // Verify sample presets
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('upload or choose leaf sample'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen_disease_initial.png') });

    // Click Analyze Disease button
    console.log("   Triggering 'Analyze Disease'...");
    await clickByText(page, 'button', 'Analyze Disease');

    // Wait for analysis to complete and results to render
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('diagnostic result'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('rice blast'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('match probability'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('observed symptoms'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('recommended immediate actions'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('agricultural advisory notice'));
    console.log("   ✅ Disease analysis results verified (Rice Blast, Match Probability, Symptoms, Actions, Disclaimer).");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen_disease_result.png') });

    // Test Scan Another Image
    await clickByText(page, 'button', 'Scan Another Image');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('upload or choose leaf sample'));
    console.log("   ✅ Scan Another Image reset verified.");

    // PART C: Module 2 — State Agriculture Dashboard
    console.log("\n--- PART C: Testing Module 2 — State Agriculture Dashboard ---");
    await clickByText(page, 'button', 'State Dashboard');
    await new Promise(r => setTimeout(r, 800));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('regional agriculture dashboard'));
    console.log("   ✅ Screen loaded: Regional Agriculture Dashboard.");

    // Verify Section 1: Overview Cards
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('regional agricultural overview'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('total crop area'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('total production'));
    console.log("   ✅ Section 1: Overview Cards verified.");

    // Verify Section 2: Crop Production & Yield
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('crop production & yield'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('40.0 qtl/ha'));
    console.log("   ✅ Section 2: Crop Production & Yield verified.");

    // Verify Section 3: Visual Distribution Chart
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('regional cultivated area share'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('rice: 43%'));
    console.log("   ✅ Section 3: Cultivated Area Share chart verified.");

    // Verify Section 4: Market Intelligence
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('market intelligence'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('gorakhpur main mandi'));
    console.log("   ✅ Section 4: Market Intelligence verified.");

    // Verify Section 5: AgriNexus Platform Telemetry (STRICT SEPARATION)
    console.log("   Verifying strict separation of AgriNexus App Intelligence...");
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('agrinexus platform telemetry'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('application-derived adoption data only'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('14,820 farmers'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('35,560 acres'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('platform boundary notice'));
    console.log("   ✅ Section 5: AgriNexus Platform Telemetry & Separation Notice verified.");

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen_state_dashboard.png') });

    // Switch back to Advisory Journey
    console.log("   Testing navigation back to Advisory Journey...");
    await clickByText(page, 'button', 'Advisory (1-9)');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('find the right crop'));
    console.log("   ✅ Successfully returned to Screen 1: Home Page.");

    console.log("\n===============================================================");
    console.log(`Summary: ALL TESTS PASSED! | Console Errors: ${consoleErrors.length}`);
    console.log("===============================================================");

  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
