module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/cities",
        "http://localhost:3000/auth/login",
      ],
      startServerCommand: "npm run start",
      startServerReadyPattern: "ready on",
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:pwa": ["warn", { minScore: 0.8 }],

        // Core Web Vitals 2024
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],

        // Performance metrics
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],
        interactive: ["warn", { maxNumericValue: 3800 }],

        // Best practices
        "uses-webp-images": "error",
        "uses-optimized-images": "error",
        "uses-text-compression": "error",
        "uses-responsive-images": "error",
        "efficient-animated-content": "warn",
        "unused-javascript": "warn",
        "unused-css-rules": "warn",

        // Security
        "is-on-https": "off", // Disabled for localhost testing
        "uses-http2": "warn",
        "no-vulnerable-libraries": "error",

        // Accessibility
        "color-contrast": "error",
        "image-alt": "error",
        label: "error",
        "link-name": "error",

        // SEO
        "document-title": "error",
        "meta-description": "error",
        viewport: "error",
        "robots-txt": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      port: 9001,
      storage: "./lighthouse-reports",
    },
  },
};
