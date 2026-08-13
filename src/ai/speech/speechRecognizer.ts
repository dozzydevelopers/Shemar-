export interface SpeechRecognitionCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onInterruption?: () => void;
}

export class SpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(callbacks: SpeechRecognitionCallbacks): void {
    if (!this.recognition) {
      callbacks.onError('Speech recognition is not supported on this browser.');
      return;
    }

    if (this.isListening) return;

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        callbacks.onTranscript(interimTranscript, false);
        // Interruption trigger if fan speaks
        if (callbacks.onInterruption) callbacks.onInterruption();
      }

      if (finalTranscript) {
        callbacks.onTranscript(finalTranscript, true);
      }
    };

    this.recognition.onerror = (event: any) => {
      callbacks.onError(event.error || 'Speech input error');
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed or already active:', e);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Speech recognition stop error:', e);
      }
      this.isListening = false;
    }
  }
}

export const speechRecognizer = new SpeechRecognizer();
