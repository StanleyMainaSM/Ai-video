import React from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, EyeOff, UserCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Legal Safeguards & Privacy Policy
              </h2>
              <p className="text-xs text-slate-400">
                Digital likeness ethics, consent verification & zero-storage privacy
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

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs leading-relaxed text-slate-300">
          {/* Likeness Ethics */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Strict Likeness Authorization Policy</span>
            </div>
            <p className="text-slate-300">
              CineFace AI Studio strictly prohibits unauthorized impersonation, deceptive identity manipulation,
              unauthorized voice cloning, or attributing falsified statements to real individuals.
            </p>
            <p className="text-slate-400">
              When using the photo upload feature, users are legally required to confirm:
              <br />
              <em className="text-slate-200">
                "I confirm that I own this image or have permission from the person depicted to create an AI likeness."
              </em>
            </p>
          </div>

          {/* Privacy & No DB */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-900 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Ephemeral Session Processing (No Database)</div>
                <p className="text-slate-400 mt-0.5">
                  Version 1.0 does not maintain a database, user profiles, or permanent media archives.
                  Uploaded photos and generated outputs reside in temporary memory only during the active creation session.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">No Account Required</div>
                <p className="text-slate-400 mt-0.5">
                  You can craft scripts, analyze viral references, and generate videos immediately without signup,
                  trackers, or credit card collection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-violet-950 text-violet-400 border border-violet-900 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Provider Data Transit</div>
                <p className="text-slate-400 mt-0.5">
                  When generation is dispatched, media and script text are securely transmitted directly to your
                  selected video generation API provider for real-time rendering. No media is retained on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
