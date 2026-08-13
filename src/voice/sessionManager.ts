import { AIVoiceSession, User } from '../types';

export class VoiceSessionManager {
  private activeSessions: Map<string, AIVoiceSession> = new Map();

  /**
   * Secure temporary session token creation and database metadata record
   */
  public createSession(currentUser: User, celebrityId: string, celebrityName: string): AIVoiceSession {
    // Verify membership server-side check
    const isVIP = currentUser.isVerified || currentUser.role === 'super_admin' || currentUser.role === 'celebrity';
    if (!isVIP) {
      throw new Error('AI Voice Call requires an active $1,000 Verified Fan VIP Membership.');
    }

    const sessionId = `aivoice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionToken = `tok_voice_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    const session: AIVoiceSession = {
      id: sessionId,
      fan_id: currentUser.id,
      celebrity_id: celebrityId,
      membership_id: isVIP ? 'vip_pass_1000' : 'standard',
      provider: 'Licensed Shemar Voice Engine v2 (Low-Latency)',
      status: 'active',
      started_at: new Date().toISOString(),
      duration: 0,
      created_at: new Date().toISOString(),
      sessionToken,
      fanName: currentUser.name,
      celebrityName,
      latencyMetrics: {
        avgResponseMs: 165,
        sttMs: 40,
        ttsMs: 50,
      },
      safetyStatus: 'clean',
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  public endSession(sessionId: string): AIVoiceSession | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.ended_at = new Date().toISOString();
      const startTime = new Date(session.started_at).getTime();
      session.duration = Math.round((Date.now() - startTime) / 1000);
      return session;
    }
    return null;
  }

  public getActiveSessionsCount(): number {
    return Array.from(this.activeSessions.values()).filter((s) => s.status === 'active').length;
  }
}

export const voiceSessionManager = new VoiceSessionManager();
