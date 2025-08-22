import { NetworkActivity } from "../framework/test-framework";

export class TestReporter {
  private logs: Map<string, string[]> = new Map();
  private screenshots: Map<string, string[]> = new Map();
  private networkActivity: Map<string, NetworkActivity[]> = new Map();
  private requestTimestamps: Map<string, Map<string, number>> = new Map();

  addLog(browserId: string, message: string): void {
    if (!this.logs.has(browserId)) {
      this.logs.set(browserId, []);
    }

    const timestamp = new Date().toISOString();
    this.logs.get(browserId)!.push(`[${timestamp}] ${message}`);
  }

  addScreenshot(browserId: string, screenshotPath: string): void {
    if (!this.screenshots.has(browserId)) {
      this.screenshots.set(browserId, []);
    }

    this.screenshots.get(browserId)!.push(screenshotPath);
  }

  addNetworkActivity(browserId: string, activity: NetworkActivity): void {
    if (!this.networkActivity.has(browserId)) {
      this.networkActivity.set(browserId, []);
    }

    if (!this.requestTimestamps.has(browserId)) {
      this.requestTimestamps.set(browserId, new Map());
    }

    this.networkActivity.get(browserId)!.push(activity);
    this.requestTimestamps
      .get(browserId)!
      .set(activity.url, activity.timestamp);
  }

  updateNetworkActivity(
    browserId: string,
    url: string,
    updates: Partial<NetworkActivity>
  ): void {
    const activities = this.networkActivity.get(browserId);
    if (!activities) return;

    const activity = activities.find(a => a.url === url);
    if (activity) {
      Object.assign(activity, updates);
    }
  }

  getRequestTimestamp(browserId: string, url: string): number {
    const timestamps = this.requestTimestamps.get(browserId);
    return timestamps?.get(url) || Date.now();
  }

  getLogs(browserId: string): string[] {
    return this.logs.get(browserId) || [];
  }

  getScreenshots(browserId: string): string[] {
    return this.screenshots.get(browserId) || [];
  }

  getNetworkActivity(browserId: string): NetworkActivity[] {
    return this.networkActivity.get(browserId) || [];
  }

  generateReport(browserId: string): TestReport {
    return {
      browserId,
      logs: this.getLogs(browserId),
      screenshots: this.getScreenshots(browserId),
      networkActivity: this.getNetworkActivity(browserId),
      timestamp: new Date().toISOString(),
    };
  }

  generateSummaryReport(browserIds: string[]): SummaryReport {
    const reports = browserIds.map(id => this.generateReport(id));

    return {
      timestamp: new Date().toISOString(),
      totalBrowsers: browserIds.length,
      reports,
      summary: {
        totalLogs: reports.reduce((sum, r) => sum + r.logs.length, 0),
        totalScreenshots: reports.reduce(
          (sum, r) => sum + r.screenshots.length,
          0
        ),
        totalNetworkRequests: reports.reduce(
          (sum, r) => sum + r.networkActivity.length,
          0
        ),
      },
    };
  }

  clear(browserId?: string): void {
    if (browserId) {
      this.logs.delete(browserId);
      this.screenshots.delete(browserId);
      this.networkActivity.delete(browserId);
      this.requestTimestamps.delete(browserId);
    } else {
      this.logs.clear();
      this.screenshots.clear();
      this.networkActivity.clear();
      this.requestTimestamps.clear();
    }
  }
}

export interface TestReport {
  browserId: string;
  logs: string[];
  screenshots: string[];
  networkActivity: NetworkActivity[];
  timestamp: string;
}

export interface SummaryReport {
  timestamp: string;
  totalBrowsers: number;
  reports: TestReport[];
  summary: {
    totalLogs: number;
    totalScreenshots: number;
    totalNetworkRequests: number;
  };
}
