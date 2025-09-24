import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    // Capture all logs that might be relevant
    if (text.includes('🎯') || text.includes('handleStartFromIntro') || text.includes('NameBlame mode') || text.includes('gameMode') || text.includes('classic')) {
      console.log('FLOW:', text);
    }
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  console.log('=== STEP 1: Verify IntroScreen ===');
  await page.waitForSelector('text=BlameGame');
  console.log('✅ IntroScreen loaded');

  console.log('=== STEP 2: Enable NameBlame Mode ===');
  // Target the specific NameBlame toggle by id/label to avoid clicking the category toggle
  const nameBlameById = page.locator('#nameBlameModeToggle');
  const nameBlameByLabel = page.locator('[for="nameBlameModeToggle"]');

  if (await nameBlameById.count() > 0) {
    await nameBlameById.click();
  } else if (await nameBlameByLabel.count() > 0) {
    await nameBlameByLabel.click();
  } else {
    // As a last resort, pick the first switch with data-state not checked, but this is unreliable
    const fallback = page.getByRole('switch').first();
    await fallback.click();
  }

  // Verify switch is actually turned on using Radix data-state or aria-checked
  let isChecked = false;
  if (await nameBlameById.count() > 0) {
    const dataState = await nameBlameById.getAttribute('data-state');
    const ariaChecked = await nameBlameById.getAttribute('aria-checked');
    isChecked = dataState === 'checked' || ariaChecked === 'true';
  }
  console.log('✅ NameBlame toggle attempted; checked state detected =', isChecked);

  console.log('=== STEP 3: Click Start Game ===');
  const startBtn = await page.getByRole('button', { name: /start|spiel starten/i });
  await startBtn.click();
  await page.waitForTimeout(1000);

  const isOnPlayerSetup = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
  const isOnLoadingScreen = await page.locator('[class*="bg-gradient-to-br"]').count() > 0;

  console.log('After clicking Start: PlayerSetup visible:', isOnPlayerSetup, 'Loading screen:', isOnLoadingScreen);

  await browser.close();
})();