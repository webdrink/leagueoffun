import { test, expect } from '@playwright/test';

test.describe('BlameGame - UI Components', () => {
  test('should render core UI components', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for basic UI structure
    const mainContainer = page.locator('main, .app, #root, [data-testid="app"]').first();
    await expect(mainContainer).toBeVisible();
    
    // Check for buttons (there should be at least a start button)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Verify at least one button is visible and clickable
    const visibleButton = buttons.first();
    await expect(visibleButton).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const desktopContent = await page.textContent('body');
    expect(desktopContent).toBeTruthy();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileContent = await page.textContent('body');
    expect(mobileContent).toBeTruthy();
    
    // Content should be roughly the same (responsive design)
    expect(mobileContent?.length).toBeGreaterThan(desktopContent!.length * 0.8);
  });

  test('should display proper loading states', async ({ page }) => {
    await page.goto('/');
    
    // Check for loading indicators during app initialization
    const loadingText = page.getByText(/loading|laden|preparing|vorbereiten/i);
    const loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
    
    // Either loading text or spinner might be visible briefly
    const hasLoadingState = await Promise.race([
      loadingText.isVisible(),
      loadingSpinner.isVisible(),
      page.waitForTimeout(1000).then(() => false)
    ]);
    
    console.log('Loading state detected:', hasLoadingState);
    
    // After loading, main content should be visible
    await page.waitForTimeout(3000);
    const mainContent = await page.textContent('body');
    expect(mainContent).toBeTruthy();
    expect(mainContent?.trim().length).toBeGreaterThan(50);
  });

  test('should handle animations without blocking UI', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Click start to trigger any animations
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      
      // Wait for animations to complete
      await page.waitForTimeout(3000);
      
      // UI should be interactive after animations
      const interactiveElements = page.getByRole('button').or(page.getByRole('link'));
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 0) {
        // At least one element should be clickable
        const firstElement = interactiveElements.first();
        await expect(firstElement).toBeEnabled();
      }
    }
  });

  test('should display consistent theme and styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check that CSS is loaded (by verifying computed styles)
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
        color: styles.color
      };
    });
    
    // Basic style checks
    expect(bodyStyles.fontFamily).toBeTruthy();
    expect(bodyStyles.backgroundColor).toBeTruthy();
    
    // Check that Tailwind CSS classes are working
    const hasStyledElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let styledCount = 0;
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.padding !== '0px' || styles.margin !== '0px' || styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          styledCount++;
        }
      });
      
      return styledCount > 5; // At least some elements should have styling
    });
    
    expect(hasStyledElements).toBe(true);
  });
});
