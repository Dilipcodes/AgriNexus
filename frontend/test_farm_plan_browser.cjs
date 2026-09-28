const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\dilip\\.gemini\\antigravity\\brain\\0464222d-f702-4753-8ca9-cc96a290098f';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runBrowserTest() {
  console.log('Launching Edge for Farm Plan browser testing...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900 });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // 1. Jump to Screen 7 (Recommendations)
    console.log('Navigating to Screen 7...');
    await page.evaluate(() => {
      // Find quick switcher or button
      const buttons = Array.from(document.querySelectorAll('button'));
      const advBtn = buttons.find(b => b.textContent.includes('Advisory'));
      if (advBtn) advBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click Screen 7 pill or advance
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('button[title*="Jump to Screen"]'));
      if (pills[6]) pills[6].click(); // Screen 7 is index 6
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify Screen 7 has "Personalized Farm Plan" entry banner
    const hasFarmPlanBanner = await page.evaluate(() => {
      return document.body.innerText.includes('Personalized Farm Plan') &&
             document.body.innerText.includes('View Plan');
    });
    console.log('Screen 7 has Personalized Farm Plan banner:', hasFarmPlanBanner);
    if (!hasFarmPlanBanner) throw new Error('Missing Personalized Farm Plan entry banner in Screen 7');

    // 2. Click "View Plan" on Screen 7 -> Should navigate to Screen 11
    console.log('Clicking "View Plan" on Screen 7...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const viewPlanBtn = btns.find(b => b.textContent.includes('View Plan'));
      if (viewPlanBtn) viewPlanBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 3. Verify Screen 11 Content and all 9 data sections (A - I)
    console.log('Verifying Screen 11 sections (A through I)...');
    const sectionsStatus = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        screen11Header: text.includes('screen 11') && text.includes('personalized farm plan'),
        sectionA: text.includes('farm overview') && text.includes('parcel area'),
        sectionB: text.includes('recommended crop') && text.includes('suitability rationale'),
        sectionC: text.includes('soil action plan') && text.includes('soil reaction (ph)') && text.includes('macronutrients status'),
        sectionD: text.includes('fertilizer plan') && text.includes('urea') && text.includes('dap') && text.includes('mop'),
        sectionE: text.includes('crop protection') && text.includes('preliminary optical screening'),
        sectionF: text.includes('weather & seasonal risk') && text.includes('seasonal irrigation'),
        sectionG: text.includes('market plan & output value') && text.includes('bounded gross output value'),
        sectionH: text.includes('crop-cycle action timeline') && text.includes('stage 1:') && text.includes('stage 6:'),
        sectionI: text.includes('data reliability & provenance') && text.includes('verified') && text.includes('live') && text.includes('estimated'),
        sectionJ_action: text.includes('ask farmai about this plan')
      };
    });

    console.log('Sections Verification Results:', JSON.stringify(sectionsStatus, null, 2));
    for (const [k, v] of Object.entries(sectionsStatus)) {
      if (!v) throw new Error(`Verification failed for: ${k}`);
    }

    // Capture Screen 11 Screenshot
    const screen11Shot = path.join(ARTIFACT_DIR, 'screen11_farm_plan_overview.png');
    await page.screenshot({ path: screen11Shot });
    console.log('Saved screenshot:', screen11Shot);

    // 4. Test Crop Selector Switch in Screen 11 (Switch to Maize)
    console.log('Testing Crop Switcher to Maize on Screen 11...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const maizeTab = tabs.find(t => t.textContent.includes('Maize'));
      if (maizeTab) maizeTab.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const maizeVerified = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Maize') && text.includes('ICAR-IIMR');
    });
    console.log('Switched to Maize successfully:', maizeVerified);

    // 5. Test Screen 10 (Simulator) -> Screen 11 Navigation
    console.log('Testing Screen 10 -> Screen 11 Navigation...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const simBtn = buttons.find(b => b.textContent.includes('Simulator (10)'));
      if (simBtn) simBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const simHasFarmPlanBtn = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Formulate Farm Plan for');
    });
    console.log('Screen 10 has Formulate Farm Plan button:', simHasFarmPlanBtn);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const planBtn = btns.find(b => b.textContent.includes('Formulate Farm Plan for'));
      if (planBtn) planBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const backOnScreen11 = await page.evaluate(() => {
      return document.body.innerText.toLowerCase().includes('screen 11');
    });
    console.log('Returned to Screen 11 from Screen 10 button:', backOnScreen11);
    if (!backOnScreen11) throw new Error('Failed navigating from Screen 10 to Screen 11');

    // 6. Test Section J Action -> Navigate to Screen 9 (Copilot) with Plan Context
    console.log('Clicking "Ask FarmAI About This Plan (Screen 9)"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const copilotBtn = btns.find(b => b.textContent.includes('Ask FarmAI About This Plan'));
      if (copilotBtn) copilotBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const copilotContextVerified = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        onScreen9: text.includes('Ask FarmAI'),
        hasPlanContextBanner: text.includes('Plan Context:'),
        hasPlanChip: text.includes('Explain my farm plan summary')
      };
    });
    console.log('Screen 9 Copilot with Plan Context:', JSON.stringify(copilotContextVerified, null, 2));
    if (!copilotContextVerified.onScreen9 || !copilotContextVerified.hasPlanContextBanner) {
      throw new Error('Screen 9 Copilot did not receive farm plan context');
    }

    // Capture Copilot with Plan Context Screenshot
    const copilotShot = path.join(ARTIFACT_DIR, 'screen9_copilot_farm_plan_context.png');
    await page.screenshot({ path: copilotShot });
    console.log('Saved screenshot:', copilotShot);

    console.log('\nALL BROWSER AUTOMATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Browser test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserTest();
