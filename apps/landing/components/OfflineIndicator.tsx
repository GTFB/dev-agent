'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { isOnline, syncOfflineActions } from '../lib/query-client';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = isOnline();
      setIsOffline(!online);
      
      if (online) {
        // Auto-sync when coming back online
        handleSync();
      }
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for network changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncOfflineActions();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">
          {t('common.offline') || 'Offline'}
        </span>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-2 p-1 hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
          title="Sync offline actions"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
