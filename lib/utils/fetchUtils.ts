import { getAssetsPath } from './assetUtils';

/**
 * fetchWithRetry - Attempts to fetch a resource with multiple retries
 * 
 * @param url - The URL to fetch
 * @param retries - Number of retries (default: 3)
 * @param delay - Delay between retries in ms (default: 500)
 * @returns Promise resolving to the Response object
 */
export async function fetchWithRetry(url: string, retries = 3, delay = 500): Promise<Response> {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt + 1} for ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}:`, error);
      lastError = error;
      
      // Wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to load ${url} after ${retries} attempts: ${lastError}`);
}

/**
 * fetchAsset - Fetches an asset using getAssetsPath and fetchWithRetry
 * 
 * @param relativePath - Path relative to the public directory
 * @param retries - Number of retries
 * @param delay - Delay between retries in ms
 * @returns Promise resolving to the Response object
 */
export async function fetchAsset(relativePath: string, retries = 3, delay = 500): Promise<Response> {
  const url = getAssetsPath(relativePath);
  console.log(`Fetching asset from: ${url}`);
  return fetchWithRetry(url, retries, delay);
}
