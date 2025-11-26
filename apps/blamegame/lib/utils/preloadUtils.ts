import { fetchAsset } from './fetchUtils';

/**
 * preloadCategoriesJson - Preloads the categories.json file
 * 
 * This can be called early in the application lifecycle to ensure
 * the categories.json file is in the browser cache
 * 
 * @returns Promise that resolves when preloading is complete
 */
export async function preloadCategoriesJson(): Promise<void> {
  try {
    console.log('Preloading categories.json...');
    await fetchAsset('questions/categories.json');
    console.log('categories.json preloaded successfully');
  } catch (error) {
    console.error('Failed to preload categories.json:', error);
    // Don't throw, just log - this is preloading
  }
}

/**
 * preloadEssentialAssets - Preloads multiple essential assets
 */
export async function preloadEssentialAssets(): Promise<void> {
  try {
    console.log('Preloading essential assets...');
    await Promise.allSettled([
      preloadCategoriesJson(),
      // Add other assets to preload here
    ]);
    console.log('Essential assets preloaded');
  } catch (error) {
    console.error('Error in preloadEssentialAssets:', error);
  }
}
