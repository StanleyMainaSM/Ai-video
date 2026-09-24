import React, { useState } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, Key, ExternalLink, RefreshCw, Sparkles, Video, ShieldCheck, Info } from 'lucide-react';
import { ProviderInfo } from '../../types';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderInfo[];
  activeProvider?: { id: string; name: string; isConfigured: boolean; description: string; isMock?: boolean; category?: string };
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
  const [unconfiguredNotice, setUnconfiguredNotice] = useState<{ name: string; keyName: string; help: string } | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (p: ProviderInfo) => {
    setErrorMsg(null);
    setUnconfiguredNotice(null);

    if (!p.isConfigured && p.id !== 'mock') {
      setUnconfiguredNotice({
        name: p.name,
        keyName: p.configurationKeyName || `${p.id.toUpperCase()}_API_KEY`,
        help: p.configurationHelp || `Please add ${p.configurationKeyName} to your environment variables.`,
      });
      return;
    }

    try {
      setSwitching(p.id);
      await onSelectProvider(p.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch provider');
    } finally {
      setSwitching(null);
    }
  };

  // Group providers by functional category
  const talkingAvatarProviders = providers.filter((p) => p.category === 'talking_avatar');
  const generativeBrollProviders = providers.filter((p) => p.category === 'generative_broll');
  const demoSandboxProviders = providers.filter((p) => p.category === 'demo_sandbox');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                AI Video Engine Architecture & Settings
              </h2>
              <p className="text-xs text-slate-400">
                Transparent provider routing, capability badges & credential status
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Provider Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Currently Active Engine
                </span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeProvider?.name || 'Development Demo Sandbox'}</span>
                  {activeProvider?.id === 'mock' ? (
                    <span className="text-[10px] font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full">
                      Simulation Mode
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full">
                      Production Live
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onRefresh}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-900/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Unconfigured Provider Notice Warning */}
          {unconfiguredNotice && (
            <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-800 text-xs text-amber-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Cannot Activate {unconfiguredNotice.name}</span>
              </div>
              <p className="leading-relaxed text-amber-100/90">
                This engine requires credentials that are not yet set on the server.
                The app will not switch to an unconfigured provider to prevent broken generation attempts.
              </p>
              <div className="bg-black/60 p-2.5 rounded-lg border border-amber-900/60 font-mono text-[11px] text-amber-300">
                <div>Missing Server Variable: <strong>{unconfiguredNotice.keyName}</strong></div>
                <div className="text-[10px] text-amber-200/70 mt-1">{unconfiguredNotice.help}</div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* AI Script & Viral Analysis Section (Gemini) */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Spoken Script & Strategy Engine
              </div>
              <div className="text-sm font-semibold text-white mt-0.5">
                Google Gemini 3.8 Flash SDK
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Generates spoken script hooks, natural conversational pacing, and viral video reverse-engineering.
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-950/60 border-emerald-800 text-emerald-300 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{geminiConfigured ? 'Configured ✓' : 'Demo Script Fallback'}</span>
            </div>
          </div>

          {/* GROUP 1: Primary Dedicated Talking-Avatar Engines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  1. Dedicated Talking-Avatar Engine (Primary Production Milestone)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Specialized for uploading authorized portrait photos and generating photorealistic lip-sync speech.
            </p>

            {talkingAvatarProviders.map((p) => {
              const isActive = p.id === activeProvider?.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] uppercase font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Active Engine
                          </span>
                        )}
                        <span className="text-[10px] font-medium bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-full">
                          Talking-Photo + Lip-Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>

                      {/* Capability checklist */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 text-[10px]">
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ Photo Likeness Preservation
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ Viseme Lip Synchronization
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ Swahili & Multilingual TTS
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ Vertical 9:16 & 16:9
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ Blinking & Eye Kinematics
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          ✓ 1080p Video Output
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2.5">
                      {p.isConfigured ? (
                        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Configured ✓</span>
                        </div>
                      ) : (
                        <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Not Configured</span>
                        </div>
                      )}

                      {!isActive && (
                        <button
                          onClick={() => handleSelect(p)}
                          disabled={switching === p.id}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            p.isConfigured
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {switching === p.id ? 'Activating...' : p.isConfigured ? 'Set Active' : 'Setup Guide'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GROUP 2: Generative Video & B-Roll Engines (Not Talking-Avatar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Generative Video & Cinematic B-Roll Diffusion Engines
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Creates atmospheric camera motion and cinematic video scenes. NOTE: These diffusion models do not perform lip-sync talking avatar generation from uploaded photos.
            </p>

            <div className="space-y-3">
              {generativeBrollProviders.map((p) => {
                const isActive = p.id === activeProvider?.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-800/90 border-violet-500 shadow-md shadow-violet-950/40'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200">{p.name}</span>
                          <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                            Generative B-Roll
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                        <div className="flex gap-2 pt-1 text-[10px] text-amber-300/80">
                          <span>⚠️ Does not perform talking-photo viseme lip sync</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {p.isConfigured ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Configured ✓
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5" /> Not Configured
                          </span>
                        )}

                        {!isActive && (
                          <button
                            onClick={() => handleSelect(p)}
                            disabled={switching === p.id}
                            className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            {p.isConfigured ? 'Set Active' : 'Setup Guide'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GROUP 3: Development Demo Sandbox */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Offline Development & Simulation
              </span>
            </div>

            {demoSandboxProviders.map((p) => {
              const isActive = p.id === activeProvider?.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{p.name}</span>
                        <span className="text-[10px] bg-amber-950/80 border border-amber-800 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                          Available (Offline Simulation)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                      <p className="text-[11px] text-amber-300/80 pt-1">
                        Notice: Never generates fake third-party videos. Returns clearly labeled Development Demo results.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>

                      {!isActive && (
                        <button
                          onClick={() => handleSelect(p)}
                          disabled={switching === p.id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white transition-colors"
                        >
                          Use Sandbox
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Environment Variable Setup Guide */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Configuring Production HeyGen Talking Avatar Engine</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Add the following environment variables to your deployment settings (e.g. Vercel Project Settings or local <code className="text-indigo-300">.env</code>):
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1 overflow-x-auto">
              <div className="text-slate-500"># Set active provider to HeyGen</div>
              <div className="text-emerald-400">AI_VIDEO_PROVIDER="heygen"</div>
              <div className="text-slate-500 pt-1"># Your HeyGen API Key (from https://app.heygen.com/settings?nav=API)</div>
              <div className="text-emerald-400">HEYGEN_API_KEY="your-real-heygen-api-key"</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
