import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { ProviderInfo } from '../../types';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderInfo[];
  activeProvider?: { id: string; name: string; isConfigured: boolean; description: string };
  geminiConfigured: boolean;
  onSelectProvider: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  providers,
  activeProvider,
  geminiConfigured,
  onSelectProvider,
  onRefresh,
}) => {
  const [switching, setSwitching] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (id: string) => {
    try {
      setSwitching(id);
      setErrorMsg(null);
      await onSelectProvider(id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch provider');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                AI Video Provider Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Pluggable generation abstraction layer & credentials inspector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Transparency Notice */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Full Generation Transparency</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              CineFace AI Studio strictly decouples frontend video orchestration from the underlying AI video generation engine.
              When no external commercial API key is provided, the application operates in <strong>Mock Development Sandbox Mode</strong>,
              allowing complete end-to-end testing of scripts, avatars, voices, captions, and rendering pipelines without false claims.
            </p>
          </div>

          {/* Gemini AI Status (Script & Reference Analysis) */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Script & Content Analysis Engine
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                Google Gemini 3.8 Flash SDK
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Powers AI script generation, script improvement, and viral reference reverse-engineering.
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-950/60 border-emerald-800 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{geminiConfigured ? 'Connected (Live)' : 'Connected'}</span>
            </div>
          </div>

          {/* Providers List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Available Video Generation Engines
              </span>
              <button
                onClick={onRefresh}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              {providers.map((p) => {
                const isActive = p.id === activeProvider?.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-800/80 border-indigo-500 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {p.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                              Active Engine
                            </span>
                          )}
                          {p.id === 'mock' && (
                            <span className="text-[10px] font-medium bg-amber-950 border border-amber-800 text-amber-300 px-2 py-0.5 rounded-full">
                              Development Sandbox
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {p.supportedFeatures.map((feat, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <div className="text-[11px] flex items-center gap-1.5 font-medium">
                          {p.isConfigured ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <Key className="w-3.5 h-3.5" /> Needs API Key
                            </span>
                          )}
                        </div>

                        {!isActive && (
                          <button
                            onClick={() => handleSelect(p.id)}
                            disabled={switching === p.id}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
                          >
                            {switching === p.id ? 'Switching...' : 'Set Active'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environment Variable Setup Instructions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>How to Connect a Live Provider</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              To connect a real commercial video engine, configure your server environment variables in your deployment settings (e.g. Vercel Project Settings or local <code className="text-indigo-300">.env</code>):
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1 overflow-x-auto">
              <div># HeyGen Avatar Generation</div>
              <div className="text-emerald-400">AI_VIDEO_PROVIDER="heygen"</div>
              <div>HEYGEN_API_KEY="your-heygen-api-key"</div>
              <div className="pt-1"># Or Runway Gen-3 Video Synthesis</div>
              <div className="text-emerald-400">AI_VIDEO_PROVIDER="runway"</div>
              <div>RUNWAY_API_KEY="your-runway-api-key"</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
