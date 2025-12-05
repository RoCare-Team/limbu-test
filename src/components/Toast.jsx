import React from 'react';

const Toast = ({ message, type = "success" }) => (
  <div className={`fixed top-4 sm:top-18 right-4 left-4 sm:left-auto sm:right-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl z-50 animate-slide-in ${type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
    type === "info" ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
      "bg-gradient-to-r from-red-500 to-rose-600"
    } text-white font-semibold text-sm sm:text-base text-center sm:text-left`}>
    {message}
  </div>
);

export default Toast;