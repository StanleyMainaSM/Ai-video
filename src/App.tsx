import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { VideoCreator } from './components/Studio/VideoCreator';
import { ViralAnalyzer } from './components/Analyzer/ViralAnalyzer';
import { ProviderSettingsModal } from './components/Modals/ProviderSettingsModal';
import { PrivacyModal } from './components/Modals/PrivacyModal';
import { fetchProviders, selectActiveProvider } from './services/api';
import { ProviderInfo, VideoType, ScriptTone } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'studio' | 'analyzer'>('home');

  // Modals
  const [isProviderSettingsOpen, setIsProviderSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Studio Pre-fill Data (transferred from Viral Analyzer)
  const [studioInitialData, setStudioInitialData] = useState<{
    script?: string;
    videoType?: VideoType;
    tone?: ScriptTone;
    targetAudience?: string;
    productName?: string;
  }>({});

  // Provider state
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeProvider, setActiveProvider] = useState<{
    id: string;
    name: string;
    isConfigured: boolean;
    description: string;
  }>({
    id: 'mock',
    name: 'Mock Development Sandbox',
    isConfigured: true,
    description: 'Local test simulation provider for offline development without paid external API keys.',
  });
  const [geminiConfigured, setGeminiConfigured] = useState(true);

  // Load provider status
  const loadProviders = async () => {
    try {
      const data = await fetchProviders();
      setProviders(data.providers || []);
      if (data.activeProvider) {
        setActiveProvider(data.activeProvider);
      }
      setGeminiConfigured(Boolean(data.geminiConfigured));
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleSelectProvider = async (id: string) => {
    await selectActiveProvider(id);
    await loadProviders();
  };

  // Callback when user generates an original adaptation in Viral Analyzer and clicks "Create My Original Video"
  const handleTransferToStudio = (data: {
    script: string;
    videoType: VideoType;
    tone: ScriptTone;
    targetAudience: string;
    productName: string;
  }) => {
    setStudioInitialData(data);
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProviderSettings={() => setIsProviderSettingsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        activeProvider={activeProvider}
        providers={providers}
      />

      {/* Main Content Pages */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <LandingPage
            onStartCreating={() => {
              setCurrentView('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartAnalyzing={() => {
              setCurrentView('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProviderSettings={() => setIsProviderSettingsOpen(true)}
          />
        )}

        {currentView === 'studio' && (
          <VideoCreator
            initialScript={studioInitialData.script}
            initialVideoType={studioInitialData.videoType}
            initialTone={studioInitialData.tone}
            initialAudience={studioInitialData.targetAudience}
            onOpenViralAnalyzer={() => {
              setCurrentView('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProviderSettings={() => setIsProviderSettingsOpen(true)}
            activeProvider={activeProvider}
          />
        )}

        {currentView === 'analyzer' && (
          <ViralAnalyzer onTransferToStudio={handleTransferToStudio} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenProviderSettings={() => setIsProviderSettingsOpen(true)}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <ProviderSettingsModal
        isOpen={isProviderSettingsOpen}
        onClose={() => setIsProviderSettingsOpen(false)}
        providers={providers}
        activeProvider={activeProvider}
        geminiConfigured={geminiConfigured}
        onSelectProvider={handleSelectProvider}
        onRefresh={loadProviders}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
