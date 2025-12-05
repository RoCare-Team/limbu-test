import React, { useEffect } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

const SuccessOverlay = ({ onComplete, postsCount }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }, [onComplete]);
  
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="relative flex flex-col items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
  
          <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col items-center space-y-4 sm:space-y-6 max-w-lg w-full border-4 border-white animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-300/50 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="text-7xl sm:text-9xl animate-rocket relative z-10">🚀</div>
              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-orange-400 rounded-full animate-flame-1"></div>
                  <div className="w-1.5 sm:w-2 h-8 sm:h-10 bg-yellow-400 rounded-full animate-flame-2"></div>
                  <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-orange-400 rounded-full animate-flame-3"></div>
                </div>
              </div>
            </div>
  
            <div className="text-center space-y-3 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-check" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white animate-bounce-in">
                Post Published!
              </h3>
              <p className="text-white/90 text-base sm:text-lg font-semibold px-4">
                {postsCount} post{postsCount > 1 ? 's' : ''} sent to Google My Business! 🎉
              </p>
            </div>
  
            <div className="w-full bg-white/30 rounded-full h-2.5 sm:h-3 overflow-hidden relative">
              <div className="bg-white h-full rounded-full animate-progress-bar shadow-lg"></div>
            </div>
  
            <div className="flex gap-2 animate-stars">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-200" />
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    );
  };

export default SuccessOverlay;