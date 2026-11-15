import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowRight, RotateCw, X, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import api from '../services/api';

/**
 * Mask an email address for privacy (e.g. s***y@gmail.com)
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user.charAt(0)}***@${domain}`;
  }
  return `${user.charAt(0)}***${user.charAt(user.length - 1)}@${domain}`;
}

export default function CodOtpModal({
  isOpen,
  onClose,
  email,
  customerName = '',
  totalAmount = 0,
  onVerifySuccess,
  onResendOtp,
  initialCooldown = 60
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  const inputRefs = useRef([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setError('');
      setSuccessMsg('');
      setCooldown(initialCooldown);
      setAttemptsRemaining(null);

      // Auto-focus first input after animation
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
    }
  }, [isOpen, initialCooldown]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const executeVerify = async (codeToVerify) => {
    const targetOtp = String(codeToVerify || otpDigits.join('')).trim();
    if (!/^\d{6}$/.test(targetOtp)) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/orders/cod/verify-otp', {
        email: email.trim(),
        otp: targetOtp
      });

      if (!res.success) {
        throw new Error(res.message || 'OTP verification failed.');
      }

      setSuccessMsg('Email verified! Placing your order...');
      onVerifySuccess(res.verificationToken);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Incorrect verification code. Please check and try again.';
      setError(msg);
      if (err.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.response.data.attemptsRemaining);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    setError('');

    // Handle full paste
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const updated = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpDigits(updated);
      const focusIndex = Math.min(pasted.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
      if (pasted.length === 6) {
        executeVerify(updated.join(''));
      }
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal ? cleanVal.charAt(cleanVal.length - 1) : '';
    setOtpDigits(updated);

    // Auto advance to next input or auto-submit when complete
    if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    } else if (cleanVal && index === 5) {
      const finalCode = updated.join('');
      if (finalCode.length === 6) {
        executeVerify(finalCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const fullOtp = otpDigits.join('');
  const isOtpComplete = fullOtp.length === 6 && /^\d{6}$/.test(fullOtp);

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    executeVerify(fullOtp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      if (onResendOtp) {
        await onResendOtp();
      } else {
        await api.post('/orders/cod/send-otp', {
          customer: { email: email.trim() }
        });
      }

      setOtpDigits(['', '', '', '', '', '']);
      setCooldown(60);
      setAttemptsRemaining(null);
      setSuccessMsg('A fresh verification code has been sent to your email.');

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP. Please wait a moment.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-brand-primaryPink/30 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cod-otp-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-2 rounded-full text-brand-plum/60 hover:text-brand-deepPurple hover:bg-brand-softPink transition-colors"
          aria-label="Close verification modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-brightPink to-brand-deepPink text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-pink/30">
            <Mail className="w-7 h-7" />
          </div>
          <h3 id="cod-otp-title" className="font-display font-black text-xl text-brand-deepPurple">
            Verify Your Email for COD
          </h3>
          <p className="text-xs text-[#805A82] leading-relaxed max-w-sm mx-auto">
            To confirm your Cash on Delivery order of{' '}
            <strong className="text-brand-deepPurple">₹{Number(totalAmount).toFixed(0)}</strong>, please enter the 6-digit OTP sent to:
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-softPink border border-brand-primaryPink/25 text-brand-deepPurple font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{maskEmail(email)}</span>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <span className="block font-bold mt-0.5 text-red-800">
                  {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
                </span>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                autoComplete="one-time-code"
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-display font-black text-xl rounded-xl border-2 transition-all outline-none ${
                  digit
                    ? 'border-brand-brightPink bg-[#FFF0F7] text-brand-deepPurple shadow-sm'
                    : 'border-brand-primaryPink/30 bg-white text-brand-deepPurple focus:border-brand-brightPink focus:ring-2 focus:ring-brand-pink/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-[#805A82] px-1">
            <span className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Valid for 5 mins</span>
            </span>

            {cooldown > 0 ? (
              <span className="text-brand-plum/70 font-semibold text-[11px]">
                Resend code in <strong className="text-brand-brightPink">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-brand-brightPink hover:text-brand-deepPink font-bold flex items-center space-x-1 hover:underline transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend OTP'}</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={loading || !isOtpComplete}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-sm shadow-xl shadow-brand-pink/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 btn-tactile"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-[#805A82] hover:text-brand-deepPurple transition-colors"
            >
              Cancel & Change Details
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-pink-900/60 leading-tight">
          🔒 Secure 256-bit encrypted verification. We never share your details with third parties.
        </p>
      </div>
    </div>
  );
}
