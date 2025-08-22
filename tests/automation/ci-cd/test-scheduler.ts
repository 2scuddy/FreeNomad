import { SchedulingConfig } from "./pipeline-integration";
import * as cron from "node-cron";

export interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  callback: () => Promise<void> | void;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
}

export interface SchedulerStats {
  totalTasks: number;
  activeTasks: number;
  totalRuns: number;
  lastRunTime?: Date;
  uptime: number;
}

export class TestScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private startTime: Date = new Date();
  private isInitialized: boolean = false;

  constructor(private config: SchedulingConfig) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn("Scheduler already initialized");
      return;
    }

    console.log("Initializing test scheduler...");

    // Validate cron expression
    if (this.config.cron && !cron.validate(this.config.cron)) {
      throw new Error(`Invalid cron expression: ${this.config.cron}`);
    }

    this.isInitialized = true;
    console.log("Test scheduler initialized successfully");
  }

  schedule(
    cronExpression: string,
    callback: () => Promise<void> | void,
    taskName: string = "default"
  ): string {
    if (!this.isInitialized) {
      throw new Error("Scheduler not initialized. Call initialize() first.");
    }

    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const scheduledTask: ScheduledTask = {
      id: taskId,
      name: taskName,
      cronExpression,
      callback,
      enabled: true,
      runCount: 0,
    };

    // Create cron job
    const cronJob = cron.schedule(
      cronExpression,
      async () => {
        if (scheduledTask.enabled) {
          console.log(`Executing scheduled task: ${taskName} (${taskId})`);

          try {
            scheduledTask.lastRun = new Date();
            scheduledTask.runCount++;

            await callback();

            console.log(`Scheduled task completed: ${taskName}`);
          } catch (error) {
            console.error(`Scheduled task failed: ${taskName}`, error);

            // Handle retry logic if configured
            if (this.config.retryFailedTests && this.config.maxRetries > 0) {
              await this.retryTask(scheduledTask, error as Error);
            }
          }
        }
      },
      {
        timezone: this.config.timezone || "UTC",
      }
    );

    // Calculate next run time
    scheduledTask.nextRun = this.getNextRunTime(cronExpression);

    this.tasks.set(taskId, scheduledTask);
    this.cronJobs.set(taskId, cronJob);

    // Start the job
    cronJob.start();

    console.log(
      `Scheduled task '${taskName}' with expression '${cronExpression}' (ID: ${taskId})`
    );
    console.log(`Next run: ${scheduledTask.nextRun}`);

    return taskId;
  }

  private async retryTask(
    task: ScheduledTask,
    originalError: Error
  ): Promise<void> {
    let retryCount = 0;

    while (retryCount < this.config.maxRetries) {
      retryCount++;
      console.log(
        `Retrying task '${task.name}' (attempt ${retryCount}/${this.config.maxRetries})`
      );

      try {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s, etc.
        await this.sleep(delay);

        await task.callback();

        console.log(`Task '${task.name}' succeeded on retry ${retryCount}`);
        return; // Success, exit retry loop
      } catch (retryError) {
        console.error(
          `Retry ${retryCount} failed for task '${task.name}':`,
          retryError
        );

        if (retryCount === this.config.maxRetries) {
          console.error(
            `All retries exhausted for task '${task.name}'. Original error:`,
            originalError
          );
        }
      }
    }
  }

  unschedule(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    const cronJob = this.cronJobs.get(taskId);

    if (!task || !cronJob) {
      console.warn(`Task not found: ${taskId}`);
      return false;
    }

    cronJob.stop();
    cronJob.destroy();

    this.tasks.delete(taskId);
    this.cronJobs.delete(taskId);

    console.log(`Unscheduled task: ${task.name} (${taskId})`);
    return true;
  }

  enableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.warn(`Task not found: ${taskId}`);
      return false;
    }

    task.enabled = true;
    console.log(`Enabled task: ${task.name} (${taskId})`);
    return true;
  }

  disableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      console.warn(`Task not found: ${taskId}`);
      return false;
    }

    task.enabled = false;
    console.log(`Disabled task: ${task.name} (${taskId})`);
    return true;
  }

  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(task => task.enabled);
  }

  getStats(): SchedulerStats {
    const allTasks = this.getAllTasks();
    const activeTasks = this.getActiveTasks();
    const totalRuns = allTasks.reduce((sum, task) => sum + task.runCount, 0);
    const lastRunTimes = allTasks
      .map(task => task.lastRun)
      .filter(time => time !== undefined) as Date[];

    return {
      totalTasks: allTasks.length,
      activeTasks: activeTasks.length,
      totalRuns,
      lastRunTime:
        lastRunTimes.length > 0
          ? new Date(Math.max(...lastRunTimes.map(d => d.getTime())))
          : undefined,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  async runTaskNow(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    console.log(`Manually executing task: ${task.name} (${taskId})`);

    try {
      task.lastRun = new Date();
      task.runCount++;

      await task.callback();

      console.log(`Manual task execution completed: ${task.name}`);
    } catch (error) {
      console.error(`Manual task execution failed: ${task.name}`, error);
      throw error;
    }
  }

  private getNextRunTime(cronExpression: string): Date {
    // Simple implementation - in a real scenario, you'd use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 60000); // Default to 1 minute from now

    // This is a simplified implementation
    // A real implementation would parse the cron expression properly
    return nextRun;
  }

  async stop(): Promise<void> {
    console.log("Stopping test scheduler...");

    // Stop all cron jobs
    for (const [taskId, cronJob] of this.cronJobs.entries()) {
      cronJob.stop();
      cronJob.destroy();
      console.log(`Stopped task: ${taskId}`);
    }

    this.tasks.clear();
    this.cronJobs.clear();
    this.isInitialized = false;

    console.log("Test scheduler stopped");
  }

  updateConfig(newConfig: SchedulingConfig): void {
    this.config = newConfig;

    if (!this.config.enabled) {
      // Disable all tasks if scheduling is disabled
      for (const task of this.tasks.values()) {
        task.enabled = false;
      }
    }
  }

  // Utility method for creating common cron expressions
  static createCronExpression(options: {
    minute?: number | string;
    hour?: number | string;
    dayOfMonth?: number | string;
    month?: number | string;
    dayOfWeek?: number | string;
  }): string {
    const {
      minute = "*",
      hour = "*",
      dayOfMonth = "*",
      month = "*",
      dayOfWeek = "*",
    } = options;

    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }

  // Predefined common schedules
  static readonly SCHEDULES = {
    EVERY_MINUTE: "* * * * *",
    EVERY_5_MINUTES: "*/5 * * * *",
    EVERY_15_MINUTES: "*/15 * * * *",
    EVERY_30_MINUTES: "*/30 * * * *",
    EVERY_HOUR: "0 * * * *",
    EVERY_2_HOURS: "0 */2 * * *",
    EVERY_6_HOURS: "0 */6 * * *",
    EVERY_12_HOURS: "0 */12 * * *",
    DAILY_AT_MIDNIGHT: "0 0 * * *",
    DAILY_AT_NOON: "0 12 * * *",
    WEEKLY_SUNDAY_MIDNIGHT: "0 0 * * 0",
    MONTHLY_FIRST_DAY: "0 0 1 * *",
    WORKDAYS_9AM: "0 9 * * 1-5",
    WORKDAYS_6PM: "0 18 * * 1-5",
  };

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
