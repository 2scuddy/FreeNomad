import { BrowserType, devices } from "@playwright/test";

export interface BrowserConfig {
  name: string;
  type: "chromium" | "firefox" | "webkit";
  headless: boolean;
  viewport: { width: number; height: number };
  userAgent?: string;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

export interface DeviceProfile {
  name: string;
  viewport: { width: number; height: number };
  userAgent: string;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

export const BROWSER_CONFIGS: BrowserConfig[] = [
  {
    name: "Chrome Desktop",
    type: "chromium",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: "Firefox Desktop",
    type: "firefox",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: "Safari Desktop",
    type: "webkit",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: "Chrome Mobile",
    type: "chromium",
    headless: true,
    viewport: { width: 375, height: 667 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPad",
    type: "webkit",
    headless: true,
    viewport: { width: 768, height: 1024 },
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    name: "iPhone 12",
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPhone 12 Pro Max",
    viewport: { width: 428, height: 926 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "Galaxy S21",
    viewport: { width: 384, height: 854 },
    userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36",
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPad Pro",
    viewport: { width: 1024, height: 1366 },
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "Desktop 1920x1080",
    viewport: { width: 1920, height: 1080 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: "Desktop 1366x768",
    viewport: { width: 1366, height: 768 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
];

export interface TestExecutionConfig {
  parallel: boolean;
  maxWorkers: number;
  retryAttempts: number;
  timeout: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnFailure: boolean;
}

export const DEFAULT_EXECUTION_CONFIG: TestExecutionConfig = {
  parallel: true,
  maxWorkers: 4,
  retryAttempts: 3,
  timeout: 30000,
  screenshotOnFailure: true,
  videoOnFailure: true,
  traceOnFailure: true,
};

export interface PerformanceThresholds {
  pageLoadTime: number; // milliseconds
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: 5000,
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  timeToInteractive: 3800,
};

export interface NotificationConfig {
  email: {
    enabled: boolean;
    recipients: string[];
    smtpConfig?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  slack: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
  webhook: {
    enabled: boolean;
    url?: string;
    headers?: Record<string, string>;
  };
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  email: {
    enabled: false,
    recipients: [],
  },
  slack: {
    enabled: false,
  },
  webhook: {
    enabled: false,
  },
};
