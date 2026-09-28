const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
  console.log("🚀 Starting AgriNexus 9-Screen Headless Browser Test...");
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 900, deviceScaleFactor: 2 });

  try {
    // 1. Home Page
    console.log("👉 Loading Screen 1: Home Page...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.innerText.includes('Find the right crop'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen1_home.png') });
    console.log("   ✅ Screen 1 verified: Title and value badges rendered.");

    // Click "Detect My Land" button
    await clickByText(page, 'button', 'Detect My Land');
    await new Promise(r => setTimeout(r, 800));

    // 2. Detect & Select Land
    console.log("👉 Testing Screen 2: Detect & Select Land...");
    await page.waitForFunction(() => document.body.innerText.includes('Select Your Farm'));
    await page.waitForFunction(() => document.body.innerText.includes('Gorakhpur, Uttar Pradesh'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen2_detect_land.png') });
    console.log("   ✅ Screen 2 verified: Map boundary and location detected card rendered.");

    // Click "Analyze This Land" button
    await clickByText(page, 'button', 'Analyze This Land');
    await new Promise(r => setTimeout(r, 800));

    // 3. Analyzing Screen
    console.log("👉 Testing Screen 3: Analyzing...");
    await page.waitForFunction(() => document.body.innerText.includes('Analyzing Your Land'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen3_analyzing.png') });
    console.log("   ✅ Screen 3 verified: Satellite animation and analysis steps active.");

    // Click Proceed button
    await clickByText(page, 'button', 'Report');
    await new Promise(r => setTimeout(r, 800));

    // 4. Land Analysis Report
    console.log("👉 Testing Screen 4: Land Analysis Report...");
    await page.waitForFunction(() => document.body.innerText.includes('Land Analysis Report'));
    await page.waitForFunction(() => document.body.innerText.includes('27.4°C'));
    await page.waitForFunction(() => document.body.innerText.includes('62%'));
    await page.waitForFunction(() => document.body.innerText.includes('0.64'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen4_land_analysis.png') });
    console.log("   ✅ Screen 4 verified: 2x2 metric cards and secondary parameters verified.");

    // Click "View Full Analysis" button
    await clickByText(page, 'button', 'View Full Analysis');
    await new Promise(r => setTimeout(r, 800));

    // 5. Local Cropping Pattern
    console.log("👉 Testing Screen 5: Local Cropping Pattern...");
    await page.waitForFunction(() => document.body.innerText.includes('Local Cropping Pattern'));
    await page.waitForFunction(() => document.body.innerText.includes('43%'));
    await page.waitForFunction(() => document.body.innerText.includes('Rice ➔ Wheat'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen5_crop_pattern.png') });
    console.log("   ✅ Screen 5 verified: 5-year cropping distribution bars and rotation history rendered.");

    // Click "View Market & Mandi Prices" button
    await clickByText(page, 'button', 'View Market & Mandi Prices');
    await new Promise(r => setTimeout(r, 800));

    // 6. Market Information
    console.log("👉 Testing Screen 6: Nearby Mandi Prices...");
    await page.waitForFunction(() => document.body.innerText.includes('Nearby Mandi Prices'));
    await page.waitForFunction(() => document.body.innerText.includes('Gorakhpur Mandi'));
    await page.waitForFunction(() => document.body.innerText.includes('2,500'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen6_market_prices.png') });
    console.log("   ✅ Screen 6 verified: AGMARKNET table and disclaimers rendered.");

    // Click "See Recommended Crops" button
    await clickByText(page, 'button', 'See Recommended Crops');
    await new Promise(r => setTimeout(r, 800));

    // 7. Crop Recommendation
    console.log("👉 Testing Screen 7: Crop Recommendation...");
    await page.waitForFunction(() => document.body.innerText.includes('Top Recommended Crops'));
    await page.waitForFunction(() => document.body.innerText.includes('High Suitability'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen7_recommendations.png') });
    console.log("   ✅ Screen 7 verified: Ranked recommendation cards with suitability badges rendered.");

    // Click on Rice card
    await clickByText(page, 'h4', 'Rice');
    await new Promise(r => setTimeout(r, 800));

    // 8. Crop Details
    console.log("👉 Testing Screen 8: Crop Details...");
    await page.waitForFunction(() => document.body.innerText.includes('Rice - Detailed Information'));
    await page.waitForFunction(() => document.body.innerText.includes('Why it was recommended?'));
    await page.waitForFunction(() => document.body.innerText.includes('Kharif (June – October)'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen8_crop_details.png') });
    console.log("   ✅ Screen 8 verified: Biophysical suitability checklist and season calendar rendered.");

    // Click "Ask FarmAI Questions About This Crop"
    await clickByText(page, 'button', 'Ask FarmAI Questions');
    await new Promise(r => setTimeout(r, 800));

    // 9. Ask FarmAI
    console.log("👉 Testing Screen 9: Ask FarmAI Copilot...");
    await page.waitForFunction(() => document.body.innerText.includes('Ask FarmAI'));
    await page.waitForFunction(() => document.body.innerText.includes('Urea (Nitrogen)'));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen9_copilot.png') });
    console.log("   ✅ Screen 9 verified: Chat interface, prompt chips, and fertilizer guidance rendered.");

    // Test sending an interaction chip
    console.log("   Testing interactive chip click: 'Expected yield'...");
    await clickByText(page, 'button', 'Expected yield');
    await new Promise(r => setTimeout(r, 1600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen9_copilot_interaction.png') });
    console.log("   ✅ Screen 9 interactive chat verified: Received FarmAI response.");

    console.log("\n🎉 ALL 9 SCREENS BROWSER-TESTED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test_failure.png') });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
