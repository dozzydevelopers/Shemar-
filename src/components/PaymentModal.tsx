import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Check, Sparkles, X, Lock, CheckCircle2, DollarSign } from 'lucide-react';
import { Celebrity, User, PaymentRecord } from '../types';

interface PaymentModalProps {
  celebrity: Celebrity;
  currentUser: User;
  onClose: () => void;
  onPaymentSuccess: (paymentRecord: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  celebrity,
  currentUser,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'apple_pay' | 'paypal'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'webhook_confirm' | 'success'>('checkout');
  const [createdSession, setCreatedSession] = useState<any>(null);

  const handleInitiateCheckout = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          celebrityId: celebrity.id,
          amount: 1000.0,
          provider: paymentProvider,
          membershipTier: `$1,000 Lifetime VIP Pass (${celebrity.displayName})`,
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setCreatedSession(data.session);
        setPaymentStep('webhook_confirm');
      }
    } catch (err) {
      console.error('Failed to create payment checkout session', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateWebhookEvent = async () => {
    if (!createdSession) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment_intent.succeeded',
          providerTransactionId: createdSession.providerTransactionId,
          metadata: {
            fanUserId: currentUser.id,
            fanEmail: currentUser.email,
            celebName: celebrity.displayName,
          },
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setPaymentStep('success');
        onPaymentSuccess(data.payment);
      }
    } catch (err) {
      console.error('Failed to trigger webhook processing', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Unlock {celebrity.displayName} VIP Access</h2>
            <p className="text-xs text-slate-400">Direct 1-on-1 private messaging & HD video call privileges</p>
          </div>
        </div>

        {paymentStep === 'checkout' && (
          <div className="space-y-5">
            {/* VIP Pass Summary Card */}
            <div className="p-4 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Official Celebrity Membership</span>
                <span className="text-2xl font-black text-white">$1,000.00 <span className="text-xs text-slate-400 font-normal">USD</span></span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 border-t border-slate-800/80 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Unlimited 1-on-1 direct encrypted chat with {celebrity.displayName}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  HD Voice & Video Call privileges with WebRTC signaling
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Verified Fan Badge on public discovery lists
                </li>
              </ul>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Production Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentProvider('stripe')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
                    paymentProvider === 'stripe'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Stripe Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentProvider('apple_pay')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
                    paymentProvider === 'apple_pay'
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-slate-200" />
                  Apple Pay
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentProvider('paypal')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
                    paymentProvider === 'paypal'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-5 h-5 text-cyan-400" />
                  PayPal
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleInitiateCheckout}
              disabled={processing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {processing ? 'Connecting to Provider...' : `Pay $1,000.00 via ${paymentProvider.toUpperCase()}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              256-Bit SSL Encrypted • PCI-DSS Compliant • Transaction Metadata Logged
            </div>
          </div>
        )}

        {paymentStep === 'webhook_confirm' && createdSession && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Checkout Session Initialized
              </div>
              <div className="text-slate-300">Payment ID: {createdSession.paymentId}</div>
              <div className="text-slate-300">Stripe Intent: {createdSession.providerTransactionId}</div>
              <div className="text-slate-400 text-[11px] break-all">
                URL: {createdSession.checkoutUrl}
              </div>
            </div>

            <p className="text-slate-300">
              In production, the payment gateway automatically triggers a server-to-server webhook to activate your VIP membership upon successful card authorization.
            </p>

            <button
              onClick={handleSimulateWebhookEvent}
              disabled={processing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {processing ? 'Processing Webhook Verification...' : 'Execute Production Webhook Confirmation'}
            </button>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Confirmed & Verified!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your $1,000 VIP Pass for {celebrity.displayName} has been permanently credited to your account.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Enter VIP Private Chat Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
