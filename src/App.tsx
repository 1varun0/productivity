import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { CaptureModal } from '@/components/CaptureModal';
import { SettingsModal } from '@/components/SettingsModal';

import { useCommandPaletteStore } from '@/store/useCommandPaletteStore';
import { useStore } from '@/store/useStore';
import { useNexusStore } from '@/features/nexus/store/useNexusStore';

import { PublicNotePage } from '@/pages/PublicNotePage';
import { InviteAcceptPage } from '@/features/workspace/components/InviteAcceptPage';
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/legal/TermsOfServicePage';
import { DocumentationPage } from '@/pages/legal/DocumentationPage';

// Lazy-loaded major route components
const TodayPage = lazy(() => import('@/pages/TodayPage').then(m => ({ default: m.TodayPage })));
const HabitsPage = lazy(() => import('@/features/habits/pages/HabitsPage').then(m => ({ default: m.HabitsPage })));
const TimetablePage = lazy(() => import('@/features/timetable/components/TimetablePage').then(m => ({ default: m.TimetablePage })));
const NexusView = lazy(() => import('@/features/nexus/components/NexusView').then(m => ({ default: m.NexusView })));
const WorkspacePage = lazy(() => import('@/features/workspace/components/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

function LegacyRedirect() {
  const location = useLocation();
  return <Navigate to={`/app${location.pathname}`} replace />;
}

function App() {
  const togglePalette = useCommandPaletteStore((state) => state.togglePalette);
  const closePalette = useCommandPaletteStore((state) => state.closePalette);
  const { 
    openCaptureModal, closeCaptureModal, 
    openFocusSetup, focusState, 
    closeSettingsModal 
  } = useStore();
  const triggerNewNote = useNexusStore((state) => state.triggerNewNote);
  const closeTemplateGallery = useNexusStore((state) => state.closeTemplateGallery);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = e.target instanceof HTMLInputElement || 
                             e.target instanceof HTMLTextAreaElement || 
                             (e.target as HTMLElement).isContentEditable;
      
      // ESC closes any modal
      if (e.key === 'Escape') {
        closeCaptureModal();
        closeSettingsModal();

        closeTemplateGallery();
        closePalette();
        return;
      }

      if (isInputFocused) return;
      
      // Command Palette (CTRL+K or CMD+K)
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        togglePalette();
      }
      
      // Quick Task Capture (CTRL+SPACE or CMD+SPACE)
      if (e.key === ' ' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCaptureModal();
      }
      
      // Enter Focus Mode (F)
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (focusState === 'idle') {
          openFocusSetup();
        }
      }
      
      // New note in Nexus (ALT+N)
      if (e.key.toLowerCase() === 'n' && e.altKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('/app/nexus');
        triggerNewNote();
      }
      

    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette, closePalette, openCaptureModal, closeCaptureModal, openFocusSetup, focusState, closeSettingsModal, triggerNewNote, closeTemplateGallery, navigate]);

  const loadingFallback = (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/share/:slug" element={<PublicNotePage />} />
        <Route path="/invite/:token" element={<InviteAcceptPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        
        {/* Legacy Route Redirects */}
        <Route path="/habits" element={<LegacyRedirect />} />
        <Route path="/timetable" element={<LegacyRedirect />} />
        <Route path="/nexus" element={<LegacyRedirect />} />
        <Route path="/workspace" element={<LegacyRedirect />} />
        <Route path="/workspace/:projectId" element={<LegacyRedirect />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={
            <AppLayout>
              <TodayPage />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
          <Route path="/app/habits" element={
            <AppLayout>
              <HabitsPage />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
          <Route path="/app/timetable" element={
            <AppLayout>
              <TimetablePage />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
          <Route path="/app/nexus" element={
            <AppLayout>
              <NexusView />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
          <Route path="/app/workspace" element={
            <AppLayout>
              <WorkspacePage />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
          <Route path="/app/workspace/:projectId" element={
            <AppLayout>
              <WorkspacePage />
              <CaptureModal />
              <SettingsModal />

            </AppLayout>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
