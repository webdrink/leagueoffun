/**
 * getAssetsPath - Utility function for creating proper asset paths that work in both development and production
 * 
 * This function prepends the Vite BASE_URL to asset paths, ensuring they work correctly
 * when deployed to GitHub Pages where the app is served from a subdirectory.
 * It also handles custom domains where the base URL is just '/'.
 * 
 * @param {string} path - The relative path to the asset (e.g., "questions/categories.json")
 * @returns {string} - The full path including the BASE_URL prefix when needed
 * 
 * @example
 * // Returns "/blamegame/questions/categories.json" in GitHub Pages deployment
 * // Returns "/questions/categories.json" in local development or custom domain
 * const categoriesUrl = getAssetsPath("questions/categories.json");
 */
export const getAssetsPath = (path: string): string => {
  // Get the base URL from Vite environment
  const base = import.meta.env.BASE_URL || '/';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Ensure base ends with a slash
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  
  // Combine and return the path
  return `${cleanBase}${cleanPath}`;
};