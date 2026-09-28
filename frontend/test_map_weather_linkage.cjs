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

async function runMapWeatherTest() {
  console.log("===============================================================");
  console.log("  TEST: Screen 2 Map Coordinates -> Live Weather & Geocoding   ");
  console.log("===============================================================\n");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=450,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  try {
    // 1. Load app on Screen 1
    console.log("1. Loading Home Screen...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.innerText.includes('Find the right crop'));

    // Switch to REAL mode
    console.log("2. Switching to REAL Mode...");
    await clickByText(page, 'button', 'DEMO');
    await new Promise(r => setTimeout(r, 600));

    // Verify mode is now REAL
    const isReal = await page.evaluate(() => document.body.innerText.includes('REAL'));
    console.log(`   Mode is REAL: ${isReal ? '✅' : '❌'}`);

    // Navigate to Screen 2
    console.log("3. Navigating to Screen 2 (Detect & Select Land)...");
    await clickByText(page, 'button', 'Detect My Land');
    await new Promise(r => setTimeout(r, 800));
    await page.waitForFunction(() => document.body.innerText.includes('Select Your Farm'));

    // 4. Select new location (Lucknow coordinates: 26.8467, 80.9462)
    console.log("4. Selecting new location 'Lucknow' via search input...");
    const searchInput = await page.$('input[placeholder*="Search location"]');
    await searchInput.type('lucknow');
    await searchInput.press('Enter');

    // Wait for geocoding service call to resolve and state to update
    await new Promise(r => setTimeout(r, 1800));

    // Verify Screen 2 details
    const screen2Text = await page.evaluate(() => document.body.innerText);
    const hasLucknow = screen2Text.includes('Lucknow');
    const hasLucknowCoords = screen2Text.includes('26.8467') && screen2Text.includes('80.9462');
    console.log(`   Location updated to Lucknow: ${hasLucknow ? '✅' : '❌'}`);
    console.log(`   Coordinates updated to 26.8467, 80.9462: ${hasLucknowCoords ? '✅' : '❌'}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen2_lucknow_selected.png') });

    // 5. Proceed to Analyze This Land -> Screen 3 -> Screen 4
    console.log("5. Clicking 'Analyze This Land'...");
    await clickByText(page, 'button', 'Analyze This Land');
    await new Promise(r => setTimeout(r, 800));

    // Screen 3 Analyzing
    await page.waitForFunction(() => document.body.innerText.includes('Analyzing Your Land'));
    console.log("   ✅ Screen 3: Analyzing screen reached.");

    // Proceed to Screen 4
    await clickByText(page, 'button', 'Report');
    await new Promise(r => setTimeout(r, 1500));

    // 6. Verify Screen 4 Land Analysis Report consistency
    console.log("6. Verifying Screen 4 Land Analysis Report consistency...");
    await page.waitForFunction(() => document.body.innerText.includes('Land Analysis Report'));
    
    const screen4Text = await page.evaluate(() => document.body.innerText);
    const hasReportLucknow = screen4Text.includes('Lucknow');
    console.log(`   Screen 4 displays selected location (Lucknow): ${hasReportLucknow ? '✅' : '❌'}`);

    // Verify temperature and Live provenance badge
    const hasLiveBadge = screen4Text.includes('Live');
    console.log(`   Screen 4 displays [Live] provenance for real weather: ${hasLiveBadge ? '✅' : '❌'}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen4_lucknow_analysis.png') });

    if (hasLucknow && hasLucknowCoords && hasReportLucknow && hasLiveBadge) {
      console.log("\n🎉 TEST PASSED: Interactive Map Coordinates -> Live Weather & Geocoding Linkage verified!");
    } else {
      throw new Error("One or more consistency checks failed.");
    }
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runMapWeatherTest();
