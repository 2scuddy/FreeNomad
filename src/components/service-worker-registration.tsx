"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    console.log("Registering service worker...");

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("Service Worker registered successfully:", registration);

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New content is available, show update notification
              console.log("New content is available; please refresh.");
              showUpdateNotification();
            } else {
              // Content is cached for offline use
              console.log("Content is cached for offline use.");
            }
          }
        });
      }
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

function showUpdateNotification() {
  // Create a simple update notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("FreeNomad Update Available", {
      body: "A new version of FreeNomad is available. Refresh to update.",
      icon: "/icon-192x192.png",
      tag: "app-update",
    });
  } else {
    // Fallback to console log or custom UI notification
    console.log("App update available - please refresh");
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }
  return Notification.permission;
}

// Performance monitoring for Core Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Monitor Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    // Log LCP for monitoring
    console.log("LCP:", lastEntry.startTime);

    // Send to analytics if available
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "web_vitals", {
        name: "LCP",
        value: Math.round(lastEntry.startTime),
        event_category: "Performance",
      });
    }
  });

  try {
    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (error) {
    console.warn("LCP monitoring not supported:", error);
  }

  // Monitor First Input Delay (FID)
  const fidObserver = new PerformanceObserver(list => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const fidValue = entry.processingStart - entry.startTime;
      console.log("FID:", fidValue);

      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "web_vitals", {
          name: "FID",
          value: Math.round(fidValue),
          event_category: "Performance",
        });
      }
    });
  });

  try {
    fidObserver.observe({ entryTypes: ["first-input"] });
  } catch (error) {
    console.warn("FID monitoring not supported:", error);
  }

  // Monitor Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver(list => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    console.log("CLS:", clsValue);

    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "web_vitals", {
        name: "CLS",
        value: Math.round(clsValue * 1000),
        event_category: "Performance",
      });
    }
  });

  try {
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  } catch (error) {
    console.warn("CLS monitoring not supported:", error);
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === "undefined") return;

  const criticalResources = [
    { href: "/api/cities?featured=true&limit=8", as: "fetch" },
    // Add more critical resources as needed
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}
