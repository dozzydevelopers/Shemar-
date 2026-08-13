import { FeatureFlag } from '../types';

export class FeatureFlagsService {
  private static flags: FeatureFlag[] = [
    {
      id: 'ff_1',
      flagKey: 'ENABLE_REALTIME_WEBRTC_CALLS',
      name: 'WebRTC Voice & Video Calls',
      description: 'Enables 1-on-1 HD voice and video calling between VIP fans and celebrities.',
      enabled: true,
      targetRoles: ['super_admin', 'celebrity', 'fan'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ff_2',
      flagKey: 'ENABLE_STRIPE_PAYMENTS',
      name: 'Stripe Membership Checkout',
      description: 'Enables real $1,000 VIP pass payments via Stripe & Apple Pay webhooks.',
      enabled: true,
      targetRoles: ['super_admin', 'celebrity', 'fan'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ff_3',
      flagKey: 'ENABLE_PASSPORTS_IDENTITY',
      name: 'Jumio Identity Verification',
      description: 'Requires celebrities to verify biometric passport before hosting VIP channels.',
      enabled: true,
      targetRoles: ['super_admin', 'celebrity'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ff_4',
      flagKey: 'ENABLE_PASSKEYS_WEBAUTHN',
      name: 'Passkeys & Biometric Login',
      description: 'Allows Touch ID / Face ID hardware security authentication.',
      enabled: true,
      targetRoles: ['super_admin', 'celebrity', 'fan'],
      createdAt: new Date().toISOString(),
    },
  ];

  public static getFlags(): FeatureFlag[] {
    return this.flags;
  }

  public static isEnabled(key: string): boolean {
    const flag = this.flags.find((f) => f.flagKey === key);
    return flag ? flag.enabled : false;
  }

  public static toggleFlag(flagKey: string, enabled: boolean): FeatureFlag | undefined {
    const flag = this.flags.find((f) => f.flagKey === flagKey);
    if (flag) {
      flag.enabled = enabled;
    }
    return flag;
  }
}
