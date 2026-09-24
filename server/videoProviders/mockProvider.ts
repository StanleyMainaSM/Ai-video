import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData } from '../../src/types';

interface StoredJob {
  id: string;
  config: VideoGenerationConfig;
  startedAt: number;
  status: ProviderJobStatus;
  cancelled?: boolean;
}

export class MockDevelopmentVideoProvider implements IVideoGenerationProvider {
  public id = 'mock';
  public name = 'Mock Development Sandbox';
  public description = 'Local test simulation provider for offline development without paid external API keys.';
  public supportedFeatures = [
    'Uploaded Photo Avatars',
    'AI Presets',
    'Custom Character Prompt',
    'Multi-language Voices (inc. Swahili)',
    'Aspect Ratios (9:16, 16:9, 1:1)',
    'Dynamic Captions',
    'Realistic Generation Pipeline States',
  ];

  private jobs = new Map<string, StoredJob>();

  public isConfigured(): boolean {
    return true; // Always available as testing fallback
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const jobId = 'mock_job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const initialStatus: ProviderJobStatus = {
      phase: 'queued',
      phaseLabel: 'Queued in generation queue...',
      progressPercent: 5,
      details: 'Allocating rendering compute in development sandbox...',
    };

    const job: StoredJob = {
      id: jobId,
      config,
      startedAt: Date.now(),
      status: initialStatus,
    };

    this.jobs.set(jobId, job);

    // Simulate progressive asynchronous rendering pipeline
    this.runMockPipeline(jobId);

    return {
      jobId,
      status: 'queued',
      message: 'Video job queued in development sandbox provider.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        phase: 'failed',
        phaseLabel: 'Job not found',
        progressPercent: 0,
        error: `Job ${jobId} not found in provider queue.`,
      };
    }
    return job.status;
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status.phase === 'completed' || job.status.phase === 'failed') return false;

    job.cancelled = true;
    job.status = {
      phase: 'cancelled',
      phaseLabel: 'Generation cancelled',
      progressPercent: 0,
      details: 'Generation was aborted by user.',
    };
    return true;
  }

  private async runMockPipeline(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const stages: Array<{ phase: ProviderJobStatus['phase']; label: string; details: string; percent: number; delayMs: number }> = [
      { phase: 'preparing_script', label: 'Preparing script & phoneme tokens...', details: 'Analyzing phonetic pronunciation and sentence pauses...', percent: 18, delayMs: 1400 },
      { phase: 'creating_voice', label: 'Synthesizing voice & acoustic cadence...', details: `Generating natural vocal track (${job.config.speakingSpeed}x speed, ${job.config.voiceId})...`, percent: 38, delayMs: 1600 },
      { phase: 'generating_avatar', label: 'Synthesizing facial topology & eye contact...', details: 'Rendering natural eye blinking, micro-expressions and head tilting...', percent: 62, delayMs: 2000 },
      { phase: 'rendering_video', label: 'Rendering lip synchronization & frames...', details: 'Aligning audio waveforms with viseme mouth geometry at 60fps...', percent: 85, delayMs: 2200 },
      { phase: 'finalizing', label: 'Finalizing high-resolution output...', details: 'Applying color grading, studio lighting and caption alignment...', percent: 96, delayMs: 1200 },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, stage.delayMs));
      const current = this.jobs.get(jobId);
      if (!current || current.cancelled) return;

      current.status = {
        phase: stage.phase,
        phaseLabel: stage.label,
        progressPercent: stage.percent,
        details: stage.details,
      };
    }

    // Pipeline completed
    const current = this.jobs.get(jobId);
    if (!current || current.cancelled) return;

    const width = current.config.aspectRatio === '9:16' ? 1080 : current.config.aspectRatio === '1:1' ? 1080 : 1920;
    const height = current.config.aspectRatio === '9:16' ? 1920 : current.config.aspectRatio === '1:1' ? 1080 : 1080;
    const duration = Math.max(10, current.config.desiredDurationSeconds || 25);

    // Reliable sample video URLs tailored for testing
    // Using high quality video samples with presenter feel
    const sampleVideos: Record<string, string> = {
      '9:16': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      '16:9': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      '1:1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    };

    const videoUrl = sampleVideos[current.config.aspectRatio] || sampleVideos['16:9'];
    const thumbnailUrl = current.config.uploadedPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

    const resultData: VideoResultData = {
      jobId,
      videoUrl,
      thumbnailUrl,
      durationSeconds: duration,
      aspectRatio: current.config.aspectRatio,
      width,
      height,
      fileSizeEstimate: `${(duration * 0.45).toFixed(1)} MB`,
      generatedAt: new Date().toISOString(),
      provider: 'Mock Development Sandbox (Simulation)',
      isMock: true,
      script: current.config.script,
      voiceName: current.config.voiceId,
    };

    current.status = {
      phase: 'completed',
      phaseLabel: 'Video Ready for Preview & Download',
      progressPercent: 100,
      details: 'All rendering stages completed in development sandbox.',
      result: resultData,
    };
  }
}
