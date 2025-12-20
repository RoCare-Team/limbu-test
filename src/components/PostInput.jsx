import React, { useEffect, useState } from 'react';
import { deleteAssetAction, saveAssetsToServerAction } from "@/app/actions/assetActions";
import {
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  ChevronDown,
  Check,
  Trash2,
  Edit2
} from "lucide-react";

const PostInput = ({ prompt, setPrompt, onGenerate, loading, assets, logo, setLogo, assetId, fetchUserAssets, setUserAssets, showToast, selectedAssets, setSelectedAssets,bussinessTitle }) => {
  console.log("bussinessTitlebussinessTitle",bussinessTitle);
  

  const removeImage = () => setLogo(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [showAssets, setShowAssets] = useState(true);
  const [businessName, setBusinessName] = useState(bussinessTitle);
  const [keywords, setKeywords] = useState("");

  console.log("businessNamebusinessName",businessName);
  
  useEffect(() => {
    setBusinessName(bussinessTitle);
  }, [bussinessTitle]);



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

  const handleCheckBoxChange = async () => {
    setShowAssets(!showAssets);
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

      // Optimistic update with Base64
      const newAssetBase64 = { name: asset.name, url: base64Image };
      setSelectedAssets(prev => [...prev.filter(a => a.name !== asset.name), newAssetBase64]);
      
      // Update parent assets to prevent useEffect overwrite
      setUserAssets(prev => prev.map(a => a.name === asset.name ? { ...a, url: base64Image } : a));

      const userId = localStorage.getItem("userId");
      const payload = { [fieldName]: base64Image };
      if (!assetId && userId) payload.userId = userId;

      const result = await saveAssetsToServerAction(payload, assetId);
      if (result.success) {
        showToast(`${asset.name} updated successfully!`, "success");
        if (!assetId) await fetchUserAssets();
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
      const userId = localStorage.getItem("userId");
      const payload = { [fieldName]: newValue };
      if (!assetId && userId) payload.userId = userId;

      const result = await saveAssetsToServerAction(payload, assetId);
      if (result.success) {
        showToast(`${asset.name} updated successfully!`, "success");
        await fetchUserAssets();
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

    // Optimistic update
    setUserAssets(prev => prev.map(a => a.name === asset.name ? { ...a, url: "" } : a));
    setSelectedAssets(prev => prev.filter(a => a.name !== asset.name));

    try {
      const result = await deleteAssetAction(assetId, fieldName);

      if (result.success) {
        showToast(`${asset.name} removed successfully!`, "success");
        fetchUserAssets();
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
    if (assets && assets.length > 0) {
      const assetsToSelect = assets.filter(asset => {
        const assetTypesToAutoSelect = ['Character', 'Product', 'Uniform', 'Background', 'Logo'];
        return assetTypesToAutoSelect.includes(asset.name) && asset.url;
      });

      setSelectedAssets(prevSelected => {
        const newSelections = [...assetsToSelect];
        return newSelections;
      });
    }
  }, [assets]);

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


  console.log("businessNamebusinessName111111111111111111111111",businessName);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              What would you like to create?
            </label>
            <textarea
              placeholder="Describe your post idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all min-h-[90px] resize-none placeholder:text-gray-400"
              disabled={loading}
            />
            {suggestedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestedKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(prev => `${prev} ${keyword}`.trim())}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Business Name & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Business Name</label>
              <input
                type="text"
                value={businessName || ''}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter business name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter keywords"
              />
            </div>
          </div>

          {/* Logo Upload - Compact */}
          {!showAssets && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Add Logo (Optional)
              </label>

              {!logo ? (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload</span>
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
                <div className="relative h-24 bg-gray-50 rounded-lg border border-gray-300 p-2">
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="Logo Preview"
                    className="w-full h-full object-contain rounded"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Assets Section - Compact List */}
          {assets && showAssets && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Your Assets</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {assets.map((asset, index) => {
                  const isSelected = selectedAssets.some(a => a.name === asset.name && a.url === asset.url);
                  const isImageField = asset.name !== "Size" && asset.name !== "Color";

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white group relative">
                      {/* Asset Header */}
                      <div className="p-2 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-700 truncate">{asset.name}</span>
                        {/* Checkbox for selection */}
                        {asset.url && isImageField && (
                          <div
                            onClick={() => handleAssetToggle(asset)}
                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>

                      {/* Asset Content */}
                      <div className="p-2 flex-1 flex flex-col justify-center">
                        {updatingAsset === asset.name ? (
                          <div className="flex flex-col items-center justify-center h-24 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <span className="text-xs">Updating...</span>
                          </div>
                        ) : isImageField ? (
                          // IMAGE ASSET UI
                          <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200 group/image">
                            {asset.url ? (
                              <>
                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="p-1.5 bg-white rounded-full cursor-pointer hover:bg-blue-50 text-blue-600 shadow-sm transition-transform hover:scale-110" title="Replace">
                                    <Edit2 className="w-4 h-4" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleAssetUpload(e, asset)}
                                    />
                                  </label>
                                  <button 
                                    onClick={() => handleAssetDelete(asset)}
                                    className="p-1.5 bg-white rounded-full hover:bg-red-50 text-red-600 shadow-sm transition-transform hover:scale-110"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-200 transition-colors">
                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                <span className="text-[10px] text-gray-500 font-medium">Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleAssetUpload(e, asset)}
                                />
                              </label>
                            )}
                          </div>
                        ) : (
                          // DROPDOWN ASSET UI (Size/Color)
                          <div className="h-full flex items-center">
                            {asset.name === "Size" && (
                              <select
                                value={asset.url}
                                onChange={(e) => handleAssetChange(asset, e.target.value)}
                                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                {sizeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            )}
                            {asset.name === "Color" && (
                              <select
                                value={asset.url}
                                onChange={(e) => handleAssetChange(asset, e.target.value)}
                                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                <option value="" disabled>Select palette</option>
                                {colorPalettes.map((palette) => (
                                  <option key={palette.value} value={palette.value}>{palette.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={() => onGenerate(selectedAssets, showAssets, businessName, keywords)}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Post
              </>
            )}
          </button>

          {/* Pro Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base">💡</span>
              <span><strong>Tip:</strong> Be specific about details for best results!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInput;