import { VideoGenerationConfig, JobPhase, VideoResultData } from '../../src/types';

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
  isConfigured(): boolean;
  supportedFeatures: string[];
  generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: JobPhase; message?: string }>;
  getStatus(jobId: string): Promise<ProviderJobStatus>;
  cancelJob(jobId: string): Promise<boolean>;
}
