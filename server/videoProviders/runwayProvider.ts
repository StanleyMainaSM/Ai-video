import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData } from '../../src/types';

export class RunwayVideoProvider implements IVideoGenerationProvider {
  public id = 'runway';
  public name = 'Runway Gen-3 / Gen-4 Alpha';
  public description = 'Cinematic video generation with rich lighting, temporal consistency, and camera movement.';
  public supportedFeatures = [
    'Image-to-Video Realistic Motion',
    'Cinematic Lighting & Depth of Field',
    'High Resolution 720p/1080p',
    'Temporal Motion Smoothness',
  ];

  public isConfigured(): boolean {
    return Boolean(process.env.RUNWAY_API_KEY && process.env.RUNWAY_API_KEY.trim().length > 0);
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      throw new Error('RUNWAY_API_KEY environment variable is not configured.');
    }

    const promptText = `Photorealistic presenter speaking naturally directly to camera. ${config.script.slice(0, 150)}. Consistent facial features, natural blinking and head movements. High quality studio lighting, sharp 8k resolution.`;

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
          provider: 'Runway Gen-3 Alpha',
          isMock: false,
          script: '',
          voiceName: 'Runway Native',
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
}
