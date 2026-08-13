import { AIVoiceMetrics, AISafetyReport, User } from '../types';
import { voiceSessionManager } from '../voice/sessionManager';
import { safetyGuardrails } from '../ai/safety/safetyGuardrails';

export class AIVoiceService {
  private metrics: AIVoiceMetrics = {
    activeSessions: 1,
    totalVoiceSessions: 524,
    avgResponseMs: 165,
    aiErrors: 0,
    safetyEvents: 0,
  };

  public getMetrics(): AIVoiceMetrics {
    this.metrics.activeSessions = voiceSessionManager.getActiveSessionsCount();
    return { ...this.metrics };
  }

  public reportAbuse(reportData: Omit<AISafetyReport, 'id' | 'createdAt' | 'status'>): AISafetyReport {
    this.metrics.safetyEvents += 1;
    return safetyGuardrails.reportAbuse(reportData);
  }

  public getSafetyReports(): AISafetyReport[] {
    return safetyGuardrails.getReports();
  }

  public checkEligibility(user: User): boolean {
    return user.isVerified || user.role === 'super_admin' || user.role === 'celebrity';
  }
}

export const aiVoiceService = new AIVoiceService();
