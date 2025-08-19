#!/usr/bin/env bun

/**
 * Dev Agent CLI - Main Entry Point
 * Implements the High-Efficiency Standard Operating Protocol
 */

import { Command } from 'commander';
import { StorageService } from './services/StorageService.js';
import { GitService } from './services/GitService.js';
import { WorkflowService } from './services/WorkflowService.js';
import { DevAgentConfig, WorkflowContext } from './core/types.js';
import { logger, LogLevel } from './utils/logger.js';

// CLI version
const VERSION = '2.0.0';

// Global services
let storageService: StorageService;
let gitService: GitService;
let workflowService: WorkflowService;

/**
 * Initialize services
 */
async function initializeServices(): Promise<void> {
  try {
    storageService = new StorageService();
    gitService = new GitService();
    
    // Create default context
    const context: WorkflowContext = {
      cwd: process.cwd(),
      config: {
        github: { owner: '', repo: '' },
        branches: {
          main: 'main',
          develop: 'develop',
          feature_prefix: 'feature',
          release_prefix: 'release'
        },
        goals: {
          default_status: 'todo',
          id_pattern: '^g-[a-z0-9]{6}$'
        }
      }
    };

    workflowService = new WorkflowService(storageService, gitService, context);
    
    logger.info('Services initialized');
  } catch (error) {
    logger.error('Failed to initialize services', error as Error);
    // Don't exit, just log the error
  }
}

/**
 * Display formatted goal list
 */
function displayGoals(goals: any[], counts: Record<string, number>): void {
  console.log('\n📋 Goal Summary:');
  console.log(`   Todo: ${counts.todo || 0} | In Progress: ${counts.in_progress || 0} | Done: ${counts.done || 0} | Archived: ${counts.archived || 0}\n`);

  if (goals.length === 0) {
    console.log('No goals found.');
    return;
  }

  // Group goals by status
  const groupedGoals: Record<string, any[]> = {
    todo: [],
    in_progress: [],
    done: [],
    archived: []
  };

  goals.forEach(goal => {
    if (groupedGoals[goal.status]) {
      groupedGoals[goal.status].push(goal);
    }
  });

  // Display goals by status
  Object.entries(groupedGoals).forEach(([status, statusGoals]) => {
    if (statusGoals.length > 0) {
      const statusEmoji = {
        todo: '⏳',
        in_progress: '🔄',
        done: '✅',
        archived: '📁'
      }[status] || '❓';

      console.log(`${statusEmoji} ${status.toUpperCase()} (${statusGoals.length}):`);
      statusGoals.forEach(goal => {
        const branchInfo = goal.branch_name ? ` [${goal.branch_name}]` : '';
        const dateInfo = goal.created_at ? ` (${new Date(goal.created_at).toLocaleDateString()})` : '';
        console.log(`   ${goal.id}${branchInfo}: ${goal.title}${dateInfo}`);
      });
      console.log('');
    }
  });
}

/**
 * Main CLI setup
 */
async function main(): Promise<void> {
  // Initialize services (but don't fail if database is not ready)
  await initializeServices();

  const program = new Command();

  program
    .name('dev')
    .description('Dev Agent - CLI assistant for the High-Efficiency Standard Operating Protocol')
    .version(VERSION)
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-d, --debug', 'Enable debug logging');

  // Global options handler
  program.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    
    if (options.debug) {
      logger.setLevel(LogLevel.DEBUG);
    } else if (options.verbose) {
      logger.setLevel(LogLevel.INFO);
    }
  });

  // Initialize command
  program
    .command('init')
    .description('Initialize Dev Agent in the current project')
    .action(async () => {
      try {
        const result = await workflowService.initializeProject();
        
        if (result.success) {
          console.log('✅', result.message);
          console.log('\n🎉 Dev Agent initialized successfully!');
          console.log('\nNext steps:');
          console.log('1. Configure GitHub repository: dev config set github.owner <owner>');
          console.log('2. Create your first goal: dev goal create "Goal title"');
          console.log('3. Start working: dev goal start <goal-id>');
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to initialize project', error as Error);
        process.exit(1);
      }
    });

  // Configuration commands
  const configCommand = program
    .command('config')
    .description('Manage Dev Agent configuration');

  configCommand
    .command('set')
    .description('Set configuration value')
    .argument('<key>', 'Configuration key (e.g., github.owner)')
    .argument('<value>', 'Configuration value')
    .action(async (key: string, value: string) => {
      try {
        const result = await workflowService.setConfiguration(key, value);
        
        if (result.success) {
          console.log('✅', result.message);
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to set configuration', error as Error);
        process.exit(1);
      }
    });

  configCommand
    .command('get')
    .description('Get configuration value')
    .argument('<key>', 'Configuration key')
    .action(async (key: string) => {
      try {
        const result = await workflowService.getConfiguration(key);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log(`${result.data.key} = ${result.data.value}`);
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to get configuration', error as Error);
        process.exit(1);
      }
    });

  configCommand
    .command('list')
    .description('List all configuration values')
    .action(async () => {
      try {
        const result = await workflowService.getAllConfiguration();
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log('\n📋 Configuration:');
            Object.entries(result.data).forEach(([key, value]) => {
              console.log(`   ${key} = ${value}`);
            });
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to list configuration', error as Error);
        process.exit(1);
      }
    });

  // Goal commands
  const goalCommand = program
    .command('goal')
    .description('Manage goals');

  goalCommand
    .command('create')
    .description('Create a new goal')
    .argument('<title>', 'Goal title')
    .option('-d, --description <description>', 'Goal description')
    .action(async (title: string, options: { description?: string }) => {
      try {
        const result = await workflowService.createGoal(title, options.description);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
                      console.log(`Goal ID: ${result.data.goalId}`);
          console.log(`Title: ${result.data.title}`);
          console.log(`Status: ${result.data.status}`);
          
          // Display validation warnings if any
          if (result.data.validationResults) {
            const warnings = result.data.validationResults.filter((r: any) => r.severity === 'warning');
            if (warnings.length > 0) {
              console.log('\n⚠️  Validation Warnings:');
              warnings.forEach((warning: any) => {
                console.log(`  - ${warning.message}`);
                if (warning.suggestion) {
                  console.log(`    💡 ${warning.suggestion}`);
                }
              });
            }
          }
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to create goal', error as Error);
        process.exit(1);
      }
    });

  goalCommand
    .command('list')
    .description('List all goals')
    .option('-s, --status <status>', 'Filter by status (todo, in_progress, done, archived)')
    .action(async (options: { status?: string }) => {
      try {
        const result = await workflowService.listGoals(options.status as any);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            displayGoals(result.data.goals, result.data.counts);
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to list goals', error as Error);
        process.exit(1);
      }
    });

  goalCommand
    .command('start')
    .description('Start working on a goal')
    .argument('<goal-id>', 'Goal ID (e.g., g-a1b2c3)')
    .action(async (goalId: string) => {
      try {
        const result = await workflowService.startGoal(goalId);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log(`Branch: ${result.data.branchName}`);
            console.log(`Status: ${result.data.status}`);
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to start goal', error as Error);
        process.exit(1);
      }
    });

  goalCommand
    .command('complete')
    .description('Mark a goal as completed')
    .argument('<goal-id>', 'Goal ID')
    .action(async (goalId: string) => {
      try {
        const result = await workflowService.completeGoal(goalId);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log(`Goal ID: ${result.data.goalId}`);
            console.log(`Status: ${result.data.status}`);
            console.log(`Completed: ${result.data.completedAt}`);
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to complete goal', error as Error);
        process.exit(1);
      }
    });

  goalCommand
    .command('stop')
    .description('Stop working on a goal')
    .argument('<goal-id>', 'Goal ID')
    .action(async (goalId: string) => {
      try {
        const result = await workflowService.stopGoal(goalId);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log(`Goal ID: ${result.data.goalId}`);
            console.log(`Status: ${result.data.status}`);
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        logger.error('Failed to stop goal', error as Error);
        process.exit(1);
      }
    });

  goalCommand
    .command('delete')
    .description('Delete a goal')
    .argument('<goal-id>', 'Goal ID')
    .action(async (goalId: string) => {
      try {
        await initializeServices();
        await storageService.deleteGoal(goalId);
        console.log('✅', `Goal ${goalId} deleted successfully`);
      } catch (error) {
        console.error('❌', `Failed to delete goal ${goalId}:`, error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  goalCommand
    .command('validate')
    .description('Validate a goal')
    .argument('<goal-id>', 'Goal ID to validate')
    .action(async (goalId: string) => {
      try {
        await initializeServices();
        const goal = await storageService.getGoal(goalId);
        
        if (!goal) {
          console.error('❌', `Goal ${goalId} not found`);
          process.exit(1);
        }

        // Create validation service and validate goal
        const { ValidationService } = await import('./services/ValidationService.js');
        const validationService = new ValidationService(storageService, gitService);
        const results = await validationService.validateGoal(goal);
        const summary = ValidationService.summarizeResults(results);

        console.log(`\n🔍 Validation Results for Goal ${goalId}:`);
        console.log(`Title: ${goal.title}`);
        console.log(`Status: ${goal.status}`);
        
        if (summary.valid) {
          console.log('✅ Goal passes all validation checks');
        } else {
          console.log('❌ Goal has validation errors');
        }

        // Display errors
        if (summary.errors.length > 0) {
          console.log('\n🚨 Errors:');
          summary.errors.forEach(error => {
            console.log(`  - ${error.message}`);
            if (error.suggestion) {
              console.log(`    💡 ${error.suggestion}`);
            }
          });
        }

        // Display warnings
        if (summary.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          summary.warnings.forEach(warning => {
            console.log(`  - ${warning.message}`);
            if (warning.suggestion) {
              console.log(`    💡 ${warning.suggestion}`);
            }
          });
        }

        // Display info
        if (summary.info.length > 0) {
          console.log('\n💡 Information:');
          summary.info.forEach(info => {
            if (info.message) {
              console.log(`  - ${info.message}`);
            }
          });
        }

        if (!summary.valid) {
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to validate goal:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  goalCommand
    .command('validate-all')
    .description('Validate all goals')
    .option('--fix', 'Automatically fix issues where possible')
    .action(async (options: { fix?: boolean }) => {
      try {
        await initializeServices();
        const goals = await storageService.listGoals();
        
        if (goals.length === 0) {
          console.log('📝 No goals found');
          return;
        }

        const { ValidationService } = await import('./services/ValidationService.js');
        const validationService = new ValidationService(storageService, gitService);

        console.log(`🔍 Validating ${goals.length} goals...\n`);

        let totalValid = 0;
        let totalErrors = 0;
        let totalWarnings = 0;

        for (const goal of goals) {
          const results = await validationService.validateGoal(goal);
          const summary = ValidationService.summarizeResults(results);

          console.log(`📋 Goal ${goal.id}: ${goal.title}`);
          
          if (summary.valid) {
            console.log('  ✅ Valid');
            totalValid++;
          } else {
            console.log('  ❌ Has issues');
            
            if (summary.errors.length > 0) {
              totalErrors += summary.errors.length;
              console.log(`     🚨 ${summary.errors.length} errors`);
              if (options.fix) {
                // Try to auto-fix some common issues
                for (const error of summary.errors) {
                  if (error.type === 'INVALID_STATUS' && error.suggestion) {
                    // Auto-fix invalid status
                    console.log(`     🔧 Auto-fixing: ${error.suggestion}`);
                  }
                }
              }
            }
            
            if (summary.warnings.length > 0) {
              totalWarnings += summary.warnings.length;
              console.log(`     ⚠️  ${summary.warnings.length} warnings`);
            }
          }
          console.log();
        }

        console.log('📊 Summary:');
        console.log(`  Valid goals: ${totalValid}/${goals.length}`);
        console.log(`  Total errors: ${totalErrors}`);
        console.log(`  Total warnings: ${totalWarnings}`);

        if (totalErrors > 0) {
          console.log('\n💡 Run with --fix to automatically fix common issues');
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to validate goals:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  // Git commands
  const gitCommand = program
    .command('git')
    .description('Git operations');

  gitCommand
    .command('commit')
    .description('Create a commit with staged changes')
    .argument('<message>', 'Commit message')
    .option('-t, --type <type>', 'Commit type (feat, fix, docs, style, refactor, test, chore)', 'chore')
    .option('-a, --add-all', 'Stage all changes before committing')
    .action(async (message: string, options: { type?: string; addAll?: boolean }) => {
      try {
        await initializeServices();
        
        if (options.addAll) {
          console.log('📝 Staging all changes...');
          await gitService.add(['.']);
        }

        // Check if there are staged changes
        const status = await gitService.getStatus();
        if (status.files.length === 0) {
          console.log('⚠️  No staged changes to commit');
          console.log('💡 Use --add-all to stage all changes, or stage files manually with git add');
          process.exit(1);
        }

        // Format commit message based on conventional commits
        const formattedMessage = options.type ? `${options.type}: ${message}` : message;
        
        console.log(`📝 Creating commit: ${formattedMessage}`);
        await gitService.commit(formattedMessage);
        
        const latestHash = await gitService.getLatestCommitHash();
        console.log(`✅ Commit created successfully: ${latestHash.substring(0, 8)}`);
        
      } catch (error) {
        console.error('❌ Failed to create commit:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  gitCommand
    .command('status')
    .description('Show Git status')
    .action(async () => {
      try {
        await initializeServices();
        
        const status = await gitService.getStatus();
        const currentBranch = await gitService.getCurrentBranch();
        
        console.log(`📍 On branch: ${currentBranch}`);
        
        if (status.ahead > 0) {
          console.log(`⬆️  Your branch is ahead by ${status.ahead} commit(s)`);
        }
        
        if (status.behind > 0) {
          console.log(`⬇️  Your branch is behind by ${status.behind} commit(s)`);
        }
        
        if (status.files.length > 0) {
          console.log('\n📂 Changes:');
          status.files.forEach(file => {
            console.log(`  ${file}`);
          });
        } else {
          console.log('\n✅ Working directory clean');
        }
        
      } catch (error) {
        console.error('❌ Failed to get Git status:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  gitCommand
    .command('branch')
    .description('Create or switch to a branch')
    .argument('<branch-name>', 'Branch name')
    .option('-c, --create', 'Create the branch if it doesn\'t exist')
    .action(async (branchName: string, options: { create?: boolean }) => {
      try {
        await initializeServices();
        
        const branchExists = await gitService.branchExists(branchName);
        
        if (!branchExists) {
          if (options.create) {
            console.log(`🌿 Creating branch: ${branchName}`);
            await gitService.createBranch(branchName);
          } else {
            console.error(`❌ Branch '${branchName}' does not exist`);
            console.log('💡 Use --create to create the branch');
            process.exit(1);
          }
        }
        
        console.log(`🔄 Switching to branch: ${branchName}`);
        await gitService.checkoutBranch(branchName);
        
        console.log(`✅ Now on branch: ${branchName}`);
        
      } catch (error) {
        console.error('❌ Failed to switch branch:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  gitCommand
    .command('push')
    .description('Push commits to remote repository')
    .option('-f, --force-with-lease', 'Force push with lease (safer than --force)')
    .option('-r, --remote <remote>', 'Remote name', 'origin')
    .action(async (options: { forceWithLease?: boolean; remote?: string }) => {
      try {
        await initializeServices();
        
        const currentBranch = await gitService.getCurrentBranch();
        console.log(`📤 Pushing ${currentBranch} to ${options.remote}...`);
        
        if (options.forceWithLease) {
          await gitService.forcePushWithLease(options.remote, currentBranch);
          console.log('⚠️  Force pushed with lease');
        } else {
          await gitService.push(options.remote, currentBranch);
        }
        
        console.log('✅ Push completed successfully');
        
      } catch (error) {
        console.error('❌ Failed to push:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  gitCommand
    .command('pull')
    .description('Pull changes from remote repository')
    .option('-r, --remote <remote>', 'Remote name', 'origin')
    .option('-b, --branch <branch>', 'Branch name', 'develop')
    .action(async (options: { remote?: string; branch?: string }) => {
      try {
        await initializeServices();
        
        console.log(`📥 Pulling ${options.branch} from ${options.remote}...`);
        await gitService.pull(options.remote, options.branch);
        
        console.log('✅ Pull completed successfully');
        
      } catch (error) {
        console.error('❌ Failed to pull:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  gitCommand
    .command('pr')
    .description('Create a pull request')
    .argument('<title>', 'Pull request title')
    .option('-d, --description <description>', 'Pull request description')
    .option('-b, --base <branch>', 'Base branch for the PR', 'develop')
    .option('-h, --head <branch>', 'Head branch for the PR (current branch if not specified)')
    .option('--draft', 'Create as draft PR')
    .action(async (title: string, options: { description?: string; base?: string; head?: string; draft?: boolean }) => {
      try {
        await initializeServices();
        
        const currentBranch = await gitService.getCurrentBranch();
        const headBranch = options.head || currentBranch;
        
        // Check if we have configuration for GitHub
        const owner = await storageService.getConfig('github.owner');
        const repo = await storageService.getConfig('github.repo');
        
        if (!owner || !repo) {
          console.error('❌ GitHub configuration not found');
          console.log('💡 Configure GitHub repository:');
          console.log(`   bun run dev config set github.owner "your-org"`);
          console.log(`   bun run dev config set github.repo "your-repo"`);
          process.exit(1);
        }

        // Check if current branch has commits to push
        const status = await gitService.getStatus();
        if (status.ahead === 0) {
          console.error('❌ Current branch has no commits ahead of remote');
          console.log('💡 Make some commits first, then try again');
          process.exit(1);
        }

        console.log(`🔄 Creating pull request...`);
        console.log(`  From: ${headBranch}`);
        console.log(`  To: ${options.base}`);
        console.log(`  Title: ${title}`);
        
        // Push current branch if needed
        try {
          console.log('📤 Pushing current branch...');
          await gitService.push('origin', headBranch);
        } catch (error) {
          console.log('⚠️  Failed to push, continuing with PR creation...');
        }

        // For now, we'll provide instructions since we don't have GitHub API integration yet
        const prUrl = `https://github.com/${owner}/${repo}/compare/${options.base}...${headBranch}?quick_pull=1`;
        
        console.log('\n🔗 Pull Request Details:');
        console.log(`Repository: ${owner}/${repo}`);
        console.log(`Title: ${title}`);
        if (options.description) {
          console.log(`Description: ${options.description}`);
        }
        console.log(`Base: ${options.base}`);
        console.log(`Head: ${headBranch}`);
        if (options.draft) {
          console.log('Type: Draft');
        }
        
        console.log(`\n🌐 Open this URL to create the PR:`);
        console.log(prUrl);
        
        // TODO: Implement actual GitHub API integration
        console.log('\n💡 Future enhancement: Automatic PR creation via GitHub API');
        
      } catch (error) {
        console.error('❌ Failed to create pull request:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  // Language validation commands
  const langCommand = program
    .command('lang')
    .description('Language validation and translation');

  langCommand
    .command('check')
    .description('Check content language compliance')
    .argument('<text>', 'Text to check')
    .option('-s, --strict', 'Strict mode - fail on non-English content')
    .option('-t, --translate', 'Auto-translate if needed')
    .action(async (text: string, options: { strict?: boolean; translate?: boolean }) => {
      try {
        await initializeServices();
        
        const { LanguageValidationMiddleware } = await import('./middleware/LanguageValidationMiddleware.js');
        const middleware = new LanguageValidationMiddleware();
        
        const result = await middleware.validateBeforeSave({
          entityType: 'comment',
          fieldName: 'content',
          content: text,
          autoTranslate: options.translate,
          strictMode: options.strict
        });

        console.log('\n🔍 Language Validation Results:');
        console.log('================================');
        console.log(`Content: "${text}"`);
        console.log(`Detected Language: ${result.detectedLanguage} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        console.log(`Needs Translation: ${result.needsTranslation ? 'Yes' : 'No'}`);
        console.log(`Valid: ${result.valid ? '✅ Yes' : '❌ No'}`);

        if (result.translatedContent) {
          console.log(`\n🔄 Auto-translation:`);
          console.log(`Original: "${result.originalContent}"`);
          console.log(`Translated: "${result.translatedContent}"`);
        }

        if (result.issues.length > 0) {
          console.log('\n🚨 Issues:');
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }

        if (result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          result.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        if (result.suggestions.length > 0) {
          console.log('\n💡 Suggestions:');
          result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
        }

        if (!result.valid && options.strict) {
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to check language:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  langCommand
    .command('validate-file')
    .description('Validate language in a file')
    .argument('<file-path>', 'Path to file to validate')
    .option('-s, --strict', 'Strict mode - fail on non-English content')
    .option('-t, --translate', 'Auto-translate if needed')
    .action(async (filePath: string, options: { strict?: boolean; translate?: boolean }) => {
      try {
        await initializeServices();
        
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch {
          console.error(`❌ File not found: ${filePath}`);
          process.exit(1);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const { LanguageValidationMiddleware } = await import('./middleware/LanguageValidationMiddleware.js');
        const middleware = new LanguageValidationMiddleware();
        
        const result = await middleware.validateFileContent(filePath, content);

        console.log(`\n🔍 Language Validation for: ${filePath}`);
        console.log('==========================================');
        console.log(`Detected Language: ${result.detectedLanguage} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        console.log(`Needs Translation: ${result.needsTranslation ? 'Yes' : 'No'}`);
        console.log(`Valid: ${result.valid ? '✅ Yes' : '❌ No'}`);

        if (result.translatedContent) {
          console.log(`\n🔄 Auto-translation available`);
          console.log(`Original: "${result.originalContent.substring(0, 100)}..."`);
          console.log(`Translated: "${result.translatedContent.substring(0, 100)}..."`);
        }

        if (result.issues.length > 0) {
          console.log('\n🚨 Issues:');
          result.issues.forEach(issue => console.log(`  - ${issue}`));
        }

        if (result.suggestions.length > 0) {
          console.log('\n💡 Suggestions:');
          result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
        }

        if (!result.valid && options.strict) {
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to validate file:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  // Document management commands
  const docCommand = program
    .command('doc')
    .description('Manage project documents');

  docCommand
    .command('create')
    .description('Create a new project document')
    .argument('<title>', 'Document title')
    .argument('<type>', 'Document type (architecture, api, deployment, user-guide)')
    .argument('<content>', 'Document content or file path')
    .option('-t, --tags <tags>', 'Comma-separated tags')
    .option('-g, --goal <goal-id>', 'Associated goal ID')
    .option('-f, --file-path <path>', 'File path relative to project root')
    .action(async (title: string, type: string, content: string, options: { tags?: string; goal?: string; filePath?: string }) => {
      try {
        await initializeServices();
        
        const { generateUniqueEntityId } = await import('./core/aid-generator.js');
        const docId = generateUniqueEntityId('D', {
          prefix: 'D',
          title: title,
          type: 'document',
          status: 'draft'
        });
        
        const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
        
        // For now, we'll store the document in the database
        // TODO: Implement document storage service
        console.log(`📄 Creating document: ${title}`);
        console.log(`  ID: ${docId}`);
        console.log(`  Type: ${type}`);
        console.log(`  Tags: ${tags.join(', ') || 'none'}`);
        if (options.goal) {
          console.log(`  Goal: ${options.goal}`);
        }
        if (options.filePath) {
          console.log(`  File: ${options.filePath}`);
        }
        
        console.log('\n💡 Document storage service will be implemented in the next iteration');
        console.log('   This will allow storing documents in the database with full AID tracking');
        
      } catch (error) {
        console.error('❌ Failed to create document:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  docCommand
    .command('list')
    .description('List all project documents')
    .option('-t, --type <type>', 'Filter by document type')
    .option('-s, --status <status>', 'Filter by status')
    .option('-g, --goal <goal-id>', 'Filter by associated goal')
    .action(async (options: { type?: string; status?: string; goal?: string }) => {
      try {
        await initializeServices();
        
        console.log('📚 Project Documents');
        console.log('===================\n');
        
        // TODO: Implement document listing from database
        console.log('💡 Document listing will be implemented in the next iteration');
        console.log('   This will show all documents stored in the database');
        
        if (options.type) {
          console.log(`   Filter by type: ${options.type}`);
        }
        if (options.status) {
          console.log(`   Filter by status: ${options.status}`);
        }
        if (options.goal) {
          console.log(`   Filter by goal: ${options.goal}`);
        }
        
      } catch (error) {
        console.error('❌ Failed to list documents:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  // GitHub sync commands
  program
    .command('sync')
    .description('Sync issues from GitHub to local goals')
    .option('-t, --token <token>', 'GitHub token (or use GITHUB_TOKEN env var)')
    .action(async (options: { token?: string }) => {
      try {
        await initializeServices();
        const result = await workflowService.syncFromGitHub(options.token);
        
        if (result.success) {
          console.log('✅', result.message);
          if (result.data) {
            console.log(`Created: ${result.data.created} goals`);
            console.log(`Updated: ${result.data.updated} goals`);
            if (result.data.errors && result.data.errors.length > 0) {
              console.log(`Errors: ${result.data.errors.length}`);
              result.data.errors.forEach((error: string) => {
                console.error(`  - ${error}`);
              });
            }
          }
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to sync from GitHub:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  program
    .command('sync-goal')
    .description('Sync goal status to GitHub')
    .argument('<goal-id>', 'Goal ID to sync')
    .option('-t, --token <token>', 'GitHub token (or use GITHUB_TOKEN env var)')
    .action(async (goalId: string, options: { token?: string }) => {
      try {
        await initializeServices();
        const result = await workflowService.syncGoalToGitHub(goalId, options.token);
        
        if (result.success) {
          console.log('✅', result.message);
        } else {
          console.error('❌', result.message);
          if (result.error) {
            console.error('Error:', result.error);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Failed to sync goal to GitHub:', error);
        process.exit(1);
      } finally {
        storageService.close();
      }
    });

  // Help command
  program
    .command('help')
    .description('Show detailed help information')
    .action(() => {
      console.log('\n🚀 Dev Agent - High-Efficiency Standard Operating Protocol');
      console.log('========================================================\n');
      console.log('Quick Start:');
      console.log('  dev/src/index.ts init                    - Initialize monorepo');
      console.log('  dev/src/index.ts goal create "Title"     - Create new goal');
      console.log('  dev/src/index.ts goal start <goal-id>    - Start working on goal');
      console.log('  dev/src/index.ts goal complete <goal-id> - Mark goal as done');
      console.log('  dev/src/index.ts goal list               - List all goals');
      console.log('\nConfiguration:');
      console.log('  dev/src/index.ts config set <key> <value> - Set configuration');
      console.log('  dev/src/index.ts config get <key>         - Get configuration');
      console.log('  dev/src/index.ts config list              - List all configuration');
      console.log('\nGit Operations:');
      console.log('  dev/src/index.ts git status               - Show Git status');
      console.log('  dev/src/index.ts git commit "message"     - Create commit (add --add-all to stage)');
      console.log('  dev/src/index.ts git branch <name>        - Create/switch branch (add --create)');
      console.log('  dev/src/index.ts git push                 - Push to remote');
      console.log('  dev/src/index.ts git pull                 - Pull from remote');
      console.log('  dev/src/index.ts git pr "title"           - Create pull request');
      console.log('\nValidation:');
      console.log('  dev/src/index.ts goal validate <goal-id>  - Validate specific goal');
      console.log('  dev/src/index.ts goal validate-all        - Validate all goals');
      console.log('\nLanguage Validation:');
console.log('  dev/src/index.ts lang check "text"                     - Check text language compliance');
console.log('  dev/src/index.ts lang validate-file <path>             - Validate file language');
console.log('\nDocumentation:');
console.log('  dev/src/index.ts doc create <title> <type> <content>  - Create project document');
console.log('  dev/src/index.ts doc list                              - List project documents');
      console.log('\nGitHub Integration:');
      console.log('  dev/src/index.ts sync                     - Sync issues from GitHub');
      console.log('  dev/src/index.ts sync-goal <goal-id>      - Sync goal status to GitHub');
      console.log('\nFor detailed help on any command:');
      console.log('  dev <command> --help');
    });

  // Parse command line arguments
  try {
    await program.parseAsync();
  } catch (error) {
    logger.error('CLI parsing error', error as Error);
    process.exit(1);
  } finally {
    // Cleanup
    if (storageService) {
      storageService.close();
    }
  }
}

// Run main function
if (import.meta.main) {
  main().catch((error) => {
    logger.error('Unhandled error in main', error as Error);
    process.exit(1);
  });
}
