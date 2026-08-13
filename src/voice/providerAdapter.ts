import { AIVoiceProviderConfig } from '../types';

export interface AIVoiceProvider {
  id: string;
  name: string;
  config: AIVoiceProviderConfig;
  synthesizeSpeech(text: string): Promise<ArrayBuffer | null>;
}

export class ProviderAdapter {
  private currentVoiceProvider: string = 'shemar_licensed_eleven_v2';

  public getVoiceConfig(): AIVoiceProviderConfig {
    return {
      providerId: this.currentVoiceProvider,
      voiceId: 'shemar_official_voice_licensed_hd',
      speechRate: 1.0,
      pitch: 0.95,
      clarityBoost: true,
    };
  }

  public setVoiceProvider(voiceProviderId: string): void {
    this.currentVoiceProvider = voiceProviderId;
  }
}

export const providerAdapter = new ProviderAdapter();
