import { Page, Locator } from "@playwright/test";

export type WaitStrategy =
  | "networkIdle"
  | "domContentLoaded"
  | "load"
  | "custom";

export interface WaitOptions {
  timeout?: number;
  state?: "attached" | "detached" | "visible" | "hidden";
  strict?: boolean;
}

export interface DynamicContentOptions {
  selector: string;
  expectedCount?: number;
  timeout?: number;
  stable?: boolean; // Wait for content to stop changing
  stableTimeout?: number; // How long to wait for stability
}

export interface AjaxWaitOptions {
  timeout?: number;
  ignoreUrls?: string[]; // URLs to ignore when waiting for network idle
  waitForSpecificRequest?: string; // Wait for a specific request URL
}

export class WaitStrategies {
  private defaultTimeout = 30000;
  private networkIdleTimeout = 500;
  private stabilityCheckInterval = 100;

  async waitForNavigation(
    page: Page,
    url: string,
    strategy: WaitStrategy = "networkIdle"
  ): Promise<void> {
    const navigationPromise = page.goto(url, {
      waitUntil: this.getPlaywrightWaitUntil(strategy),
      timeout: this.defaultTimeout,
    });

    await navigationPromise;

    // Additional wait based on strategy
    switch (strategy) {
      case "networkIdle":
        await this.waitForNetworkIdle(page);
        break;
      case "custom":
        await this.waitForPageStability(page);
        break;
    }
  }

  async waitForElement(
    page: Page,
    selector: string,
    options: WaitOptions = {}
  ): Promise<Locator> {
    const locator = page.locator(selector);

    await locator.waitFor({
      state: options.state || "visible",
      timeout: options.timeout || this.defaultTimeout,
    });

    return locator;
  }

  async waitForElements(
    page: Page,
    selector: string,
    expectedCount: number,
    timeout: number = this.defaultTimeout
  ): Promise<Locator[]> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const elements = await page.locator(selector).all();

      if (elements.length >= expectedCount) {
        return elements;
      }

      await page.waitForTimeout(this.stabilityCheckInterval);
    }

    throw new Error(
      `Expected at least ${expectedCount} elements with selector '${selector}', but found ${await page.locator(selector).count()}`
    );
  }

  async waitForDynamicContent(
    page: Page,
    options: DynamicContentOptions
  ): Promise<void> {
    const {
      selector,
      expectedCount,
      timeout = this.defaultTimeout,
      stable = true,
      stableTimeout = 2000,
    } = options;

    const startTime = Date.now();
    let lastCount = 0;
    let stableStartTime = 0;

    while (Date.now() - startTime < timeout) {
      const currentCount = await page.locator(selector).count();

      // Check if we have the expected count
      if (expectedCount !== undefined && currentCount >= expectedCount) {
        if (!stable) {
          return; // Don't wait for stability
        }
      }

      // Check for stability
      if (stable) {
        if (currentCount === lastCount) {
          if (stableStartTime === 0) {
            stableStartTime = Date.now();
          } else if (Date.now() - stableStartTime >= stableTimeout) {
            // Content has been stable for the required time
            if (expectedCount === undefined || currentCount >= expectedCount) {
              return;
            }
          }
        } else {
          stableStartTime = 0; // Reset stability timer
          lastCount = currentCount;
        }
      }

      await page.waitForTimeout(this.stabilityCheckInterval);
    }

    throw new Error(
      `Timeout waiting for dynamic content with selector '${selector}'`
    );
  }

  async waitForAjaxCompletion(
    page: Page,
    options: AjaxWaitOptions = {}
  ): Promise<void> {
    const {
      timeout = this.defaultTimeout,
      ignoreUrls = [],
      waitForSpecificRequest,
    } = options;

    if (waitForSpecificRequest) {
      // Wait for a specific request
      await this.waitForSpecificRequest(page, waitForSpecificRequest, timeout);
    } else {
      // Wait for network idle
      await this.waitForNetworkIdle(page, { timeout, ignoreUrls });
    }
  }

  private async waitForSpecificRequest(
    page: Page,
    requestUrl: string,
    timeout: number
  ): Promise<void> {
    const requestPromise = page.waitForRequest(
      request => request.url().includes(requestUrl),
      { timeout }
    );

    const responsePromise = page.waitForResponse(
      response => response.url().includes(requestUrl),
      { timeout }
    );

    await Promise.all([requestPromise, responsePromise]);
  }

  async waitForNetworkIdle(
    page: Page,
    options: { timeout?: number; ignoreUrls?: string[] } = {}
  ): Promise<void> {
    const { timeout = this.defaultTimeout, ignoreUrls = [] } = options;

    let pendingRequests = 0;
    let idleStartTime = 0;
    const startTime = Date.now();

    const requestHandler = (request: any) => {
      const url = request.url();
      const shouldIgnore = ignoreUrls.some(ignoreUrl =>
        url.includes(ignoreUrl)
      );

      if (!shouldIgnore) {
        pendingRequests++;
        idleStartTime = 0;
      }
    };

    const responseHandler = (response: any) => {
      const url = response.url();
      const shouldIgnore = ignoreUrls.some(ignoreUrl =>
        url.includes(ignoreUrl)
      );

      if (!shouldIgnore) {
        pendingRequests--;
        if (pendingRequests === 0) {
          idleStartTime = Date.now();
        }
      }
    };

    page.on("request", requestHandler);
    page.on("response", responseHandler);
    page.on("requestfailed", responseHandler);

    try {
      while (Date.now() - startTime < timeout) {
        if (pendingRequests === 0) {
          if (idleStartTime === 0) {
            idleStartTime = Date.now();
          } else if (Date.now() - idleStartTime >= this.networkIdleTimeout) {
            // Network has been idle for the required time
            break;
          }
        }

        await page.waitForTimeout(50);
      }
    } finally {
      page.off("request", requestHandler);
      page.off("response", responseHandler);
      page.off("requestfailed", responseHandler);
    }

    if (Date.now() - startTime >= timeout) {
      throw new Error(`Network idle timeout after ${timeout}ms`);
    }
  }

  async waitForLoadState(
    page: Page,
    state: WaitStrategy = "networkIdle"
  ): Promise<void> {
    switch (state) {
      case "domContentLoaded":
        await page.waitForLoadState("domcontentloaded");
        break;
      case "load":
        await page.waitForLoadState("load");
        break;
      case "networkIdle":
        await page.waitForLoadState("networkidle");
        break;
      case "custom":
        await this.waitForPageStability(page);
        break;
    }
  }

  async waitForPageStability(
    page: Page,
    stabilityTimeout: number = 2000
  ): Promise<void> {
    // Wait for DOM to be stable (no new elements added)
    let lastElementCount = 0;
    let stableStartTime = 0;
    const startTime = Date.now();
    const maxWaitTime = this.defaultTimeout;

    while (Date.now() - startTime < maxWaitTime) {
      const currentElementCount = await page.evaluate(
        () => document.querySelectorAll("*").length
      );

      if (currentElementCount === lastElementCount) {
        if (stableStartTime === 0) {
          stableStartTime = Date.now();
        } else if (Date.now() - stableStartTime >= stabilityTimeout) {
          // Page has been stable for the required time
          break;
        }
      } else {
        stableStartTime = 0;
        lastElementCount = currentElementCount;
      }

      await page.waitForTimeout(this.stabilityCheckInterval);
    }
  }

  async waitForElementToStopMoving(
    page: Page,
    selector: string,
    stabilityTimeout: number = 1000
  ): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: "visible" });

    let lastPosition: { x: number; y: number } | null = null;
    let stableStartTime = 0;
    const startTime = Date.now();
    const maxWaitTime = this.defaultTimeout;

    while (Date.now() - startTime < maxWaitTime) {
      const boundingBox = await element.boundingBox();

      if (boundingBox) {
        const currentPosition = { x: boundingBox.x, y: boundingBox.y };

        if (
          lastPosition &&
          currentPosition.x === lastPosition.x &&
          currentPosition.y === lastPosition.y
        ) {
          if (stableStartTime === 0) {
            stableStartTime = Date.now();
          } else if (Date.now() - stableStartTime >= stabilityTimeout) {
            // Element has been stable for the required time
            break;
          }
        } else {
          stableStartTime = 0;
          lastPosition = currentPosition;
        }
      }

      await page.waitForTimeout(this.stabilityCheckInterval);
    }
  }

  async waitForTextToAppear(
    page: Page,
    text: string,
    timeout: number = this.defaultTimeout
  ): Promise<void> {
    await page.waitForFunction(
      searchText => document.body.textContent?.includes(searchText),
      text,
      { timeout }
    );
  }

  async waitForTextToDisappear(
    page: Page,
    text: string,
    timeout: number = this.defaultTimeout
  ): Promise<void> {
    await page.waitForFunction(
      searchText => !document.body.textContent?.includes(searchText),
      text,
      { timeout }
    );
  }

  async waitForElementCount(
    page: Page,
    selector: string,
    expectedCount: number,
    timeout: number = this.defaultTimeout
  ): Promise<void> {
    await page.waitForFunction(
      ({ sel, count }) => document.querySelectorAll(sel).length === count,
      { sel: selector, count: expectedCount },
      { timeout }
    );
  }

  async waitForCustomCondition(
    page: Page,
    condition: () => Promise<boolean> | boolean,
    timeout: number = this.defaultTimeout,
    checkInterval: number = this.stabilityCheckInterval
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        // Condition check failed, continue waiting
      }

      await page.waitForTimeout(checkInterval);
    }

    throw new Error(`Custom condition not met within ${timeout}ms`);
  }

  private getPlaywrightWaitUntil(
    strategy: WaitStrategy
  ): "load" | "domcontentloaded" | "networkidle" {
    switch (strategy) {
      case "domContentLoaded":
        return "domcontentloaded";
      case "load":
        return "load";
      case "networkIdle":
      case "custom":
      default:
        return "networkidle";
    }
  }

  // Configuration methods
  setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  setNetworkIdleTimeout(timeout: number): void {
    this.networkIdleTimeout = timeout;
  }

  setStabilityCheckInterval(interval: number): void {
    this.stabilityCheckInterval = interval;
  }
}
