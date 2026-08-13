import { personalityEngine } from '../personality/personalityEngine';
import { memoryStore } from '../memory/memoryStore';
import { safetyGuardrails } from '../safety/safetyGuardrails';

export interface AIResponseChunk {
  text: string;
  isComplete: boolean;
  latencyMs: number;
}

export class ConversationEngine {
  public async generateResponse(
    fanInput: string,
    celebrityId: string,
    fanId: string
  ): Promise<string> {
    const startTime = Date.now();

    // 1. Safety Scan
    const safetyCheck = safetyGuardrails.scanFanInput(fanInput);
    if (!safetyCheck.safe && safetyCheck.sanitizedText) {
      return safetyCheck.sanitizedText;
    }

    // 2. Load Personality Profile & Memories
    const profile = personalityEngine.getProfile(celebrityId);
    const memories = memoryStore.getMemories(fanId, celebrityId);
    const fanNameMemory = memories.find((m) => m.key === 'preferred_name')?.value || 'my friend';

    // 3. Conversational Logic & Natural Phrasing Engine
    let responseText = '';
    const textLower = fanInput.toLowerCase();

    if (textLower.includes('who are you') || textLower.includes('are you real')) {
      responseText = `You're chatting with Shemar AI, an AI-powered representation of Shemar Moore. How can I brighten your day, ${fanNameMemory}?`;
    } else if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
      const greeting = profile.preferred_greetings[Math.floor(Math.random() * profile.preferred_greetings.length)];
      responseText = `${greeting} Good to connect with you, ${fanNameMemory}! How's your day going?`;
    } else if (textLower.includes('swat') || textLower.includes('s.w.a.t') || textLower.includes('hondo')) {
      responseText = `S.W.A.T. has been an incredible journey! Hondo taught me so much about leadership and heart. What's your favorite episode?`;
    } else if (textLower.includes('workout') || textLower.includes('fitness') || textLower.includes('gym')) {
      responseText = `Fitness is a lifestyle! Daily discipline and consistency is key. Keep pushing your limits every single day!`;
    } else if (textLower.includes('day') || textLower.includes('how are you')) {
      responseText = `It's been a productive day! Grateful for every moment and connecting with amazing fans like you. What have you been up to today?`;
    } else {
      responseText = `Thanks for sharing that with me! I really appreciate your support and positivity. Tell me more about what you're working on today!`;
    }

    // 4. Enforce Output Safety Guardrails
    responseText = safetyGuardrails.enforceResponseGuardrails(responseText);

    // Save implicit memory if topic is mentioned
    if (textLower.includes('love') || textLower.includes('favorite')) {
      memoryStore.saveMemory(fanId, celebrityId, 'interest', fanInput, 'preference');
    }

    return responseText;
  }
}

export const conversationEngine = new ConversationEngine();
