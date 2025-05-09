/**
 * getAssetsPath - Utility function for creating proper asset paths that work in both development and production
 * 
 * This function prepends the Vite BASE_URL to asset paths, ensuring they work correctly
 * when deployed to GitHub Pages where the app is served from a subdirectory.
 * 
 * @param {string} path - The relative path to the asset (e.g., "questions/categories.json")
 * @returns {string} - The full path including the BASE_URL prefix when needed
 * 
 * @example
 * // Returns "/blamegame/questions/categories.json" in production
 * // Returns "/questions/categories.json" in local development
 * const categoriesUrl = getAssetsPath("questions/categories.json");
 */
export const getAssetsPath = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine with BASE_URL, which already includes trailing slash when needed
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};