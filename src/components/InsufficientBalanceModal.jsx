import React from 'react';

const InsufficientBalanceModal = ({ onClose, onRecharge, walletBalance, required }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-4 border-red-200 animate-scale-in">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="text-5xl sm:text-7xl">💸</div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Insufficient Balance!</h3>
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 sm:p-4">
            <p className="text-red-800 font-semibold text-sm sm:text-base">Current Balance: {walletBalance} coins</p>
            <p className="text-red-600 text-xs sm:text-sm mt-1">Required: {required || 80} coins</p>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Please recharge your wallet to continue</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRecharge}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all text-sm sm:text-base"
            >
              Recharge Wallet
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

export default InsufficientBalanceModal;