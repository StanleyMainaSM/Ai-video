import { IVideoGenerationProvider } from './types';
import { MockDevelopmentVideoProvider } from './mockProvider';
import { HeyGenVideoProvider } from './heygenProvider';
import { RunwayVideoProvider } from './runwayProvider';
import { VeoGeminiVideoProvider } from './veoProvider';
import { ProviderInfo } from '../../src/types';

export class VideoProviderManager {
  private providers: Map<string, IVideoGenerationProvider> = new Map();
  private activeProviderId: string = 'mock';

  constructor() {
    const mock = new MockDevelopmentVideoProvider();
    const heygen = new HeyGenVideoProvider();
    const runway = new RunwayVideoProvider();
    const veo = new VeoGeminiVideoProvider();

    this.providers.set(mock.id, mock);
    this.providers.set(heygen.id, heygen);
    this.providers.set(runway.id, runway);
    this.providers.set(veo.id, veo);

    // Determine initial active provider from environment variable
    const configuredEnvProvider = (process.env.AI_VIDEO_PROVIDER || '').toLowerCase().trim();
    if (configuredEnvProvider && this.providers.has(configuredEnvProvider)) {
      this.activeProviderId = configuredEnvProvider;
    } else if (heygen.isConfigured()) {
      this.activeProviderId = 'heygen';
    } else if (runway.isConfigured()) {
      this.activeProviderId = 'runway';
    } else {
      this.activeProviderId = 'mock';
    }
  }

  public getActiveProvider(): IVideoGenerationProvider {
    return this.providers.get(this.activeProviderId) || this.providers.get('mock')!;
  }

  public setActiveProvider(id: string): boolean {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
      return true;
    }
    return false;
  }

  public getProvider(id: string): IVideoGenerationProvider | undefined {
    return this.providers.get(id);
  }

  public listProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isConfigured: p.isConfigured(),
      isActive: p.id === this.activeProviderId,
      supportedFeatures: p.supportedFeatures,
    }));
  }
}

export const providerManager = new VideoProviderManager();
