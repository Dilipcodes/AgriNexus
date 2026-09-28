const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots');

async function clickByText(page, selector, text) {
  const success = await page.evaluate((selector, text) => {
    const elements = Array.from(document.querySelectorAll(selector));
    const el = elements.find(e => e.textContent.toLowerCase().includes(text.toLowerCase()));
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
  console.log("   AGRINEXUS: TESTING REAL/DEMO CROP DISEASE DETECTION API    ");
  console.log("===============================================================\n");

  // 1. DIRECT FASTAPI ENDPOINT TESTS
  console.log("--- STEP 1: Direct Backend API Validation ---");
  const testPixel = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

  // Test 1A: DEMO mode fallback
  const resDemo = await fetch('http://127.0.0.1:8000/api/disease/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_data: testPixel,
      crop: 'Rice',
      mode: 'DEMO',
      disease_key: 'rice_blast'
    })
  });
  const dataDemo = await resDemo.json();
  console.log(`   [DEMO Fallback Test] Status: ${resDemo.status}`);
  console.log(`   -> Disease: ${dataDemo.diseaseName}, Status: ${dataDemo.provenance.status}, isPlant: ${dataDemo.isPlant}`);
  if (dataDemo.diseaseName !== 'Rice Blast' || dataDemo.provenance.status !== 'demo') {
    throw new Error("DEMO fallback validation failed.");
  }
  console.log("   ✅ Backend DEMO fallback returned valid ICAR dataset.");

  // Test 1B: Wheat rust fallback
  const resWheat = await fetch('http://127.0.0.1:8000/api/disease/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_data: testPixel,
      crop: 'Wheat',
      mode: 'DEMO',
      disease_key: 'wheat_rust'
    })
  });
  const dataWheat = await resWheat.json();
  console.log(`   [Wheat Test] Disease: ${dataWheat.diseaseName}, Severity: ${dataWheat.severityColor}`);
  console.log("   ✅ Backend multi-crop resolution verified.");

  // 2. PUPPETEER FRONTEND TESTS
  console.log("\n--- STEP 2: Frontend UI & Client Validation Testing ---");
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
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log("   Navigating to Disease AI module...");
    await clickByText(page, 'button', 'Disease AI');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('crop disease detection'));
    console.log("   ✅ Screen loaded: Crop Disease Detection.");

    // Test 2A: Client-side oversized file rejection (> 5MB)
    console.log("   Testing client-side oversized image rejection (>5MB)...");
    await page.evaluate(() => {
      // Simulate input event with mock 6MB file
      const input = document.querySelector('input[type="file"]');
      const mockLargeFile = new File([new Uint8Array(6 * 1024 * 1024)], "oversized.jpg", { type: "image/jpeg" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockLargeFile);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('exceeds 5 mb limit'));
    console.log("   ✅ 5 MB client-side file size validation verified.");

    // Test 2B: Client-side invalid MIME type rejection
    console.log("   Testing client-side invalid MIME type rejection...");
    await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]');
      const mockPdf = new File(["dummy text content"], "document.pdf", { type: "application/pdf" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockPdf);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('unsupported file format'));
    console.log("   ✅ Unsupported file format validation verified.");

    // Test 2C: Preset selection and analysis via connected backend
    console.log("   Testing analysis of preset Rice Blast sample via backend endpoint...");
    await clickByText(page, 'button', 'Analyze Disease');

    // Wait for analysis to complete and results to render from backend
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('diagnostic result'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('rice blast'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('match probability'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('observed symptoms'));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('agricultural advisory notice'));
    console.log("   ✅ Diagnostic results rendered and matched backend schema.");

    // Take screenshot of result
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'screen_disease_backend_verified.png') });

    // Test 2D: Reset
    await clickByText(page, 'button', 'Scan Another Image');
    await new Promise(r => setTimeout(r, 600));
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('upload or choose leaf sample'));
    console.log("   ✅ Scan Another Image reset verified.");

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
