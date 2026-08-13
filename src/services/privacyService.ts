import { User, PrivacyPreferences, UserDataExport } from '../types';
import { PaymentService } from './paymentService';
import { VerificationService } from './verificationService';

export class PrivacyService {
  private static userPreferences: Record<string, PrivacyPreferences> = {};

  public static getPreferences(userId: string): PrivacyPreferences {
    return (
      this.userPreferences[userId] || {
        marketingConsent: false,
        analyticsConsent: true,
        thirdPartySharing: false,
        dataRetentionMonths: 24,
      }
    );
  }

  public static updatePreferences(userId: string, prefs: Partial<PrivacyPreferences>): PrivacyPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    this.userPreferences[userId] = updated;
    return updated;
  }

  public static generateUserDataExport(user: User): UserDataExport {
    const verifications = VerificationService.getVerificationForUser(user.id);
    const deviceSessions = VerificationService.getDeviceSessions(user.id);
    const payments = PaymentService.getPaymentsForUser(user.id, user.role, user.celebrityId);

    return {
      user,
      verifications: verifications ? [verifications] : [],
      deviceSessions,
      payments,
      callLogs: [],
      auditLogs: [],
      exportedAt: new Date().toISOString(),
    };
  }
}
