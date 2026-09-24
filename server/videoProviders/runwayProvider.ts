import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData } from '../../src/types';

export class RunwayVideoProvider implements IVideoGenerationProvider {
  public id = 'runway';
  public name = 'Runway Gen-3 / Gen-4 Alpha';
  public description = 'Cinematic video generation with rich lighting and camera motion. NOTE: Runway is an atmospheric diffusion model; it produces ambient scenes/B-roll and does NOT support lip-synchronized talking avatars from uploaded photos.';
  public category = 'generative_broll' as const;
  public categoryLabel = 'Generative B-Roll (Not Talking-Avatar Lip-Sync)';
  public configurationKeyName = 'RUNWAY_API_KEY';
  public configurationHelp = 'Obtain an API key at https://runwayml.com/ and set RUNWAY_API_KEY in your environment variables.';

  public supportedFeatures = [
    'Cinematic Camera Movement & Depth of Field',
    'Atmospheric Video Synthesis & Motion',
    'High Resolution 720p/1080p Generation',
    'Ambient B-Roll Generation',
  ];

  public capabilities = {
    talkingPhoto: false, // Honest: does not create lip-synced talking avatars
    customScript: false,
    lipSync: false,      // Honest: does not perform viseme mouth sync
    swahiliSupport: false,
    aspectRatio916: true,
  };

  public isConfigured(): boolean {
    const key = process.env.RUNWAY_API_KEY;
    return Boolean(key && key.trim().length > 0 && !key.includes('your-runway-api-key'));
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey || !this.isConfigured()) {
      throw new Error('RUNWAY_API_KEY is not configured on the server.');
    }

    const promptText = `Cinematic commercial scene related to: ${config.script.slice(0, 160)}. Professional studio lighting, subtle camera motion, high production value.`;

    const response = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-09-13',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptImage: config.uploadedPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        promptText,
        model: 'gen3a_turbo',
        ratio: config.aspectRatio === '9:16' ? '768:1280' : '1280:768',
        duration: Math.min(10, config.desiredDurationSeconds || 5),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Runway API error (${response.status}): ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      jobId: data.id,
      status: 'queued',
      message: 'Runway Gen-3 generation task accepted.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return { phase: 'failed', phaseLabel: 'API Key Missing', progressPercent: 0, error: 'RUNWAY_API_KEY is not configured.' };
    }

    try {
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });

      if (!response.ok) {
        return { phase: 'failed', phaseLabel: 'Status check failed', progressPercent: 0, error: `Runway error ${response.status}` };
      }

      const data = await response.json();
      const status = data.status; // 'PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'

      if (status === 'SUCCEEDED') {
        const videoUrl = data.output?.[0];
        const result: VideoResultData = {
          jobId,
          videoUrl,
          thumbnailUrl: '',
          durationSeconds: 10,
          aspectRatio: '16:9',
          width: 1280,
          height: 768,
          fileSizeEstimate: '8 MB',
          generatedAt: new Date().toISOString(),
          provider: 'Runway Gen-3 Alpha (Generative B-Roll)',
          isMock: false,
          script: '',
          voiceName: 'Runway Ambient',
        };
        return { phase: 'completed', phaseLabel: 'Video Ready', progressPercent: 100, result };
      } else if (status === 'FAILED') {
        return { phase: 'failed', phaseLabel: 'Generation Failed', progressPercent: 0, error: data.failure || 'Runway video synthesis failed.' };
      } else {
        return { phase: 'rendering_video', phaseLabel: 'Synthesizing cinematic frames on Runway...', progressPercent: 60 };
      }
    } catch (err: any) {
      return { phase: 'failed', phaseLabel: 'Network Error', progressPercent: 0, error: err.message };
    }
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) return false;
    try {
      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-09-13',
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getResult(jobId: string): Promise<VideoResultData | null> {
    const status = await this.getStatus(jobId);
    return status.result || null;
  }
}
