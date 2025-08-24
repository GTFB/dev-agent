#!/usr/bin/env bun

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

interface ProjectConfig {
  name: string;
  version: string;
  description: string;
  github: {
    owner: string;
    repo: string;
  };
  branches: {
    main: string;
    develop: string;
    feature_prefix: string;
    release_prefix: string;
  };
  goals: {
    default_status: string;
    id_pattern: string;
  };
  workflow: {
    auto_sync: boolean;
    sync_interval: number;
  };
  validation: {
    strict_language: boolean;
    auto_translate: boolean;
  };
  storage: {
    database: {
      path: string;
    };
    config: {
      path: string;
    };
    logs: {
      path: string;
    };
  };
  last_updated: string;
}

function main() {
  console.log('🚀 Dev Agent Project Initialization\n');
  
  // Get project path from command line arguments
  const projectPath = process.argv[2];
  
  if (!projectPath) {
    console.error('❌ Project path is required');
    console.log('Usage: bun run src/scripts/project-init.ts "G:\\path\\to\\project"');
    process.exit(1);
  }
  
  const resolvedPath = resolve(projectPath);
  
  // Check if directory exists
  if (!existsSync(resolvedPath)) {
    console.log(`📁 Creating project directory: ${resolvedPath}`);
    try {
      mkdirSync(resolvedPath, { recursive: true });
    } catch (error) {
      console.error(`❌ Failed to create directory: ${error}`);
      process.exit(1);
    }
  }
  
  // Create dev-agent subdirectories
  const devAgentPath = join(resolvedPath, '.dev-agent');
  const databasePath = join(devAgentPath, 'database.db');
  const configPath = join(devAgentPath, 'config');
  const logsPath = join(devAgentPath, 'logs');
  const envPath = join(devAgentPath, '.env');
  
  console.log(`📁 Creating dev-agent structure in: ${devAgentPath}`);
  
  try {
    mkdirSync(devAgentPath, { recursive: true });
    mkdirSync(configPath, { recursive: true });
    mkdirSync(logsPath, { recursive: true });
  } catch (error) {
    console.error(`❌ Failed to create dev-agent directories: ${error}`);
    process.exit(1);
  }
  
  // Create .env file
  const envContent = `# Dev Agent Environment Configuration
# Database
DATABASE_PATH=${databasePath}

# Logging
LOG_LEVEL=info
LOG_PATH=${logsPath}

# Project Configuration
PROJECT_PATH=${resolvedPath}
CONFIG_PATH=${configPath}

# GitHub (optional)
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=

# LLM Configuration (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
`;
  
  try {
    writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Created .env file: ${envPath}`);
  } catch (error) {
    console.error(`❌ Failed to create .env file: ${error}`);
    process.exit(1);
  }
  
  // Create config.json
  const config: ProjectConfig = {
    name: "dev-agent-project",
    version: "1.0.0",
    description: "Dev Agent project configuration",
    github: {
      owner: "your-org",
      repo: "your-project"
    },
    branches: {
      main: "main",
      develop: "develop",
      feature_prefix: "feature",
      release_prefix: "release"
    },
    goals: {
      default_status: "todo",
      id_pattern: "^g-[a-z0-9]{6}$"
    },
    workflow: {
      auto_sync: true,
      sync_interval: 300
    },
    validation: {
      strict_language: true,
      auto_translate: false
    },
    storage: {
      database: {
        path: databasePath
      },
      config: {
        path: configPath
      },
      logs: {
        path: logsPath
      }
    },
    last_updated: new Date().toISOString()
  };
  
  const configJsonPath = join(devAgentPath, 'config.json');
  
  try {
    writeFileSync(configJsonPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ Created config.json: ${configJsonPath}`);
  } catch (error) {
    console.error(`❌ Failed to create config.json: ${error}`);
    process.exit(1);
  }
  
  // Create main config.json in project root
  const rootConfigPath = join(resolvedPath, 'config.json');
  
  try {
    writeFileSync(rootConfigPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`✅ Created root config.json: ${rootConfigPath}`);
  } catch (error) {
    console.error(`❌ Failed to create root config.json: ${error}`);
    process.exit(1);
  }
  
  console.log('\n🎉 Project initialization completed successfully!');
  console.log(`\n📁 Project location: ${resolvedPath}`);
  console.log(`🔧 Dev Agent config: ${devAgentPath}`);
  console.log(`🗄️  Database: ${databasePath}`);
  console.log(`📝 Environment: ${envPath}`);
  console.log(`📋 Configuration: ${configJsonPath}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Review and customize config.json if needed');
  console.log('2. Set up your GitHub credentials in .env file');
  console.log('3. Run "bun run src/scripts/init-db.ts" to initialize database');
  console.log('4. Start using Dev Agent with your chosen protocol');
}

if (import.meta.main) {
  main();
}
