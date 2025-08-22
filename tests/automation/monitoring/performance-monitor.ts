import { Page } from "@playwright/test";
import { PerformanceThresholds } from "../config/browser-config";

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  constructor(private thresholds: PerformanceThresholds) {}

  async startMonitoring(page: Page): Promise<void> {
    this.startTime = Date.now();

    // Inject performance monitoring script
    await page.addInitScript(() => {
      // Store performance marks
      (window as any).performanceMarks = {
        navigationStart: performance.timeOrigin,
        marks: [],
        measures: [],
      };

      // Monitor Core Web Vitals
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          (window as any).performanceMarks.marks.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration || 0,
            entryType: entry.entryType,
          });
        }
      });

      observer.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "layout-shift",
          "first-input",
        ],
      });
    });
  }

  async getMetrics(page: Page): Promise<PerformanceMetrics> {
    const pageLoadTime = Date.now() - this.startTime;

    // Get performance metrics from the page
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");
      const marks = (window as any).performanceMarks?.marks || [];

      // Calculate Core Web Vitals
      const fcp =
        paint.find(entry => entry.name === "first-contentful-paint")
          ?.startTime || 0;
      const lcp =
        marks.find(
          (entry: any) => entry.entryType === "largest-contentful-paint"
        )?.startTime || 0;
      const cls = marks
        .filter((entry: any) => entry.entryType === "layout-shift")
        .reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      const fid =
        marks.find((entry: any) => entry.entryType === "first-input")
          ?.duration || 0;

      return {
        navigationTiming: {
          domContentLoaded:
            navigation?.domContentLoadedEventEnd -
              navigation?.domContentLoadedEventStart || 0,
          loadComplete:
            navigation?.loadEventEnd - navigation?.loadEventStart || 0,
          domInteractive: navigation?.domInteractive || 0,
        },
        paintTiming: {
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
        },
        layoutShift: cls,
        firstInputDelay: fid,
      };
    });

    // Get memory usage if available
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          }
        : null;
    });

    const metrics: PerformanceMetrics = {
      pageLoadTime,
      firstContentfulPaint: performanceData.paintTiming.firstContentfulPaint,
      largestContentfulPaint:
        performanceData.paintTiming.largestContentfulPaint,
      cumulativeLayoutShift: performanceData.layoutShift,
      firstInputDelay: performanceData.firstInputDelay,
      timeToInteractive: performanceData.navigationTiming.domInteractive,
      memoryUsage: memoryInfo?.usedJSHeapSize || 0,
      cpuUsage: 0, // CPU usage would require additional monitoring
    };

    return metrics;
  }

  validateMetrics(metrics: PerformanceMetrics): ValidationResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check against thresholds
    if (metrics.pageLoadTime > this.thresholds.pageLoadTime) {
      violations.push(
        `Page load time (${metrics.pageLoadTime}ms) exceeds threshold (${this.thresholds.pageLoadTime}ms)`
      );
    }

    if (metrics.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      violations.push(
        `First Contentful Paint (${metrics.firstContentfulPaint}ms) exceeds threshold (${this.thresholds.firstContentfulPaint}ms)`
      );
    }

    if (
      metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint
    ) {
      violations.push(
        `Largest Contentful Paint (${metrics.largestContentfulPaint}ms) exceeds threshold (${this.thresholds.largestContentfulPaint}ms)`
      );
    }

    if (metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      violations.push(
        `Cumulative Layout Shift (${metrics.cumulativeLayoutShift}) exceeds threshold (${this.thresholds.cumulativeLayoutShift})`
      );
    }

    if (metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      violations.push(
        `First Input Delay (${metrics.firstInputDelay}ms) exceeds threshold (${this.thresholds.firstInputDelay}ms)`
      );
    }

    if (metrics.timeToInteractive > this.thresholds.timeToInteractive) {
      violations.push(
        `Time to Interactive (${metrics.timeToInteractive}ms) exceeds threshold (${this.thresholds.timeToInteractive}ms)`
      );
    }

    // Add warnings for values close to thresholds (within 10%)
    const warningThreshold = 0.9;

    if (
      metrics.pageLoadTime >
      this.thresholds.pageLoadTime * warningThreshold
    ) {
      warnings.push(`Page load time approaching threshold`);
    }

    if (
      metrics.firstContentfulPaint >
      this.thresholds.firstContentfulPaint * warningThreshold
    ) {
      warnings.push(`First Contentful Paint approaching threshold`);
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      score: this.calculatePerformanceScore(metrics),
    };
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    // Calculate a performance score from 0-100
    let score = 100;

    // Deduct points for each threshold violation
    const violations = [
      metrics.pageLoadTime / this.thresholds.pageLoadTime,
      metrics.firstContentfulPaint / this.thresholds.firstContentfulPaint,
      metrics.largestContentfulPaint / this.thresholds.largestContentfulPaint,
      metrics.cumulativeLayoutShift / this.thresholds.cumulativeLayoutShift,
      metrics.firstInputDelay / this.thresholds.firstInputDelay,
      metrics.timeToInteractive / this.thresholds.timeToInteractive,
    ];

    violations.forEach(ratio => {
      if (ratio > 1) {
        score -= Math.min(20, (ratio - 1) * 20); // Deduct up to 20 points per violation
      }
    });

    return Math.max(0, Math.round(score));
  }

  async measureResourceTiming(page: Page): Promise<ResourceTiming[]> {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];

      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType,
        startTime: resource.startTime,
        responseEnd: resource.responseEnd,
      }));
    });
  }

  generatePerformanceReport(metrics: PerformanceMetrics): PerformanceReport {
    const validation = this.validateMetrics(metrics);

    return {
      timestamp: new Date().toISOString(),
      metrics,
      validation,
      recommendations: this.generateRecommendations(metrics, validation),
    };
  }

  private generateRecommendations(
    metrics: PerformanceMetrics,
    validation: ValidationResult
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.pageLoadTime > this.thresholds.pageLoadTime) {
      recommendations.push(
        "Consider optimizing images, minifying CSS/JS, and enabling compression"
      );
    }

    if (metrics.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      recommendations.push(
        "Optimize critical rendering path and reduce render-blocking resources"
      );
    }

    if (
      metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint
    ) {
      recommendations.push(
        "Optimize largest content element (images, videos) and improve server response times"
      );
    }

    if (metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      recommendations.push(
        "Add size attributes to images and videos, avoid inserting content above existing content"
      );
    }

    if (metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      recommendations.push(
        "Reduce JavaScript execution time and break up long tasks"
      );
    }

    return recommendations;
  }
}

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  score: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  startTime: number;
  responseEnd: number;
}

export interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  validation: ValidationResult;
  recommendations: string[];
}
