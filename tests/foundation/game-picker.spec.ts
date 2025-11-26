import { test, expect } from '@playwright/test';

test.describe('Game Picker', () => {
  test.use({ baseURL: 'http://localhost:999' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
  });

  test('should display the game picker title', async ({ page }) => {
    // Wait for body to be visible to ensure page loaded
    await page.locator('body').waitFor();
    
    // Check if we are on the right page
    const title = await page.title();
    console.log('Title in test:', title);
    
    // The title is "League of Fun" in h1
    const mainTitle = page.getByRole('heading', { name: 'League of Fun', level: 1 });
    await expect(mainTitle).toBeVisible();
  });

  test('should display BlameGame card', async ({ page }) => {
    // Find game card by looking for heading with game name (h2)
    const card = page.getByRole('heading', { name: 'BlameGame', level: 2 });
    await expect(card).toBeVisible();
    // Check for description text within the card
    await expect(page.getByText('The ultimate party game!')).toBeVisible();
  });

  test('should display HookHunt card', async ({ page }) => {
    const card = page.getByRole('heading', { name: 'HookHunt', level: 2 });
    await expect(card).toBeVisible();
    await expect(page.getByText('Test your music knowledge!')).toBeVisible();
  });

  test('should navigate to BlameGame when Play Now is clicked', async ({ page }) => {
    // Find the BlameGame card by locating heading
    const blameGameHeading = page.getByRole('heading', { name: 'BlameGame', level: 2 });
    await expect(blameGameHeading).toBeVisible();
    
    // Find the Play Now button - there are two, one per game
    // Use the first one since BlameGame comes first in the grid
    const playButtons = page.getByRole('button', { name: 'Play Now' });
    const blameGamePlayButton = playButtons.first();
    
    await blameGamePlayButton.click();
    
    // In local development, should navigate to BlameGame on port 9991
    await page.waitForURL(/localhost:9991/);
    expect(page.url()).toContain('playerId=');
  });

  // Note: This test requires HookHunt to be running on port 9992
  // Run `npm run dev:hookhunt` in a separate terminal before running this test
  test.skip('should navigate to HookHunt when Play Now is clicked', async ({ page }) => {
    const hookHuntHeading = page.getByRole('heading', { name: 'HookHunt', level: 2 });
    await expect(hookHuntHeading).toBeVisible();
    
    // Get all Play Now buttons and click the second one (index 1)
    const allPlayButtons = page.getByRole('button', { name: 'Play Now' });
    const buttonCount = await allPlayButtons.count();
    console.log('Total Play Now buttons:', buttonCount);
    
    // Click the second button (HookHunt)
    await allPlayButtons.nth(1).click();
    
    // Wait a bit and check current URL
    await page.waitForTimeout(1000);
    console.log('URL after click:', page.url());
    
    // In local development, should navigate to HookHunt on port 9992
    await page.waitForURL(/localhost:9992/, { timeout: 15000 });
    console.log('Final URL:', page.url());
    expect(page.url()).toContain('playerId=');
  });
});
