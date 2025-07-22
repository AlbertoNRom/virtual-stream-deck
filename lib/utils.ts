import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first letter of a string and removes the file extension
 * @param fileName - The file name to process
 * @returns The processed string with capitalized first letter and no extension
 */
export const capitalizeAndRemoveExtension = (fileName: string): string => {
  // Remove file extension by splitting at the last dot and taking the first part
  const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
  
  // If the string is empty after removing extension, return empty string
  if (nameWithoutExtension.length === 0) return '';
  
  // Capitalize the first letter and keep the rest of the string as is
  return nameWithoutExtension.charAt(0).toUpperCase() + nameWithoutExtension.slice(1);
}
