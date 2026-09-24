import React from 'react';
import { ShieldCheck, Cpu, Heart, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenProviderSettings: () => void;
  onNavigate: (view: 'home' | 'studio' | 'analyzer') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenProviderSettings,
  onNavigate,
}) => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white font-['Plus_Jakarta_Sans']">
              CineFace AI Studio
            </span>
            <span className="text-[10px] text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-1.5 py-0.5 rounded">
              v1.0 Architecture
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-md">
            Production-grade generative video framework engineered for photorealistic avatar synthesis,
            accurate likeness preservation, and reverse-engineered content strategy.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Consent Safeguards
            </span>
            <span>·</span>
            <span>Ephemeral Zero-Storage Processing</span>
            <span>·</span>
            <span>Swahili & Global TTS</span>
          </div>
        </div>

        <div>
          <div className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
            Workflows
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('studio')}
                className="hover:text-white transition-colors"
              >
                Talking Avatar Creator
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('studio')}
                className="hover:text-white transition-colors"
              >
                Product Video Commercials
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('analyzer')}
                className="hover:text-white transition-colors"
              >
                Viral Reference Analyzer
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('studio')}
                className="hover:text-white transition-colors"
              >
                Social Media 9:16 Shorts
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
            Architecture & Trust
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={onOpenProviderSettings}
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Provider Abstraction API
              </button>
            </li>
            <li>
              <button
                onClick={onOpenPrivacy}
                className="hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Likeness Authorization Policy
              </button>
            </li>
            <li>
              <button
                onClick={onOpenPrivacy}
                className="hover:text-white transition-colors"
              >
                Data Privacy & No-DB Retention
              </button>
            </li>
            <li className="text-slate-500 text-[11px] pt-1">
              Deployable directly on Vercel & Cloud Run
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} CineFace AI Studio. Built with high standards for realistic avatar ethics.
        </div>
        <div className="flex items-center gap-4">
          <span>No unauthorized impersonation</span>
          <span>·</span>
          <span>Clean API Provider Layer</span>
        </div>
      </div>
    </footer>
  );
};
