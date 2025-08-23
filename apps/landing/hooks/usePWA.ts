'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const installed = (window.navigator as any).standalone || standalone;
      
      setIsInstalled(installed);
      setIsStandalone(standalone);
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('✅ PWA installed successfully');
    };

    // Check initial installation status
    checkInstallation();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted PWA installation');
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('❌ User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during PWA installation:', error);
      return false;
    }
  };

  const canInstall = !!deferredPrompt && !isInstalled;

  return {
    canInstall,
    isInstalled,
    isStandalone,
    installPWA,
  };
}

// Hook for managing PWA updates
export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // Handle service worker updates
    const handleUpdateFound = () => {
      setUpdateAvailable(true);
    };

    // Handle service worker state changes
    const handleStateChange = (event: Event) => {
      const target = event.target as ServiceWorker;
      
      if (target.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }
    };

    // Handle page refresh after update
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound);
    navigator.serviceWorker.addEventListener('statechange', handleStateChange);
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound);
      navigator.serviceWorker.removeEventListener('statechange', handleStateChange);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const applyUpdate = async () => {
    if (!updateAvailable || isUpdating) return;

    setIsUpdating(true);
    
    try {
      if (navigator.serviceWorker.controller) {
        // Send message to service worker to skip waiting
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('❌ Error applying update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
  };
}
