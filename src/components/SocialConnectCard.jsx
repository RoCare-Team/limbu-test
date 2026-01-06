import React from "react";
import { Facebook, Instagram, LogOut, ArrowRight, Link as LinkIcon } from "lucide-react";

export default function SocialConnectCard({
  platform,
  isConnected,
  identity,
  onConnect,
  onDisconnect,
  onManage,
  loading = false,
}) {
  const config = {
    facebook: {
      icon: Facebook,
      color: "text-[#1877F2]",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      btnColor: "bg-[#1877F2]",
      label: "Facebook Page",
      requirements: "Requires Facebook login and Page permissions",
      
    },
    instagram: {
      icon: Instagram,
      color: "text-[#E1306C]",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
      btnColor: "bg-[#E1306C]",
      label: "Instagram Business",
      requirements: "Requires Instagram Business account connected to Facebook Page",
    },
  };

  const theme = config[platform];
  if (!theme) return null;
  const Icon = theme.icon;

  return (
    <div className={`relative bg-white border ${theme.borderColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center gap-3 group w-full`}>
      {/* Disconnect Button */}
      {isConnected && onDisconnect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect();
          }}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
          title="Disconnect"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Icon */}
      <div className={`${theme.bgColor} p-3 rounded-full group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${theme.color}`} />
      </div>

      {/* Content */}
      <div className="text-center w-full">
        <h3 className="text-sm font-bold text-gray-900">{theme.label}</h3>
        {isConnected ? (
          <p className="text-xs text-gray-600 font-medium mt-1 truncate px-2" title={identity}>
           {platform === "instagram" ? ` Instagram Business  Account: @${identity}` : identity}
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 mt-1">Not Connected</p>
        )}
      </div>

      {/* Action Button */}
      <div className="w-full mt-1">
        {isConnected ? (
          <button
            onClick={onManage}
            className={`w-full ${theme.btnColor} text-white text-xs font-medium py-2 px-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm`}
          >
            Create & Publish Posts
           <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={loading}
            className={`w-full bg-white border ${theme.borderColor} text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5`}
          >
            {loading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <LinkIcon className="w-3 h-3" /> Connect & Publish Posts
              </>
            )}
          </button>
        )}
        <br/>
        <p className="text-[10px] text-gray-400 text-center mt-2 leading-tight">{theme.requirements}</p>
      </div>
    </div>
  );
}