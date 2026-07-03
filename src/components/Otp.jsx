import React, { useEffect, useState, useRef } from 'react';

const Otp = ({
  phone,
  onVerify,
  onResend,
  loading = false
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef([]);

  // Auto focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(new Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerify(otpString);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
    <div className="bg-black space-y-6">
      <div className="text-center">
        <p className="text-zinc-400 text-sm mb-2">
          We've sent a 6 digit verification code to
        </p>
        <p className="text-white font-medium">+91 {phone}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-3xl font-semibold bg-zinc-800 border border-zinc-700 rounded-2xl text-white focus:outline-none focus:border-emerald-500 transition-all focus:ring-emerald-500/30"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-70 text-white font-semibold rounded-2xl transition-all duration-200"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={onResend}
          disabled={loading}
          className="text-emerald-400 hover:text-emerald-500 text-sm transition"
        >
          Resend OTP
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Otp;