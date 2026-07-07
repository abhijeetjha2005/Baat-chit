import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const LandingPage = () => {
  const navigate = useNavigate();

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
          Connect with friends instantly
        </p>

        {/* Sign In Card */}
        <div className="mt-10 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          <h2 className="text-2xl font-semibold text-white mb-8">
            Sign In
          </h2>

          <form className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                         text-white placeholder-zinc-500 focus:outline-none 
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl 
                         text-white placeholder-zinc-500 focus:outline-none 
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />

            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 
                         text-white font-semibold rounded-2xl transition-all duration-200 text-base"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-sm text-zinc-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-400 hover:text-emerald-500 font-medium hover:underline transition"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Optional Footer Text */}
        <p className="text-xs text-zinc-500 mt-8">
          Secure • Private • Instant
        </p>
      </div>
    </div>
  );
};

export default LandingPage;