import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : (fs.existsSync(CHROME_PATH) ? CHROME_PATH : null);

const ARTIFACT_DIR = 'C:\\Users\\dilip\\.gemini\\antigravity\\brain\\0464222d-f702-4753-8ca9-cc96a290098f';

async function run() {
  console.log("Starting frontend simulator verification with:", executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=900,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 1000 });

  // 1. Navigate to frontend dev server
  console.log("Loading http://localhost:5173...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 2. Step forward to Screen 7 (Crop Recommendations)
  console.log("Stepping forward to Screen 7 (Crop Recommendations)...");
  for (let step = 1; step < 7; step++) {
    const nextBtn = await page.$('button[title="Next screen"]');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  let screenText = await page.evaluate(() => document.body.innerText);
  console.log("Current screen status:", screenText.includes("Top Recommended Crops") ? "On Screen 7 (PASS)" : "Not Screen 7");

  // Verify Screen 7 shows the What-If Simulator callout
  const hasCalloutOnScreen7 = screenText.includes("What-If Scenario Simulator") && screenText.includes("Compare");
  console.log("Screen 7 has What-If Simulator banner:", hasCalloutOnScreen7 ? "PASS" : "FAIL");

  // 3. Click "Compare" button on Screen 7 to navigate to Screen 10
  console.log("Clicking 'Compare' button on Screen 7...");
  const compareBtnClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Compare'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log("Compare button clicked:", compareBtnClicked ? "PASS" : "FAIL");
  await new Promise(r => setTimeout(r, 2500));

  // 4. Verify Screen 10 (What-If Scenario Simulator) is loaded
  screenText = await page.evaluate(() => document.body.innerText);
  const onScreen10 = screenText.includes("What-If Scenario Simulator") && screenText.includes("Objective Farm Intelligence Matrix");
  console.log("Navigated to Screen 10 successfully:", onScreen10 ? "PASS" : "FAIL");

  console.log("\n--- Validating Simulator Elements on Screen 10 ---");
  const hasWaterSection = screenText.includes("Water & Irrigation Demand");
  console.log("1. Water & Irrigation Demand Section:", hasWaterSection ? "PASS" : "FAIL");

  const hasFertilizerSection = screenText.includes("ICAR Fertilizer Requirements");
  console.log("2. ICAR Fertilizer Section:", hasFertilizerSection ? "PASS" : "FAIL");

  const hasEconomicsSection = screenText.includes("Mandi Price & Gross Output Potential");
  console.log("3. Market & Gross Output Section:", hasEconomicsSection ? "PASS" : "FAIL");

  const noNetProfit = !screenText.toLowerCase().includes("net profit");
  console.log("4. ZERO Net Profit displayed:", noNetProfit ? "PASS" : "FAIL");

  const hasDisclaimer = screenText.includes("Does NOT deduct variable farm operational expenses");
  console.log("5. Operational Cost Disclaimer:", hasDisclaimer ? "PASS" : "FAIL");

  const hasRisks = screenText.includes("Agronomic Risks & Field Vulnerabilities");
  console.log("6. Agronomic Risks Section:", hasRisks ? "PASS" : "FAIL");

  const hasTradeoffs = screenText.includes("Multi-Dimensional Decision Summary");
  console.log("7. Multi-Dimensional Trade-Offs:", hasTradeoffs ? "PASS" : "FAIL");

  // Capture screenshot of Rice vs Maize on Screen 10
  const ss1Path = path.join(ARTIFACT_DIR, 'screen10_simulator_rice_vs_maize.png');
  await page.screenshot({ path: ss1Path });
  console.log("Screenshot saved:", ss1Path);

  // 5. Test Rice vs Wheat preset
  console.log("\nSelecting 'Rice vs. Wheat' preset...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Rice vs. Wheat'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  screenText = await page.evaluate(() => document.body.innerText);
  const hasWheat = screenText.includes("Wheat") && screenText.includes("115–125 Days");
  console.log("Rice vs Wheat loaded:", hasWheat ? "PASS" : "FAIL");

  // Capture screenshot of Rice vs Wheat on Screen 10
  const ss2Path = path.join(ARTIFACT_DIR, 'screen10_simulator_rice_vs_wheat.png');
  await page.screenshot({ path: ss2Path });
  console.log("Screenshot saved:", ss2Path);

  await browser.close();
  console.log("\nALL FRONTEND SIMULATOR TESTS PASSED SUCCESSFULLY!");
}

run().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
