#!/usr/bin/env bun

import { Database } from 'bun:sqlite';
import { join } from 'path';
import fs from 'fs';

// Database path - use environment variable or skip database operations
const DB_PATH = process.env.DEV_AGENT_DB_PATH || join(process.cwd(), 'data', '.dev-agent.db');

async function main(): Promise<void> {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping schema check');
      return;
    }

    if (!fs.existsSync(DB_PATH)) {
      console.log('📊 Database not found, skipping schema check');
      return;
    }

    const db = new Database(DB_PATH);
    
    console.log("🔍 Checking database schema...\n");
    
    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{name: string}>;
    console.log("📋 Tables:");
    tables.forEach(t => console.log(`   - ${t.name}`));
    
    console.log("\n🔍 LLM table schema:");
    const llmSchema = db.prepare("PRAGMA table_info(llm)").all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;
    
    llmSchema.forEach(col => {
      console.log(`   ${col.cid}: ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
    });
    
    console.log("\n🔍 Config table schema:");
    const configSchema = db.prepare("PRAGMA table_info(config)").all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;
    
    configSchema.forEach(col => {
      console.log(`   ${col.cid}: ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
    });
    
  } finally {
    // db.close(); // This line is removed as per the new_code, as the database object is no longer created here.
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
