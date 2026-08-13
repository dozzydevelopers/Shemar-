import { PaymentRecord } from '../types';

// Enterprise Payment Processing Engine
export class PaymentService {
  private static paymentsStore: PaymentRecord[] = [
    {
      paymentId: 'pay_99201a',
      userId: 'usr_fan_1',
      celebrityId: 'celeb_shemar',
      amount: 1000.0,
      currency: 'USD',
      provider: 'stripe',
      providerTransactionId: 'pi_3Mv8x92eZvKYlo2C1A004a',
      status: 'completed',
      membershipTier: '$1,000 Celebrity VIP Pass',
      metadata: { fanName: 'Sarah Jenkins', celebName: 'Shemar Moore', plan: 'Lifetime VIP' },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 3 + 120000).toISOString(),
    },
    {
      paymentId: 'pay_99201b',
      userId: 'usr_fan_2',
      celebrityId: 'celeb_shemar',
      amount: 1000.0,
      currency: 'USD',
      provider: 'apple_pay',
      providerTransactionId: 'ap_882941093120',
      status: 'completed',
      membershipTier: '$1,000 Celebrity VIP Pass',
      metadata: { fanName: 'David Ross', celebName: 'Shemar Moore', plan: 'Lifetime VIP' },
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1 + 45000).toISOString(),
    },
  ];

  public static getPaymentsForUser(userId: string, role: string, celebId?: string): PaymentRecord[] {
    if (role === 'super_admin') {
      return this.paymentsStore;
    }
    if (role === 'celebrity' && celebId) {
      return this.paymentsStore.filter((p) => p.celebrityId === celebId);
    }
    return this.paymentsStore.filter((p) => p.userId === userId);
  }

  public static createCheckoutSession(params: {
    userId: string;
    celebrityId: string;
    amount: number;
    provider: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
    membershipTier: string;
  }) {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const providerTransactionId = `pi_${Math.random().toString(36).substring(2, 12)}`;

    const newRecord: PaymentRecord = {
      paymentId,
      userId: params.userId,
      celebrityId: params.celebrityId,
      amount: params.amount,
      currency: 'USD',
      provider: params.provider,
      providerTransactionId,
      status: 'pending',
      membershipTier: params.membershipTier,
      metadata: {
        checkoutUrl: `https://checkout.stripe.com/pay/${providerTransactionId}`,
        ipHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      createdAt: new Date().toISOString(),
    };

    this.paymentsStore.unshift(newRecord);

    return {
      paymentId,
      providerTransactionId,
      checkoutUrl: newRecord.metadata.checkoutUrl,
      record: newRecord,
    };
  }

  public static processWebhook(payload: {
    event: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
    providerTransactionId: string;
    metadata?: Record<string, any>;
  }) {
    const record = this.paymentsStore.find((p) => p.providerTransactionId === payload.providerTransactionId);
    if (!record) {
      throw new Error(`Transaction ${payload.providerTransactionId} not found in database.`);
    }

    if (payload.event === 'payment_intent.succeeded') {
      record.status = 'completed';
      record.completedAt = new Date().toISOString();
      if (payload.metadata) {
        record.metadata = { ...record.metadata, ...payload.metadata };
      }
    } else {
      record.status = 'failed';
    }

    return record;
  }
}
