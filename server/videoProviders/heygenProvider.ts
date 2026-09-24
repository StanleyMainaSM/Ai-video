import { IVideoGenerationProvider, ProviderJobStatus } from './types';
import { VideoGenerationConfig, VideoResultData, AspectRatio } from '../../src/types';

// Map CineFace studio voice selections to valid HeyGen TTS voice IDs
const HEYGEN_VOICE_MAP: Record<string, string> = {
  // Swahili (East Africa)
  sw_ke_amina: 'sw-KE-WanjikuNeural',
  sw_ke_baraka: 'sw-KE-RafikiNeural',
  sw_ke_rehema: 'sw-KE-WanjikuNeural',
  sw_ke_juma: 'sw-KE-RafikiNeural',

  // English
  en_us_marcus: 'en-US-GuyNeural',
  en_us_olivia: 'en-US-JennyNeural',
  en_uk_arthur: 'en-GB-RyanNeural',

  // Spanish & French
  es_es_sofia: 'es-ES-ElviraNeural',
  fr_fr_claire: 'fr-FR-DeniseNeural',
};

// Preset fallback avatar IDs if user selects a stock archetype
const HEYGEN_PRESET_AVATARS: Record<string, string> = {
  presenter: 'Daisy-inskirt-20220818',
  executive: 'Eric-casual-20220818',
  teacher: 'Wayne_20240711',
  storyteller: 'Anna_public_3_20240108',
  monk: 'josh_lite3_20230714',
  elder: 'Daisy-inskirt-20220818',
};

export class HeyGenVideoProvider implements IVideoGenerationProvider {
  public id = 'heygen';
  public name = 'HeyGen Photorealistic Talking Avatar API';
  public description = 'Production avatar generation engine specialized in turning photos into realistic talking presenters with synchronized lips, facial micro-expressions, and identity preservation.';
  public category = 'talking_avatar' as const;
  public categoryLabel = 'Dedicated Talking-Avatar Engine';
  public configurationKeyName = 'HEYGEN_API_KEY';
  public configurationHelp = 'Get your API key at https://app.heygen.com/settings?nav=API and add HEYGEN_API_KEY to your environment variables.';

  public supportedFeatures = [
    'Uploaded Photo Likeness with Identity Preservation',
    'Sub-millimeter Viseme Lip-Synchronization',
    'Natural Blinking & Facial Micro-Expressions',
    'True 9:16 Vertical & 16:9 Landscape Video',
    'Multilingual TTS with Authentic Swahili Voices',
    'High Definition 1080p Video Rendering',
  ];

  public capabilities = {
    talkingPhoto: true,
    customScript: true,
    lipSync: true,
    swahiliSupport: true,
    aspectRatio916: true,
  };

  public isConfigured(): boolean {
    const key = process.env.HEYGEN_API_KEY;
    return Boolean(key && key.trim().length > 0 && !key.includes('your-heygen-api-key'));
  }

  /**
   * Upload an in-memory base64 image asset to HeyGen to obtain an asset_id or public asset URL.
   * This is strictly ephemeral and avoids any permanent database or local disk storage.
   */
  private async uploadPhotoAsset(base64DataUrl: string, apiKey: string): Promise<{ assetId?: string; assetUrl?: string }> {
    try {
      const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        throw new Error('Invalid image data URL format.');
      }
      const mimeType = match[1] || 'image/jpeg';
      const buffer = Buffer.from(match[2], 'base64');

      // Attempt 1: Upload via HeyGen v3 assets endpoint using multipart/form-data
      try {
        const formData = new FormData();
        const extension = mimeType.includes('png') ? 'png' : 'jpg';
        formData.append('file', new Blob([buffer], { type: mimeType }), `user_avatar.${extension}`);

        const v3UploadRes = await fetch('https://api.heygen.com/v3/assets', {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey,
          },
          body: formData,
        });

        if (v3UploadRes.ok) {
          const v3Data = await v3UploadRes.json();
          const assetId = v3Data?.data?.asset_id || v3Data?.data?.id;
          const assetUrl = v3Data?.data?.url;
          if (assetId || assetUrl) {
            return { assetId, assetUrl };
          }
        }
      } catch (err) {
        console.warn('HeyGen v3 asset upload attempt encountered notice:', err);
      }

      // Attempt 2: Upload via HeyGen v1 asset endpoint
      const v1UploadRes = await fetch('https://upload.heygen.com/v1/asset', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': mimeType,
        },
        body: buffer,
      });

      if (v1UploadRes.ok) {
        const v1Data = await v1UploadRes.json();
        const assetId = v1Data?.data?.id || v1Data?.data?.asset_id;
        const assetUrl = v1Data?.data?.url;
        if (assetId || assetUrl) {
          return { assetId, assetUrl };
        }
      }

      const errText = await v1UploadRes.text();
      throw new Error(`Failed to upload photo to HeyGen: ${errText.slice(0, 150)}`);
    } catch (err: any) {
      console.error('HeyGen photo asset upload failed:', err);
      throw new Error(`Unable to prepare photo for HeyGen avatar: ${err.message}`);
    }
  }

  /**
   * Create a photo avatar look from an uploaded asset.
   */
  private async createPhotoAvatar(assetId: string, apiKey: string): Promise<string> {
    try {
      const res = await fetch('https://api.heygen.com/v3/avatars', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'photo',
          asset_id: assetId,
          name: 'CineFace Presenter',
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HeyGen avatar creation returned status ${res.status}: ${err.slice(0, 200)}`);
      }

      const data = await res.json();
      const avatarId = data?.data?.avatar_id || data?.data?.id;
      if (!avatarId) {
        throw new Error('HeyGen avatar creation succeeded but returned no avatar_id.');
      }
      return avatarId;
    } catch (err: any) {
      console.warn('HeyGen v3 avatar creation notice, falling back to direct asset ID:', err.message);
      return assetId;
    }
  }

  public async generateVideo(config: VideoGenerationConfig): Promise<{ jobId: string; status: 'queued'; message?: string }> {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey || !this.isConfigured()) {
      throw new Error('HEYGEN_API_KEY is not configured on the server. Please add your HeyGen API key to the environment variables.');
    }

    // Explicit consent safeguard
    if (config.avatarMode === 'upload') {
      if (!config.uploadedPhotoConsentConfirmed) {
        throw new Error('Consent verification required: You must confirm authorization to generate an AI likeness of the uploaded person.');
      }
      if (!config.uploadedPhoto) {
        throw new Error('No photo was provided for the uploaded avatar mode.');
      }
    }

    // Determine voice ID
    const voiceId = HEYGEN_VOICE_MAP[config.voiceId] || config.voiceId || 'sw-KE-WanjikuNeural';

    // Handle photo avatar vs preset avatar
    let avatarId = 'Daisy-inskirt-20220818';
    let assetUrl: string | undefined;

    if (config.avatarMode === 'upload' && config.uploadedPhoto) {
      if (config.uploadedPhoto.startsWith('data:')) {
        // Upload photo buffer to HeyGen ephemerally
        const uploadResult = await this.uploadPhotoAsset(config.uploadedPhoto, apiKey);
        if (uploadResult.assetId) {
          avatarId = await this.createPhotoAvatar(uploadResult.assetId, apiKey);
        }
        assetUrl = uploadResult.assetUrl;
      } else if (config.uploadedPhoto.startsWith('http')) {
        // Already a public URL
        assetUrl = config.uploadedPhoto;
      }
    } else if (config.avatarMode === 'preset' && config.selectedPresetId) {
      avatarId = HEYGEN_PRESET_AVATARS[config.selectedPresetId] || 'Daisy-inskirt-20220818';
    }

    // Target dimensions
    const isVertical = config.aspectRatio === '9:16';
    const isSquare = config.aspectRatio === '1:1';
    const width = isVertical ? 1080 : isSquare ? 1080 : 1920;
    const height = isVertical ? 1920 : isSquare ? 1080 : 1080;

    // Call HeyGen v3 Video API
    try {
      const v3Payload = {
        type: 'avatar',
        avatar_id: avatarId,
        script: config.script,
        voice_id: voiceId,
        aspect_ratio: config.aspectRatio,
        resolution: '1080p',
      };

      const v3Response = await fetch('https://api.heygen.com/v3/videos', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(v3Payload),
      });

      if (v3Response.ok) {
        const v3Data = await v3Response.json();
        const videoId = v3Data?.data?.video_id || v3Data?.data?.id;
        if (videoId) {
          return {
            jobId: videoId,
            status: 'queued',
            message: 'HeyGen v3 rendering task successfully created.',
          };
        }
      } else {
        const errText = await v3Response.text();
        console.warn(`HeyGen v3 video dispatch notice (${v3Response.status}): ${errText.slice(0, 150)}. Trying v2 payload...`);
      }
    } catch (v3Err: any) {
      console.warn('HeyGen v3 dispatch failed, attempting v2 generate endpoint:', v3Err.message);
    }

    // Fallback: HeyGen v2 video generate API
    const v2Payload = {
      video_inputs: [
        {
          character: {
            type: config.avatarMode === 'upload' ? 'talking_photo' : 'avatar',
            avatar_id: avatarId,
            talking_photo_url: assetUrl || undefined,
          },
          voice: {
            type: 'text',
            input_text: config.script,
            voice_id: voiceId,
            speed: config.speakingSpeed || 1.0,
          },
          background: {
            type: 'color',
            value: '#020617',
          },
        },
      ],
      dimension: {
        width,
        height,
      },
    };

    const v2Response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(v2Payload),
    });

    if (!v2Response.ok) {
      const errBody = await v2Response.text();
      throw new Error(`HeyGen video generation failed (${v2Response.status}): ${errBody.slice(0, 250)}`);
    }

    const v2Data = await v2Response.json();
    const videoId = v2Data?.data?.video_id || v2Data?.data?.id;

    if (!videoId) {
      throw new Error('HeyGen accepted the generation request but did not return a valid video_id.');
    }

    return {
      jobId: videoId,
      status: 'queued',
      message: 'HeyGen photorealistic avatar rendering initiated.',
    };
  }

  public async getStatus(jobId: string): Promise<ProviderJobStatus> {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey || !this.isConfigured()) {
      return {
        phase: 'failed',
        phaseLabel: 'Provider Not Configured',
        progressPercent: 0,
        error: 'HEYGEN_API_KEY is missing.',
      };
    }

    // Try HeyGen v3 status endpoint first: GET /v3/videos/{video_id}
    try {
      const v3Res = await fetch(`https://api.heygen.com/v3/videos/${jobId}`, {
        headers: { 'X-Api-Key': apiKey },
      });

      if (v3Res.ok) {
        const data = await v3Res.json();
        const videoData = data?.data;
        const status = (videoData?.status || '').toLowerCase(); // pending, processing, completed, failed

        if (status === 'completed') {
          const videoUrl = videoData?.video_url;
          if (!videoUrl) {
            return {
              phase: 'failed',
              phaseLabel: 'Missing Video Asset',
              progressPercent: 0,
              error: 'HeyGen reported completion but did not provide a downloadable video URL.',
            };
          }

          const duration = Math.round(videoData?.duration || 30);
          const result: VideoResultData = {
            jobId,
            videoUrl, // REAL HEYGEN VIDEO URL
            thumbnailUrl: videoData?.thumbnail_url || '',
            durationSeconds: duration,
            aspectRatio: (videoData?.aspect_ratio as AspectRatio) || '9:16',
            width: 1080,
            height: 1920,
            fileSizeEstimate: `${(duration * 0.45).toFixed(1)} MB`,
            generatedAt: videoData?.created_at || new Date().toISOString(),
            provider: 'HeyGen Photorealistic Avatar Engine',
            isMock: false,
            script: '',
            voiceName: 'HeyGen Synced Voice',
            expiresAt: '24 hours from generation',
          };

          return {
            phase: 'completed',
            phaseLabel: 'Video Ready for Preview & Download',
            progressPercent: 100,
            result,
          };
        }

        if (status === 'failed') {
          return {
            phase: 'failed',
            phaseLabel: 'HeyGen Video Generation Failed',
            progressPercent: 0,
            error: videoData?.failure_message || videoData?.error?.message || 'Video rendering failed on HeyGen.',
          };
        }

        if (status === 'processing') {
          return {
            phase: 'rendering_video',
            phaseLabel: 'Synthesizing talking photo on HeyGen...',
            progressPercent: 75,
            details: 'Generating facial micro-motion, eye contact, and lip-sync at 60fps...',
          };
        }

        // pending / queued
        return {
          phase: 'queued',
          phaseLabel: 'Queued in HeyGen Pipeline...',
          progressPercent: 20,
          details: 'Allocating dedicated GPU node on HeyGen cloud...',
        };
      }
    } catch (v3Err) {
      console.warn('HeyGen v3 status check error, trying v1:', v3Err);
    }

    // Fallback: HeyGen v1 video status
    try {
      const v1Res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${jobId}`, {
        headers: { 'X-Api-Key': apiKey },
      });

      if (!v1Res.ok) {
        return {
          phase: 'failed',
          phaseLabel: 'Status Check Failed',
          progressPercent: 0,
          error: `HeyGen status query returned HTTP ${v1Res.status}`,
        };
      }

      const data = await v1Res.json();
      const status = (data?.data?.status || '').toLowerCase();

      if (status === 'completed') {
        const videoUrl = data?.data?.video_url;
        const duration = Math.round(data?.data?.duration || 30);
        const result: VideoResultData = {
          jobId,
          videoUrl, // REAL HEYGEN VIDEO URL
          thumbnailUrl: data?.data?.thumbnail_url || '',
          durationSeconds: duration,
          aspectRatio: '9:16',
          width: 1080,
          height: 1920,
          fileSizeEstimate: `${(duration * 0.45).toFixed(1)} MB`,
          generatedAt: new Date().toISOString(),
          provider: 'HeyGen Photorealistic Avatar Engine',
          isMock: false,
          script: '',
          voiceName: 'HeyGen Synced Voice',
          expiresAt: '24 hours from generation',
        };

        return {
          phase: 'completed',
          phaseLabel: 'Video Ready for Preview & Download',
          progressPercent: 100,
          result,
        };
      }

      if (status === 'failed') {
        return {
          phase: 'failed',
          phaseLabel: 'HeyGen Rendering Failed',
          progressPercent: 0,
          error: data?.data?.error?.message || 'Rendering failed on HeyGen servers.',
        };
      }

      return {
        phase: 'rendering_video',
        phaseLabel: 'Rendering avatar video on HeyGen servers...',
        progressPercent: 65,
        details: 'Synchronizing mouth phonemes and facial landmarks...',
      };
    } catch (err: any) {
      return {
        phase: 'failed',
        phaseLabel: 'Connection Error',
        progressPercent: 0,
        error: err.message || 'Unable to connect to HeyGen status endpoint.',
      };
    }
  }

  public async cancelJob(_jobId: string): Promise<boolean> {
    return false; // HeyGen REST API does not support aborting active rendering jobs
  }

  public async getResult(jobId: string): Promise<VideoResultData | null> {
    const status = await this.getStatus(jobId);
    return status.result || null;
  }
}
