import React from 'react';
import { Video, Sparkles, ShieldCheck, Cpu, Lock } from 'lucide-react';
import { ProviderInfo } from '../types';

interface NavbarProps {
  currentView: 'home' | 'studio' | 'analyzer';
  onNavigate: (view: 'home' | 'studio' | 'analyzer') => void;
  onOpenProviderSettings: () => void;
  onOpenPrivacy: () => void;
  activeProvider?: { id: string; name: string; isConfigured: boolean; description: string };
  providers?: ProviderInfo[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenProviderSettings,
  onOpenPrivacy,
  activeProvider,
}) => {
  const isMock = !activeProvider || activeProvider.id === 'mock';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
                CineFace
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                AI Studio
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Photorealistic Video Creation Engine
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              currentView === 'home'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              currentView === 'studio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Create Video</span>
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              currentView === 'analyzer'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Viral Analyzer</span>
          </button>
        </nav>

        {/* Provider Indicator & Safeguards */}
        <div className="flex items-center gap-2">
          {/* Active Provider Badge */}
          <button
            onClick={onOpenProviderSettings}
            title="Inspect Video Generation Provider Architecture"
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
              isMock
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-950/70'
                : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/70'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-medium">
              {isMock ? 'Sandbox Mode' : activeProvider?.name.split(' ')[0]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          </button>

          {/* Privacy & Ethics */}
          <button
            onClick={onOpenPrivacy}
            title="Digital Likeness Safeguards & Ephemeral Privacy Notice"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
