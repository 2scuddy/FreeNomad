import { Page } from "@playwright/test";

export interface TimeoutConfig {
  default: number;
  navigation: number;
  authentication: number;
  apiCall: number;
  elementWait: number;
  networkIdle: number;
  formSubmission: number;
  pageLoad: number;
  databaseOperation: number;
}

export interface WorkflowTimeouts {
  registration: number;
  login: number;
  logout: number;
  profileUpdate: number;
  passwordReset: number;
  emailVerification: number;
}

export interface DynamicTimeoutOptions {
  baseTimeout: number;
  complexityMultiplier?: number;
  networkCondition?: "fast" | "slow" | "offline";
  workflowType?: "simple" | "complex" | "critical";
  retryAttempt?: number;
}

export class TimeoutManager {
  private static readonly BASE_TIMEOUTS: TimeoutConfig = {
    default: 30000,
    navigation: 30000,
    authentication: 60000, // Extended for auth workflows
    apiCall: 15000,
    elementWait: 10000,
    networkIdle: 5000,
    formSubmission: 20000,
    pageLoad: 30000,
    databaseOperation: 10000,
  };

  private static readonly WORKFLOW_TIMEOUTS: WorkflowTimeouts = {
    registration: 90000, // Extended for complex registration flows
    login: 60000, // Extended for authentication processing
    logout: 30000,
    profileUpdate: 45000,
    passwordReset: 120000, // Extended for email processing
    emailVerification: 180000, // Extended for email delivery
  };

  private static readonly NETWORK_MULTIPLIERS = {
    fast: 1.0,
    slow: 2.5,
    offline: 5.0,
  };

  private static readonly COMPLEXITY_MULTIPLIERS = {
    simple: 1.0,
    complex: 2.0,
    critical: 3.0,
  };

  /**
   * Get base timeout for a specific operation type
   */
  static getBaseTimeout(operation: keyof TimeoutConfig): number {
    return this.BASE_TIMEOUTS[operation];
  }

  /**
   * Get workflow-specific timeout
   */
  static getWorkflowTimeout(workflow: keyof WorkflowTimeouts): number {
    return this.WORKFLOW_TIMEOUTS[workflow];
  }

  /**
   * Calculate dynamic timeout based on complexity and conditions
   */
  static calculateDynamicTimeout(options: DynamicTimeoutOptions): number {
    const {
      baseTimeout,
      complexityMultiplier = 1,
      networkCondition = "fast",
      workflowType = "simple",
      retryAttempt = 0,
    } = options;

    let timeout = baseTimeout;

    // Apply network condition multiplier
    timeout *= this.NETWORK_MULTIPLIERS[networkCondition];

    // Apply workflow complexity multiplier
    timeout *= this.COMPLEXITY_MULTIPLIERS[workflowType];

    // Apply custom complexity multiplier
    timeout *= complexityMultiplier;

    // Increase timeout for retry attempts
    timeout *= 1 + retryAttempt * 0.5;

    return Math.round(timeout);
  }

  /**
   * Get authentication workflow timeout with dynamic adjustments
   */
  static getAuthTimeout(
    workflow: keyof WorkflowTimeouts,
    options: Partial<DynamicTimeoutOptions> = {}
  ): number {
    const baseTimeout = this.getWorkflowTimeout(workflow);

    return this.calculateDynamicTimeout({
      baseTimeout,
      workflowType: "complex",
      ...options,
    });
  }

  /**
   * Configure page timeouts for authentication workflows
   */
  static async configureAuthPage(
    page: Page,
    workflow: keyof WorkflowTimeouts
  ): Promise<void> {
    const timeout = this.getAuthTimeout(workflow);

    // Set page timeout
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    console.log(`🕒 Configured ${workflow} timeout: ${timeout}ms`);
  }

  /**
   * Configure page timeouts for specific operations
   */
  static async configureOperationTimeout(
    page: Page,
    operation: keyof TimeoutConfig,
    options: Partial<DynamicTimeoutOptions> = {}
  ): Promise<void> {
    const baseTimeout = this.getBaseTimeout(operation);
    const timeout = this.calculateDynamicTimeout({
      baseTimeout,
      ...options,
    });

    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    console.log(`🕒 Configured ${operation} timeout: ${timeout}ms`);
  }

  /**
   * Wait with dynamic timeout based on conditions
   */
  static async waitWithDynamicTimeout(
    page: Page,
    selector: string,
    options: Partial<DynamicTimeoutOptions> & {
      state?: "attached" | "detached" | "visible" | "hidden";
    } = {}
  ): Promise<void> {
    const { state = "visible", ...timeoutOptions } = options;
    const timeout = this.calculateDynamicTimeout({
      baseTimeout: this.BASE_TIMEOUTS.elementWait,
      ...timeoutOptions,
    });

    await page.locator(selector).waitFor({ state, timeout });
  }

  /**
   * Navigate with dynamic timeout
   */
  static async navigateWithTimeout(
    page: Page,
    url: string,
    options: Partial<DynamicTimeoutOptions> = {}
  ): Promise<void> {
    const timeout = this.calculateDynamicTimeout({
      baseTimeout: this.BASE_TIMEOUTS.navigation,
      ...options,
    });

    await page.goto(url, {
      timeout,
      waitUntil: "networkidle",
    });
  }

  /**
   * Submit form with dynamic timeout
   */
  static async submitFormWithTimeout(
    page: Page,
    submitSelector: string,
    options: Partial<DynamicTimeoutOptions> = {}
  ): Promise<void> {
    const timeout = this.calculateDynamicTimeout({
      baseTimeout: this.BASE_TIMEOUTS.formSubmission,
      workflowType: "complex",
      ...options,
    });

    // Configure timeout for this operation
    const originalTimeout = 30000; // Default Playwright timeout
    page.setDefaultTimeout(timeout);

    try {
      await page.locator(submitSelector).click();
      // Wait for navigation or response
      await page.waitForLoadState("networkidle", { timeout });
    } finally {
      // Restore original timeout
      page.setDefaultTimeout(originalTimeout);
    }
  }

  /**
   * Wait for API response with dynamic timeout
   */
  static async waitForApiResponse(
    page: Page,
    urlPattern: string | RegExp,
    options: Partial<DynamicTimeoutOptions> = {}
  ): Promise<void> {
    const timeout = this.calculateDynamicTimeout({
      baseTimeout: this.BASE_TIMEOUTS.apiCall,
      ...options,
    });

    await page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === "string") {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Get timeout configuration summary
   */
  static getTimeoutSummary(): {
    base: TimeoutConfig;
    workflows: WorkflowTimeouts;
    multipliers: {
      network: typeof TimeoutManager.NETWORK_MULTIPLIERS;
      complexity: typeof TimeoutManager.COMPLEXITY_MULTIPLIERS;
    };
  } {
    return {
      base: this.BASE_TIMEOUTS,
      workflows: this.WORKFLOW_TIMEOUTS,
      multipliers: {
        network: this.NETWORK_MULTIPLIERS,
        complexity: this.COMPLEXITY_MULTIPLIERS,
      },
    };
  }

  /**
   * Log timeout configuration for debugging
   */
  static logTimeoutConfig(operation: string, timeout: number): void {
    console.log(`🕒 Timeout Configuration:`);
    console.log(`   Operation: ${operation}`);
    console.log(`   Timeout: ${timeout}ms (${(timeout / 1000).toFixed(1)}s)`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  }
}

// Export timeout constants for direct use
export const TIMEOUTS = {
  ...TimeoutManager["BASE_TIMEOUTS"],
  workflows: TimeoutManager["WORKFLOW_TIMEOUTS"],
} as const;

// Export helper functions
export const getAuthTimeout =
  TimeoutManager.getAuthTimeout.bind(TimeoutManager);
export const configureAuthPage =
  TimeoutManager.configureAuthPage.bind(TimeoutManager);
export const waitWithDynamicTimeout =
  TimeoutManager.waitWithDynamicTimeout.bind(TimeoutManager);
export const navigateWithTimeout =
  TimeoutManager.navigateWithTimeout.bind(TimeoutManager);
export const submitFormWithTimeout =
  TimeoutManager.submitFormWithTimeout.bind(TimeoutManager);
