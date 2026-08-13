import { conversationEngine } from '../ai/conversation/conversationEngine';
import { voiceSynthesizer } from '../ai/voice/voiceSynthesizer';

export class VoiceStreamingPipeline {
  private isProcessing: boolean = false;

  public async processStream(
    fanInput: string,
    celebrityId: string,
    fanId: string,
    onResponseText: (text: string) => void,
    onStateChange: (state: 'listening' | 'thinking' | 'speaking') => void
  ): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      onStateChange('thinking');

      // Low latency AI response generation
      const textResponse = await conversationEngine.generateResponse(fanInput, celebrityId, fanId);
      onResponseText(textResponse);

      // Trigger authorized voice synthesis
      onStateChange('speaking');

      voiceSynthesizer.speak(textResponse, {
        onEnd: () => {
          onStateChange('listening');
          this.isProcessing = false;
        },
        onError: () => {
          onStateChange('listening');
          this.isProcessing = false;
        },
      });
    } catch (err) {
      console.error('Voice streaming pipeline error:', err);
      onStateChange('listening');
      this.isProcessing = false;
    }
  }

  public interruptStream(): void {
    voiceSynthesizer.stop();
    this.isProcessing = false;
  }
}

export const voiceStreamingPipeline = new VoiceStreamingPipeline();
