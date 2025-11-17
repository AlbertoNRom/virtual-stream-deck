import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes the file extension from a filename
 * @param fileName - The file name to process
 * @returns The filename without extension
 */
export const removeExtension = (fileName: string): string => {
  // Remove file extension by splitting at the last dot and taking the first part
  return fileName.split('.').slice(0, -1).join('.') || fileName;
};

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with first letter capitalized
 */
export const capitalizeFirst = (str: string): string => {
  if (str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes the first letter of a string and removes the file extension
 * @param fileName - The file name to process
 * @returns The processed string with capitalized first letter and no extension
 */
export const capitalizeAndRemoveExtension = (fileName: string): string => {
  const nameWithoutExtension = removeExtension(fileName);
  return capitalizeFirst(nameWithoutExtension);
};

  // Function to truncate long sound names
export const truncateName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };
