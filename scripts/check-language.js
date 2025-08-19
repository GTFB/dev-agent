#!/usr/bin/env node

/**
 * Language Check Script for Git Hooks
 * Automatically checks language compliance in staged files
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File extensions to check
const TEXT_EXTENSIONS = [
  '.md', '.txt', '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cpp', '.c',
  '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'
];

// Files to ignore
const IGNORE_FILES = [
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
];

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.includes(ext);
}

function shouldIgnoreFile(filePath) {
  return IGNORE_FILES.some(ignore => filePath.includes(ignore));
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('No staged files or not a git repository');
    return [];
  }
}

function checkFileLanguage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple Russian character detection
    const russianChars = content.match(/[\u0400-\u04FF\u0500-\u052F]/gi);
    if (russianChars) {
      const russianCount = russianChars.length;
      const totalChars = content.replace(/\s/g, '').length;
      const russianPercentage = (russianCount / totalChars * 100).toFixed(1);
      
      return {
        file: filePath,
        hasRussian: true,
        russianCount,
        totalChars,
        russianPercentage,
        lines: content.split('\n').map((line, index) => ({
          lineNumber: index + 1,
          content: line,
          hasRussian: /[\u0400-\u04FF\u0500-\u052F]/i.test(line)
        })).filter(line => line.hasRussian)
      };
    }
    
    return {
      file: filePath,
      hasRussian: false
    };
  } catch (error) {
    return {
      file: filePath,
      error: error.message
    };
  }
}

function main() {
  console.log('🔍 Checking language compliance in staged files...\n');
  
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('✅ No staged files to check');
    return 0;
  }
  
  const textFiles = stagedFiles.filter(file => isTextFile(file) && !shouldIgnoreFile(file));
  if (textFiles.length === 0) {
    console.log('✅ No text files to check');
    return 0;
  }
  
  console.log(`📁 Found ${textFiles.length} text files to check:\n`);
  
  const results = textFiles.map(checkFileLanguage);
  const filesWithRussian = results.filter(result => result.hasRussian);
  
  if (filesWithRussian.length === 0) {
    console.log('✅ All files pass language compliance check');
    return 0;
  }
  
  console.log('🚨 Files with Russian text detected:\n');
  
  filesWithRussian.forEach(result => {
    console.log(`📄 ${result.file}`);
    console.log(`   Russian characters: ${result.russianCount}/${result.totalChars} (${result.russianPercentage}%)`);
    
    if (result.lines && result.lines.length > 0) {
      console.log('   Lines with Russian text:');
      result.lines.slice(0, 5).forEach(line => {
        console.log(`     ${line.lineNumber}: ${line.content.trim()}`);
      });
      if (result.lines.length > 5) {
        console.log(`     ... and ${result.lines.length - 5} more lines`);
      }
    }
    console.log('');
  });
  
  console.log('💡 Recommendations:');
  console.log('   - Translate all Russian text to English');
  console.log('   - Use English for documentation, comments, and user interfaces');
  console.log('   - Consider using Dev Agent language validation middleware');
  console.log('');
  
  console.log('❌ Language compliance check failed');
  console.log('   Commit blocked. Please fix language issues before committing.');
  
  return 1;
}

// Run the script
const exitCode = main();
process.exit(exitCode);
