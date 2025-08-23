import { Header } from './Header';
import { Footer } from './Footer';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallPrompt, PWAUpdatePrompt } from './PWAInstallPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { PerformanceMonitor } from './PerformanceMonitor';
import { AuthProvider } from './auth/AuthProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ErrorBoundary>
      <PerformanceMonitor>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <OfflineIndicator />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
          </div>
        </AuthProvider>
      </PerformanceMonitor>
    </ErrorBoundary>
  );
}
