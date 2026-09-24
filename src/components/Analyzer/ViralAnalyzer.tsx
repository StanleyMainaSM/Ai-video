import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  Layers,
  Clock,
  Target,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { ReferenceAnalysisResult, VideoType, ScriptTone } from '../../types';
import { analyzeReferenceVideoApi } from '../../services/api';

interface ViralAnalyzerProps {
  onTransferToStudio: (data: {
    script: string;
    videoType: VideoType;
    tone: ScriptTone;
    targetAudience: string;
    productName: string;
  }) => void;
}

export const ViralAnalyzer: React.FC<ViralAnalyzerProps> = ({ onTransferToStudio }) => {
  const [referenceContent, setReferenceContent] = useState('');
  const [userProduct, setUserProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReferenceAnalysisResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Quick preset loader to help user test immediately
  const handleLoadSample = (sampleType: 'finance' | 'fitness' | 'saas') => {
    if (sampleType === 'finance') {
      setReferenceContent(
        'A viral TikTok about personal debt where the creator starts by tearing up a mock credit card statement. Hook: "The banks make $140 billion a year because you don\'t know this one loophole." Explains compound interest traps, contrasts minimum payments with principal paydown, and finishes with a spreadsheet download link.'
      );
      setUserProduct('Personal Finance Starter E-Book & Budget Planner');
      setTargetAudience('Young adults and college graduates with entry-level salaries');
      setIndustry('Personal Finance / Digital Publishing');
    } else if (sampleType === 'fitness') {
      setReferenceContent(
        'Short video about morning mobility. Opening hook: "If your lower back hurts every morning at 7 AM, stop stretching your hamstrings." Shows unexpected hip flexor drill, explains anatomy in 10 seconds, finishes with "Save this and try it tomorrow morning."'
      );
      setUserProduct('15-Minute Desk Worker Mobility Video Course');
      setTargetAudience('Remote workers sitting 8+ hours a day');
      setIndustry('Health & Wellness');
    } else {
      setReferenceContent(
        'Fast-paced B2B SaaS demo. Opening: "I spent 4 hours every Monday writing client reports until I discovered this automation." Side-by-side timer comparison of manual spreadsheet vs automated PDF. Call to action: "Try the free 7-day trial in my bio."'
      );
      setUserProduct('Automated Client Invoicing & Reporting Tool');
      setTargetAudience('Freelancers, agency founders, and solo consultants');
      setIndustry('Productivity / Software');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceContent.trim()) {
      setError('Please provide reference video notes, topic, or transcript.');
      return;
    }
    if (!userProduct.trim()) {
      setError('Please provide your product or topic to formulate an original adaptation.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const analysis = await analyzeReferenceVideoApi({
        referenceContent,
        userProduct,
        targetAudience: targetAudience || 'Target audience',
        industry,
      });
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to complete analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendToStudio = () => {
    if (!result) return;
    onTransferToStudio({
      script: result.originalConcept.originalScript,
      videoType: result.originalConcept.suggestedVideoType || 'product_ad',
      tone: result.originalConcept.suggestedTone || 'persuasive',
      targetAudience: result.targetAudience,
      productName: result.userProduct,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-100">
      {/* Title & Safeguard Banner */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Content Architecture Intelligence</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              Analyze a High-Performing Video
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Deconstruct the structural psychology, hook mechanisms, and pacing of top-performing content.
              Our Gemini AI engine formulates a <strong>100% original script and presentation strategy</strong> tailored
              for your own product without copying or copyright infringement.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="shrink-0 flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] px-2 font-medium">Test Presets:</span>
            <button
              onClick={() => handleLoadSample('finance')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              Finance E-Book
            </button>
            <button
              onClick={() => handleLoadSample('saas')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              SaaS Tool
            </button>
            <button
              onClick={() => handleLoadSample('fitness')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              Fitness Course
            </button>
          </div>
        </div>

        {/* Ethical Non-Plagiarism Assurance */}
        <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-900/60 text-xs flex items-center gap-3 text-slate-300">
          <ShieldAlert className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong>Anti-Plagiarism Protection:</strong> The analyzer never copies verbatim sentences.
            It isolates underlying pacing and cognitive curiosity loops, then invents fresh wording, new analogies,
            and custom scenarios.
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Video Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Reference Video Notes / Transcript / Hook
            </label>
            <textarea
              value={referenceContent}
              onChange={(e) => setReferenceContent(e.target.value)}
              placeholder="Paste transcript, description of what happens in the video, how it hooks the viewer, pacing, or topic breakdown..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 placeholder:text-slate-600 leading-relaxed resize-y"
            />
            <div className="text-[11px] text-slate-500">
              Tip: Detail what makes the opening 3 seconds memorable and how information is sequenced.
            </div>
          </div>

          {/* User's Own Product & Target Audience */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Your Product, E-Book, or Topic
              </label>
              <input
                type="text"
                value={userProduct}
                onChange={(e) => setUserProduct(e.target.value)}
                placeholder="e.g. Personal finance e-book, B2B SaaS tool, Coffee subscription..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  3. Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Young adults, creators, parents..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  4. Industry / Niche (Optional)
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Finance, Education, Software..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Deconstructing Content Strategy & Generating Original Concept...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Analyze Content Strategy & Generate Original Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* ----------------- STRUCTURED ANALYSIS & ORIGINAL OUTPUT ----------------- */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Action Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-violet-400">
                Strategy Synthesis Complete
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {result.originalConcept.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Original adapted concept tailored for <strong>{result.userProduct}</strong>
              </p>
            </div>

            <button
              onClick={handleSendToStudio}
              className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Create My Original Video</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COLUMN 1: REFERENCE ANALYSIS (40%) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-violet-400" />
                  REFERENCE ANALYSIS (Structure & DNA)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Deconstructed</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs divide-y divide-slate-800/80">
                {/* Hook */}
                <div className="space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">OPENING HOOK</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.hook}</p>
                </div>

                {/* Structure */}
                <div className="pt-3 space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">CONTENT STRUCTURE</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.structure}</p>
                </div>

                {/* Pacing */}
                <div className="pt-3 space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">PACING & TEMPO</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.pacing}</p>
                </div>

                {/* Curiosity */}
                <div className="pt-3 space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">CURIOSITY MECHANISMS</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.curiosityMechanisms}</p>
                </div>

                {/* Information Sequence */}
                <div className="pt-3 space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">INFORMATION SEQUENCE</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.informationSequence}</p>
                </div>

                {/* CTA Structure */}
                <div className="pt-3 space-y-1">
                  <span className="font-bold text-violet-300 block text-xs">CTA STRUCTURE</span>
                  <p className="text-slate-300 leading-relaxed">{result.referenceAnalysis.ctaStructure}</p>
                </div>

                {/* Visual & Caption Rhythm */}
                <div className="pt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-400 block">VISUAL RHYTHM</span>
                    <span className="text-slate-300">{result.referenceAnalysis.visualRhythm}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block">CAPTIONS</span>
                    <span className="text-slate-300">{result.referenceAnalysis.captionStrategy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: ORIGINAL VIDEO CONCEPT & SCRIPT (60%) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  ORIGINAL VIDEO CONCEPT (Tailored for You)
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono">100% Unique Script</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
                {/* Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-300 text-xs">STRATEGIC ANGLE</span>
                  <p className="text-slate-300 leading-relaxed">{result.originalConcept.conceptSummary}</p>
                </div>

                {/* Original Hook */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                      Original Opening Hook (First 3 Seconds)
                    </span>
                    <button
                      onClick={() => handleCopy(result.originalConcept.originalHook, 'hook')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === 'hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'hook' ? 'Copied' : 'Copy Hook'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-200 font-medium text-xs sm:text-sm">
                    "{result.originalConcept.originalHook}"
                  </div>
                </div>

                {/* Complete Original Spoken Script */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Complete Spoken Script Draft
                    </span>
                    <button
                      onClick={() => handleCopy(result.originalConcept.originalScript, 'script')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {copiedField === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'script' ? 'Copied Script' : 'Copy Entire Script'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-['JetBrains_Mono'] text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {result.originalConcept.originalScript}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Estimated Duration: ~{result.originalConcept.estimatedDurationSeconds}s
                    </span>
                    <span>
                      Words: {result.originalConcept.originalScript.split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                </div>

                {/* Original CTA */}
                <div className="space-y-1">
                  <span className="font-bold text-slate-300 text-xs">ORIGINAL CALL TO ACTION</span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {result.originalConcept.originalCta}
                  </div>
                </div>

                {/* Direct Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleSendToStudio}
                    className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
                  >
                    <Video className="w-4 h-4" />
                    <span>Create My Original Video with This Script</span>
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setReferenceContent('');
                      setUserProduct('');
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Analyze Another Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
