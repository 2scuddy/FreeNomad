import { PipelineResult, ReportingConfig } from "../ci-cd/pipeline-integration";
import { promises as fs } from "fs";
import * as path from "path";

export class ReportGenerator {
  constructor(private config: ReportingConfig) {}

  async generateReport(
    pipelineResult: PipelineResult,
    format: "html" | "json" | "junit" | "pdf"
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `test-report-${pipelineResult.pipelineId}-${timestamp}`;

    switch (format) {
      case "html":
        return await this.generateHtmlReport(pipelineResult, fileName);
      case "json":
        return await this.generateJsonReport(pipelineResult, fileName);
      case "junit":
        return await this.generateJunitReport(pipelineResult, fileName);
      case "pdf":
        return await this.generatePdfReport(pipelineResult, fileName);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  private async generateHtmlReport(
    result: PipelineResult,
    fileName: string
  ): Promise<string> {
    const filePath = path.join(this.config.outputDir, `${fileName}.html`);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${result.pipelineId}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .metric {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .partial { color: #ffc107; }
        .content {
            padding: 30px;
        }
        .suite {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        .suite-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-partial {
            background: #fff3cd;
            color: #856404;
        }
        .browser-results {
            padding: 20px;
        }
        .browser {
            margin-bottom: 20px;
        }
        .browser-name {
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
        }
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        .test-card {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            background: white;
        }
        .test-name {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .test-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .test-duration {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .test-error {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            font-size: 0.8em;
            white-space: pre-wrap;
        }
        .screenshots {
            margin-top: 10px;
        }
        .screenshot {
            display: inline-block;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        .screenshot img {
            max-width: 150px;
            height: auto;
            display: block;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Automation Report</h1>
            <div class="subtitle">
                Pipeline: ${result.pipelineId} | Environment: ${result.environment} | ${new Date(result.timestamp).toLocaleString()}
            </div>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value ${result.status}">${result.status.toUpperCase()}</div>
                <div class="metric-label">Overall Status</div>
            </div>
            <div class="metric">
                <div class="metric-value">${result.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value passed">${result.summary.passedTests}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${result.summary.failedTests}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${result.summary.passRate.toFixed(1)}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.formatDuration(result.duration)}</div>
                <div class="metric-label">Duration</div>
            </div>
        </div>
        
        <div class="content">
            ${this.generateSuiteHtml(result)}
        </div>
        
        <div class="footer">
            Generated on ${new Date().toLocaleString()} | Test Automation Framework
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(filePath, html, "utf-8");
    return filePath;
  }

  private generateSuiteHtml(result: PipelineResult): string {
    let html = "";

    for (const [suiteName, suiteResult] of result.suiteResults.entries()) {
      html += `
        <div class="suite">
            <div class="suite-header">
                <div class="suite-name">${suiteName}</div>
                <div class="suite-status status-${suiteResult.status}">${suiteResult.status}</div>
            </div>
            <div class="browser-results">
      `;

      for (const [
        browserName,
        testResults,
      ] of suiteResult.browserResults.entries()) {
        html += `
          <div class="browser">
              <div class="browser-name">🌐 ${browserName}</div>
              <div class="test-grid">
        `;

        for (const [testId, testResult] of testResults.entries()) {
          html += `
            <div class="test-card">
                <div class="test-name">${testId}</div>
                <div class="test-status status-${testResult.status}">${testResult.status}</div>
                <div class="test-duration">Duration: ${this.formatDuration(testResult.duration)}</div>
          `;

          if (testResult.error) {
            html += `<div class="test-error">${this.escapeHtml(testResult.error.message)}</div>`;
          }

          if (
            this.config.includeScreenshots &&
            testResult.screenshots.length > 0
          ) {
            html += '<div class="screenshots">';
            for (const screenshot of testResult.screenshots) {
              html += `<div class="screenshot"><img src="${screenshot}" alt="Screenshot" /></div>`;
            }
            html += "</div>";
          }

          html += "</div>";
        }

        html += "</div></div>";
      }

      html += "</div></div>";
    }

    return html;
  }

  private async generateJsonReport(
    result: PipelineResult,
    fileName: string
  ): Promise<string> {
    const filePath = path.join(this.config.outputDir, `${fileName}.json`);

    // Convert Map objects to plain objects for JSON serialization
    const jsonResult = {
      ...result,
      suiteResults: Object.fromEntries(
        Array.from(result.suiteResults.entries()).map(
          ([suiteName, suiteResult]) => [
            suiteName,
            {
              ...suiteResult,
              browserResults: Object.fromEntries(
                Array.from(suiteResult.browserResults.entries()).map(
                  ([browserName, testResults]) => [
                    browserName,
                    Object.fromEntries(testResults.entries()),
                  ]
                )
              ),
            },
          ]
        )
      ),
    };

    await fs.writeFile(filePath, JSON.stringify(jsonResult, null, 2), "utf-8");
    return filePath;
  }

  private async generateJunitReport(
    result: PipelineResult,
    fileName: string
  ): Promise<string> {
    const filePath = path.join(this.config.outputDir, `${fileName}.xml`);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites name="${result.pipelineId}" tests="${result.summary.totalTests}" failures="${result.summary.failedTests}" time="${result.duration / 1000}">\n`;

    for (const [suiteName, suiteResult] of result.suiteResults.entries()) {
      for (const [
        browserName,
        testResults,
      ] of suiteResult.browserResults.entries()) {
        const suiteTestCount = testResults.size;
        const suiteFailures = Array.from(testResults.values()).filter(
          t => t.status === "failed"
        ).length;
        const suiteDuration = Array.from(testResults.values()).reduce(
          (sum, t) => sum + t.duration,
          0
        );

        xml += `  <testsuite name="${suiteName} - ${browserName}" tests="${suiteTestCount}" failures="${suiteFailures}" time="${suiteDuration / 1000}">\n`;

        for (const [testId, testResult] of testResults.entries()) {
          xml += `    <testcase name="${testId}" classname="${suiteName}.${browserName}" time="${testResult.duration / 1000}">`;

          if (testResult.status === "failed" && testResult.error) {
            xml += `\n      <failure message="${this.escapeXml(testResult.error.message)}">`;
            xml += `<![CDATA[${testResult.error.stack || testResult.error.message}]]>`;
            xml += "</failure>\n    ";
          }

          xml += "</testcase>\n";
        }

        xml += "  </testsuite>\n";
      }
    }

    xml += "</testsuites>";

    await fs.writeFile(filePath, xml, "utf-8");
    return filePath;
  }

  private async generatePdfReport(
    result: PipelineResult,
    fileName: string
  ): Promise<string> {
    // For PDF generation, we would typically use a library like puppeteer
    // For now, we'll create a simple text-based report
    const filePath = path.join(this.config.outputDir, `${fileName}.txt`);

    let content = `TEST AUTOMATION REPORT\n`;
    content += `========================\n\n`;
    content += `Pipeline ID: ${result.pipelineId}\n`;
    content += `Environment: ${result.environment}\n`;
    content += `Timestamp: ${new Date(result.timestamp).toLocaleString()}\n`;
    content += `Duration: ${this.formatDuration(result.duration)}\n`;
    content += `Status: ${result.status.toUpperCase()}\n\n`;

    content += `SUMMARY\n`;
    content += `-------\n`;
    content += `Total Tests: ${result.summary.totalTests}\n`;
    content += `Passed: ${result.summary.passedTests}\n`;
    content += `Failed: ${result.summary.failedTests}\n`;
    content += `Skipped: ${result.summary.skippedTests}\n`;
    content += `Pass Rate: ${result.summary.passRate.toFixed(1)}%\n\n`;

    content += `DETAILED RESULTS\n`;
    content += `----------------\n`;

    for (const [suiteName, suiteResult] of result.suiteResults.entries()) {
      content += `\nSuite: ${suiteName} (${suiteResult.status})\n`;

      for (const [
        browserName,
        testResults,
      ] of suiteResult.browserResults.entries()) {
        content += `  Browser: ${browserName}\n`;

        for (const [testId, testResult] of testResults.entries()) {
          content += `    - ${testId}: ${testResult.status.toUpperCase()} (${this.formatDuration(testResult.duration)})\n`;

          if (testResult.error) {
            content += `      Error: ${testResult.error.message}\n`;
          }
        }
      }
    }

    await fs.writeFile(filePath, content, "utf-8");
    return filePath;
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private escapeHtml(text: string): string {
    const div = { innerHTML: "" } as any;
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  async archiveOldReports(): Promise<void> {
    if (this.config.archiveAfterDays <= 0) {
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.archiveAfterDays);

    try {
      const files = await fs.readdir(this.config.outputDir);

      for (const file of files) {
        const filePath = path.join(this.config.outputDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Archived old report: ${file}`);
        }
      }
    } catch (error) {
      console.warn("Failed to archive old reports:", error);
    }
  }
}
