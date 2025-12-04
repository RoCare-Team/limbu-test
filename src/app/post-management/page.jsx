"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Download,
  Share2,
  Upload,
  X,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Send,
  Paperclip,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Toast Component
const Toast = ({ message, type = "success" }) => (
  <div className={`fixed top-4 sm:top-18 right-4 left-4 sm:left-auto sm:right-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl z-50 animate-slide-in ${type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
    type === "info" ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
      "bg-gradient-to-r from-red-500 to-rose-600"
    } text-white font-semibold text-sm sm:text-base text-center sm:text-left`}>
    {message}
  </div>
);

// Location Selection Modal
const LocationSelectionModal = ({ locations, onClose, onConfirm }) => {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [checkmark, setCheckmark] = useState(['post', 'photo']); // Default to both selected

  const handleCheckmarkChange = (option) => {
    setCheckmark(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const getPayload = () => {
    const hasPost = checkmark.includes('post');
    const hasPhoto = checkmark.includes('photo');

    if (hasPost && hasPhoto) return 'both';
    if (hasPost) return 'post';
    if (hasPhoto) return 'photo';

    return 'post'; // Default to 'post' if nothing is selected
  };

  const toggleLocation = (locationId) => {
    setSelectedLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl 
     w-full max-w-2xl
     max-h-[70vh]            /* 🔥 height reduced */
     mt-10                   /* 🔥 top margin */
     overflow-y-auto         /* scroll inside */
     p-6 sm:p-8 
     border-4 border-blue-200 
     animate-scale-in">


        <div className="space-y-4 sm:space-y-6">
          <div className="text-center">
            {/* <div className="text-5xl sm:text-6xl mb-3">📍</div> */}
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Select Locations</h3>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Choose locations to post (50 coins per location)</p>
            <div className="flex justify-center gap-4 sm:gap-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="post-checkbox"
                  checked={checkmark.includes('post')}
                  onChange={() => handleCheckmarkChange('post')}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="post-checkbox" className="ml-2 text-gray-700 font-medium cursor-pointer">Post</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="photo-checkbox"
                  checked={checkmark.includes('photo')}
                  onChange={() => handleCheckmarkChange('photo')}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="photo-checkbox" className="ml-2 text-gray-700 font-medium cursor-pointer">Photo</label>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Locations</p>
                <p className="text-2xl font-black text-blue-700">{selectedLocations.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 text-right">Cost per Location</p>
                <p className="text-2xl font-black text-green-600">50 coins</p>
              </div>
            </div>
          </div>

          <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                onClick={() => toggleLocation(location.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedLocations.includes(location.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLocations.includes(location.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                      }`}>
                      {selectedLocations.includes(location.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{location.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-sm">50 coins</span>
                </div>
              </div>
            ))}
          </div>

          {selectedLocations.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4">
              <p className="text-sm text-amber-900 flex items-start gap-2">
                <span className="text-lg sm:text-xl">💡</span>
                <span>
                  <strong>Selected:</strong> {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''}
                  {' '}• Total posting cost: {selectedLocations.length * 50} coins
                </span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onConfirm(selectedLocations, getPayload())}
              disabled={selectedLocations.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Post to {selectedLocations.length} Location{selectedLocations.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-300 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Insufficient Balance Modal
const InsufficientBalanceModal = ({ onClose, onRecharge, walletBalance, required }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-4 border-red-200 animate-scale-in">
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="text-5xl sm:text-7xl">💸</div>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Insufficient Balance!</h3>
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 sm:p-4">
          <p className="text-red-800 font-semibold text-sm sm:text-base">Current Balance: {walletBalance} coins</p>
          <p className="text-red-600 text-xs sm:text-sm mt-1">Required: {required} coins</p>
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

// Loading Overlay Component with Timer
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

// Success Animation Overlay Component
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

// Post Input Component
const PostInput = ({ prompt, setPrompt, onGenerate, loading, assets, logo, setLogo,assetId, fetchUserAssets, setUserAssets, showToast }) => {
  console.log("assets",assets);
  
  const removeImage = () => setLogo(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [showAssets, setShowAssets] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const sizeOptions = [
    { label: "1:1", value: "1:1" },
    { label: "2:3", value: "2:3" },
    { label: "3:2", value: "3:2" },
    { label: "3:4", value: "3:4" },
    { label: "4:3", value: "4:3" },
    { label: "4:5", value: "4:5" },
    { label: "5:4", value: "5:4" },
    { label: "9:16", value: "9:16" },
    { label: "16:9", value: "16:9" },
    { label: "21:9", value: "21:9" },
  ];

  const colorPalettes = [
    { label: "Warm Sunset", value: "warm, yellow, orange, red", colors: ["#FFC700", "#FF8C00", "#FF4500", "#D2691E"] },
    { label: "Cool Ocean", value: "cool, blue, teal, cyan", colors: ["#00BFFF", "#48D1CC", "#20B2AA", "#4682B4"] },
    { label: "Nature Green", value: "fresh, green, lime, mint", colors: ["#32CD32", "#98FB98", "#2E8B57", "#ADFF2F"] },
    { label: "Royal Purple", value: "luxe, purple, violet, magenta", colors: ["#8A2BE2", "#9932CC", "#DA70D6", "#BA55D3"] },
    { label: "Monochrome", value: "minimal, black, white, gray", colors: ["#000000", "#808080", "#C0C0C0", "#FFFFFF"] },
    { label: "Vibrant Mix", value: "vibrant, rainbow, multicolor, bold", colors: ["#FF1493", "#00FF00", "#FFD700", "#1E90FF"] }
  ];


  const [selectedCheckbox, setSelectedCheckbox] = useState(false);

  const [pendingUpdates, setPendingUpdates] = useState({});



  const handleCheckBoxChange = () => {
    setShowAssets(!showAssets);
    setSelectedCheckbox(!selectedCheckbox)
  };

  const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};



const handleAssetUpload = async (e, asset) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // 1️⃣ Convert file → Base64
    const base64Image = await fileToBase64(file);

    const fieldMap = {
      Character: "characterImage",
      Product: "productImage",
      Uniform: "uniformImage",
      Background: "backgroundImage",
      Logo: "logoImage",
      Size: "size",
      Color: "colourPalette"
    };

    const fieldName = fieldMap[asset.name];
    if (!fieldName) {
      console.error("Unknown field:", asset.name);
      return;
    }

    // 2️⃣ API ko base64 bhejna → Cloudinary upload backend me hoga
    const res = await fetch("/api/assets-manage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: assetId,
        [fieldName]: base64Image   // ← BASE64 SENT HERE
      }),
    });

    const result = await res.json();

    if (result.success) {
      fetchUserAssets();
      // 3️⃣ UI update (show Cloudinary URL)
      setUserAssets(prev =>
        prev.map(a =>
          a.name === asset.name ? { ...a, url: result.data[fieldName] } : a
        )
      );

      // toast.success(`${asset.name} updated successfully`);
    }

  } catch (error) {
    console.error("Upload failed:", error);
    // toast.error("Failed to upload asset");
  }
};

const handleAssetChange = async (asset, newValue) => {
  const fieldMap = {
    Size: "size",
    Color: "colourPalette"
  };

  const fieldName = fieldMap[asset.name];
  if (!fieldName) {
    console.error("Unknown asset field:", asset.name);
    return;
  }

  try {
    const res = await fetch("/api/assets-manage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: assetId,
        [fieldName]: newValue
      }),
    });

    const result = await res.json();

    if (result.success) {
      fetchUserAssets(); // Refresh assets from server
      // You can add a success toast here if you like
    } else {
      throw new Error(result.error || `Failed to update ${asset.name}`);
    }
  } catch (error) {
    console.error(`Failed to update ${asset.name}:`, error);
    // You can add an error toast here
  }
};

const handleAssetDelete = async (asset) => {
  if (!confirm(`Are you sure you want to remove the ${asset.name}?`)) return;

  const fieldMap = {
    Character: "characterImage",
    Product: "productImage", // This was correct, but ensuring it's clear
    Uniform: "uniformImage",
    Background: "backgroundImage",
    Logo: "logoImage",
  };

  const fieldName = fieldMap[asset.name];
  if (!fieldName) {
    console.error("Unknown asset for deletion:", asset.name);
    showToast("Cannot delete this asset type.", "error");
    return;
  }

  try {
    // Use DELETE method and pass params in the URL
    const res = await fetch(`/api/assets-manage?id=${assetId}&field=${fieldName}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (result.success) {
      showToast(`${asset.name} removed successfully!`, "success");
      fetchUserAssets(); // Refresh assets from the server to update UI
    } else {
      throw new Error(result.error || `Failed to remove ${asset.name}`);
    }
  } catch (error) {
    console.error(`Failed to remove ${asset.name}:`, error);
    showToast(error.message, "error");
  }
};


  


  useEffect(() => {
    try {
      const savedKeywords = localStorage.getItem("selectedKeywords");
      if (savedKeywords) {
        setSuggestedKeywords(JSON.parse(savedKeywords));
      }
    } catch (error) {
      console.error("Error parsing keywords from localStorage:", error);
    }
  }, []);

  const handleAssetToggle = (asset) => { 
    const isSelected = selectedAssets.some(a => a.url === asset.url);
    let newSelectedAssets;
    if (isSelected) {
      newSelectedAssets = selectedAssets.filter(a => a.url !== asset.url);
    } else {
      newSelectedAssets = [...selectedAssets, asset];
    }
    setSelectedAssets(newSelectedAssets);

  }; 
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            What would you like to create?
          </label>
          <textarea
            placeholder="Describe your post idea... e.g., 'Create a festive Diwali offer post for RO water purifier with 30% discount'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl text-sm sm:text-base text-gray-800 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all min-h-[100px] sm:min-h-[120px] resize-none placeholder:text-gray-400 bg-gray-50"
            disabled={loading}
          />

        </div>

        {/* Logo Upload */}
        {!selectedCheckbox ? (
          <div className="space-y-2 sm:space-y-3 mb-4">
          <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Add Your Logo (Optional)
          </label>

          {!logo ? (
            <label className="flex flex-col items-center justify-center w-full h-32 sm:h-36 border-3 border-dashed border-blue-400 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 hover:border-blue-500 transition-all group">
              <div className="flex flex-col items-center justify-center">
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm sm:text-base text-gray-700 font-semibold">Click to upload logo</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
                className="hidden"
                disabled={loading}
              />
            </label>
          ) : (
            <div className="relative w-full h-32 sm:h-36 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-300 p-3 sm:p-4 shadow-md">
              <img
                src={URL.createObjectURL(logo)}
                alt="Logo Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-500 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-600 transition-all shadow-xl hover:scale-110"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
        ) : ""}
{assets && (
  <div className="pt-2 pb-4">
    {/* MAIN TOGGLE */}
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={showAssets}
        onChange={handleCheckBoxChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="font-bold text-gray-700">Create image with assets</span>
    </label>

    {/* SHOW ASSETS SECTION */}
    {showAssets && (
      <div className="pt-4">
        <p className="text-sm font-bold text-gray-600 mb-3">
          Select assets to use:
        </p>

        {/* WRAPPER CARD */}
        <div className="w-full border border-gray-300 rounded-xl p-6 flex flex-wrap gap-8">

          {assets.map((asset, index) => {
            const isSelected = selectedAssets.some(
              (a) => a.name === asset.name && a.url === asset.url
            );

            return (
              <div key={index} className="flex flex-col w-32">

                {/* LABEL + CHECKBOX */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {asset.name}
                    </span>
                  </div>
                  {asset.url && asset.name !== "Size" && asset.name !== "Color" && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAssetToggle(asset)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* ============= UPLOAD CARD IF NO ASSET ============= */}
                {!asset.url && (
                  <div className="w-32 h-32 rounded-lg bg-gray-100 border border-gray-300 flex flex-col items-center justify-center hover:shadow transition-all">
                    <label className="cursor-pointer flex flex-col items-center">
                      <div className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                        Upload Asset
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAssetUpload(e, asset)}
                      />
                    </label>

                    <span className="text-[10px] text-gray-500 mt-1">
                      PNG, JPG
                    </span>
                  </div>
                )}

                {/* ============= SIZE DROPDOWN ============= */}
                {asset.url && asset.name === "Size" && (
                  <select
                    value={asset.url}
                    onChange={(e) =>
                      handleAssetChange(asset, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* ============= COLOR DROPDOWN ============= */}
                {asset.url && asset.name === "Color" && (
                 <>
                  <select
                    value={asset.url}
                    onChange={(e) => handleAssetChange(asset, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Select a palette</option>
                    {colorPalettes.map((palette) => (
                      <option key={palette.value} value={palette.value}>
                        {palette.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1 mt-2 justify-center">
                    {(colorPalettes.find(p => p.value === asset.url)?.colors || []).map((color, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color }}>
                        &nbsp;
                      </div>
                    ))}
                  </div>
                 </>
                )}

                {/* ============= IMAGE CARD ============= */}
                {asset.url &&
                  asset.name !== "Size" &&
                  asset.name !== "Color" && (
                    <div className="relative group">
                      <div
                        className={`w-32 h-32 border rounded-xl overflow-hidden transition-all 
                          ${isSelected ? "border-blue-500 shadow-sm" : "border-gray-300"}
                          hover:shadow`}
                      >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      </div>
                      <button
                        onClick={() => handleAssetDelete(asset)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                        title={`Remove ${asset.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}







          {suggestedKeywords.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(keyword)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all disabled:opacity-50"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )} 
        </div>

        <button
          onClick={() => onGenerate(selectedAssets, showAssets)}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-black text-base sm:text-lg"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          Generate Post with AI
        </button>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4 mt-4">
          <p className="text-xs sm:text-sm text-amber-900 flex items-start gap-2">
            <span className="text-lg sm:text-xl">💡</span>
            <span><strong>Pro Tip:</strong> Be specific about your business, offer details, colors, and style for best results!</span>
          </p>
        </div>
      </div>
  );
};

// Tab Button Component
const TabButton = ({ tab, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 sm:border-3 text-xs sm:text-sm md:text-base font-bold transition-all flex-1 shadow-md hover:shadow-xl ${isActive
      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent scale-105"
      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
      }`}
  >
    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
    <span className="truncate hidden sm:inline">{tab.label}</span>
    <span className="truncate sm:hidden">{tab.shortLabel || tab.label}</span>
    <span
      className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-black ${isActive ? "bg-white/30 text-white" : "bg-blue-100 text-blue-700"
        }`}
    >
      {count}
    </span>
  </button>
);

// Post Card Component
const PostCard = ({ post, scheduleDates, onDateChange, onUpdateStatus, onReject, handleDownload, handleShare, handlePost, onEditDescription, showRejectModal, rejectReason, submitRejection, setShowRejectModal, setRejectReason }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post?.description || "");

  const handleSave = () => {
    onEditDescription(post._id, editedDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(post?.description || "");
    setIsEditing(false);
  };

  return (
    <div>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all">
        <a href={post.aiOutput} target="_blank" rel="noopener noreferrer">
          <div className="relative group">
            <img
              src={post?.aiOutput || "https://via.placeholder.com/400"}
              alt="Post"
              className="w-full h-48 sm:h-64 object-cover group-hover:opacity-90 transition-opacity"
            />

            <div
              className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-black shadow-xl backdrop-blur-sm ${post.status === "pending"
                ? "bg-yellow-500/90 text-white"
                : post.status === "approved"
                  ? "bg-green-500/90 text-white"
                  : post.status === "posted"
                    ? "bg-purple-600/90 text-white"
                    : "bg-blue-500/90 text-white"
                }`}
            >
              {post.status.toUpperCase()}
            </div>

            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex gap-2 sm:gap-3 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(post);
                }}
                className="p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition"
                title="Download"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleShare(post);
                }}
                className="p-1.5 sm:p-2 bg-white/80 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </a>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <strong className="text-gray-900 text-sm sm:text-base font-bold flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                Description
              </strong>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 sm:space-y-3">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full p-2.5 sm:p-3 border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none text-gray-800 text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
                  rows={5}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:shadow-lg transition"
                  >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-300 transition"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className={`text-xs sm:text-sm text-gray-700 leading-relaxed ${showFull ? "" : "line-clamp-3"}`}>
                  {post?.description || "No description available"}
                </p>
                {post?.description?.length > 150 && (
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="flex items-center gap-1 text-blue-600 text-xs sm:text-sm font-semibold mt-2 hover:text-blue-700"
                  >
                    {showFull ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    {showFull ? "Show Less" : "Show More"}
                  </button>
                )}
              </>
            )}
          </div>

          {post.locations && post.locations.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Locations ({post.locations.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {post.locations.map((loc, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                    {loc.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 flex items-center gap-1 pt-2 border-t border-gray-100">
            <Calendar className="w-3 h-3" />
            Created: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}
          </p>

          <div className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
            {post.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => onUpdateStatus(post._id, "approved")}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:shadow-xl transition-all"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(post._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:shadow-xl transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reject
                </button>
              </div>
            )}

            {post.status === "approved" && (
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <button
                    onClick={() => handlePost(post)}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-black hover:shadow-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    Post Now
                  </button>
                </div>
              </div>
            )}

            {post.status === "scheduled" && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-blue-200">
                  <p className="text-xs sm:text-sm text-gray-700 font-semibold flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    Scheduled for:
                  </p>
                  <p className="text-blue-700 font-black text-base sm:text-lg">
                    {post.scheduledDate
                      ? new Date(post.scheduledDate).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "Not set"}
                  </p>
                </div>

                <button
                  onClick={() => handlePost(post)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-base font-black hover:shadow-xl transition-all"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Post Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-80 sm:w-96 p-5 rounded-xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-blue-600">Reject Post</h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400"
              rows={4}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Main Component
export default function PostManagement() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userWallet, setUserWallet] = useState(0);
  const [requiredCoins, setRequiredCoins] = useState(0);
  const { slug } = useParams();
  const { data: session } = useSession();


  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("total");
  const [prompt, setPrompt] = useState("");
  const [scheduleDates, setScheduleDates] = useState({});
  const [logo, setLogo] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postsGeneratedCount, setPostsGeneratedCount] = useState(0);

  const [userAssets, setUserAssets] = useState([]);
  const [rejectPostId, setRejectPostId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [assetId, setAssetId] = useState(null);


  // Load locations from localStorage
  const [availableLocations, setAvailableLocations] = useState([]);



  useEffect(() => {
    const stored = localStorage.getItem("locationDetails");
    if (stored) {
      try {
        const parsedLocations = JSON.parse(stored);
        // Transform the data to match the expected format
        const formattedLocations = parsedLocations.map((loc, index) => ({
          id: loc.id || index + 1,
          name: loc.name || loc.title || `Location ${index + 1}`,
          address: loc.address || loc.storefrontAddress?.addressLines?.join(", ") || "Address not available",
          city: loc.city || "",
          ...loc
        }));
        setAvailableLocations(formattedLocations);
      } catch (err) {
        console.error("Invalid JSON in localStorage:", err);
        // Fallback to empty array if parsing fails
        setAvailableLocations([]);
      }
    }
  }, []);

  const fetchUserAssets = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(`/api/assets-manage?userId=${userId}`);
      const result = await res.json();
      
      if (result.success && result.data.length > 0) {
        const latestAssets = result.data[0];
        setAssetId(latestAssets._id);
        
        const productImagesArray = Array.isArray(latestAssets.productImage)
          ? latestAssets.productImage
          : latestAssets.productImage
          ? [latestAssets.productImage]
          : [];

        const imageAssets = [
          { name: "Character", url: latestAssets.characterImage || "" },
          { name: "Product", url: latestAssets.productImage || "" },
          { name: "Uniform", url: latestAssets.uniformImage || "" },
          { name: "Background", url: latestAssets.backgroundImage || "" },
          { name: "Logo", url: latestAssets.logoImage || "" },
          { name: "Size", url: latestAssets.size || "" },
          { name: "Color", url: latestAssets.colourPalette || "" },
        ];

        setUserAssets(imageAssets);
      }
    } catch (error) {
      console.error("Failed to fetch user assets:", error);
    }
  }, []);



  useEffect(() => { fetchUserAssets(); }, [fetchUserAssets]);
  


  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [allCounts, setAllCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    scheduled: 0,
    posted: 0,
  });

  const tabs = [
    { id: "total", label: "Total Posts", shortLabel: "Total", icon: ImageIcon, count: allCounts.total },
    { id: "pending", label: "Pending", shortLabel: "Pending", icon: Clock, count: allCounts.pending },
    { id: "approved", label: "Approved", shortLabel: "Approved", icon: CheckCircle, count: allCounts.approved },
    { id: "scheduled", label: "Scheduled", shortLabel: "Scheduled", icon: Calendar, count: allCounts.scheduled },
    { id: "posted", label: "Posted", shortLabel: "Posted", icon: Calendar, count: allCounts.posted },
  ];

  const fetchPosts = async (status) => {
    try {
      const userId = localStorage.getItem("userId");
      const url = status === "total"
        ? `/api/post-status?userId=${userId}`
        : `/api/post-status?userId=${userId}&status=${status}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch posts");
      }
      setPosts(data.data);

      const allPostsRes = await fetch(`/api/post-status?userId=${userId}`);
      const allPostsData = await allPostsRes.json();

      if (allPostsRes.ok && allPostsData.success) {
        const allPosts = allPostsData.data;
        setAllCounts({
          total: allPosts.filter((p) => p.status !== "rejected").length,
          approved: allPosts.filter((p) => p.status === "approved").length,
          pending: allPosts.filter((p) => p.status === "pending").length,
          scheduled: allPosts.filter((p) => p.status === "scheduled").length,
          posted: allPosts.filter((p) => p.status === "posted").length,
        });

      }
    } catch (err) {
      showToast(err.message || "Error fetching posts", "error");
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleGenerateClick = async (selectedAssets, useAssetsFlow) => {
    if (useAssetsFlow) {
      await handleImageGenerateWithAssets(selectedAssets);
    } else {
      await handleAiAgent(selectedAssets);
    }
  };

  const handleAiAgent = async (selectedAssets = []) => {
    if (!prompt.trim()) {
      showToast("Please enter a prompt before generating!", "error");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      // Check wallet balance for AI generation (150 coins)
      const userRes = await fetch(`/api/auth/signup?userId=${userId}`);
      if (!userRes.ok) {
        showToast("Failed to fetch user data", "error");
        return;
      }

      const userData = await userRes.json();
      const walletBalance = userData.wallet || 0;
      setUserWallet(walletBalance);

      // Check if user has sufficient balance for AI generation (150 coins)
      if (walletBalance < 150) {
        setRequiredCoins(150);
        setShowInsufficientBalance(true);
        return;
      }

      // Start AI generation process
      setIsGenerating(true);
      setAiResponse(null);
      setCountdown(59);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Convert logo to base64 if provided
      let logoBase64 = null;
      if (logo) {
        logoBase64 = await fileToBase64(logo);
      }

      // Call AI Agent API (single generation, not per location)
      const res = await fetch("/api/aiAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          logo: logoBase64,
          assets: selectedAssets, // Pass selected assets to the API
        }),
      });

      clearInterval(timer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate post from AI agent.");
      }

      const apiResponse = await res.json();
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "AI agent failed.");
      }

      const data = apiResponse.data || {};



      // Save post to database
      const postRes = await fetch("/api/post-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          aiOutput: data.output,
          description: data.description,
          logoUrl: data.logoUrl,
          status: "pending",
          promat: data.user_input,
          locations: [], // No locations assigned yet
        }),
      });

      const postData = await postRes.json();


      if (!postData.success) {
        throw new Error(postData.error || "Failed to save post in database.");
      }

      // Deduct 150 coins for AI generation
      const walletRes = await fetch(`/api/auth/signup?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 150,
          type: "deduct",
          reason: "image_generated",
          metadata: {
            aiPrompt: prompt,
            logoUsed: !!logo,
          }
        }),
      });

      const walletData = await walletRes.json();

      if (walletData.error) {
        console.warn("Wallet deduction failed:", walletData.error);
        showToast(walletData.error, "error");
      } else {
        showToast("150 coins deducted for AI generation ✅", "success");
        setUserWallet((prev) => Math.max(0, prev - 150));
      }

      // Update frontend state
      setPosts((prev) => [postData.data, ...prev]);
      setAllCounts((prev) => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
      }));

      showToast("AI Post Generated & Saved Successfully! 🎉");

      setPrompt("");
      setLogo(null);
      setCountdown(0);
    } catch (error) {
      console.error("Generation Error:", error);
      showToast(error.message || "Failed to generate AI post!", "error");
    } finally {
      setIsGenerating(false);
      setCountdown(0);
    }
  };

  
  
  const handleImageGenerateWithAssets = async (selectedAssets = []) => {
    if (!prompt.trim()) {
      showToast("Please enter a prompt before generating!", "error");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      // Check wallet balance for AI generation (150 coins)
      const userRes = await fetch(`/api/auth/signup?userId=${userId}`);
      if (!userRes.ok) {
        showToast("Failed to fetch user data", "error");
        return;
      }

      const userData = await userRes.json();
      const walletBalance = userData.wallet || 0;
      setUserWallet(walletBalance);

      // Check if user has sufficient balance for AI generation (150 coins)
      if (walletBalance < 150) {
        setRequiredCoins(150);
        setShowInsufficientBalance(true);
        return;
      }

      // Start AI generation process
      setIsGenerating(true);
      setAiResponse(null);
      setCountdown(59);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Convert logo to base64 if provided
      let logoBase64 = null;
      if (logo) {
        logoBase64 = await fileToBase64(logo);
      }

      // Call the asset generation API
      const res = await fetch("https://n8n.limbutech.in/webhook/6678555b-a0a2-4cbf-b157-7d0f831bd51c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: prompt,
          colourPalette: userAssets.find(a => a.name === 'Color')?.url || "",
          size: userAssets.find(a => a.name === 'Size')?.url || "1:1",
          characterImage: selectedAssets.find(a => a.name === 'Character')?.url || "",
          uniformImage: selectedAssets.find(a => a.name === 'Uniform')?.url || "", 
          productImage: selectedAssets.find(a => a.name.startsWith('Product'))?.url || "",
          backgroundImage: selectedAssets.find(a => a.name === 'Background')?.url || "",
          logoImage: selectedAssets.find(a => a.name === 'Logo')?.url || logoBase64 || "",
          platform: "gmb"
        }),
      });

      clearInterval(timer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate post from AI agent.");
      }

      const apiResponse = await res.json();

      console.log("apiResponse",apiResponse);
      
      // The direct response from n8n is now the data we need
      if (apiResponse.status !== "true" && !apiResponse.success) {
        throw new Error(apiResponse.error || apiResponse.message || "AI asset generation failed.");
      }

      const data = apiResponse.success ? apiResponse.data : apiResponse;

      const postRes = await fetch("/api/post-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          aiOutput: data.image,
          description: data.description,
          logoUrl: data.logoUrl,
          status: "pending",
          promat: data.user_input,
          locations: [], // No locations assigned yet
        }),
      });

      const postData = await postRes.json();

      if (!postData.success) {
        throw new Error(postData.error || "Failed to save post in database.");
      }

      // Deduct 150 coins for AI generation
      const walletRes = await fetch(`/api/auth/signup?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 150,
          type: "deduct",
          reason: "image_generated",
          metadata: {
            aiPrompt: prompt,
            logoUsed: !!logo,
          }
        }),
      });

      const walletData = await walletRes.json();

      if (walletData.error) {
        console.warn("Wallet deduction failed:", walletData.error);
        showToast(walletData.error, "error");
      } else {
        showToast("150 coins deducted for AI generation ✅", "success");
        setUserWallet((prev) => Math.max(0, prev - 150));
      }

      // Update frontend state
      setPosts((prev) => [postData.data, ...prev]);
      setAllCounts((prev) => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
      }));

      showToast("AI Post Generated & Saved Successfully! 🎉");

      setPrompt("");
      setLogo(null);
      setCountdown(0);
    } catch (error) {
      console.error("Generation Error:", error);
      showToast(error.message || "Failed to generate AI post!", "error");
    } finally {
      setIsGenerating(false);
      setCountdown(0);
    }
  };

    const handleDateChange = (id, value) => {
    setScheduleDates((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const scheduleDate = scheduleDates[id];
    const userId = localStorage.getItem("userId");

    if (newStatus === "scheduled" && !scheduleDate) {
      showToast("Please select a schedule date!", "error");
      return;
    }

    try {
      const res = await fetch("/api/post-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          scheduledDate: scheduleDate,
          userId: userId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to update post", "error");
        return;
      }

      showToast("Post Updated Successfully! ✅");
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status: newStatus, scheduledDate: data.data.scheduledDate } : p
        )
      );
      await fetchPosts(activeTab);
    } catch (err) {
      showToast("Error updating post", "error");
    }
  };

  const handleEditDescription = async (id, newDescription) => {
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch("/api/post-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          description: newDescription,
          userId: userId,
          status: "pending"
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to update description", "error");
        return;
      }

      showToast("Description Updated Successfully! ✅");
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, description: newDescription } : p))
      );
    } catch (err) {
      showToast("Error updating description", "error");
    }
  };

  const handlePost = async (post) => {
    // First check if user has approved the post
    if (post.status !== "approved" && post.status !== "scheduled") {
      showToast("Please approve the post first!", "error");
      return;
    }

    const userId = localStorage.getItem("userId");

    try {
      // Fetch user wallet data
      const userRes = await fetch(`/api/auth/signup?userId=${userId}`);
      if (!userRes.ok) {
        showToast("Failed to fetch user data", "error");
        return;
      }

      const userData = await userRes.json();
      const walletBalance = userData.wallet || 0;
      setUserWallet(walletBalance);

      // Show location selection modal for posting
      setShowLocationModal(true);

      // Store current post for later use
      window.currentPostForLocation = post;
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to fetch user data", "error");
    }
  };

  const handleLocationConfirm = async (selectedLocationIds, checkmark) => {

    setShowLocationModal(false);

    if (selectedLocationIds.length === 0) {
      showToast("Please select at least one location", "error");
      return;
    }

    const post = window.currentPostForLocation;
    if (!post) {
      showToast("Post data not found", "error");
      return;
    }

    const userId = localStorage.getItem("userId");
    const selectedLocations = availableLocations.filter(loc =>
      selectedLocationIds.includes(loc.id)
    );

    // Calculate cost: 50 coins per location for posting
    const totalPostCost = selectedLocationIds.length * 50;

    try {
      // Re-check wallet balance
      const userRes = await fetch(`/api/auth/signup?userId=${userId}`);
      if (!userRes.ok) {
        showToast("Failed to fetch user data", "error");
        return;
      }

      const userData = await userRes.json();
      const walletBalance = userData.wallet || 0;
      setUserWallet(walletBalance);

      // Check if user has sufficient balance
      if (walletBalance < totalPostCost) {
        showToast(`Insufficient wallet balance. Required: ${totalPostCost} coins`, "error");
        setRequiredCoins(totalPostCost);
        setShowInsufficientBalance(true);
        return;
      }

      setIsPosting(true);
      setPostsGeneratedCount(selectedLocationIds.length);

      const accountId = localStorage.getItem("accountId");
      const payloadDetails = JSON.parse(localStorage.getItem("listingData"));

      // Prepare location data for webhook
      const locationData = selectedLocations.map(loc => ({
        city: loc.locationId,
        cityName: loc.locality,
        bookUrl: loc.websiteUrl || "",
      }));

      // Send post to webhook
      const response = await fetch(
        "https://n8n.srv968758.hstgr.cloud/webhook/cc144420-81ab-43e6-8995-9367e92363b0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            account: selectedLocations[0]?.accountId || "",
            locationData: locationData,
            output: post?.aiOutput || "",
            description: post?.description || "",
            accessToken: session?.accessToken || "",
            checkmark: checkmark,
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      // If post success → Deduct coins
      if (response.ok) {
        showToast("Post successfully sent to all locations!", "success");
        setShowSuccess(true);

        // Deduct coins from wallet (100 per location)
        const walletRes = await fetch(`/api/auth/signup?userId=${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPostCost,
            type: "deduct",
            reason: "Post-on-GMB",
            metadata: {
              aiPrompt: prompt,
              logoUsed: !!logo,
            }
          }),
        });

        if (walletRes.ok) {
          const newBalance = walletBalance - totalPostCost;
          setUserWallet(newBalance);
          localStorage.setItem("walletBalance", newBalance);
          showToast(`${totalPostCost} coins deducted (${selectedLocationIds.length} locations × 50 coins)`, "info");
        } else {
          showToast("Post sent, but wallet deduction failed", "warning");
        }

        // Update post with selected locations
        await fetch("/api/post-status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: post._id,
            locations: selectedLocations,
            status: "posted",
            userId: userId,
          }),
        });

        // Refresh posts
        await fetchPosts(activeTab);

      } else {
        console.error("Webhook failed:", data);
        showToast(`Failed to send post (Status: ${response.status})`, "error");
      }

    } catch (error) {
      console.error("Post error:", error);
      showToast("Network error: Failed to send post", "error");
    } finally {
      setIsPosting(false);
      window.currentPostForLocation = null;
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this post?")) return;

    setRejectPostId(id);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    const userId = localStorage.getItem("userId");

    if (!rejectReason.trim()) {
      showToast("Please enter a reason!", "error");
      return;
    }

    try {
      const res = await fetch(`/api/post-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectPostId,
          userId,
          status: "rejected",
          reason: rejectReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Post rejected successfully! ❌");

        // ✅ Update status only (do not delete)
        setPosts((prev) =>
          prev.map((p) =>
            p._id === rejectPostId
              ? { ...p, status: "rejected", rejectReason: rejectReason }
              : p
          )
        );

        // ✅ Decrease "pending" count only
        setAllCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
        }));
      }

      // Reset modal data
      setRejectReason("");
      setRejectPostId(null);
      setShowRejectModal(false);

    } catch (error) {
      console.error(error);
      showToast("Error rejecting post", "error");
    }
  };


  const handleDownload = async (post) => {
    if (!post.aiOutput) {
      alert("No image available to download.");
      return;
    }

    try {
      const apiUrl = `/api/downloadImage?url=${encodeURIComponent(post.aiOutput)}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        showToast("Failed to download image", "error");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `post-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      showToast("Image downloaded successfully! 📥");

    } catch (err) {
      showToast("Failed to download image", "error");
    }
  };


  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          text: post.description || "AI-generated content",
          url: post.aiOutput,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(post.aiOutput || "");
      showToast("Link copied to clipboard! 📋");
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchPosts("total");
  }, []);

  const filteredPosts = activeTab === "total" ? posts : posts.filter((post) => post.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes rocket {
          0%, 100% {
            transform: translateY(0) rotate(-45deg);
          }
          50% {
            transform: translateY(-30px) rotate(-45deg);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes check {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.3) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }
        @keyframes progress-bar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes flame-1 {
          0%, 100% {
            height: 2rem;
            opacity: 0.8;
          }
          50% {
            height: 2.5rem;
            opacity: 1;
          }
        }
        @keyframes flame-2 {
          0%, 100% {
            height: 2.5rem;
            opacity: 1;
          }
          50% {
            height: 3rem;
            opacity: 0.8;
          }
        }
        @keyframes flame-3 {
          0%, 100% {
            height: 2rem;
            opacity: 0.7;
          }
          50% {
            height: 2.5rem;
            opacity: 1;
          }
        }
        @keyframes stars {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-rocket {
          animation: rocket 2s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-check {
          animation: check 0.8s ease-out;
        }
        .animate-progress-bar {
          animation: progress-bar 3s ease-in-out;
        }
        .animate-flame-1 {
          animation: flame-1 0.3s ease-in-out infinite;
        }
        .animate-flame-2 {
          animation: flame-2 0.4s ease-in-out infinite;
        }
        .animate-flame-3 {
          animation: flame-3 0.35s ease-in-out infinite;
        }
        .animate-stars {
          animation: stars 1s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s ease-in-out infinite;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #f0f;
          animation: confetti-fall 3s linear infinite;
        }
        .confetti:nth-child(1) {
          left: 10%;
          background: #ff0;
          animation-delay: 0s;
        }
        .confetti:nth-child(2) {
          left: 30%;
          background: #0ff;
          animation-delay: 0.3s;
        }
        .confetti:nth-child(3) {
          left: 50%;
          background: #f0f;
          animation-delay: 0.6s;
        }
        .confetti:nth-child(4) {
          left: 70%;
          background: #0f0;
          animation-delay: 0.9s;
        }
        .confetti:nth-child(5) {
          left: 90%;
          background: #f00;
          animation-delay: 1.2s;
        }
        .confetti:nth-child(6) {
          left: 45%;
          background: #00f;
          animation-delay: 1.5s;
        }
      `}</style>

      {/* Back button for mobile view */}
      <div className="sm:hidden fixed top-20 left-5 z-50">
        <Link href="/dashboard" passHref>
          <button
            aria-label="Go back to dashboard"
            className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto -mt-[45px] sm:mt-0 p-1 sm:p-4 space-y-1 sm:space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} />}
        {isGenerating && <LoadingOverlay countdown={countdown} />}
        {showLocationModal && (
          <LocationSelectionModal
            locations={availableLocations}
            onClose={() => setShowLocationModal(false)}
            onConfirm={handleLocationConfirm}
          />
        )}
        {showInsufficientBalance && (
          <InsufficientBalanceModal
            walletBalance={userWallet}
            required={requiredCoins}
            onClose={() => setShowInsufficientBalance(false)}
            onRecharge={() => {
              setShowInsufficientBalance(false);
              window.location.href = "/wallet";
            }}
          />
        )}
        {isPosting && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center space-y-4 sm:space-y-6 max-w-md w-full border-4 border-white/30">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-300/40 rounded-full blur-2xl animate-pulse"></div>
                <div className="text-6xl sm:text-8xl animate-bounce-slow">🚀</div>
              </div>
              <div className="text-center space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-white">Publishing Post...</h3>
                <p className="text-blue-100 text-xs sm:text-sm">Sending to Google My Business</p>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-300 via-yellow-300 to-green-300 h-full rounded-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}
        {showSuccess && <SuccessOverlay onComplete={() => setShowSuccess(false)} postsCount={postsGeneratedCount} />}

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mt-16 sm:mt-8 shadow-2xl border-4 border-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
            Post Management
          </h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium">
            Create stunning GMB posts with AI in seconds ✨
          </p>
        </div>

        <PostInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateClick}
          loading={isGenerating}
          logo={logo}
          setLogo={setLogo}
          assets={userAssets}
          setUserAssets={setUserAssets}
          fetchUserAssets={fetchUserAssets}
          assetId={assetId}
          showToast={showToast}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              count={tab.count}
            />
          ))}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.filter((post) => post.status !== "rejected")
              .map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  scheduleDates={scheduleDates}
                  onDateChange={handleDateChange}
                  handleDownload={handleDownload}
                  handleShare={handleShare}
                  onUpdateStatus={handleUpdateStatus}
                  onReject={handleReject}
                  handlePost={handlePost}
                  onEditDescription={handleEditDescription}
                  showRejectModal={showRejectModal}
                  rejectReason={rejectReason}
                  submitRejection={submitRejection}
                  setRejectReason={setRejectReason}
                  setShowRejectModal={setShowRejectModal}
                />
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border-3 border-dashed border-gray-300 shadow-xl">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📭</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-600 text-sm sm:text-lg">
              {activeTab === "total"
                ? "Create your first AI-powered post above!"
                : `No ${activeTab} posts yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}