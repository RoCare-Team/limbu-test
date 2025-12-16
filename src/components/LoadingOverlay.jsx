import React from "react";
import { Sparkles, Image, Wand2 } from "lucide-react";

const LoadingOverlay = ({ countdown }) => (
  <div className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden min-h-screen w-screen">
    
    {/* Background blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
    </div>

    {/* 🔥 Animated Gradient Border (thicker) */}
<div className="relative rounded-3xl p-[3px] animate-border-spin bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600 max-w-xl w-full">
      
      {/* Card */}
      <div
        className="
          relative
          bg-gradient-to-r from-blue-500/85 via-purple-500/85 to-pink-500/85
          backdrop-blur-2xl
          rounded-3xl
          shadow-[0_20px_60px_rgba(168,85,247,0.45)]
          p-8 sm:p-12
          flex flex-col items-center space-y-8
          max-w-xl
          animate-in fade-in zoom-in duration-300
        "
      >
        {/* Icon animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-white/30 rounded-full animate-ping" />
            <div
              className="absolute w-40 h-40 border-2 border-white/20 rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-xl animate-spin-slow opacity-60" />

          <div className="relative bg-slate-900/80 p-6 rounded-2xl border border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
            <Image className="w-12 h-12 text-blue-400 z-10" />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-scan" />

            <div className="absolute top-2 left-2 w-2 h-2 bg-blue-400 rounded-sm animate-float-1" />
            <div className="absolute top-4 right-3 w-2 h-2 bg-purple-400 rounded-sm animate-float-2" />
            <div className="absolute bottom-3 left-4 w-2 h-2 bg-pink-400 rounded-sm animate-float-3" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-cyan-400 rounded-sm animate-float-4" />

            <Sparkles className="absolute -top-4 -right-4 w-7 h-7 text-yellow-400 animate-sparkle-1" />
            <Sparkles className="absolute -top-3 -left-4 w-5 h-5 text-pink-400 animate-sparkle-2" />
            <Wand2 className="absolute -bottom-4 -left-4 w-6 h-6 text-purple-400 animate-wand" />
            <Sparkles className="absolute -bottom-3 -right-4 w-5 h-5 text-cyan-400 animate-sparkle-3" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
            Creating Magic...
          </h3>
          <p className="text-blue-100/80 text-sm font-medium">
            AI is generating your stunning post
          </p>

          <div className="flex flex-col items-center pt-4">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse-slow">
              {countdown || 0}
            </span>
            <span className="text-[10px] text-white/70 uppercase tracking-[0.2em] mt-2 font-semibold">
              Seconds Remaining
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress-indeterminate shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
      </div>
    </div>

    {/* Animations */}
    <style>{`
      @keyframes border-spin {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      .animate-border-spin {
        background-size: 200% 200%;
        animation: border-spin 4s linear infinite;
      }

      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
      }

      @keyframes progress-indeterminate {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
      .animate-progress-indeterminate {
        animation: progress-indeterminate 1.5s linear infinite;
      }

      @keyframes scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(200%); }
      }
      .animate-scan {
        animation: scan 2s ease-in-out infinite;
      }

      @keyframes pulse-slow {
        0%,100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default LoadingOverlay;
