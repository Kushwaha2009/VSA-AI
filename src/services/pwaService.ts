/**
 * Progressive Web App (PWA) Service & Installation Manager
 * Handles Service Worker registration, install prompts, and standalone lifecycle.
 */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

class PwaManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private listeners: Set<(canInstall: boolean) => void> = new Set();
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // 1. Listen for browser install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as InstallPromptEvent;
      this.notifyListeners(true);
      console.log('[VSA AI PWA] Install prompt intercepted and ready');
    });

    // 2. Listen for successful app installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyListeners(false);
      console.log('[VSA AI PWA] Application successfully installed natively');
    });

    // 3. Register Service Worker
    this.registerServiceWorker();
  }

  public async registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        this.registration = registration;
        console.log('[VSA AI PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[VSA AI PWA] New version available! Ready to refresh.');
                window.dispatchEvent(new CustomEvent('vsa-pwa-update-available'));
              }
            });
          }
        });
      } catch (error) {
        console.warn('[VSA AI PWA] Service Worker registration failed:', error);
      }
    }
  }

  public subscribe(callback: (canInstall: boolean) => void) {
    this.listeners.add(callback);
    callback(this.canInstall());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(canInstall: boolean) {
    this.listeners.forEach((callback) => callback(canInstall));
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUiMedia = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isWindowControlsMedia = window.matchMedia('(display-mode: window-controls-overlay)').matches;
      const isNavStandalone = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      const isCustomStandalone =
        window.location.search.includes('source=pwa') ||
        window.location.search.includes('standalone=true') ||
        window.location.search.includes('mode=app') ||
        localStorage.getItem('vsa_app_standalone') === 'true';

      const isElectron =
        window.navigator.userAgent.toLowerCase().includes('electron') ||
        (window as any).process?.versions?.electron !== undefined;
      const isCapacitor = (window as any).Capacitor?.isNativePlatform?.() === true;
      const isCordova = (window as any).cordova !== undefined;
      const isFileProtocol = window.location.protocol === 'file:';

      return (
        isStandaloneMedia ||
        isFullscreenMedia ||
        isMinimalUiMedia ||
        isWindowControlsMedia ||
        isNavStandalone ||
        isAndroidApp ||
        isCustomStandalone ||
        isElectron ||
        isCapacitor ||
        isCordova ||
        isFileProtocol
      );
    } catch (e) {
      return false;
    }
  }

  public isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    if (!this.deferredPrompt) {
      return 'unsupported';
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notifyListeners(false);
      return choice.outcome;
    } catch (err) {
      console.error('[VSA AI PWA] Error prompting installation:', err);
      return 'unsupported';
    }
  }
}

export const pwaManager = new PwaManager();
