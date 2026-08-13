export interface VoiceSynthesisCallbacks {
  onStart?: () => void;
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class VoiceSynthesizer {
  private isSpeaking: boolean = false;

  public speak(text: string, callbacks?: VoiceSynthesisCallbacks): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (callbacks?.onEnd) callbacks.onEnd();
      return;
    }

    // Cancel existing audio if speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // Deep masculine tone for Shemar AI

    // Find best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Male'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (callbacks?.onStart) callbacks.onStart();
    };

    utterance.onboundary = (event) => {
      if (callbacks?.onBoundary) callbacks.onBoundary(event.charIndex);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (callbacks?.onEnd) callbacks.onEnd();
    };

    utterance.onerror = (err) => {
      this.isSpeaking = false;
      if (callbacks?.onError) callbacks.onError(err);
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const voiceSynthesizer = new VoiceSynthesizer();
