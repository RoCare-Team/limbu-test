import React from 'react';

// Tab Button Component
const TabButton = ({ tab, isActive, onClick, count }) => (
    
    <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 px-4 py-3 md:px-5 md:py-3.5 rounded-xl border-2 text-sm md:text-base font-bold transition-all flex-1 min-w-0 shadow-sm hover:shadow-md ${isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent scale-105"
            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            }`}
    >
        <tab.icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate hidden sm:inline">{tab.label}</span>
        <span className="truncate sm:hidden">{tab.shortLabel || tab.label}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${isActive ? "bg-white/25 text-white" : "bg-blue-100 text-blue-700"}`}>{count}</span>
    </button>
);

export default TabButton;