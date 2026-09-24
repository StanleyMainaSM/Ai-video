import {
  VideoGenerationConfig,
  ProviderJobStatus,
  ProviderInfo,
  ReferenceAnalysisResult,
  ScriptTone,
  VideoType,
} from '../types';

export async function fetchHealth(): Promise<{
  status: string;
  timestamp: string;
  providers: {
    geminiConfigured: boolean;
    heygenConfigured: boolean;
    runwayConfigured: boolean;
    veoConfigured: boolean;
  };
  activeProvider: {
    id: string;
    name: string;
    isConfigured: boolean;
    isMock: boolean;
    category: string;
  };
  productionReady: boolean;
}> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchProviders(): Promise<{
  providers: ProviderInfo[];
  activeProvider: { id: string; name: string; isConfigured: boolean; description: string; isMock: boolean; category: string };
  geminiConfigured: boolean;
}> {
  const res = await fetch('/api/video/providers');
  if (!res.ok) throw new Error('Failed to fetch provider status');
  return res.json();
}

export async function selectActiveProvider(providerId: string): Promise<void> {
  const res = await fetch('/api/video/select-provider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to select provider');
  }
}

export async function startVideoGeneration(config: VideoGenerationConfig): Promise<{
  jobId: string;
  status: string;
  message?: string;
  provider: { id: string; name: string; isMock: boolean; category?: string };
}> {
  const res = await fetch('/api/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Generation request failed (${res.status})`);
  }
  return res.json();
}

export async function pollVideoStatus(jobId: string): Promise<ProviderJobStatus> {
  const res = await fetch(`/api/video/status/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to poll video job status');
  }
  return res.json();
}

export async function cancelVideoGeneration(jobId: string): Promise<boolean> {
  const res = await fetch(`/api/video/cancel/${encodeURIComponent(jobId)}`, {
    method: 'POST',
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.cancelled);
}

export async function generateAIScript(params: {
  topicOrIdea: string;
  videoType: VideoType;
  targetAudience: string;
  durationSeconds: number;
  tone: ScriptTone;
  keyPoints?: string;
  productName?: string;
}): Promise<{ script: string; estimatedDurationSeconds: number; wordCount: number }> {
  const res = await fetch('/api/script/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate script');
  }
  return res.json();
}

export async function improveAIScript(params: {
  originalScript: string;
  goal: 'hook' | 'pacing' | 'natural_speech' | 'conversion' | 'conciseness';
  videoType: VideoType;
  targetAudience?: string;
}): Promise<{ improvedScript: string; explanation: string }> {
  const res = await fetch('/api/script/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to improve script');
  }
  return res.json();
}

export async function analyzeReferenceVideoApi(params: {
  referenceContent: string;
  userProduct: string;
  targetAudience: string;
  industry?: string;
}): Promise<ReferenceAnalysisResult> {
  const res = await fetch('/api/video/analyze-reference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to analyze reference video');
  }
  return res.json();
}
