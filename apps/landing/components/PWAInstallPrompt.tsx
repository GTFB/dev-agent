'use client';

import { useState } from 'react';
import { Download, Check, X, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { usePWAUpdate } from '../hooks/usePWA';
import { useTranslation } from '../hooks/useTranslation';

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, isInstalled, installPWA } = usePWA();
  const { updateAvailable, isUpdating, applyUpdate } = usePWAUpdate();
  const [isVisible, setIsVisible] = useState(true);

  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Download className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground">
              Install lnd-boilerplate
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add to your home screen for a better experience
            </p>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </button>
              
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for PWA updates
export function PWAUpdatePrompt() {
  const { updateAvailable, isUpdating, applyUpdate } = usePWAUpdate();
  const [isVisible, setIsVisible] = useState(true);

  if (!updateAvailable || !isVisible) {
    return null;
  }

  const handleUpdate = async () => {
    await applyUpdate();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground">
              Update Available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              A new version is ready to install
            </p>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
