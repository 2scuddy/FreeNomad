#!/usr/bin/env node

/**
 * GitHub Branch Protection Setup Script
 *
 * This script automatically configures branch protection rules for the repository
 * using the GitHub REST API.
 *
 * Prerequisites:
 * 1. GitHub personal access token with repo permissions
 * 2. Node.js environment
 * 3. Repository admin access
 *
 * Usage:
 * GITHUB_TOKEN=your_token node .github/setup-branch-protection.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const https = require("https");
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-require-imports */

// Configuration
const CONFIG_FILE = path.join(__dirname, "branch-protection-setup.json");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER =
  process.env.GITHUB_REPOSITORY?.split("/")[0] || "your-username";
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split("/")[1] || "FreeNomad";

// Validate environment
if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN environment variable is required");
  console.error(
    "   Set it with: export GITHUB_TOKEN=your_personal_access_token"
  );
  process.exit(1);
}

// Load configuration
let config;
try {
  const configData = fs.readFileSync(CONFIG_FILE, "utf8");
  config = JSON.parse(configData);
} catch (error) {
  console.error("❌ Error loading configuration:", error.message);
  process.exit(1);
}

/**
 * Make GitHub API request
 */
function makeGitHubRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Branch-Protection-Setup-Script",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, res => {
      let responseData = "";

      res.on("data", chunk => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(
              new Error(
                `HTTP ${res.statusCode}: ${parsedData.message || responseData}`
              )
            );
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Check if branch exists
 */
async function checkBranchExists(branchName) {
  try {
    await makeGitHubRequest(
      "GET",
      `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}`
    );
    return true;
  } catch (error) {
    if (error.message.includes("404")) {
      return false;
    }
    throw error;
  }
}

/**
 * Create branch if it doesn't exist
 */
async function createBranch(branchName, fromBranch = "main") {
  try {
    console.log(`📝 Creating branch: ${branchName}`);

    // Get the SHA of the source branch
    const sourceRef = await makeGitHubRequest(
      "GET",
      `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${fromBranch}`
    );
    const sha = sourceRef.object.sha;

    // Create the new branch
    await makeGitHubRequest(
      "POST",
      `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`,
      {
        ref: `refs/heads/${branchName}`,
        sha: sha,
      }
    );

    console.log(`✅ Branch ${branchName} created successfully`);
  } catch (error) {
    console.error(`❌ Failed to create branch ${branchName}:`, error.message);
    throw error;
  }
}

/**
 * Set up branch protection
 */
async function setupBranchProtection(branchName, protectionConfig) {
  try {
    console.log(`🔒 Setting up protection for branch: ${branchName}`);

    await makeGitHubRequest(
      "PUT",
      `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}/protection`,
      protectionConfig
    );

    console.log(`✅ Protection rules applied to ${branchName}`);
  } catch (error) {
    console.error(`❌ Failed to protect branch ${branchName}:`, error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setupBranchProtections() {
  console.log("🚀 Starting GitHub branch protection setup...");
  console.log(`📁 Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log("");

  const branches = Object.keys(config.branch_protection_rules);

  for (const branchName of branches) {
    try {
      console.log(`\n🔍 Processing branch: ${branchName}`);

      // Check if branch exists
      const branchExists = await checkBranchExists(branchName);

      if (!branchExists) {
        console.log(`⚠️  Branch ${branchName} does not exist`);

        if (branchName === "main") {
          console.log("❌ Main branch must exist. Please create it first.");
          continue;
        }

        // Create branch from main
        await createBranch(branchName, "main");
      } else {
        console.log(`✅ Branch ${branchName} exists`);
      }

      // Apply protection rules
      const protectionConfig =
        config.branch_protection_rules[branchName].protection;
      await setupBranchProtection(branchName, protectionConfig);
    } catch (error) {
      console.error(`❌ Error processing branch ${branchName}:`, error.message);
      console.error("   Continuing with next branch...");
    }
  }

  console.log("\n🎉 Branch protection setup completed!");
  console.log("\n📋 Next steps:");
  console.log("   1. Verify protection rules in GitHub repository settings");
  console.log("   2. Set up team permissions if using team restrictions");
  console.log("   3. Configure Vercel deployment settings");
  console.log("   4. Test the workflow with a feature branch");
}

/**
 * Verify setup
 */
async function verifySetup() {
  console.log("\n🔍 Verifying branch protection setup...");

  const branches = Object.keys(config.branch_protection_rules);

  for (const branchName of branches) {
    try {
      const protection = await makeGitHubRequest(
        "GET",
        `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branchName}/protection`
      );

      console.log(`✅ ${branchName}: Protection rules active`);
      console.log(
        `   - Required status checks: ${protection.required_status_checks?.contexts?.length || 0}`
      );
      console.log(
        `   - Required reviews: ${protection.required_pull_request_reviews?.required_approving_review_count || 0}`
      );
      console.log(
        `   - Enforce admins: ${protection.enforce_admins?.enabled ? "Yes" : "No"}`
      );
    } catch (error) {
      console.log(`❌ ${branchName}: ${error.message}`);
    }
  }
}

// Run the setup
if (require.main === module) {
  setupBranchProtections()
    .then(() => verifySetup())
    .catch(error => {
      console.error("\n💥 Setup failed:", error.message);
      process.exit(1);
    });
}

module.exports = {
  setupBranchProtections,
  verifySetup,
  makeGitHubRequest,
};
