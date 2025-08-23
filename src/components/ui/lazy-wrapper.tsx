"use client";

import { Suspense, lazy, ComponentType, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Generic lazy loading wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function WrappedComponent(props: any) {
    const { fallback: customFallback, className, ...componentProps } = props;

    const defaultFallback = (
      <div className={className}>
        <Skeleton className="h-full w-full" />
      </div>
    );

    return (
      <Suspense fallback={customFallback || fallback || defaultFallback}>
        <LazyComponent {...componentProps} />
      </Suspense>
    );
  };
}

// Lazy loading for heavy components
export const LazyFilterSidebar = createLazyComponent(
  () =>
    import("@/components/filter-sidebar").then(module => ({
      default: module.FilterSidebar,
    })),
  <div className="w-80 h-screen">
    <Skeleton className="h-full w-full" />
  </div>
);

export const LazyCityDetailPage = createLazyComponent(
  () =>
    import("@/components/city-detail-page").then(module => ({
      default: module.CityDetailPage,
    })),
  <div className="min-h-screen">
    <Skeleton className="h-64 w-full mb-8" />
    <div className="container mx-auto px-4">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const LazyUserProfile = createLazyComponent(
  () =>
    import("@/components/user-profile").then(module => ({
      default: module.UserProfile,
    })),
  <div className="min-h-screen">
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const LazyAdminDashboard = createLazyComponent(
  () =>
    import("@/components/admin-dashboard").then(module => ({
      default: module.AdminDashboard,
    })),
  <div className="min-h-screen">
    <div className="border-b">
      <div className="container mx-auto px-4 py-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  </div>
);

// Intersection Observer based lazy loading for sections
export function LazySection({
  children,
  fallback,
  className,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div ref={setRef} className={className}>
      {isVisible ? children : fallback || <Skeleton className="h-64 w-full" />}
    </div>
  );
}
