import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Upload,
  UserCheck,
  Sparkles,
  FileText,
  Volume2,
  Sliders,
  Layers,
  Subtitles,
  Smartphone,
  Play,
  Pause,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  VolumeX,
  Maximize2,
  Cpu,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import {
  VideoType,
  AvatarMode,
  CharacterPresetId,
  ScriptTone,
  VideoStyle,
  BackgroundType,
  AspectRatio,
  CaptionStyle,
  VideoGenerationConfig,
  VideoResultData,
  ProviderJobStatus,
  ProviderInfo,
} from '../../types';
import {
  CHARACTER_PRESETS,
  VOICE_OPTIONS,
  VIDEO_TYPES,
  VIDEO_STYLES,
  BACKGROUND_OPTIONS,
  ASPECT_RATIOS,
  SCRIPT_TONES,
} from '../../data/presets';
import {
  startVideoGeneration,
  pollVideoStatus,
  cancelVideoGeneration,
  generateAIScript,
  improveAIScript,
} from '../../services/api';

interface VideoCreatorProps {
  initialScript?: string;
  initialVideoType?: VideoType;
  initialTone?: ScriptTone;
  initialAudience?: string;
  onOpenViralAnalyzer: () => void;
  onOpenProviderSettings: () => void;
  activeProvider?: { id: string; name: string; isConfigured: boolean; description: string; isMock?: boolean; category?: string };
}

export const VideoCreator: React.FC<VideoCreatorProps> = ({
  initialScript = '',
  initialVideoType = 'talking_avatar',
  initialTone = 'professional',
  initialAudience = '',
  onOpenViralAnalyzer,
  onOpenProviderSettings,
  activeProvider,
}) => {
  // Step 1: Video Type
  const [videoType, setVideoType] = useState<VideoType>(initialVideoType);

  // Step 2: Avatar
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<CharacterPresetId>('presenter');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [photoConsentConfirmed, setPhotoConsentConfirmed] = useState(false);
  const [customCharacterPrompt, setCustomCharacterPrompt] = useState('');

  // Step 3: Script
  const [script, setScript] = useState<string>(
    initialScript ||
      'Welcome to CineFace AI Studio! Creating photorealistic, captivating presenter videos is now as simple as typing your message. Whether you are launching a product, teaching a concept, or sharing a story, your AI presenter delivers with authentic emotion, perfect eye contact, and natural speech. Get started by customizing your video below!'
  );
  const [targetAudience, setTargetAudience] = useState<string>(initialAudience || 'Modern digital audience');
  const [desiredDurationSeconds, setDesiredDurationSeconds] = useState<number>(30);
  const [tone, setTone] = useState<ScriptTone>(initialTone);

  // AI Script Modal / Drawer
  const [showScriptDrawer, setShowScriptDrawer] = useState(false);
  const [scriptTopicInput, setScriptTopicInput] = useState('');
  const [scriptKeyPointsInput, setScriptKeyPointsInput] = useState('');
  const [aiGeneratingScript, setAiGeneratingScript] = useState(false);
  const [aiImprovingScript, setAiImprovingScript] = useState(false);
  const [improveGoal, setImproveGoal] = useState<'hook' | 'pacing' | 'natural_speech' | 'conversion'>('hook');

  // Step 5: Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('sw_ke_amina');
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);

  // Step 6: Video Style
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('realistic_presenter');

  // Step 7: Background
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('studio');
  const [uploadedBackground, setUploadedBackground] = useState<string | null>(null);

  // Step 8: Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // Step 9: Captions
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('bold_social');

  // Step 10 & 11: Generation & Result
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<ProviderJobStatus | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Result Player State & Simulation
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoIsBuffering, setVideoIsBuffering] = useState(false);
  const [videoHasError, setVideoHasError] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isPlayingScriptAudio, setIsPlayingScriptAudio] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showLayoutTestFrame, setShowLayoutTestFrame] = useState(false);

  // Word count and duration calculation
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(5, Math.round((wordCount / (135 * speakingSpeed)) * 60));

  // Sync initial parameters if transferred from Viral Analyzer
  useEffect(() => {
    if (initialScript) setScript(initialScript);
    if (initialVideoType) setVideoType(initialVideoType);
    if (initialTone) setTone(initialTone);
    if (initialAudience) setTargetAudience(initialAudience);
  }, [initialScript, initialVideoType, initialTone, initialAudience]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG or PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPhoto(event.target?.result as string);
      setAvatarMode('upload');
    };
    reader.readAsDataURL(file);
  };

  // Handle Background Upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedBackground(event.target?.result as string);
      setBackgroundType('custom_upload');
    };
    reader.readAsDataURL(file);
  };

  // Browser Voice Sample Preview
  const handlePlayVoicePreview = (voiceId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (isPlayingVoiceSample) {
      setIsPlayingVoiceSample(false);
      return;
    }

    const voiceObj = VOICE_OPTIONS.find((v) => v.id === voiceId);
    const sampleText =
      voiceObj?.languageCode === 'sw-KE'
        ? 'Jambo! Mimi ni mwakilishi wako wa AI katika CineFace AI Studio.'
        : `Hello! I am your AI video presenter, powered by CineFace.`;

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = speakingSpeed;
    utterance.pitch = voicePitch;
    utterance.lang = voiceObj?.languageCode || 'en-US';

    utterance.onend = () => setIsPlayingVoiceSample(false);
    utterance.onerror = () => setIsPlayingVoiceSample(false);

    setIsPlayingVoiceSample(true);
    window.speechSynthesis.speak(utterance);
  };

  // AI Script Generation
  const handleGenerateAIScript = async () => {
    if (!scriptTopicInput.trim()) {
      alert('Please enter a topic or concept for your script.');
      return;
    }

    try {
      setAiGeneratingScript(true);
      const res = await generateAIScript({
        topicOrIdea: scriptTopicInput,
        videoType,
        targetAudience,
        durationSeconds: desiredDurationSeconds,
        tone,
        keyPoints: scriptKeyPointsInput,
      });

      setScript(res.script);
      setShowScriptDrawer(false);
      setScriptTopicInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to generate script');
    } finally {
      setAiGeneratingScript(false);
    }
  };

  // AI Script Improvement
  const handleImproveScript = async () => {
    if (!script.trim()) return;

    try {
      setAiImprovingScript(true);
      const res = await improveAIScript({
        originalScript: script,
        goal: improveGoal,
        videoType,
        targetAudience,
      });

      setScript(res.improvedScript);
    } catch (err: any) {
      alert(err.message || 'Failed to improve script');
    } finally {
      setAiImprovingScript(false);
    }
  };

  // STEP 10: Start Video Generation
  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      alert('Please provide a script before generating.');
      return;
    }

    if (avatarMode === 'upload') {
      if (!uploadedPhoto) {
        alert('Please upload a photo of the person to generate.');
        return;
      }
      if (!photoConsentConfirmed) {
        alert(
          'Authorization confirmation required: You must confirm that you have permission to create an AI likeness of this person.'
        );
        return;
      }
    }

    const config: VideoGenerationConfig = {
      videoType,
      avatarMode,
      uploadedPhoto: uploadedPhoto || undefined,
      uploadedPhotoConsentConfirmed: photoConsentConfirmed,
      selectedPresetId: avatarMode === 'preset' ? selectedPresetId : undefined,
      customCharacterPrompt: avatarMode === 'custom_character' ? customCharacterPrompt : undefined,
      script,
      targetAudience,
      desiredDurationSeconds: estimatedSeconds,
      tone,
      voiceId: selectedVoiceId,
      speakingSpeed,
      voiceTonePitch: voicePitch,
      videoStyle,
      backgroundType,
      uploadedBackground: uploadedBackground || undefined,
      aspectRatio,
      captionsEnabled,
      captionStyle,
    };

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setVideoResult(null);

      const res = await startVideoGeneration(config);
      setActiveJobId(res.jobId);

      // Start Polling Loop
      pollGenerationProgress(res.jobId);
    } catch (err: any) {
      setIsGenerating(false);
      setGenerationError(err.message || 'Failed to start generation job');
    }
  };

  // Polling Loop with safe cancellation and backoff
  const pollGenerationProgress = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes maximum

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsGenerating(false);
        setGenerationError('Generation timed out. Please check provider connection or retry.');
        return;
      }

      attempts++;
      try {
        const status = await pollVideoStatus(jobId);
        setJobStatus(status);

        if (status.phase === 'completed' && status.result) {
          setVideoResult(status.result);
          setIsGenerating(false);
        } else if (status.phase === 'failed') {
          setIsGenerating(false);
          setGenerationError(status.error || 'Video rendering failed on provider.');
        } else if (status.phase === 'cancelled') {
          setIsGenerating(false);
          setGenerationError('Generation was cancelled.');
        } else {
          // Continue polling
          setTimeout(poll, 1200);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  // Cancel Generation
  const handleCancelGeneration = async () => {
    if (!activeJobId) return;
    try {
      await cancelVideoGeneration(activeJobId);
      setIsGenerating(false);
      setJobStatus({
        phase: 'cancelled',
        phaseLabel: 'Generation Cancelled',
        progressPercent: 0,
      });
    } catch (err) {
      console.error('Cancel error:', err);
      setIsGenerating(false);
    }
  };

  // Reset to create another video
  const handleCreateAnother = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVideoResult(null);
    setJobStatus(null);
    setIsGenerating(false);
    setGenerationError(null);
    setIsPlayingVideo(false);
    setIsPlayingScriptAudio(false);
    setVideoHasError(false);
    setShowLayoutTestFrame(false);
  };

  // Video Player Controls
  const togglePlayVideo = () => {
    if (!videoPlayerRef.current) return;
    if (videoPlayerRef.current.paused) {
      videoPlayerRef.current.play().catch(() => setVideoHasError(true));
      setIsPlayingVideo(true);
    } else {
      videoPlayerRef.current.pause();
      setIsPlayingVideo(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoCurrentTime(time);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.muted = !videoMuted;
    setVideoMuted(!videoMuted);
  };

  const toggleFullscreen = () => {
    if (!videoPlayerRef.current) return;
    if (videoPlayerRef.current.requestFullscreen) {
      videoPlayerRef.current.requestFullscreen();
    }
  };

  const togglePlayScriptAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (isPlayingScriptAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingScriptAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const voiceObj = VOICE_OPTIONS.find((v) => v.id === selectedVoiceId);
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speakingSpeed;
    utterance.pitch = voicePitch;
    utterance.lang = voiceObj?.languageCode || 'en-US';

    utterance.onend = () => setIsPlayingScriptAudio(false);
    utterance.onerror = () => setIsPlayingScriptAudio(false);

    setIsPlayingScriptAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-slate-100">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Video Creation Studio
            </span>
            <span className="text-slate-600">/</span>
            <button
              onClick={onOpenProviderSettings}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Provider: {activeProvider?.name || 'Development Sandbox'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mt-1">
            Studio Workstation
          </h1>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenViralAnalyzer}
            className="px-3.5 py-2 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-800/60 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Reference Video</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Video Type */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Choose Video Type
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Format Intent</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {VIDEO_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setVideoType(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    videoType === t.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Avatar Selection & Legal Consent Safeguard */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Avatar & Digital Likeness
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setAvatarMode('preset')}
                  className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                    avatarMode === 'preset' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Presets
                </button>
                <button
                  onClick={() => setAvatarMode('upload')}
                  className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                    avatarMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload Photo
                </button>
                <button
                  onClick={() => setAvatarMode('custom_character')}
                  className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                    avatarMode === 'custom_character' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Persona
                </button>
              </div>
            </div>

            {/* Sub-view: AI Character Presets */}
            {avatarMode === 'preset' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {CHARACTER_PRESETS.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => {
                        setSelectedPresetId(char.id);
                        setSelectedVoiceId(char.defaultVoice);
                        setTone(char.defaultTone);
                      }}
                      className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center text-center transition-all ${
                        selectedPresetId === char.id
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden mb-1.5 border border-slate-700">
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-semibold text-[11px] text-white truncate w-full">
                        {char.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate w-full">{char.role}</div>
                    </div>
                  ))}
                </div>

                {/* Selected Preset Details */}
                {selectedPresetId && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">
                        {CHARACTER_PRESETS.find((c) => c.id === selectedPresetId)?.name}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        {CHARACTER_PRESETS.find((c) => c.id === selectedPresetId)?.description}
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                      Studio Calibrated
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sub-view: Upload Photo of Authorized Person */}
            {avatarMode === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
                  {uploadedPhoto ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                      <img
                        src={uploadedPhoto}
                        alt="Uploaded likeness"
                        className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Photo Loaded for Identity Preservation</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Facial keypoints will be extracted to maintain identity consistency across lip-sync and
                          subtle head movement.
                        </p>
                        <label className="inline-block text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer pt-1">
                          Replace Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-white">
                        Upload Photo of Authorized Person
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        High-resolution front-facing portrait with clear lighting and neutral expression.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* MANDATORY LEGAL SAFEGUARD CHECKBOX */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="likenessConsent"
                      checked={photoConsentConfirmed}
                      onChange={(e) => setPhotoConsentConfirmed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="likenessConsent"
                      className="text-xs text-slate-200 cursor-pointer leading-relaxed"
                    >
                      <strong className="text-amber-300">Mandatory Likeness Authorization:</strong> I confirm
                      that I own this image or have permission from the person depicted to create an AI
                      likeness. I agree not to create unauthorized impersonations, deceptive media, or
                      defamatory statements.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view: Custom Character Description */}
            {avatarMode === 'custom_character' && (
              <div className="space-y-3">
                <label className="block text-xs text-slate-400">
                  Describe the fictional character you want to synthesize:
                </label>
                <textarea
                  value={customCharacterPrompt}
                  onChange={(e) => setCustomCharacterPrompt(e.target.value)}
                  placeholder="e.g. A 35-year-old aerospace engineer in high-tech laboratory attire, speaking with calm precision, sharp focus, 8k cinematic lighting..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>
            )}
          </div>

          {/* STEP 3: Script Editor & AI Generator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                Spoken Script & Copywriting
              </span>

              {/* AI Script Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScriptDrawer(!showScriptDrawer)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 hover:bg-indigo-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Generate Script</span>
                </button>
                <button
                  onClick={handleImproveScript}
                  disabled={aiImprovingScript || !script.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{aiImprovingScript ? 'Improving...' : 'AI Improve'}</span>
                </button>
              </div>
            </div>

            {/* AI Generator Inline Drawer */}
            {showScriptDrawer && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-200">Gemini 3.8 Flash Scriptwriter</span>
                  <button
                    onClick={() => setShowScriptDrawer(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300">Topic or Core Concept:</label>
                  <input
                    type="text"
                    value={scriptTopicInput}
                    onChange={(e) => setScriptTopicInput(e.target.value)}
                    placeholder="e.g. How to save your first $1,000 without sacrificing your lifestyle..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300">Key Points / Brand Details (Optional):</label>
                  <input
                    type="text"
                    value={scriptKeyPointsInput}
                    onChange={(e) => setScriptKeyPointsInput(e.target.value)}
                    placeholder="e.g. 50/30/20 rule, automated transfers, free budget template link"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleGenerateAIScript}
                    disabled={aiGeneratingScript}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {aiGeneratingScript ? 'Crafting Script...' : 'Generate Spoken Script'}
                  </button>
                </div>
              </div>
            )}

            {/* Large Textarea */}
            <div className="relative">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write or paste your spoken script here..."
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-['Plus_Jakarta_Sans'] leading-relaxed resize-y"
              />

              {/* Script metrics bar */}
              <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-4">
                  <span>
                    <strong className="text-slate-200">{wordCount}</strong> words
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-slate-200">{script.length}</strong> characters
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated Duration: ~<strong>{estimatedSeconds}s</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Target Audience & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Young professionals, e-commerce shoppers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Spoken Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ScriptTone)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {SCRIPT_TONES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label} ({st.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 5: Voice Selection & Multilingual Audio */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  5
                </span>
                Voice, Language & Speed (inc. Swahili)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Multi-Language</span>
            </div>

            {/* Voice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {VOICE_OPTIONS.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoiceId(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedVoiceId === v.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white">{v.name}</span>
                      {v.languageCode === 'sw-KE' && (
                        <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800">
                          Kiswahili
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{v.accent}</div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoicePreview(v.id);
                    }}
                    title="Sample Audio"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sliders: Speed & Pitch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Speaking Speed</span>
                  <span className="font-mono text-slate-200">{speakingSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={speakingSpeed}
                  onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Voice Modulation / Pitch</span>
                  <span className="font-mono text-slate-200">{voicePitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Voice Cloning Notice */}
            <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Unauthorized voice cloning is prohibited. Custom voice models require verified biometric consent.
              </span>
            </div>
          </div>

          {/* STEP 6 & 7: Video Style & Background */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Step 6: Style */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    6
                  </span>
                  Video Visual Style
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VIDEO_STYLES.map((vs) => (
                  <button
                    key={vs.id}
                    onClick={() => setVideoStyle(vs.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      videoStyle === vs.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{vs.label}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{vs.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 7: Background */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    7
                  </span>
                  Background Environment
                </span>
                <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  + Upload Custom BG
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBackgroundType(bg.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      backgroundType === bg.id
                        ? 'border-indigo-500 bg-slate-900 ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg mb-1.5 border border-slate-700/60"
                      style={{ background: bg.preview }}
                    />
                    <div className="font-semibold text-[11px] text-white truncate">{bg.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 8 & 9: Video Format & Captions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Step 8: Aspect Ratio */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  8
                </span>
                Video Format & Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-3">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aspectRatio === ar.id
                        ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{ar.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ar.useCases}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 9: Captions */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    9
                  </span>
                  Subtitles & Social Captions
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <span className="text-slate-400">{captionsEnabled ? 'Enabled' : 'Disabled'}</span>
                  <input
                    type="checkbox"
                    checked={captionsEnabled}
                    onChange={(e) => setCaptionsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              {captionsEnabled && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'bold_social', label: 'Bold Social', sample: 'AMAZING RESULT' },
                    { id: 'karaoke_highlight', label: 'Karaoke Highlight', sample: 'Word By Word' },
                    { id: 'subrip_clean', label: 'SubRip Clean', sample: 'Standard Cinema' },
                    { id: 'minimalist', label: 'Minimalist', sample: 'Subtle Text' },
                  ].map((cs) => (
                    <button
                      key={cs.id}
                      onClick={() => setCaptionStyle(cs.id as CaptionStyle)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        captionStyle === cs.id
                          ? 'bg-slate-800 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{cs.label}</div>
                      <div className="text-[10px] text-amber-300 mt-1 font-mono">{cs.sample}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Preview, Generate CTA & Result Player (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          {/* STEP 10 & 11: Real-Time Generator & Video Player Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {videoResult ? 'Step 11: Generated Video' : 'Real-Time Stage Monitor'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {aspectRatio} · {estimatedSeconds}s
              </span>
            </div>

            {/* Video Preview Frame / Video Player / Development Demo Frame */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center transition-all duration-300 ${
                aspectRatio === '9:16'
                  ? 'aspect-[9/15] max-h-[520px]'
                  : aspectRatio === '16:9'
                  ? 'aspect-video'
                  : 'aspect-square'
              }`}
            >
              {videoResult ? (
                videoResult.isMock ? (
                  // ========================================================
                  // 1. DEVELOPMENT DEMO FRAME (TRUTHFUL & HONEST RESULT)
                  // ========================================================
                  <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-3 overflow-hidden">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <img
                        src={
                          avatarMode === 'upload' && uploadedPhoto
                            ? uploadedPhoto
                            : CHARACTER_PRESETS.find((c) => c.id === selectedPresetId)?.avatarUrl ||
                              CHARACTER_PRESETS[0].avatarUrl
                        }
                        alt="Demo Presenter"
                        className="w-full h-full object-cover object-top opacity-85"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60 pointer-events-none" />

                      {/* Prominent Truthful Watermark Ribbon */}
                      <div className="absolute top-3 inset-x-3 text-center">
                        <div className="inline-block bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                          Development Demo · Real AI Video Not Connected
                        </div>
                      </div>

                      {/* Center Audio Simulation Player */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <button
                          onClick={togglePlayScriptAudio}
                          className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 group mb-3"
                          title="Simulate vocal speech audio"
                        >
                          {isPlayingScriptAudio ? (
                            <Pause className="w-7 h-7" />
                          ) : (
                            <Volume2 className="w-7 h-7 ml-0.5" />
                          )}
                        </button>

                        <div className="text-xs font-bold text-white drop-shadow">
                          {isPlayingScriptAudio ? 'Speaking Script Audio...' : 'Click to Play Spoken Audio'}
                        </div>
                        <div className="text-[10px] text-amber-200/90 mt-0.5 drop-shadow font-medium">
                          {VOICE_OPTIONS.find((v) => v.id === selectedVoiceId)?.name} · {speakingSpeed}x speed
                        </div>

                        {/* Animated waveform visualizer during speech */}
                        {isPlayingScriptAudio && (
                          <div className="flex items-center gap-1 mt-3">
                            <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-4.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="w-1 h-7 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                            <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          </div>
                        )}
                      </div>

                      {/* Captions Preview Bar */}
                      {captionsEnabled && (
                        <div className="absolute bottom-3 inset-x-3 text-center pointer-events-none">
                          <div className="inline-block bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                            <span className="text-[11px] font-bold text-amber-300">
                              "{script.slice(0, 52)}..."
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // ========================================================
                  // 2. PRODUCTION VIDEO PLAYER (REAL AI VIDEO RESULT)
                  // ========================================================
                  <div className="relative w-full h-full bg-black flex items-center justify-center group">
                    <video
                      ref={videoPlayerRef}
                      src={videoResult.videoUrl}
                      poster={videoResult.thumbnailUrl}
                      playsInline
                      loop
                      onTimeUpdate={() => {
                        if (videoPlayerRef.current) {
                          setVideoCurrentTime(videoPlayerRef.current.currentTime);
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (videoPlayerRef.current) {
                          setVideoDuration(videoPlayerRef.current.duration);
                        }
                      }}
                      onWaiting={() => setVideoIsBuffering(true)}
                      onPlaying={() => {
                        setVideoIsBuffering(false);
                        setIsPlayingVideo(true);
                      }}
                      onPause={() => setIsPlayingVideo(false)}
                      onError={() => {
                        setVideoHasError(true);
                        setVideoIsBuffering(false);
                      }}
                      onEnded={() => setIsPlayingVideo(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* Buffering Indicator */}
                    {videoIsBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                      </div>
                    )}

                    {/* Error fallback */}
                    {videoHasError && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                        <div className="text-xs font-bold text-white">Stream Playback Notice</div>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                          Direct video streaming is blocked or URL expired. You can download the video directly below.
                        </p>
                        <a
                          href={videoResult.videoUrl}
                          download="cineface-video.mp4"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                        >
                          Direct Download
                        </a>
                      </div>
                    )}

                    {/* Overlaid Captions Rendering */}
                    {captionsEnabled && !videoHasError && (
                      <div className="absolute bottom-16 inset-x-4 text-center pointer-events-none">
                        <div className="inline-block bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xl">
                          <span
                            className={`text-xs sm:text-sm font-extrabold drop-shadow ${
                              captionStyle === 'bold_social'
                                ? 'text-amber-300 uppercase tracking-wide'
                                : captionStyle === 'karaoke_highlight'
                                ? 'text-emerald-300'
                                : 'text-white'
                            }`}
                          >
                            "{script.slice(0, 75)}..."
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Custom Player Controls Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 flex flex-col gap-1.5 transition-opacity">
                      {/* Timeline Scrubber */}
                      <input
                        type="range"
                        min="0"
                        max={videoDuration || videoResult.durationSeconds || 10}
                        step="0.1"
                        value={videoCurrentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayVideo}
                            className="p-1 hover:text-white transition-colors"
                          >
                            {isPlayingVideo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <span className="font-mono text-[10px] text-slate-400">
                            {formatSeconds(videoCurrentTime)} / {formatSeconds(videoDuration || videoResult.durationSeconds)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="p-1 hover:text-white transition-colors"
                          >
                            {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={toggleFullscreen}
                            className="p-1 hover:text-white transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Live Stage Setup Preview
                <div className="relative w-full h-full">
                  <img
                    src={
                      avatarMode === 'upload' && uploadedPhoto
                        ? uploadedPhoto
                        : CHARACTER_PRESETS.find((c) => c.id === selectedPresetId)?.avatarUrl ||
                          CHARACTER_PRESETS[0].avatarUrl
                    }
                    alt="Presenter Preview"
                    className="w-full h-full object-cover object-top"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-slate-300 border border-white/10">
                    <span>{VIDEO_STYLES.find((s) => s.id === videoStyle)?.label}</span>
                  </div>

                  {/* Live Caption Preview */}
                  {captionsEnabled && (
                    <div className="absolute bottom-4 inset-x-3 text-center">
                      <div className="inline-block bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                        <span className="text-xs font-bold text-amber-300">
                          "{script.slice(0, 48)}..."
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Generation Notice</div>
                  <p>{generationError}</p>
                </div>
              </div>
            )}

            {/* Render Progress States (STEP 10 PROGRESSION) */}
            {isGenerating && jobStatus && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-900/60 space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{jobStatus.phaseLabel}</span>
                  </span>
                  <span className="font-mono text-slate-400">{jobStatus.progressPercent}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
                    style={{ width: `${jobStatus.progressPercent}%` }}
                  />
                </div>

                {jobStatus.details && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">{jobStatus.details}</p>
                )}

                <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500">
                  <span>Engine: {activeProvider?.name || 'Sandbox Simulation'}</span>
                  <button
                    onClick={handleCancelGeneration}
                    className="text-red-400 hover:text-red-300 font-medium"
                  >
                    Cancel Generation
                  </button>
                </div>
              </div>
            )}

            {/* Video Result Actions (STEP 11) */}
            {videoResult ? (
              videoResult.isMock ? (
                // Development Demo Result Card
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-xs space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Development Demo — Real AI video generation is not connected</span>
                    </div>
                    <p className="text-[11px] text-amber-100/90 leading-relaxed">
                      This sandbox verified your photo likeness framing, aspect ratio ({videoResult.aspectRatio}), duration timing (~{videoResult.durationSeconds}s), and vocal cadence without consuming external API credits. No external video was generated from your photo.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-amber-300/80">Want real photorealistic lip-sync?</span>
                      <button
                        onClick={onOpenProviderSettings}
                        className="text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-500 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Connect HeyGen</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Demo Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Aspect Ratio</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {videoResult.aspectRatio}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Simulated Time</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {videoResult.durationSeconds}s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Voice Preset</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {VOICE_OPTIONS.find((v) => v.id === selectedVoiceId)?.name.split(' ')[0] || 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenProviderSettings}
                      className="flex-1 py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Configure Real Provider (HeyGen)</span>
                    </button>

                    <button
                      onClick={handleCopyScript}
                      className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                      title="Copy script text"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Copied' : 'Script'}</span>
                    </button>

                    <button
                      onClick={handleCreateAnother}
                      className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Production Real Video Result Card
                <div className="space-y-3 pt-2">
                  {/* Result Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Dimensions</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {videoResult.width}x{videoResult.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Duration</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {videoResult.durationSeconds}s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">File Size</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {videoResult.fileSizeEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Provider Note & Expiration Warning */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div>
                      Rendered by <strong className="text-white">{videoResult.provider}</strong>
                    </div>
                    <div className="text-[10px] text-amber-300/90 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Provider download link: Download your MP4 immediately as cloud links expire after 24 hours.</span>
                    </div>
                  </div>

                  {/* Primary Result Buttons */}
                  <div className="flex items-center gap-3">
                    <a
                      href={videoResult.videoUrl}
                      download={`cineface-video-${Date.now()}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform hover:scale-[1.02]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Video (MP4)</span>
                    </a>

                    <button
                      onClick={handleCreateAnother}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Create Another</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              // STEP 10: Generate Video CTA
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                    activeProvider?.id === 'mock' || !activeProvider?.isConfigured
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 hover:shadow-amber-600/50'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-600/50'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>
                    {activeProvider?.id === 'mock' || !activeProvider?.isConfigured
                      ? 'Run Development Demo (Simulation)'
                      : `Generate Photorealistic Avatar (${activeProvider?.name.split(' ')[0] || 'HeyGen'})`}
                  </span>
                </button>

                <div className="text-center text-[11px] text-slate-400">
                  {activeProvider?.id === 'mock' || !activeProvider?.isConfigured ? (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-amber-300">Development Mode:</span>{' '}
                      <span>Connect HeyGen in Provider Settings to generate real AI videos from your photo.</span>
                    </div>
                  ) : (
                    <div>
                      Photorealistic avatar synthesis with lifelike lip-sync and 60fps face kinematics via HeyGen.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
