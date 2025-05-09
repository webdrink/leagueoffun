/**
 * lib/index.ts
 * 
 * This file exports all utility functions from the lib directory
 * to make imports cleaner throughout the project.
 */

// Export everything from lib for easier imports

export * from './constants';
export * from './formatters';
export * from './utils';

// Export asset utilities
export * from './utils/assetUtils';

// Export question loaders
export * from './utils/questionLoaders';

// Export audio utilities
export * from './utils/audioUtils';

// Add other exports as needed
