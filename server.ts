import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { providerManager } from './server/videoProviders/index.ts';
import { generateScript, improveScript, analyzeReferenceVideo } from './server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Body parsing with generous limit for base64 image data URLs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

// List and inspect AI video generation providers
app.get('/api/video/providers', (_req: Request, res: Response) => {
  try {
    const providers = providerManager.listProviders();
    const active = providerManager.getActiveProvider();
    res.json({
      providers,
      activeProvider: {
        id: active.id,
        name: active.name,
        isConfigured: active.isConfigured(),
        description: active.description,
      },
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Switch active provider (e.g. for testing mock vs HeyGen vs Runway vs Veo)
app.post('/api/video/select-provider', (req: Request, res: Response) => {
  const { providerId } = req.body;
  if (!providerId) {
    return res.status(400).json({ error: 'providerId is required' });
  }
  const success = providerManager.setActiveProvider(providerId);
  if (!success) {
    return res.status(404).json({ error: `Provider "${providerId}" not found.` });
  }
  const active = providerManager.getActiveProvider();
  res.json({
    success: true,
    activeProvider: {
      id: active.id,
      name: active.name,
      isConfigured: active.isConfigured(),
    },
  });
});

// Start video generation
app.post('/api/video/generate', async (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config || !config.script || config.script.trim().length === 0) {
      return res.status(400).json({ error: 'A script is required to generate a video.' });
    }

    // Safeguard: verify explicit consent when using an uploaded photo likeness
    if (config.avatarMode === 'upload' && !config.uploadedPhotoConsentConfirmed) {
      return res.status(403).json({
        error: 'Consent verification required: You must confirm authorization to generate an AI likeness of the uploaded person.',
      });
    }

    const provider = providerManager.getActiveProvider();
    const result = await provider.generateVideo(config);

    res.json({
      jobId: result.jobId,
      status: result.status,
      message: result.message,
      provider: {
        id: provider.id,
        name: provider.name,
        isMock: provider.id === 'mock',
      },
    });
  } catch (err: any) {
    console.error('Error generating video:', err);
    res.status(500).json({
      error: err.message || 'An error occurred while dispatching the video generation task.',
    });
  }
});

// Poll video generation status
app.get('/api/video/status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const provider = providerManager.getActiveProvider();
    const status = await provider.getStatus(jobId);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      phase: 'failed',
      phaseLabel: 'Error polling status',
      progressPercent: 0,
      error: err.message || 'Failed to poll status',
    });
  }
});

// Cancel active video generation job
app.post('/api/video/cancel/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const provider = providerManager.getActiveProvider();
    const cancelled = await provider.cancelJob(jobId);
    res.json({ cancelled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Script Generation (powered by Gemini 3.8 Flash)
app.post('/api/script/generate', async (req: Request, res: Response) => {
  try {
    const { topicOrIdea, videoType, targetAudience, durationSeconds, tone, keyPoints, productName } = req.body;
    if (!topicOrIdea || topicOrIdea.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a topic, core message, or brief for your script.' });
    }

    const result = await generateScript({
      topicOrIdea,
      videoType: videoType || 'talking_avatar',
      targetAudience: targetAudience || 'General audience',
      durationSeconds: parseInt(durationSeconds || '30', 10),
      tone: tone || 'professional',
      keyPoints,
      productName,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Script generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate script.' });
  }
});

// AI Script Enhancement / Refinement (powered by Gemini 3.8 Flash)
app.post('/api/script/improve', async (req: Request, res: Response) => {
  try {
    const { originalScript, goal, videoType, targetAudience } = req.body;
    if (!originalScript || originalScript.trim().length === 0) {
      return res.status(400).json({ error: 'Script text is required to improve.' });
    }

    const result = await improveScript({
      originalScript,
      goal: goal || 'hook',
      videoType: videoType || 'talking_avatar',
      targetAudience,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Script improvement error:', err);
    res.status(500).json({ error: err.message || 'Failed to improve script.' });
  }
});

// Viral Reference Video Structural Analysis & Original Adaptation (powered by Gemini 3.8 Flash)
app.post('/api/video/analyze-reference', async (req: Request, res: Response) => {
  try {
    const { referenceContent, userProduct, targetAudience, industry } = req.body;
    if (!referenceContent || referenceContent.trim().length === 0) {
      return res.status(400).json({ error: 'Reference video notes, link description, or transcript are required.' });
    }
    if (!userProduct || userProduct.trim().length === 0) {
      return res.status(400).json({ error: 'Your product or subject is required to formulate an original adaptation.' });
    }

    const result = await analyzeReferenceVideo({
      referenceContent,
      userProduct,
      targetAudience: targetAudience || 'Target customers',
      industry,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Reference analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze reference video.' });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    // Dynamic import of Vite in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineFace AI Studio running at http://0.0.0.0:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
