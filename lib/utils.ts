import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react"

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and resolves conflicts using tailwind-merge
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Background color mapping for different quiz subjects
 * Used for theming quiz cards and UI elements
 */
export const backgroundColors: { [key: string]: string } = {
  HTML: "#FFF1E9",
  CSS: "#E0FDEF",
  JavaScript: "#EBF0FF",
  Accessibility: "#F6E7FF",
};

/**
 * Get a Lucide icon component by name
 * Dynamically retrieves icon components from the lucide-react library
 * @param iconName - The name of the Lucide icon
 * @returns The icon component or null if not found
 */
export function getLucideIcon(iconName: string): React.ComponentType<LucideIcons.LucideProps> | null {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName];
  if (IconComponent && typeof IconComponent === 'function') {
    return IconComponent as React.ComponentType<LucideIcons.LucideProps>;
  }
  return null;
}