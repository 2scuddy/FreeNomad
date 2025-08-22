"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CityGridProps {
  children: ReactNode;
  className?: string;
}

export function CityGrid({ children, className }: CityGridProps) {
  return (
    <div
      className={cn(
        // Base grid layout
        "grid gap-6",
        // Responsive columns: 1 on mobile, 2 on tablet, 3-4 on desktop
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
        // Responsive gap adjustments
        "gap-4 sm:gap-6",
        // Auto-fit for very large screens
        "2xl:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Grid container with proper spacing and alignment
interface CityGridContainerProps {
  children: ReactNode;
  className?: string;
}

export function CityGridContainer({
  children,
  className,
}: CityGridContainerProps) {
  return (
    <div
      className={cn(
        // Container spacing and alignment
        "w-full max-w-7xl mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "py-6 sm:py-8 lg:py-12",
        className
      )}
    >
      {children}
    </div>
  );
}

// Grid item wrapper for consistent spacing
interface CityGridItemProps {
  children: ReactNode;
  className?: string;
}

export function CityGridItem({ children, className }: CityGridItemProps) {
  return (
    <div
      className={cn(
        // Ensure consistent height and spacing
        "flex flex-col",
        "h-full",
        className
      )}
    >
      {children}
    </div>
  );
}
