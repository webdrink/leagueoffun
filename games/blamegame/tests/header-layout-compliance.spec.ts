/**
 * Layout-specific tests for header/footer balance and PWA compliance
 * 
 * These tests focus specifically on:
 * - Header and footer height balance
 * - PWA design compliance  
 * - Layout consistency across screens
 * - Content area optimization
 */
import { test, expect } from '@playwright/test';

// PWA-recommended dimensions for headers and footers
const PWA_MIN_HEADER_HEIGHT = 56; // pixels
const PWA_MAX_HEADER_HEIGHT = 72; // pixels
const PWA_MIN_TOUCH_TARGET = 44; // pixels

test.describe('PWA Layout Compliance Tests', () => {
  
  test('Desktop header maintains PWA height standards', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header, [data-testid="game-header"]');
    if (await header.count() > 0) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        expect(headerBox.height, 'Desktop header should meet PWA minimum height').toBeGreaterThanOrEqual(PWA_MIN_HEADER_HEIGHT);
        expect(headerBox.height, 'Desktop header should not exceed PWA maximum height significantly').toBeLessThanOrEqual(PWA_MAX_HEADER_HEIGHT * 1.5); // Allow some flexibility
      }
    }
  });
  
  test('Mobile header maintains PWA height standards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header, [data-testid="game-header"]');
    if (await header.count() > 0) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        expect(headerBox.height, 'Mobile header should meet PWA minimum height').toBeGreaterThanOrEqual(PWA_MIN_HEADER_HEIGHT);
        expect(headerBox.height, 'Mobile header should be proportionate to viewport').toBeLessThanOrEqual(667 * 0.15); // Max 15% of viewport height
      }
    }
  });
  
  test('Header and footer visual balance', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header, [data-testid="game-header"]');
      const footer = page.locator('footer, [data-testid="game-footer"]');
      
      if (await header.count() > 0 && await footer.count() > 0) {
        const headerBox = await header.boundingBox();
        const footerBox = await footer.boundingBox();
        
        if (headerBox && footerBox) {
          // Header should be same height or slightly larger than footer
          const ratio = headerBox.height / footerBox.height;
          expect(ratio, `${viewport.name}: Header should be balanced with footer (0.8x to 1.5x)`).toBeGreaterThanOrEqual(0.8);
          expect(ratio, `${viewport.name}: Header should not be excessively larger than footer`).toBeLessThanOrEqual(1.5);
        }
      }
    }
  });
  
  test('Content area gets adequate space', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header, [data-testid="game-header"]');
    const footer = page.locator('footer, [data-testid="game-footer"]');
    const main = page.locator('main, [role="main"]');
    
    let headerHeight = 0;
    let footerHeight = 0;
    let mainHeight = 0;
    
    if (await header.count() > 0) {
      const box = await header.boundingBox();
      headerHeight = box?.height || 0;
    }
    
    if (await footer.count() > 0) {
      const box = await footer.boundingBox();
      footerHeight = box?.height || 0;
    }
    
    if (await main.count() > 0) {
      const box = await main.boundingBox();
      mainHeight = box?.height || 0;
    }
    
    const availableSpace = 667; // viewport height
    
    // Main content should get at least 60% of available space
    expect(mainHeight, 'Main content area should get adequate vertical space').toBeGreaterThanOrEqual(availableSpace * 0.6);
    
    // Header and footer together should not take more than 30% of screen
    expect(headerHeight + footerHeight, 'Header and footer together should not dominate screen space').toBeLessThanOrEqual(availableSpace * 0.3);
  });
});

test.describe('Cross-Device Layout Consistency', () => {
  
  test('Text scales appropriately across device sizes', async ({ page }) => {
    const devices = [
      { width: 375, height: 667, name: 'iPhone SE', expectedMinSize: 16 },
      { width: 390, height: 844, name: 'iPhone 12', expectedMinSize: 18 },
      { width: 768, height: 1024, name: 'iPad', expectedMinSize: 24 },
      { width: 1920, height: 1080, name: 'Desktop', expectedMinSize: 32 }
    ];
    
    for (const device of devices) {
      await page.setViewportSize(device);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const title = page.locator('h1');
      if (await title.count() > 0) {
        const fontSize = await title.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize);
        });
        
        expect(fontSize, `${device.name}: Title font size should be appropriate for device`).toBeGreaterThanOrEqual(device.expectedMinSize);
      }
    }
  });
  
  test('Layout maintains proportions across orientations', async ({ page }) => {
    const baseViewport = { width: 768, height: 1024 };
    const rotatedViewport = { width: 1024, height: 768 };
    
    // Test portrait
    await page.setViewportSize(baseViewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const portraitHeader = await page.locator('header, [data-testid="game-header"]').boundingBox();
    const portraitMain = await page.locator('main, [role="main"]').boundingBox();
    
    // Test landscape
    await page.setViewportSize(rotatedViewport);
    await page.waitForTimeout(200); // Allow for responsive adjustments
    
    const landscapeHeader = await page.locator('header, [data-testid="game-header"]').boundingBox();
    const landscapeMain = await page.locator('main, [role="main"]').boundingBox();
    
    if (portraitHeader && landscapeHeader && portraitMain && landscapeMain) {
      // Header should take proportionally less space in landscape
      const portraitHeaderRatio = portraitHeader.height / baseViewport.height;
      const landscapeHeaderRatio = landscapeHeader.height / rotatedViewport.height;
      
      expect(landscapeHeaderRatio, 'Header should take less proportional space in landscape').toBeLessThanOrEqual(portraitHeaderRatio);
      
      // Main content should get more proportional space in landscape
      const portraitMainRatio = portraitMain.height / baseViewport.height;
      const landscapeMainRatio = landscapeMain.height / rotatedViewport.height;
      
      expect(landscapeMainRatio, 'Main content should get more proportional space in landscape').toBeGreaterThanOrEqual(portraitMainRatio * 0.9);
    }
  });
});

test.describe('Accessibility and Usability', () => {
  
  test('Clickable elements meet touch target requirements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check clickable title
    const clickableTitle = page.locator('h1[class*="cursor-pointer"]');
    if (await clickableTitle.count() > 0) {
      const box = await clickableTitle.boundingBox();
      if (box) {
        expect(box.height, 'Clickable title should meet minimum touch target height').toBeGreaterThanOrEqual(PWA_MIN_TOUCH_TARGET);
        // Width can be flexible for text, but should be reasonable
        expect(box.width, 'Clickable title should have reasonable touch area width').toBeGreaterThanOrEqual(100);
      }
    }
    
    // Check any header buttons
    const headerButtons = page.locator('header button, [data-testid="game-header"] button');
    const buttonCount = await headerButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = headerButtons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height, `Header button ${i + 1} should meet minimum touch target height`).toBeGreaterThanOrEqual(PWA_MIN_TOUCH_TARGET);
        expect(box.width, `Header button ${i + 1} should meet minimum touch target width`).toBeGreaterThanOrEqual(PWA_MIN_TOUCH_TARGET);
      }
    }
  });
  
  test('Text remains readable at all zoom levels', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test different zoom levels
    const zoomLevels = [0.75, 1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel.toString();
      }, zoom);
      
      await page.waitForTimeout(100);
      
      const title = page.locator('h1');
      if (await title.count() > 0) {
        const isVisible = await title.isVisible();
        expect(isVisible, `Title should remain visible at ${zoom}x zoom`).toBe(true);
        
        // Check that text doesn't overflow at this zoom level
        const titleBox = await title.boundingBox();
        const containerBox = await title.locator('..').boundingBox();
        
        if (titleBox && containerBox) {
          expect(titleBox.width, `Title should not overflow container at ${zoom}x zoom`).toBeLessThanOrEqual(containerBox.width + 10);
        }
      }
    }
  });
  
  test('High contrast mode compatibility', async ({ page }) => {
    // Simulate high contrast mode
    await page.addInitScript(() => {
      // Add high contrast media query simulation
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          * {
            filter: contrast(150%) !important;
          }
        }
      `;
      document.head.appendChild(style);
    });
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const title = page.locator('h1');
    if (await title.count() > 0) {
      const isVisible = await title.isVisible();
      expect(isVisible, 'Title should remain visible in high contrast mode').toBe(true);
      
      // Check color contrast (basic check)
      const computedStyle = await title.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          opacity: parseFloat(style.opacity)
        };
      });
      
      expect(computedStyle.opacity, 'Title should maintain good opacity in high contrast mode').toBeGreaterThan(0.8);
    }
  });
});