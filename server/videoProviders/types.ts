import { VideoGenerationConfig, JobPhase, VideoResultData, ProviderCategory, ProviderCapabilities } from '../../src/types';

export interface ProviderJobStatus {
  phase: JobPhase;
  phaseLabel: string;
  progressPercent: number;
  details?: string;
  result?: VideoResultData;
  error?: string;
}

export interface IVideoGenerationProvider {
  id: string;
  name: string;
  description: string;
  category: ProviderCategory;
  categoryLabel: string;
  configurationKeyName?: string;
  configurationHelp?: string;
  isConfigured(): boolean;
  supportedFeatures: string[];
  capabilities: ProviderCapabilities;
  generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: JobPhase; message?: string }>;
  getStatus(jobId: string): Promise<ProviderJobStatus>;
  cancelJob(jobId: string): Promise<boolean>;
  getResult?(jobId: string): Promise<VideoResultData | null>;
}
