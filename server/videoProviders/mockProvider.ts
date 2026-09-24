import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData, AspectRatio } from '../../src/types';

interface MockJobPayload {
  startTime: number;
  aspectRatio: AspectRatio;
  duration: number;
  uploadedPhoto?: string;
  script: string;
  voiceId: string;
  cancelled?: boolean;
}

// In-memory fallback map for active session cancel actions
const activeJobs = new Map<string, MockJobPayload>();

export class MockDevelopmentVideoProvider implements IVideoGenerationProvider {
  public id = 'mock';
  public name = 'Development Demo Sandbox';
  public description = 'Offline test simulation provider for testing UI, script timing, and workflow without consuming commercial API keys.';
  public category = 'demo_sandbox' as const;
  public categoryLabel = 'Development Sandbox (Simulation)';
  public configurationKeyName = 'AI_VIDEO_PROVIDER=mock';
  public configurationHelp = 'Always available for zero-cost development and workflow verification.';

  public supportedFeatures = [
    'Offline Workflow & Step Navigation Testing',
    'Spoken Script Cadence & Duration Verification',
    'Uploaded Photo Aspect-Ratio Preview (9:16, 16:9, 1:1)',
    'Biometric Consent & Legal Safeguard Enforcement',
    'Stateless Pipeline Simulation (Vercel Serverless Ready)',
  ];

  public capabilities = {
    talkingPhoto: false, // Honest: does not synthesize live facial animation
    customScript: true,
    lipSync: false,      // Honest: does not synthesize lip synchronization
    swahiliSupport: true,
    aspectRatio916: true,
  };

  public isConfigured(): boolean {
    return true; // Always available as local development sandbox
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const now = Date.now();
    const duration = Math.max(5, config.desiredDurationSeconds || 25);
    const sanitizedAspect = config.aspectRatio || '9:16';

    // Stateless jobId encoding: mock_demo_<timestamp>_<aspectRatio>_<duration>
    const jobId = `mock_demo_${now}_${sanitizedAspect.replace(':', 'x')}_${duration}s_${Math.random().toString(36).substring(2, 6)}`;

    // Store ephemeral payload for this session
    activeJobs.set(jobId, {
      startTime: now,
      aspectRatio: sanitizedAspect,
      duration,
      uploadedPhoto: config.uploadedPhoto,
      script: config.script,
      voiceId: config.voiceId,
      cancelled: false,
    });

    return {
      jobId,
      status: 'queued',
      message: 'Development Demo simulation job queued.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const memoryJob = activeJobs.get(jobId);

    // If memoryJob was lost due to serverless restart, parse encoded metadata from jobId
    let startTime = memoryJob?.startTime;
    let aspectRatio: AspectRatio = memoryJob?.aspectRatio || '9:16';
    let duration = memoryJob?.duration || 25;
    let uploadedPhoto = memoryJob?.uploadedPhoto || '';
    let script = memoryJob?.script || '';
    let voiceId = memoryJob?.voiceId || 'sw_ke_amina';

    if (!startTime) {
      const match = jobId.match(/^mock_demo_(\d+)_([0-9x]+)_(\d+)s/);
      if (match) {
        startTime = parseInt(match[1], 10);
        aspectRatio = (match[2].replace('x', ':') as AspectRatio) || '9:16';
        duration = parseInt(match[3], 10) || 25;
      } else {
        startTime = Date.now() - 10000; // default to completed if unparseable
      }
    }

    if (memoryJob?.cancelled) {
      return {
        phase: 'cancelled',
        phaseLabel: 'Generation Cancelled',
        progressPercent: 0,
        details: 'Simulation aborted by user.',
      };
    }

    const elapsed = Date.now() - startTime;

    // Progressive stage simulation
    if (elapsed < 1400) {
      return {
        phase: 'preparing_script',
        phaseLabel: 'Development Demo: Preparing script tokens...',
        progressPercent: 18,
        details: 'Calculating duration estimates and phonetic cadence for offline preview...',
      };
    }

    if (elapsed < 3200) {
      return {
        phase: 'creating_voice',
        phaseLabel: 'Development Demo: Simulating vocal track cadence...',
        progressPercent: 42,
        details: `Simulating ${voiceId} acoustic synthesis without external API...`,
      };
    }

    if (elapsed < 5200) {
      return {
        phase: 'generating_avatar',
        phaseLabel: 'Development Demo: Checking avatar image geometry...',
        progressPercent: 68,
        details: 'Verifying portrait boundaries and aspect ratio fit...',
      };
    }

    if (elapsed < 7200) {
      return {
        phase: 'rendering_video',
        phaseLabel: 'Development Demo: Simulating rendering pipeline...',
        progressPercent: 88,
        details: 'Running simulated pipeline frames (No third-party video API called)...',
      };
    }

    // COMPLETED STATE: Strictly honest.
    // videoUrl is intentionally empty ('') so the application NEVER substitutes
    // unrelated stock cartoons or public videos (Big Buck Bunny, ForBiggerBlazes, etc.)
    const width = aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920;
    const height = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080;

    const resultData: VideoResultData = {
      jobId,
      videoUrl: '', // NEVER return stock sample videos
      thumbnailUrl: uploadedPhoto,
      durationSeconds: duration,
      aspectRatio,
      width,
      height,
      fileSizeEstimate: `${(duration * 0.38).toFixed(1)} MB (simulated)`,
      generatedAt: new Date(startTime).toISOString(),
      provider: 'Development Demo (Offline Simulation)',
      isMock: true,
      script,
      voiceName: voiceId,
      demoMessage: 'Development Demo — Real AI video generation is not connected.',
    };

    return {
      phase: 'completed',
      phaseLabel: 'Development Demo Ready',
      progressPercent: 100,
      details: 'Development sandbox completed simulation without calling external APIs.',
      result: resultData,
    };
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const job = activeJobs.get(jobId);
    if (job) {
      job.cancelled = true;
      return true;
    }
    return true;
  }

  public async getResult(jobId: string): Promise<VideoResultData | null> {
    const status = await this.getStatus(jobId);
    return status.result || null;
  }
}
