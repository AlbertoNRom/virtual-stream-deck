import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values into a single string, merging Tailwind CSS classes
 * @param inputs - The class values to combine
 * @returns The merged class string
 */
export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

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

/**
 * Truncates a string to a specified length, adding ellipsis if truncated
 * @param name - The string to truncate
 * @param maxLength - The maximum length of the string (default: 20)
 * @returns The truncated string with ellipsis if needed
 */
export const truncateName = (name: string, maxLength = 20) => {
	if (name.length <= maxLength) return name;
	return `${name.substring(0, maxLength)}...`;
};

export const getAudioFormatFromUrl = (url: string): string | undefined => {
  const clean = url.split('?')[0].split('#')[0];
  const ext = clean.split('.').pop()?.toLowerCase();
  if (!ext) return undefined;
  if (ext === 'm4a') return 'aac';
  return ext;
};
