import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData } from '../../src/types';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

export class VeoGeminiVideoProvider implements IVideoGenerationProvider {
  public id = 'veo';
  public name = 'Google Veo Video Engine';
  public description = 'Google DeepMind state-of-the-art generative video diffusion model. NOTE: Veo creates cinematic scenes and visual shots; it is a text/image-to-video diffusion model and does NOT perform lip-synchronized talking avatar synthesis.';
  public category = 'generative_broll' as const;
  public categoryLabel = 'Generative Video Diffusion (Not Talking-Avatar Lip-Sync)';
  public configurationKeyName = 'GEMINI_API_KEY';
  public configurationHelp = 'Requires GEMINI_API_KEY with access to Google Veo video generation endpoints.';

  public supportedFeatures = [
    'Text-to-Video & Image-to-Video Diffusion',
    '720p Resolution Generation',
    '16:9 Landscape & 9:16 Portrait Formats',
    'Naturalistic Camera Dynamics & Physics',
  ];

  public capabilities = {
    talkingPhoto: false, // Honest: generative video, not lip-synced talking avatar
    customScript: false,
    lipSync: false,      // Honest: does not synthesize phoneme mouth shapes
    swahiliSupport: false,
    aspectRatio916: true,
  };

  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 0 && !key.includes('MY_GEMINI_API_KEY'));
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !this.isConfigured()) {
      throw new Error('GEMINI_API_KEY is not configured for Veo generation.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Cinematic commercial video scene: "${config.script.slice(0, 180)}". Professional studio lighting, cinematic crisp clarity.`;
    const aspectRatio = config.aspectRatio === '9:16' ? '9:16' : '16:9';

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
      },
    });

    return {
      jobId: operation.name || `veo_${Date.now()}`,
      status: 'queued',
      message: 'Veo generative video task initiated.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { phase: 'failed', phaseLabel: 'API Key Missing', progressPercent: 0, error: 'GEMINI_API_KEY is not configured.' };
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const op = new GenerateVideosOperation();
      op.name = jobId;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      if (updated.done) {
        const uri = updated.response?.generatedVideos?.[0]?.video?.uri || '';
        const result: VideoResultData = {
          jobId,
          videoUrl: uri,
          thumbnailUrl: '',
          durationSeconds: 10,
          aspectRatio: '16:9',
          width: 1280,
          height: 720,
          fileSizeEstimate: '6 MB',
          generatedAt: new Date().toISOString(),
          provider: 'Google Veo Video Engine (Generative B-Roll)',
          isMock: false,
          script: '',
          voiceName: 'Veo Native',
        };
        return { phase: 'completed', phaseLabel: 'Video Ready', progressPercent: 100, result };
      }

      return {
        phase: 'rendering_video',
        phaseLabel: 'Rendering video with Veo diffusion model...',
        progressPercent: 55,
        details: 'Generating high-dimensional spatio-temporal video frames...',
      };
    } catch (err: any) {
      return { phase: 'failed', phaseLabel: 'Veo Polling Error', progressPercent: 0, error: err.message };
    }
  }

  public async cancelJob(_jobId: string): Promise<boolean> {
    return false;
  }

  public async getResult(jobId: string): Promise<VideoResultData | null> {
    const status = await this.getStatus(jobId);
    return status.result || null;
  }
}
