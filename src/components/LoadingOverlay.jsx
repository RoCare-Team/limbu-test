import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const LoadingOverlay = ({ countdown }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center space-y-4 sm:space-y-6 max-w-md w-full border-4 border-white/30">
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-300/40 rounded-full blur-2xl animate-pulse"></div>
          <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-white animate-spin relative z-10" />
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 absolute -top-2 -right-2 sm:-top-3 sm:-right-3 animate-bounce" />
        </div>
        <div className="text-center space-y-2 sm:space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black text-white">Creating Magic ✨</h3>
          <p className="text-blue-100 text-xs sm:text-sm">
            AI is generating your stunning post...
          </p>
          {countdown > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="text-5xl sm:text-6xl font-black text-white animate-pulse">{countdown}</div>
              <p className="text-blue-100 text-xs mt-2">seconds remaining</p>
            </div>
          )}
        </div>
        <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 h-full rounded-full animate-shimmer"></div>
        </div>
      </div>
    </div>
  );

export default LoadingOverlay;