import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  FileText,
  ShoppingBag,
  TrendingUp,
  Volume2,
  Subtitles,
  Smartphone,
  Check,
  Layers,
  Award,
  Globe,
  Zap,
} from 'lucide-react';
import { AspectRatio } from '../types';

interface LandingPageProps {
  onStartCreating: () => void;
  onStartAnalyzing: () => void;
  onOpenProviderSettings: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onStartAnalyzing,
  onOpenProviderSettings,
}) => {
  const [heroRatio, setHeroRatio] = useState<AspectRatio>('9:16');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  return (
    <div className="w-full min-h-screen text-slate-100 flex flex-col items-center">
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Photorealistic Video Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans'] leading-[1.12]">
              Create Realistic <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                AI Videos
              </span>{' '}
              From Your Ideas
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Turn scripts, photos, and concepts into photorealistic video presenters.
              Featuring authentic facial expressions, natural eye contact, realistic blinking,
              accurate lip synchronization, and multi-language studio voices.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onStartCreating}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Video className="w-5 h-5" />
                <span>Create a Video</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onStartAnalyzing}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all hover:border-violet-500/50"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Analyze a Video</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Identity Preserved</span>
                <span>Authorized photo likeness</span>
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-sm">Natural Visemes</span>
                <span>Sub-frame audio lip sync</span>
              </div>
              <div>
                <span className="font-bold text-slate-200 block text-sm">East African Swahili</span>
                <span>+ English, Spanish, Global</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl shadow-indigo-950/40 relative">
              {/* Aspect Ratio Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Preview Engine
                </span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setHeroRatio(r)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        heroRatio === r
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Video Frame */}
              <div
                className={`relative mt-3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 transition-all duration-300 ${
                  heroRatio === '9:16'
                    ? 'aspect-[9/14]'
                    : heroRatio === '16:9'
                    ? 'aspect-video'
                    : 'aspect-square'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="AI Video Presenter"
                  className="w-full h-full object-cover object-top"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

                {/* Subtitle / Caption simulation */}
                <div className="absolute bottom-4 inset-x-3 text-center">
                  <div className="inline-block bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-xs sm:text-sm font-extrabold text-amber-300 drop-shadow">
                      "Turn your concepts into photorealistic videos..."
                    </span>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Lip-Sync 60 FPS</span>
                </div>

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-medium text-slate-300 border border-white/10">
                  <span>Kiswahili / English</span>
                </div>
              </div>

              {/* Bottom Quick Test Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Amina Kimani</div>
                    <div className="text-[10px] text-slate-400">Nairobi Broadcast Audio</div>
                  </div>
                </div>
                <button
                  onClick={onStartCreating}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- HOW IT WORKS ----------------- */}
      <section className="w-full bg-slate-950/70 border-y border-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              Streamlined Creation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              How CineFace AI Works
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Five frictionless steps from raw concept to high-definition video output.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Choose Your Avatar',
                desc: 'Upload an authorized photo or select from 9 photorealistic presenter archetypes.',
                icon: UserCheck,
              },
              {
                step: '02',
                title: 'Write or Generate Script',
                desc: 'Type your message or let Gemini AI craft an audience-tailored script.',
                icon: FileText,
              },
              {
                step: '03',
                title: 'Customize Your Video',
                desc: 'Pick your voice, language, background, aspect ratio, and caption style.',
                icon: Layers,
              },
              {
                step: '04',
                title: 'Generate Video',
                desc: 'Watch real-time pipeline status as avatar, voice, and visemes are rendered.',
                icon: Zap,
              },
              {
                step: '05',
                title: 'Download & Publish',
                desc: 'Instant high-resolution export ready for TikTok, Reels, YouTube, or web ads.',
                icon: Video,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FEATURES SECTION ----------------- */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-violet-400">
            Professional Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Engineered for Photorealism & Conversion
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything needed to produce studio-grade video assets at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'AI Avatars & Likeness',
              desc: 'Upload authorized photos with strict legal consent, or select custom fictional characters designed with realistic skin textures and lighting.',
              icon: UserCheck,
              highlight: 'Identity Preservation',
            },
            {
              title: 'Script-to-Video Engine',
              desc: 'Gemini 3.8 Flash scriptwriter calculates spoken duration, word counts, and optimizes hooks for viewer retention.',
              icon: FileText,
              highlight: 'Duration Estimator',
            },
            {
              title: 'Product Advertisements',
              desc: 'Built-in commercial framing optimized for e-commerce, SaaS walkthroughs, and high-conversion social drops.',
              icon: ShoppingBag,
              highlight: 'E-commerce Ready',
            },
            {
              title: 'Viral Content Strategy Analyzer',
              desc: 'Reverse-engineer the hook, structure, and pacing of top videos to create 100% original concepts without copying.',
              icon: TrendingUp,
              highlight: 'Structural Science',
            },
            {
              title: 'AI Voices & Swahili Support',
              desc: 'High-definition voice synthesis with natural cadence, speed controls, and East African Swahili (Nairobi & Coastal accents).',
              icon: Volume2,
              highlight: 'Kiswahili + Global',
            },
            {
              title: 'Automatic Captions & Formats',
              desc: 'Generate viral bold social subtitles with full support for 9:16 vertical (Reels/TikTok), 16:9 landscape, and 1:1 square.',
              icon: Subtitles,
              highlight: 'Multi-Aspect Export',
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-950/20"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                  <feat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded">
                  {feat.highlight}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- VIRAL ANALYZER SPOTLIGHT ----------------- */}
      <section className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-950/90 border border-violet-900/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scientific Content Strategy</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                Viral Video Analyzer: Never Copy, Always Reverse-Engineer
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                We never make fake guarantees like "this video will go viral." Instead, our engine analyzes the
                structural DNA of high-performing reference videos—hooks, pacing, emotional transitions, and CTA mechanics—and
                synthesizes a <strong>100% original concept</strong> for your own product or e-book.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-violet-400 block text-xs">HOOK MECHANICS</span>
                <span className="text-[11px] text-slate-400">Psychological 3-second retention triggers</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-violet-400 block text-xs">PACING CADENCE</span>
                <span className="text-[11px] text-slate-400">Rhythm and curiosity loop sequencing</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-violet-400 block text-xs">CTA CONVERSION</span>
                <span className="text-[11px] text-slate-400">Frictionless closing incentives</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-violet-400 block text-xs">ORIGINAL SCRIPT</span>
                <span className="text-[11px] text-slate-400">Tailored to your specific product</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onStartAnalyzing}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-transform hover:scale-[1.02]"
              >
                <span>Launch Viral Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- USE CASES GRID ----------------- */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Versatile Applications
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Built for High-Impact Commercial & Creative Content
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Scalable video generation tailored for modern digital creators and entrepreneurs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {[
            { title: 'E-Book & Course Promotion', desc: 'Direct-response walkthroughs highlighting core transformation' },
            { title: 'Product & SaaS Demos', desc: 'High-contrast software feature explainers with clear CTAs' },
            { title: 'Educational & Micro-Lessons', desc: 'Structured bite-sized explainers for student engagement' },
            { title: 'Social Media Shorts & Reels', desc: 'Punchy 9:16 vertical formats crafted for high loop-rates' },
            { title: 'Storytelling & Character Monologues', desc: 'Atmospheric narrative arcs with deep vocal cadence' },
            { title: 'Business Thought Leadership', desc: 'Executive-level advisories for LinkedIn and industry forums' },
            { title: 'Motivational Speeches', desc: 'High-energy inspiration with emotive vocal modulation' },
            { title: 'Multi-lingual Localization', desc: 'East African Swahili and global language market expansion' },
          ].map((uc, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 hover:border-slate-700"
            >
              <div className="font-bold text-white text-xs">{uc.title}</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- CTA FOOTER BANNER ----------------- */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-800/60 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Ready to Generate Your First AI Video?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            No signup required. No credit card. Test the full studio workflow, craft your script,
            select your avatar, and render immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-transform hover:scale-[1.02]"
            >
              Open Video Creator Studio
            </button>
            <button
              onClick={onOpenProviderSettings}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-sm transition-colors"
            >
              Inspect Provider API Architecture
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
