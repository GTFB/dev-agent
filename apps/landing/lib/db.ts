import Dexie, { Table } from 'dexie';

// Types for our database
export interface CachedPage {
  id?: number;
  url: string;
  title: string;
  content: string;
  timestamp: number;
  lastAccessed: number;
}

export interface OfflineAction {
  id?: number;
  type: 'comment' | 'like' | 'share' | 'bookmark';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface UserPreferences {
  id?: number;
  key: string;
  value: any;
  timestamp: number;
}

// Database class
export class LndBoilerplateDB extends Dexie {
  cachedPages!: Table<CachedPage>;
  offlineActions!: Table<OfflineAction>;
  userPreferences!: Table<UserPreferences>;

  constructor() {
    super('lnd-boilerplate-db');
    
    this.version(1).stores({
      cachedPages: '++id, url, timestamp, lastAccessed',
      offlineActions: '++id, type, timestamp, synced',
      userPreferences: '++id, key, timestamp'
    });
  }

  // Cache management methods
  async cachePage(page: Omit<CachedPage, 'id'>): Promise<number> {
    // Remove old cache entries if we have too many
    const count = await this.cachedPages.count();
    if (count > 100) {
      const oldest = await this.cachedPages
        .orderBy('lastAccessed')
        .limit(20)
        .toArray();
      await this.cachedPages.bulkDelete(oldest.map(p => p.id!));
    }

    return await this.cachedPages.add({
      ...page,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }

  async getCachedPage(url: string): Promise<CachedPage | undefined> {
    const page = await this.cachedPages.where('url').equals(url).first();
    if (page) {
      // Update last accessed time
      await this.cachedPages.update(page.id!, { lastAccessed: Date.now() });
    }
    return page;
  }

  async clearCache(): Promise<void> {
    await this.cachedPages.clear();
  }

  // Offline actions management
  async addOfflineAction(action: Omit<OfflineAction, 'id'>): Promise<number> {
    return await this.offlineActions.add(action);
  }

  async getUnsyncedActions(): Promise<OfflineAction[]> {
    return await this.offlineActions
      .where('synced')
      .equals(0)
      .toArray();
  }

  async markActionSynced(id: number): Promise<void> {
    await this.offlineActions.update(id, { synced: true });
  }

  // User preferences
  async setPreference(key: string, value: any): Promise<number> {
    const existing = await this.userPreferences.where('key').equals(key).first();
    if (existing) {
      await this.userPreferences.update(existing.id!, { value, timestamp: Date.now() });
      return existing.id!;
    } else {
      return await this.userPreferences.add({
        key,
        value,
        timestamp: Date.now()
      });
    }
  }

  async getPreference(key: string): Promise<any | undefined> {
    const pref = await this.userPreferences.where('key').equals(key).first();
    return pref?.value;
  }

  // Database maintenance
  async cleanup(): Promise<void> {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Remove old cached pages
    await this.cachedPages
      .where('lastAccessed')
      .below(oneWeekAgo)
      .delete();
    
    // Remove old synced offline actions
    await this.offlineActions
      .where('timestamp')
      .below(oneWeekAgo)
      .and(action => action.synced)
      .delete();
  }
}

// Export singleton instance
export const db = new LndBoilerplateDB();

// Initialize database
export async function initDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('✅ IndexedDB initialized successfully');
    
    // Run cleanup on init
    await db.cleanup();
  } catch (error) {
    console.error('❌ Failed to initialize IndexedDB:', error);
  }
}
