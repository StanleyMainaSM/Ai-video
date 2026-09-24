import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData } from '../../src/types';

export class HeyGenVideoProvider implements IVideoGenerationProvider {
  public id = 'heygen';
  public name = 'HeyGen Photorealistic Avatar API';
  public description = 'Production avatar generation with lifelike lip-sync and identity preservation.';
  public supportedFeatures = [
    'Uploaded Photo Likeness (with consent)',
    'Talking Photo API v2',
    'Custom Avatars',
    'Ultra-accurate Viseme Lip Sync',
    'Multi-language TTS (including Swahili)',
    'Full HD 1080p Export',
  ];

  public isConfigured(): boolean {
    return Boolean(process.env.HEYGEN_API_KEY && process.env.HEYGEN_API_KEY.trim().length > 0);
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      throw new Error('HEYGEN_API_KEY environment variable is not configured on the server.');
    }

    // Call HeyGen v2 Video Generate API
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: config.avatarMode === 'upload' ? 'talking_photo' : 'avatar',
              talking_photo_url: config.uploadedPhoto || undefined,
              avatar_id: config.selectedPresetId || 'Daisy-inskirt-20220818',
            },
            voice: {
              type: 'text',
              input_text: config.script,
              voice_id: config.voiceId,
              speed: config.speakingSpeed,
            },
            background: {
              type: config.backgroundType === 'plain' ? 'color' : 'image',
              value: '#0f172a',
            },
          },
        ],
        dimension: {
          width: config.aspectRatio === '9:16' ? 1080 : config.aspectRatio === '1:1' ? 1080 : 1920,
          height: config.aspectRatio === '9:16' ? 1920 : config.aspectRatio === '1:1' ? 1080 : 1080,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`HeyGen API request failed (${response.status}): ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const videoId = data?.data?.video_id || `heygen_${Date.now()}`;

    return {
      jobId: videoId,
      status: 'queued',
      message: 'HeyGen rendering task successfully initiated.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return {
        phase: 'failed',
        phaseLabel: 'Provider Not Configured',
        progressPercent: 0,
        error: 'HEYGEN_API_KEY is missing.',
      };
    }

    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${jobId}`, {
        headers: { 'X-Api-Key': apiKey },
      });

      if (!response.ok) {
        return {
          phase: 'failed',
          phaseLabel: 'Status Check Failed',
          progressPercent: 0,
          error: `Failed to poll HeyGen video status: ${response.status}`,
        };
      }

      const data = await response.json();
      const status = data?.data?.status; // 'processing', 'completed', 'failed', 'pending'

      if (status === 'completed') {
        const videoUrl = data?.data?.video_url;
        const result: VideoResultData = {
          jobId,
          videoUrl,
          thumbnailUrl: data?.data?.thumbnail_url || '',
          durationSeconds: data?.data?.duration || 30,
          aspectRatio: '16:9',
          width: 1920,
          height: 1080,
          fileSizeEstimate: '12 MB',
          generatedAt: new Date().toISOString(),
          provider: 'HeyGen AI Avatar Engine',
          isMock: false,
          script: '',
          voiceName: 'HeyGen Voice',
        };

        return {
          phase: 'completed',
          phaseLabel: 'Video Ready',
          progressPercent: 100,
          result,
        };
      } else if (status === 'failed') {
        return {
          phase: 'failed',
          phaseLabel: 'HeyGen Rendering Failed',
          progressPercent: 0,
          error: data?.data?.error?.message || 'Video rendering failed on provider.',
        };
      } else {
        return {
          phase: 'rendering_video',
          phaseLabel: 'Rendering photorealistic avatar video on HeyGen servers...',
          progressPercent: 65,
          details: 'Synchronizing mouth phonemes and facial motion...',
        };
      }
    } catch (err: any) {
      return {
        phase: 'failed',
        phaseLabel: 'Network Error',
        progressPercent: 0,
        error: err.message || 'Unable to connect to HeyGen status endpoint.',
      };
    }
  }

  public async cancelJob(_jobId: string): Promise<boolean> {
    // HeyGen does not support aborting active rendering jobs via standard REST API
    return false;
  }
}
