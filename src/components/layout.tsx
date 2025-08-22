"use client";

import { ReactNode } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export function Layout({
  children,
  className,
  showNavigation = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {showNavigation && <Navigation />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
