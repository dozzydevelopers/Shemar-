import { CallRecord, WebRtcSignal } from '../types';

export class TelephonyService {
  private static callRecordsStore: CallRecord[] = [
    {
      id: 'call_101',
      conversationId: 'conv_1',
      tenantId: 'celeb_shemar',
      callerId: 'usr_celeb_shemar',
      callerName: 'Shemar Moore',
      callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      receiverId: 'usr_fan_1',
      receiverName: 'Sarah Jenkins',
      callType: 'ai_voice',
      status: 'ended',
      durationSeconds: 412, // 6m 52s HD VIP Call
      qualityRating: 5,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      endedAt: new Date(Date.now() - 86400000 * 2 + 412000).toISOString(),
    },
  ];

  private static activeSignals: WebRtcSignal[] = [];

  public static getCallHistory(conversationId: string): CallRecord[] {
    return this.callRecordsStore.filter((c) => c.conversationId === conversationId);
  }

  public static initiateCall(params: {
    conversationId: string;
    tenantId: string;
    callerId: string;
    callerName: string;
    callerAvatar: string;
    receiverId: string;
    receiverName: string;
    callType: 'audio' | 'ai_voice';
  }): CallRecord {
    const callRecord: CallRecord = {
      id: `call_${Date.now()}`,
      conversationId: params.conversationId,
      tenantId: params.tenantId,
      callerId: params.callerId,
      callerName: params.callerName,
      callerAvatar: params.callerAvatar,
      receiverId: params.receiverId,
      receiverName: params.receiverName,
      callType: params.callType,
      status: 'ringing',
      durationSeconds: 0,
      createdAt: new Date().toISOString(),
    };

    this.callRecordsStore.unshift(callRecord);
    return callRecord;
  }

  public static sendSignal(signal: WebRtcSignal) {
    this.activeSignals.push(signal);
    // Keep max 100 recent signals in memory
    if (this.activeSignals.length > 100) {
      this.activeSignals.shift();
    }
  }

  public static getSignalsForUser(userId: string): WebRtcSignal[] {
    const signals = this.activeSignals.filter((s) => s.receiverId === userId);
    // Flush retrieved signals
    this.activeSignals = this.activeSignals.filter((s) => s.receiverId !== userId);
    return signals;
  }

  public static endCall(callId: string, durationSeconds: number): CallRecord | undefined {
    const call = this.callRecordsStore.find((c) => c.id === callId);
    if (call) {
      call.status = 'ended';
      call.durationSeconds = durationSeconds;
      call.endedAt = new Date().toISOString();
    }
    return call;
  }
}
