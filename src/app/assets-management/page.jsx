"use client";
import { useState, useEffect } from "react";
import { Upload, ImageIcon, Palette, X, Check, Download, Copy } from "lucide-react";

export default function AssetsManager() {
  const [assets, setAssets] = useState({
    colourPalette: "",
    size: "1080x1350",
    characterImage: "",
    uniformImage: "",
    productImage: "",
    backgroundImage: "",
    logoImage: ""
  });

  const [previews, setPreviews] = useState({});
  const [copiedPayload, setCopiedPayload] = useState(false);

  const sizeOptions = [
    { label: "Instagram Post", value: "1080x1080" },
    { label: "Instagram Story", value: "1080x1920" },
    { label: "Instagram Portrait", value: "1080x1350" },
    { label: "Facebook Post", value: "1200x630" },
    { label: "Twitter Post", value: "1200x675" },
    { label: "LinkedIn Post", value: "1200x627" },
    { label: "Custom", value: "custom" }
  ];

  const colorPalettes = [
    { label: "Warm Sunset", value: "warm, yellow, orange, red" },
    { label: "Cool Ocean", value: "cool, blue, teal, cyan" },
    { label: "Nature Green", value: "fresh, green, lime, mint" },
    { label: "Royal Purple", value: "luxe, purple, violet, magenta" },
    { label: "Monochrome", value: "minimal, black, white, gray" },
    { label: "Vibrant Mix", value: "vibrant, rainbow, multicolor, bold" }
  ];

  // Load saved assets from storage
  useEffect(() => {
    loadAssetsFromStorage();
  }, []);

  const loadAssetsFromStorage = async () => {
    try {
      const result = await window.storage.get('design-assets');
      if (result && result.value) {
        const savedAssets = JSON.parse(result.value);
        setAssets(savedAssets);
        setPreviews(savedAssets);
      }
    } catch (error) {
      console.log('No saved assets found');
    }
  };

  const saveAssetsToStorage = async (updatedAssets) => {
    try {
      await window.storage.set('design-assets', JSON.stringify(updatedAssets));
    } catch (error) {
      console.error('Error saving assets:', error);
    }
  };

  const handleImageUpload = (key, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedAssets = {
          ...assets,
          [key]: base64String
        };
        setAssets(updatedAssets);
        setPreviews(prev => ({ ...prev, [key]: base64String }));
        saveAssetsToStorage(updatedAssets);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (key, url) => {
    const updatedAssets = {
      ...assets,
      [key]: url
    };
    setAssets(updatedAssets);
    setPreviews(prev => ({ ...prev, [key]: url }));
    saveAssetsToStorage(updatedAssets);
  };

  const removeAsset = (key) => {
    const updatedAssets = {
      ...assets,
      [key]: ""
    };
    setAssets(updatedAssets);
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[key];
      return newPreviews;
    });
    saveAssetsToStorage(updatedAssets);
  };

  const handleColorPaletteChange = (value) => {
    const updatedAssets = {
      ...assets,
      colourPalette: value
    };
    setAssets(updatedAssets);
    saveAssetsToStorage(updatedAssets);
  };

  const handleSizeChange = (value) => {
    const updatedAssets = {
      ...assets,
      size: value
    };
    setAssets(updatedAssets);
    saveAssetsToStorage(updatedAssets);
  };

  const generatePayload = () => {
    return JSON.stringify(assets, null, 2);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(generatePayload());
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const downloadPayload = () => {
    const blob = new Blob([generatePayload()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-assets-payload.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const imageFields = [
    { key: "characterImage", label: "Character Image", icon: "👤" },
    { key: "uniformImage", label: "Uniform Image", icon: "👕" },
    { key: "productImage", label: "Product Image", icon: "📦" },
    { key: "backgroundImage", label: "Background Image", icon: "🖼️" },
    { key: "logoImage", label: "Logo Image", icon: "🏷️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Assets Manager
              </h1>
              <p className="text-gray-600">
                Upload and manage all your design assets in one place
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyPayload}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-all flex items-center gap-2"
              >
                {copiedPayload ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedPayload ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadPayload}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Payload Preview - REMOVED */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Color Palette */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Color Palette</h2>
              </div>
              
              <div className="space-y-3">
                {/* Color Picker */}
                <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pick Colors
                  </label>
                  <input
                    type="color"
                    onChange={(e) => handleColorPaletteChange(e.target.value)}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {assets.colourPalette || 'No color selected'}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">or choose preset</span>
                  </div>
                </div>

                {colorPalettes.map((palette) => (
                  <button
                    key={palette.value}
                    onClick={() => handleColorPaletteChange(palette.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      assets.colourPalette === palette.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{palette.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{palette.value}</p>
                      </div>
                      {assets.colourPalette === palette.value && (
                        <Check className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </button>
                ))}
                
                <input
                  type="text"
                  value={assets.colourPalette}
                  onChange={(e) => handleColorPaletteChange(e.target.value)}
                  placeholder="Or type custom palette..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Size Selector */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Canvas Size</h2>
              
              <div className="space-y-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSizeChange(option.value)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      assets.size === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.value}</span>
                    </div>
                  </button>
                ))}
                
                <input
                  type="text"
                  value={assets.size}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  placeholder="Custom size (e.g., 1920x1080)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Assets</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {imageFields.map((field) => (
                  <div key={field.key} className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{field.icon}</span>
                        <h3 className="font-semibold text-gray-800">{field.label}</h3>
                      </div>
                      {assets[field.key] && (
                        <button
                          onClick={() => removeAsset(field.key)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>

                    {/* Preview */}
                    {previews[field.key] ? (
                      <div className="mb-3 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <img
                          src={previews[field.key]}
                          alt={field.label}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-40 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No image</p>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="block mb-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(field.key, e.target.files[0])}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload
                      </div>
                    </label>

                    {/* URL Input */}
                    <input
                      type="text"
                      value={assets[field.key]}
                      onChange={(e) => handleUrlInput(field.key, e.target.value)}
                      placeholder="Or paste URL..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-400 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-purple-600" />
                  Asset Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Color Palette</p>
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {assets.colourPalette || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Canvas Size</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {assets.size}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Images Uploaded</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {Object.values(assets).filter(v => v && v.includes('http') || v.includes('data:image')).length} / 5
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}