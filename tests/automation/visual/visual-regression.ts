import { Page } from "@playwright/test";
import { promises as fs } from "fs";
import * as path from "path";

export interface VisualDiffResult {
  hasDifferences: boolean;
  diffPercentage: number;
  diffImagePath?: string;
  baselineImagePath: string;
  actualImagePath: string;
}

export interface VisualTestConfig {
  threshold: number; // Percentage threshold for differences
  baselineDir: string;
  actualDir: string;
  diffDir: string;
  fullPage: boolean;
  clip?: { x: number; y: number; width: number; height: number };
}

export class VisualRegressionTester {
  private config: VisualTestConfig;

  constructor(config?: Partial<VisualTestConfig>) {
    this.config = {
      threshold: 0.2, // 0.2% difference threshold
      baselineDir: "test-results/visual/baseline",
      actualDir: "test-results/visual/actual",
      diffDir: "test-results/visual/diff",
      fullPage: true,
      ...config,
    };

    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.baselineDir,
      this.config.actualDir,
      this.config.diffDir,
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch {
        // Directory might already exist
      }
    }
  }

  async captureBaseline(
    page: Page,
    testName: string,
    browserName: string
  ): Promise<string> {
    const fileName = `${testName}-${browserName}.png`;
    const baselinePath = path.join(this.config.baselineDir, fileName);

    await page.screenshot({
      path: baselinePath,
      fullPage: this.config.fullPage,
      clip: this.config.clip,
    });

    return baselinePath;
  }

  async captureActual(
    page: Page,
    testName: string,
    browserName: string
  ): Promise<string> {
    const fileName = `${testName}-${browserName}.png`;
    const actualPath = path.join(this.config.actualDir, fileName);

    await page.screenshot({
      path: actualPath,
      fullPage: this.config.fullPage,
      clip: this.config.clip,
    });

    return actualPath;
  }

  async compareImages(
    testName: string,
    browserName: string
  ): Promise<VisualDiffResult> {
    const fileName = `${testName}-${browserName}.png`;
    const baselinePath = path.join(this.config.baselineDir, fileName);
    const actualPath = path.join(this.config.actualDir, fileName);
    const diffPath = path.join(this.config.diffDir, fileName);

    // Check if baseline exists
    try {
      await fs.access(baselinePath);
    } catch {
      // No baseline exists, create one from actual
      await fs.copyFile(actualPath, baselinePath);
      return {
        hasDifferences: false,
        diffPercentage: 0,
        baselineImagePath: baselinePath,
        actualImagePath: actualPath,
      };
    }

    // For now, we'll use a simple file comparison
    // In a real implementation, you'd use a library like pixelmatch
    const baselineBuffer = await fs.readFile(baselinePath);
    const actualBuffer = await fs.readFile(actualPath);

    const areIdentical = Buffer.compare(baselineBuffer, actualBuffer) === 0;

    if (areIdentical) {
      return {
        hasDifferences: false,
        diffPercentage: 0,
        baselineImagePath: baselinePath,
        actualImagePath: actualPath,
      };
    }

    // Create a simple diff (copy actual as diff for now)
    await fs.copyFile(actualPath, diffPath);

    // Calculate a mock difference percentage
    const diffPercentage = this.calculateMockDifference(
      baselineBuffer,
      actualBuffer
    );

    return {
      hasDifferences: diffPercentage > this.config.threshold,
      diffPercentage,
      diffImagePath: diffPath,
      baselineImagePath: baselinePath,
      actualImagePath: actualPath,
    };
  }

  private calculateMockDifference(baseline: Buffer, actual: Buffer): number {
    // Simple mock calculation based on file size difference
    const sizeDiff = Math.abs(baseline.length - actual.length);
    const avgSize = (baseline.length + actual.length) / 2;
    return (sizeDiff / avgSize) * 100;
  }

  async runVisualTest(
    page: Page,
    testName: string,
    browserName: string,
    updateBaseline: boolean = false
  ): Promise<VisualDiffResult> {
    if (updateBaseline) {
      // Update baseline
      await this.captureBaseline(page, testName, browserName);
      return {
        hasDifferences: false,
        diffPercentage: 0,
        baselineImagePath: path.join(
          this.config.baselineDir,
          `${testName}-${browserName}.png`
        ),
        actualImagePath: path.join(
          this.config.actualDir,
          `${testName}-${browserName}.png`
        ),
      };
    }

    // Capture actual screenshot
    await this.captureActual(page, testName, browserName);

    // Compare with baseline
    return await this.compareImages(testName, browserName);
  }

  async runMultiViewportTest(
    page: Page,
    testName: string,
    browserName: string,
    viewports: Array<{ width: number; height: number; name: string }>
  ): Promise<Map<string, VisualDiffResult>> {
    const results = new Map<string, VisualDiffResult>();

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.waitForTimeout(1000); // Allow layout to settle

      const viewportTestName = `${testName}-${viewport.name}`;
      const result = await this.runVisualTest(
        page,
        viewportTestName,
        browserName
      );
      results.set(viewport.name, result);
    }

    return results;
  }

  async generateVisualReport(
    testResults: Map<string, VisualDiffResult>
  ): Promise<VisualReport> {
    const totalTests = testResults.size;
    const failedTests = Array.from(testResults.values()).filter(
      r => r.hasDifferences
    ).length;
    const passedTests = totalTests - failedTests;

    const details = Array.from(testResults.entries()).map(
      ([testName, result]) => ({
        testName,
        passed: !result.hasDifferences,
        diffPercentage: result.diffPercentage,
        baselineImage: result.baselineImagePath,
        actualImage: result.actualImagePath,
        diffImage: result.diffImagePath,
      })
    );

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
      details,
      config: this.config,
    };
  }

  async cleanupOldResults(daysToKeep: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const dirs = [this.config.actualDir, this.config.diffDir];

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup directory ${dir}:`, error);
      }
    }
  }

  updateConfig(newConfig: Partial<VisualTestConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.ensureDirectories();
  }
}

export interface VisualReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  details: Array<{
    testName: string;
    passed: boolean;
    diffPercentage: number;
    baselineImage: string;
    actualImage: string;
    diffImage?: string;
  }>;
  config: VisualTestConfig;
}
