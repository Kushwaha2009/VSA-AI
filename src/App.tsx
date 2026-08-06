import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnnouncementBanner } from './components/layout/AnnouncementBanner';
import { Header, ActiveTab } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { ChatContainer } from './components/chat/ChatContainer';
import { PdfToolsContainer } from './components/pdf/PdfToolsContainer';
import { ImageToolsContainer } from './components/image/ImageToolsContainer';
import { VideoToolsContainer } from './components/video/VideoToolsContainer';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { GuestLockoutModal } from './components/auth/GuestLockoutModal';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { AnimatedBackground } from './components/common/AnimatedBackground';

function MainApp() {
  const { isGuestExpired, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab;
    if (['chat', 'pdf', 'image', 'video', 'dashboard', 'admin'].includes(tabParam)) {
      return tabParam;
    }
    return 'chat';
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Dynamic SEO title & URL sync
  useEffect(() => {
    const titles: Record<ActiveTab, string> = {
      chat: 'VSA AI - Smart Solutions, Smarter Future | Multi-Model AI Hub',
      pdf: 'PDF Security & Processing Suite | VSA AI',
      image: 'AI Image Studio & Generation | VSA AI',
      video: 'Video Studio & Audio MP3 Extractor | VSA AI',
      dashboard: 'User Profile & Dashboard | VSA AI',
      admin: 'Admin Console & SEO Suite | VSA AI',
    };

    document.title = titles[activeTab] || 'VSA AI - Smart Solutions, Smarter Future';

    // Update URL query params without reloading
    const newUrl = activeTab === 'chat' ? window.location.pathname : `?tab=${activeTab}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50/50 dark:bg-[#09090b]/80 text-slate-900 dark:text-slate-200 transition-colors selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Animated Futuristic Background Layer */}
      <AnimatedBackground />

      {/* Top Dynamic Announcement Banner */}
      <AnnouncementBanner />

      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className={`flex-1 flex flex-col relative z-10 w-full ${activeTab !== 'chat' ? 'pb-20 md:pb-0' : ''}`}>
        {activeTab === 'chat' && <ChatContainer />}
        {activeTab === 'pdf' && <PdfToolsContainer />}
        {activeTab === 'image' && <ImageToolsContainer />}
        {activeTab === 'video' && <VideoToolsContainer />}
        {activeTab === 'dashboard' && (
          <UserDashboard
            onOpenLogin={() => setIsLoginOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Global Footer (shown on tool views) */}
      {activeTab !== 'chat' && <Footer setActiveTab={setActiveTab} />}

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Guest Mode 2-Minute Expiry Lockout Modal */}
      <GuestLockoutModal
        isOpen={isGuestExpired && !isLoginOpen && !isSignupOpen && !isForgotPasswordOpen}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
      />

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenSignup={() => setIsSignupOpen(true)}
        onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* PWA Native Installation Floating Banner */}
      <PwaInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
