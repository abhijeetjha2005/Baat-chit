import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";

const ResetPass = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!token) {
      return setError("Reset token is missing. Please check your email link.");
    }
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/auth/reset-password",
        {
          token,
          password,
          confirmPassword,
        },
      );

      setSuccessMessage(
        response.data.message || "Password updated successfully!",
      );

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while resetting your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter">
          बात-चीत
        </h1>
        <p className="mt-3 text-zinc-400 text-base sm:text-lg max-w-xs mx-auto">
          Set your new account credentials
        </p>

        <div className="mt-10 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
          <h2 className="text-2xl font-semibold text-white mb-2 text-center">
            Create New Password
          </h2>
          <p className="text-sm text-zinc-400 mb-8 text-center">
            Please type your new secure password below to regain full account
            access.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                           text-white placeholder-zinc-500 focus:outline-none 
                           focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />

            </div>
            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                           text-white placeholder-zinc-500 focus:outline-none 
                           focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-950/30 py-2 rounded-xl border border-red-900/50">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-emerald-400 text-sm text-center font-medium bg-emerald-950/30 py-2 rounded-xl border border-emerald-900/50">
               {successMessage} <br />
               <span className="text-xs text-zinc-400">Redirecting to Sign In...</span>
              </p>
            )}
       <button
       type="submit"
       disabled={loading || !!successMessage}
       className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 
                         disabled:opacity-50 text-white font-semibold rounded-2xl transition-all duration-200 text-base"
            >
       
        {loading ? "Updating Password..." : "Reset Password"}
       </button>

          </form>
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button
            onClick={()=> navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">

         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
         </svg>
         Back to Sign In
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-8">
           Secure • Private • Instant
        </p>
      </div>
    </div>
  );
};

export default ResetPass;
