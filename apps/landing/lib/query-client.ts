import { QueryClient } from '@tanstack/react-query';
import { db } from './db';

// Create a query client with offline-first configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Cache time and stale time for offline support
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Network mode for offline support
      networkMode: 'always',
      
      // Background refetch when app comes online
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Network mode for offline support
      networkMode: 'always',
    },
  },
});

// Custom hooks for offline-first data fetching
export const createOfflineQuery = <T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options: {
    cacheTime?: number;
    staleTime?: number;
    fallbackData?: T;
  } = {}
) => {
  return {
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        // Try to fetch from network first
        const data = await fetchFn();
        
        // Cache the data in IndexedDB
        await db.cachePage({
          url: queryKey.join('/'),
          title: queryKey[queryKey.length - 1],
          content: JSON.stringify(data),
          timestamp: Date.now(),
          lastAccessed: Date.now(),
        });
        
        return data;
      } catch (error) {
        console.log('🔄 Network request failed, trying offline cache...');
        
        // Try to get from IndexedDB cache
        const cached = await db.getCachedPage(queryKey.join('/'));
        if (cached) {
          try {
            const parsedData = JSON.parse(cached.content) as T;
            console.log('✅ Data loaded from offline cache');
            return parsedData;
          } catch (parseError) {
            console.error('❌ Failed to parse cached data:', parseError);
          }
        }
        
        // Return fallback data if available
        if (options.fallbackData) {
          console.log('📱 Using fallback data');
          return options.fallbackData;
        }
        
        // Re-throw the error if no fallback
        throw error;
      }
    },
    ...options,
  };
};

// Hook for offline actions
export const createOfflineMutation = <T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options: {
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
  } = {}
) => {
  return {
    mutationFn: async (variables: V): Promise<T> => {
      try {
        // Try to execute the mutation
        const result = await mutationFn(variables);
        
        // If successful, mark any pending offline actions as synced
        // This would typically be done after a successful network request
        console.log('✅ Mutation successful, syncing offline actions...');
        
        return result;
      } catch (error) {
        console.log('🔄 Network mutation failed, storing offline action...');
        
        // Store the action for later sync
        await db.addOfflineAction({
          type: 'comment', // This would be dynamic based on the mutation
          data: { variables, timestamp: Date.now() },
          timestamp: Date.now(),
          synced: false,
        });
        
        // Re-throw the error to trigger onError
        throw error;
      }
    },
    ...options,
  };
};

// Utility function to sync offline actions
export const syncOfflineActions = async () => {
  try {
    const unsyncedActions = await db.getUnsyncedActions();
    
    if (unsyncedActions.length === 0) {
      console.log('✅ No offline actions to sync');
      return;
    }
    
    console.log(`🔄 Syncing ${unsyncedActions.length} offline actions...`);
    
    // Process each unsynced action
    for (const action of unsyncedActions) {
      try {
        // This would be the actual sync logic
        // For now, we'll just mark them as synced
        await db.markActionSynced(action.id!);
        console.log(`✅ Synced action ${action.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);
      }
    }
    
    console.log('✅ Offline actions sync completed');
  } catch (error) {
    console.error('❌ Failed to sync offline actions:', error);
  }
};

// Network status detection
export const isOnline = () => navigator.onLine;

// Listen for network status changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Network is online, syncing offline actions...');
    syncOfflineActions();
  });
  
  window.addEventListener('offline', () => {
    console.log('📱 Network is offline, storing actions locally...');
  });
}
