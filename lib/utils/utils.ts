import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Combines multiple class value inputs into a single string of class names,
 * merging Tailwind CSS classes intelligently to avoid duplicates and conflicts.
 *
 * @param inputs - An array of class values (strings, arrays, or objects) to be combined.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
