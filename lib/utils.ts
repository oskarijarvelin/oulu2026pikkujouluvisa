import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const backgroundColors: { [key: string]: string } = {
  HTML: "#FFF1E9",
  CSS: "#E0FDEF",
  JavaScript: "#EBF0FF",
  Accessibility: "#F6E7FF",
};

/**
 * Get a Lucide icon component by name
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