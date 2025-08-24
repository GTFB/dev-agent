#!/usr/bin/env bun

/**
 * Coverage Badge Update Script
 * Updates the test coverage badge in README.md with dynamic values
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";



async function updateCoverageBadge(): Promise<void> {
  try {
    // Run tests to get coverage data
    const testOutput = await Bun.spawn(["bun", "test", "--coverage"], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(testOutput.stdout).text();
    const errorOutput = await new Response(testOutput.stderr).text();

    // Parse coverage from test output
    const coverageMatch = output.match(/Function coverage: (\d+(?:\.\d+)?)%/);
    const lineCoverageMatch = output.match(/Line coverage: (\d+(?:\.\d+)?)%/);

    if (!coverageMatch || !lineCoverageMatch) {
      console.error("❌ Could not parse coverage data from test output");
      console.error("Test output:", output);
      console.error("Error output:", errorOutput);
      process.exit(1);
    }

    const functionCoverage = parseFloat(coverageMatch[1]);
    const lineCoverage = parseFloat(lineCoverageMatch[1]);

    // Determine badge color based on coverage
    const getBadgeColor = (coverage: number): string => {
      if (coverage >= 90) return "brightgreen";
      if (coverage >= 80) return "green";
      if (coverage >= 70) return "yellowgreen";
      if (coverage >= 60) return "yellow";
      if (coverage >= 50) return "orange";
      return "red";
    };

    const functionColor = getBadgeColor(functionCoverage);
    const lineColor = getBadgeColor(lineCoverage);

    // Create dynamic badges
    const functionBadge = `[![Function Coverage](https://img.shields.io/badge/function%20coverage-${functionCoverage}%25-${functionColor}.svg)](https://github.com/your-org/dev-agent)`;
    const lineBadge = `[![Line Coverage](https://img.shields.io/badge/line%20coverage-${lineCoverage}%25-${lineColor}.svg)](https://github.com/your-org/dev-agent)`;

    // Read README.md
    const readmePath = join(process.cwd(), "README.md");
    let readmeContent = readFileSync(readmePath, "utf8");

    // Replace existing coverage badges or add new ones
    const coverageBadgeRegex = /\[!\[.*?coverage.*?\]\(.*?\)\]\(.*?\)/g;
    
    if (coverageBadgeRegex.test(readmeContent)) {
      // Replace existing badges
      readmeContent = readmeContent.replace(
        /\[!\[Test Coverage\].*?\]\(.*?\)/,
        functionBadge
      );
      
      // Add line coverage badge if it doesn't exist
      if (!readmeContent.includes("line coverage")) {
        readmeContent = readmeContent.replace(
          functionBadge,
          `${functionBadge} ${lineBadge}`
        );
      }
    } else {
      // Add new badges after the first heading
      const firstHeadingIndex = readmeContent.indexOf("## ");
      if (firstHeadingIndex !== -1) {
        const beforeHeading = readmeContent.substring(0, firstHeadingIndex);
        const afterHeading = readmeContent.substring(firstHeadingIndex);
        readmeContent = `${beforeHeading}${functionBadge} ${lineBadge}\n\n${afterHeading}`;
      }
    }

    // Write updated README.md
    writeFileSync(readmePath, readmeContent, "utf8");

    console.log("✅ Coverage badges updated successfully!");
    console.log(`📊 Function Coverage: ${functionCoverage}% (${functionColor})`);
    console.log(`📊 Line Coverage: ${lineCoverage}% (${lineColor})`);
    console.log("📝 README.md has been updated");

  } catch (error) {
    console.error("❌ Failed to update coverage badge:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  updateCoverageBadge();
}
