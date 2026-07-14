import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      setLoading(true);
      // Replace with your actual forgot password backend route
      const response = await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email,
      });
      
      setIsSubmitted(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to send reset link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter">
          बात-चीत
        </h1>

        <p className="mt-3 text-zinc-400 text-base sm:text-lg max-w-xs mx-auto">
          Reset your password safely
        </p>

        {/* Card Container */}
        <div className="mt-10 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
          
          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2 text-center">
                Forgot Password?
              </h2>
              <p className="text-sm text-zinc-400 mb-8 text-center">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                               text-white placeholder-zinc-500 focus:outline-none 
                               focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 
                             disabled:opacity-50 text-white font-semibold rounded-2xl transition-all duration-200 text-base"
                >
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto mb-6">
                We have sent password recovery instructions to <span className="font-semibold text-white">{email}</span>.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-emerald-400 hover:text-emerald-500 hover:underline transition block mx-auto mb-4"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-xs text-zinc-500 mt-8">
          Secure • Private • Instant
        </p>
      </div>
    </div>
  );
};

export default Forgot;