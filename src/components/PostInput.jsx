import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { createDefaultAssetsAction, updateAssetAction } from "@/app/actions/postActions";
import { deleteAssetAction, loadAssetsFromServerAction } from "@/app/actions/assetActions";

const PostInput = ({ prompt, setPrompt, onGenerate, loading, assets, logo, setLogo, assetId, fetchUserAssets, setUserAssets, showToast, selectedAssets, setSelectedAssets }) => {

  const removeImage = () => setLogo(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [showAssets, setShowAssets] = useState(true);

  const [updatingAsset, setUpdatingAsset] = useState(null);
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



  const handleCheckBoxChange = async () => {
    // If there's no assetId, it means the user has no assets saved yet.
    // We'll create a default asset record for them.
    if (!assetId) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        showToast("User ID not found. Please log in again.", "error");
        return;
      }

      try {
        const result = await createDefaultAssetsAction(userId);
        if (result.success) {
          showToast("Default assets created!", "info");
          await fetchUserAssets(); // Refresh assets to get the new assetId and data
        } else {
          throw new Error(result.error || "Failed to create default assets.");
        }
      } catch (error) {
        showToast(error.message, "error");
      }
    }
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

    setUpdatingAsset(asset.name);

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
      const result = await updateAssetAction(assetId, fieldName, base64Image);
      if (result.success) {
        showToast(`${asset.name} updated successfully!`, "success");
        await fetchUserAssets();
      } else {
        throw new Error(result.error || `Failed to upload ${asset.name}`);
      }

    } catch (error) {
      console.error("Upload failed:", error);
      showToast(error.message, "error");
    } finally {
      setUpdatingAsset(null);
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

    setUpdatingAsset(asset.name);

    try {
      const result = await updateAssetAction(assetId, fieldName, newValue);
      if (result.success) {
        showToast(`${asset.name} updated successfully!`, "success");
        await fetchUserAssets(); // Refresh assets from server
      } else {
        throw new Error(result.error || `Failed to update ${asset.name}`);
      }
    } catch (error) {
      console.error(`Failed to update ${asset.name}:`, error);
      showToast(error.message, "error");
    } finally {
      setUpdatingAsset(null);
    }
  };

  const handleAssetDelete = async (asset) => {
    if (!confirm(`Are you sure you want to remove the ${asset.name}?`)) return;

    const fieldMap = {
      Character: "characterImage",
      Product: "productImage",
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

    setUpdatingAsset(asset.name);

    try {
      const result = await deleteAssetAction(assetId, fieldName);

      if (result.success) {
        showToast(`${asset.name} removed successfully!`, "success");
        await fetchUserAssets(); // Refresh assets from the server to update UI
      } else {
        throw new Error(result.error || `Failed to remove ${asset.name}`);
      }
    } catch (error) {
      console.error(`Failed to remove ${asset.name}:`, error);
      showToast(error.message, "error");
    } finally {
      setUpdatingAsset(null);
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
  
    console.log("assetssss", assets);
  

    return (
      <>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          <div className="space-y-2">
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
            <div className="space-y-2 mb-4">
              <label className="text-base font-bold text-gray-800 flex items-center gap-2">
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
                  <div className="w-full border border-gray-300 rounded-xl p-4 sm:p-6 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-8">

                    {assets.map((asset, index) => {
                      const isSelected = selectedAssets.some(
                        (a) => a.name === asset.name && a.url === asset.url
                      );




                      return (
                        <div key={index} className="flex flex-col w-32">

                          {/* LABEL + CHECKBOX */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1 w-full">
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
                              {updatingAsset === asset.name ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                  <span className="text-xs text-gray-600">
                                    Updating...
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <label className="cursor-pointer flex flex-col items-center gap-1">
                                    <div className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                                      Upload Asset
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleAssetUpload(e, asset)}
                                      disabled={updatingAsset}
                                    />
                                    <span className="text-[10px] text-gray-500 mt-1">PNG, JPG</span>
                                  </label>
                                </>
                              )}
                            </div>
                          )}

                          {/* ============= SIZE DROPDOWN ============= */}
                          {asset.url && asset.name === "Size" && (
                            <select
                              value={asset.url}
                              onChange={(e) =>
                                handleAssetChange(asset, e.target.value)
                              }
                              disabled={!!updatingAsset}
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
                                disabled={!!updatingAsset}
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
                                  {updatingAsset === asset.name ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100">
                                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                      <span className="text-xs text-gray-600">
                                        Updating...
                                      </span>
                                    </div>
                                  ) : (
                                    <img
                                      src={asset.url}
                                      alt={asset.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
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
        </div>

        <button
          onClick={() => onGenerate(selectedAssets, showAssets)}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 sm:px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-black text-base"
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
      </>
    );
  };

  export default PostInput