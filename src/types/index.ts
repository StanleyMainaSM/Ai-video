export type VideoType =
  | 'talking_avatar'
  | 'product_ad'
  | 'social_media'
  | 'educational'
  | 'motivational'
  | 'storytelling'
  | 'custom';

export type AvatarMode = 'upload' | 'preset' | 'custom_character';

export type CharacterPresetId =
  | 'young_professional'
  | 'older_professional'
  | 'teacher'
  | 'entrepreneur'
  | 'fitness_coach'
  | 'storyteller'
  | 'wise_elder'
  | 'monk'
  | 'presenter';

export interface CharacterPreset {
  id: CharacterPresetId;
  name: string;
  role: string;
  avatarUrl: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
  defaultVoice: string;
  defaultTone: ScriptTone;
}

export type ScriptTone =
  | 'professional'
  | 'energetic'
  | 'conversational'
  | 'emotional'
  | 'educational'
  | 'humorous'
  | 'motivational'
  | 'persuasive'
  | 'calm'
  | 'storytelling';

export type VideoStyle =
  | 'realistic_presenter'
  | 'cinematic'
  | 'professional_ad'
  | 'social_media'
  | 'educational'
  | 'documentary'
  | 'motivational'
  | 'storytelling'
  | 'custom';

export type BackgroundType =
  | 'plain'
  | 'studio'
  | 'office'
  | 'classroom'
  | 'outdoor'
  | 'cinematic'
  | 'product_focused'
  | 'custom_upload';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type CaptionStyle =
  | 'subrip_clean'
  | 'bold_social'
  | 'karaoke_highlight'
  | 'minimalist';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  languageCode: string;
  accent: string;
  previewSample?: string;
  description: string;
}

export interface VideoGenerationConfig {
  videoType: VideoType;
  avatarMode: AvatarMode;
  uploadedPhoto?: string; // Data URL or storage URI
  uploadedPhotoConsentConfirmed: boolean;
  selectedPresetId?: CharacterPresetId;
  customCharacterPrompt?: string;
  script: string;
  targetAudience: string;
  desiredDurationSeconds: number;
  tone: ScriptTone;
  voiceId: string;
  speakingSpeed: number; // 0.75 - 1.5
  voiceTonePitch: number; // 0.8 - 1.2
  videoStyle: VideoStyle;
  backgroundType: BackgroundType;
  uploadedBackground?: string;
  aspectRatio: AspectRatio;
  captionsEnabled: boolean;
  captionStyle: CaptionStyle;
}

export type JobPhase =
  | 'idle'
  | 'queued'
  | 'preparing_script'
  | 'creating_voice'
  | 'generating_avatar'
  | 'rendering_video'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface VideoJobProgress {
  phase: JobPhase;
  phaseLabel: string;
  progressPercent: number; // 0 - 100
  details?: string;
}

export interface VideoResultData {
  jobId: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  fileSizeEstimate: string;
  generatedAt: string;
  provider: string;
  isMock: boolean;
  script: string;
  voiceName: string;
}

export interface ReferenceAnalysisResult {
  referenceTopic: string;
  userProduct: string;
  targetAudience: string;
  referenceAnalysis: {
    hook: string;
    structure: string;
    pacing: string;
    curiosityMechanisms: string;
    emotionalApproach: string;
    informationSequence: string;
    ctaStructure: string;
    visualRhythm: string;
    captionStrategy: string;
    approximateDuration: string;
    audienceTargeting: string;
    generalPresentationStyle: string;
  };
  originalConcept: {
    title: string;
    conceptSummary: string;
    originalHook: string;
    originalStructure: string;
    contentStrategy: string;
    originalCta: string;
    originalScript: string;
    suggestedVideoType: VideoType;
    suggestedTone: ScriptTone;
    estimatedDurationSeconds: number;
  };
}

export interface ProviderJobStatus {
  phase: JobPhase;
  phaseLabel: string;
  progressPercent: number;
  details?: string;
  result?: VideoResultData;
  error?: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  isActive: boolean;
  supportedFeatures: string[];
}
