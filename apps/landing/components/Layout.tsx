import { Header } from './Header';
import { Footer } from './Footer';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallPrompt, PWAUpdatePrompt } from './PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
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
  );
}
