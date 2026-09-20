import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, XCircle, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export default function RazorpayModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onError
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !orderData) return null;

  const handleSimulatedPayment = async (status = 'success') => {
    setIsProcessing(true);
    try {
      if (status === 'success') {
        const simulatedPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await onSuccess({
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: 'SIMULATED_TEST_SIGNATURE_OK',
          is_test_mode: true
        });
      } else {
        onError(new Error('Customer cancelled payment in modal.'));
      }
    } catch (err) {
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="bg-[#0A192F] p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-pink/20 text-brand-pink mb-3 border border-brand-pink/30">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-white tracking-wide">
            Razorpay Secure Payment
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            ZEBA Wellness • 256-bit Encrypted Transaction
          </p>
          
          <div className="mt-4 inline-block bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-xs text-slate-300">Amount to Pay: </span>
            <span className="font-display font-black text-brand-gold text-base ml-1">
              ₹{(orderData.amount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-brand-blush/60 p-4 rounded-2xl border border-brand-pink/20 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span>Customer:</span>
              <span className="text-brand-navy font-bold">{orderData.customer?.name}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Razorpay Order Ref:</span>
              <span className="font-mono text-[11px] text-slate-600">{orderData.razorpayOrderId}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Payment Mode:</span>
              <span className="text-emerald-700 font-bold">UPI / Cards / NetBanking / Wallets</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              disabled={isProcessing}
              onClick={() => handleSimulatedPayment('success')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying with PostgreSQL...' : 'Complete Payment (Success)'}</span>
            </button>

            <button
              disabled={isProcessing}
              onClick={() => handleSimulatedPayment('fail')}
              className="w-full py-3 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel / Simulate Failure</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated via Razorpay Node.js Signature Verification</span>
          </div>
        </div>

      </div>
    </div>
  );
}
