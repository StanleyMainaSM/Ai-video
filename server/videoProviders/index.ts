import { IVideoGenerationProvider } from './types';
import { MockDevelopmentVideoProvider } from './mockProvider';
import { HeyGenVideoProvider } from './heygenProvider';
import { RunwayVideoProvider } from './runwayProvider';
import { VeoGeminiVideoProvider } from './veoProvider';
import { ProviderInfo } from '../../src/types';

export class VideoProviderManager {
  private providers = new Map<string, IVideoGenerationProvider>();
  private activeProviderId: string = 'mock';

  constructor() {
    // 1. Dedicated Talking-Avatar Engine (Production Milestone)
    const heygen = new HeyGenVideoProvider();
    this.providers.set(heygen.id, heygen);

    // 2. Generative Video & Cinematic B-Roll Diffusion Engines
    const veo = new VeoGeminiVideoProvider();
    this.providers.set(veo.id, veo);

    const runway = new RunwayVideoProvider();
    this.providers.set(runway.id, runway);

    // 3. Development Demo Sandbox (Offline Simulation)
    const mock = new MockDevelopmentVideoProvider();
    this.providers.set(mock.id, mock);

    // Resolution priority:
    // Respect AI_VIDEO_PROVIDER only if the provider is actually configured.
    // Never auto-activate an unconfigured provider.
    const configuredEnvProvider = (process.env.AI_VIDEO_PROVIDER || '').toLowerCase().trim();
    if (configuredEnvProvider && this.providers.has(configuredEnvProvider)) {
      const p = this.providers.get(configuredEnvProvider)!;
      if (p.isConfigured()) {
        this.activeProviderId = configuredEnvProvider;
      } else {
        console.warn(`[VideoProviderManager] AI_VIDEO_PROVIDER="${configuredEnvProvider}" requested, but credentials are missing. Defaulting to Development Demo ("mock").`);
        this.activeProviderId = 'mock';
      }
    } else if (heygen.isConfigured()) {
      // Auto-prefer real HeyGen if configured
      this.activeProviderId = 'heygen';
    } else {
      this.activeProviderId = 'mock';
    }
  }

  public getActiveProvider(): IVideoGenerationProvider {
    return this.providers.get(this.activeProviderId) || this.providers.get('mock')!;
  }

  public setActiveProvider(providerId: string): { success: boolean; error?: string } {
    if (!this.providers.has(providerId)) {
      return { success: false, error: `Provider "${providerId}" does not exist.` };
    }

    const provider = this.providers.get(providerId)!;
    if (!provider.isConfigured() && provider.id !== 'mock') {
      return {
        success: false,
        error: `Cannot activate "${provider.name}": ${provider.configurationKeyName} is not set in environment variables.`,
      };
    }

    this.activeProviderId = providerId;
    return { success: true };
  }

  public getProvider(id: string): IVideoGenerationProvider | undefined {
    return this.providers.get(id);
  }

  public listProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      categoryLabel: p.categoryLabel,
      isConfigured: p.isConfigured(),
      isActive: p.id === this.activeProviderId,
      supportedFeatures: p.supportedFeatures,
      capabilities: p.capabilities,
      configurationKeyName: p.configurationKeyName,
      configurationHelp: p.configurationHelp,
    }));
  }
}

export const providerManager = new VideoProviderManager();
export * from './types';
