import React from "react";
import Logo from "../components/Logo";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <Logo />

        {/* Title */}
        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          बात-चीत
        </h1>

        <p className="mt-3 mb-8 md:mb-12 text-sm sm:text-base md:text-lg text-zinc-400">
          Connect with friends instantly
        </p>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8">

          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
            Sign In
          </h2>

          <form className="space-y-4 md:space-y-5">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-3 md:px-5 md:py-4 bg-zinc-800 border border-zinc-700 rounded-xl md:rounded-2xl text-white focus:outline-none focus:border-emerald-500"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 md:px-5 md:py-4 bg-zinc-800 border border-zinc-700 rounded-xl md:rounded-2xl text-white focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              className="w-full py-3 md:py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl md:rounded-2xl transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-sm text-zinc-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-400 hover:text-emerald-500 hover:underline font-medium"
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;