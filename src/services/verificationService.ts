import { IdentityVerificationRecord, DeviceSessionRecord, PasskeyCredential } from '../types';

export class VerificationService {
  private static verificationsStore: IdentityVerificationRecord[] = [
    {
      id: 'ver_001',
      userId: 'usr_celeb_shemar',
      verificationProvider: 'jumio',
      verificationReference: 'JUMIO_REF_988210384',
      verificationStatus: 'verified',
      country: 'US',
      documentType: 'passport',
      verifiedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ];

  private static deviceSessionsStore: DeviceSessionRecord[] = [
    {
      id: 'sess_1',
      userId: 'usr_fan_1',
      deviceName: 'iPhone 15 Pro Max',
      browser: 'Mobile Safari 17.4',
      os: 'iOS 17.4',
      ipHash: 'ip_hash_a9f81',
      location: 'Los Angeles, USA',
      isCurrent: true,
      isActive: true,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'sess_2',
      userId: 'usr_fan_1',
      deviceName: 'MacBook Pro 16"',
      browser: 'Chrome 122.0',
      os: 'macOS Sonoma',
      ipHash: 'ip_hash_c83d2',
      location: 'Los Angeles, USA',
      isCurrent: false,
      isActive: true,
      lastActiveAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];

  private static passkeysStore: PasskeyCredential[] = [
    {
      id: 'passkey_1',
      userId: 'usr_fan_1',
      credentialId: 'cred_38921094382091',
      publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
      deviceName: 'iCloud Keychain / FaceID',
      transports: ['internal', 'hybrid'],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      lastUsedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  public static getVerificationForUser(userId: string): IdentityVerificationRecord | undefined {
    return this.verificationsStore.find((v) => v.userId === userId);
  }

  public static submitVerification(params: {
    userId: string;
    provider: 'jumio' | 'onfido' | 'stripe_identity' | 'sumsub';
    documentType: 'passport' | 'drivers_license' | 'national_id';
    country: string;
  }): IdentityVerificationRecord {
    const record: IdentityVerificationRecord = {
      id: `ver_${Date.now()}`,
      userId: params.userId,
      verificationProvider: params.provider,
      verificationReference: `${params.provider.toUpperCase()}_REF_${Math.random().toString(36).substring(2, 10)}`,
      verificationStatus: 'verified',
      country: params.country,
      documentType: params.documentType,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.verificationsStore.unshift(record);
    return record;
  }

  public static getDeviceSessions(userId: string): DeviceSessionRecord[] {
    return this.deviceSessionsStore.filter((s) => s.userId === userId && s.isActive);
  }

  public static revokeSession(sessionId: string): boolean {
    const session = this.deviceSessionsStore.find((s) => s.id === sessionId);
    if (session) {
      session.isActive = false;
      return true;
    }
    return false;
  }

  public static getPasskeys(userId: string): PasskeyCredential[] {
    return this.passkeysStore.filter((p) => p.userId === userId);
  }

  public static registerPasskey(userId: string, deviceName: string): PasskeyCredential {
    const passkey: PasskeyCredential = {
      id: `passkey_${Date.now()}`,
      userId,
      credentialId: `cred_${Math.random().toString(36).substring(2, 16)}`,
      publicKey: `pubkey_${Math.random().toString(36).substring(2, 20)}`,
      deviceName,
      transports: ['internal', 'hybrid'],
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    this.passkeysStore.push(passkey);
    return passkey;
  }
}
