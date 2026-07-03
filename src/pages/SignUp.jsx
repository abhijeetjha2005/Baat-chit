import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
// import { motion } from 'framer-motion'; // Uncomment if you want animations

const SignUp = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input
  };

  const handleOtpChange = (e) => {
    // Only allow numbers and max 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    let phone = formData.phone.trim();
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    // Clean and validate Indian phone number
    phone = phone.replace(/^(\+91|91|0)/, '');
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian phone number");
      return;
    }

    setFormData((prev) => ({ ...prev, phone }));
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP + Complete Signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        alert("🎉 Account created successfully!");
        navigate('/chat');
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Full form submit (Step 1)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    handleSendOtp(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <Logo />
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">बात-चीत</h1>
        <p className="text-zinc-400 text-lg mb-8">Create your account</p>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-8">
          <h2 className="text-2xl text-white font-semibold mb-6">
            {step === 1 ? 'Sign Up' : 'Verify Your Phone'}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone number (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-white text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-white text-sm"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm text-left">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-70 text-white font-semibold rounded-2xl transition-all duration-200"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-zinc-400 text-sm mb-4">
                We've sent a 6-digit code to <span className="font-medium text-white">+91 {formData.phone}</span>
              </p>

              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white text-center text-2xl tracking-widest placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-70 text-white font-semibold rounded-2xl transition-all duration-200"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white text-sm underline"
              >
                ← Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;