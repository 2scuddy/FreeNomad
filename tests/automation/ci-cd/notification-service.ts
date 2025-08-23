import { NotificationConfig } from "../config/browser-config";
import { PipelineResult } from "./pipeline-integration";
import axios from "axios";
import * as nodemailer from "nodemailer";

export interface StartNotificationData {
  pipelineId: string;
  environment: string;
  triggeredBy: string;
  timestamp: string;
}

export interface FailureNotificationData {
  pipelineId: string;
  error: Error;
  environment: string;
  duration: number;
}

export interface WebhookNotificationData {
  type: "start" | "completion" | "failure" | "test";
  pipelineId: string;
  environment: string;
  timestamp: string;
  data:
    | StartNotificationData
    | PipelineResult
    | FailureNotificationData
    | { message: string };
}

export class NotificationService {
  private emailTransporter?: nodemailer.Transporter;

  constructor(private config: NotificationConfig) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter(): void {
    if (this.config.email.enabled && this.config.email.smtpConfig) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: this.config.email.smtpConfig.host,
          port: this.config.email.smtpConfig.port,
          secure: this.config.email.smtpConfig.secure,
          auth: {
            user: this.config.email.smtpConfig.auth.user,
            pass: this.config.email.smtpConfig.auth.pass,
          },
        });
      } catch (error) {
        console.warn("Failed to initialize email transporter:", error);
      }
    }
  }

  async sendStartNotification(data: StartNotificationData): Promise<void> {
    const message = `🚀 Test Pipeline Started\n\nPipeline ID: ${data.pipelineId}\nEnvironment: ${data.environment}\nTriggered by: ${data.triggeredBy}\nTimestamp: ${data.timestamp}`;

    await Promise.allSettled([
      this.sendEmailNotification("Test Pipeline Started", message),
      this.sendSlackNotification(message),
      this.sendWebhookNotification({
        type: "start",
        pipelineId: data.pipelineId,
        environment: data.environment,
        timestamp: data.timestamp,
        data,
      }),
    ]);
  }

  async sendCompletionNotification(result: PipelineResult): Promise<void> {
    const statusEmoji =
      result.status === "passed"
        ? "✅"
        : result.status === "failed"
          ? "❌"
          : "⚠️";
    const message = `${statusEmoji} Test Pipeline Completed\n\nPipeline ID: ${result.pipelineId}\nEnvironment: ${result.environment}\nStatus: ${result.status}\nDuration: ${this.formatDuration(result.duration)}\nPass Rate: ${result.summary.passRate.toFixed(1)}%\nTests: ${result.summary.passedTests}/${result.summary.totalTests} passed`;

    await Promise.allSettled([
      this.sendEmailNotification(
        `Test Pipeline ${result.status}`,
        message,
        result
      ),
      this.sendSlackNotification(message),
      this.sendWebhookNotification({
        type: "completion",
        pipelineId: result.pipelineId,
        environment: result.environment,
        timestamp: result.timestamp,
        data: result,
      }),
    ]);
  }

  async sendFailureNotification(data: FailureNotificationData): Promise<void> {
    const message = `❌ Test Pipeline Failed\n\nPipeline ID: ${data.pipelineId}\nEnvironment: ${data.environment}\nDuration: ${this.formatDuration(data.duration)}\nError: ${data.error.message}`;

    // Send immediate failure notifications
    await Promise.allSettled([
      this.sendEmailNotification("Test Pipeline Failed", message),
      this.sendSlackNotification(message, true), // Mark as urgent
      this.sendWebhookNotification({
        type: "failure",
        pipelineId: data.pipelineId,
        environment: data.environment,
        timestamp: new Date().toISOString(),
        data,
      }),
    ]);
  }

  private async sendEmailNotification(
    subject: string,
    message: string,
    result?: PipelineResult
  ): Promise<void> {
    if (!this.config.email.enabled || !this.emailTransporter) {
      return;
    }

    try {
      const htmlContent = this.generateEmailHtml(subject, message, result);

      const mailOptions = {
        from: this.config.email.smtpConfig?.auth.user,
        to: this.config.email.recipients.join(", "),
        subject: `[Test Automation] ${subject}`,
        text: message,
        html: htmlContent,
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log("Email notification sent successfully");
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  }

  private generateEmailHtml(
    subject: string,
    message: string,
    result?: PipelineResult
  ): string {
    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: #f0f0f0; padding: 15px; border-radius: 5px; }
            .content { margin: 20px 0; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            .success { color: #28a745; }
            .failure { color: #dc3545; }
            .warning { color: #ffc107; }
            table { border-collapse: collapse; width: 100%; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${subject}</h2>
          </div>
          <div class="content">
            <pre>${message}</pre>
          </div>
    `;

    if (result) {
      const statusClass =
        result.status === "passed"
          ? "success"
          : result.status === "failed"
            ? "failure"
            : "warning";

      html += `
        <div class="summary">
          <h3>Test Summary</h3>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Status</td><td class="${statusClass}">${result.status.toUpperCase()}</td></tr>
            <tr><td>Total Tests</td><td>${result.summary.totalTests}</td></tr>
            <tr><td>Passed</td><td class="success">${result.summary.passedTests}</td></tr>
            <tr><td>Failed</td><td class="failure">${result.summary.failedTests}</td></tr>
            <tr><td>Skipped</td><td>${result.summary.skippedTests}</td></tr>
            <tr><td>Pass Rate</td><td>${result.summary.passRate.toFixed(1)}%</td></tr>
            <tr><td>Duration</td><td>${this.formatDuration(result.duration)}</td></tr>
          </table>
        </div>
      `;
    }

    html += `
        </body>
      </html>
    `;

    return html;
  }

  private async sendSlackNotification(
    message: string,
    urgent: boolean = false
  ): Promise<void> {
    if (!this.config.slack.enabled || !this.config.slack.webhookUrl) {
      return;
    }

    try {
      const payload = {
        text: message,
        channel: this.config.slack.channel,
        username: "Test Automation Bot",
        icon_emoji: ":robot_face:",
        attachments: urgent
          ? [
              {
                color: "danger",
                text: "Immediate attention required!",
              },
            ]
          : undefined,
      };

      await axios.post(this.config.slack.webhookUrl, payload);
      console.log("Slack notification sent successfully");
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
    }
  }

  private async sendWebhookNotification(
    data: WebhookNotificationData
  ): Promise<void> {
    if (!this.config.webhook.enabled || !this.config.webhook.url) {
      return;
    }

    try {
      await axios.post(
        this.config.webhook.url,
        {
          source: "test-automation",
          ...data,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...this.config.webhook.headers,
          },
        }
      );
      console.log("Webhook notification sent successfully");
    } catch (error) {
      console.error("Failed to send webhook notification:", error);
    }
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

  async testNotifications(): Promise<{
    email: boolean;
    slack: boolean;
    webhook: boolean;
  }> {
    const results = {
      email: false,
      slack: false,
      webhook: false,
    };

    // Test email
    if (this.config.email.enabled) {
      try {
        await this.sendEmailNotification(
          "Test Notification",
          "This is a test notification from the automation system."
        );
        results.email = true;
      } catch (error) {
        console.error("Email test failed:", error);
      }
    }

    // Test Slack
    if (this.config.slack.enabled) {
      try {
        await this.sendSlackNotification(
          "🧪 Test notification from automation system"
        );
        results.slack = true;
      } catch (error) {
        console.error("Slack test failed:", error);
      }
    }

    // Test webhook
    if (this.config.webhook.enabled) {
      try {
        await this.sendWebhookNotification({
          type: "test",
          pipelineId: "test-pipeline",
          environment: "test",
          timestamp: new Date().toISOString(),
          data: { message: "Test notification from automation system" },
        });
        results.webhook = true;
      } catch (error) {
        console.error("Webhook test failed:", error);
      }
    }

    return results;
  }

  updateConfig(newConfig: NotificationConfig): void {
    this.config = newConfig;
    this.initializeEmailTransporter();
  }
}
