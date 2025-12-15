"use client";

import { useState } from "react";
import {
  Sparkles,
  Download,
  Share2,
  Video,
  ArrowLeft,
  PlayCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Toast from "../../components/Toast";
import LoadingOverlay from "../../components/LoadingOverlay";
import { generateVideoAction } from "@/app/actions/postActions";

/* ----------------------------------------------------
   IMAGE + INPUT FORM COMPONENT
---------------------------------------------------- */
const VideoInput = ({
  prompt,
  setPrompt,
  productName,
  setProductName,
  size,
  setSize,
  productImage,
  setProductImage,
  onGenerate,
  loading,
}) => {
  const removeImage = () => setProductImage(null);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col space-y-4 sm:space-y-6">

        {/* Video Prompt */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            What video would you like to create?
          </label>

          <textarea
            placeholder="Describe your video idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 focus:ring-4 focus:ring-blue-300 outline-none resize-none min-h-[120px]"
            disabled={loading}
          />
        </div>

        {/* Product Name */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-base sm:text-lg font-bold text-gray-800">
            Product Name
          </label>

          <input
            type="text"
            placeholder="e.g., My Awesome Logo"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 focus:ring-4 focus:ring-blue-300 outline-none"
            disabled={loading}
          />
        </div>

        {/* Product Image Upload */}
        <div className="space-y-2 sm:space-y-3">
          <label className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-green-500" />
            Product Image
          </label>

          {!productImage ? (
            <label className="flex flex-col items-center justify-center w-full h-36 border-3 border-dashed border-gray-400 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-base text-gray-700 font-semibold">
                Click to upload image
              </p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                className="hidden"
                disabled={loading}
              />
            </label>
          ) : (
            <div className="relative w-full h-36 bg-gray-100 rounded-xl border-2 border-gray-300 p-4">
              <img
                src={URL.createObjectURL(productImage)}
                className="w-full h-full object-contain rounded-lg"
              />

              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Video Size */}
        <div className="space-y-3">
          <label className="text-lg font-bold text-gray-800">Video Size</label>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSize("9:16")}
              disabled={loading}
              className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                size === "9:16"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="w-8 h-14 bg-gray-300 mb-2 rounded-md" />
              <span className="font-semibold text-gray-800">Portrait</span>
            </button>

            <button
              onClick={() => setSize("16:9")}
              disabled={loading}
              className={`p-4 border-2 rounded-xl flex flex-col items-center ${
                size === "16:9"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="w-14 h-8 bg-gray-300 mb-2 rounded-md" />
              <span className="font-semibold text-gray-800">Landscape</span>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-black text-lg hover:scale-[1.02] transition disabled:opacity-50"
        >
          <Video className="w-6 h-6 inline-block mr-2" />
          Generate Video with AI
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------------------------
   VIDEO CARD COMPONENT
---------------------------------------------------- */
const VideoCard = ({ videoUrl, prompt, handleDownload, handleShare }) => (
  <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden hover:scale-[1.02] transition">
    <div className="relative">
      <video
        src={videoUrl}
        className="w-full h-64 object-cover"
        controls
        loop
        muted
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition flex items-center justify-center">
        <PlayCircle className="w-16 h-16 text-white/80" />
      </div>
    </div>

    <div className="p-4 space-y-4">
      <p className="text-sm text-gray-700 line-clamp-3">{prompt}</p>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={() => handleDownload(videoUrl)}
          className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-bold hover:bg-blue-200"
        >
          <Download className="w-4 h-4 inline-block mr-1" />
          Download
        </button>

        <button
          onClick={() => handleShare(videoUrl)}
          className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg font-bold hover:bg-purple-200"
        >
          <Share2 className="w-4 h-4 inline-block mr-1" />
          Share
        </button>
      </div>
    </div>
  </div>
);

/* ----------------------------------------------------
   MAIN PAGE
---------------------------------------------------- */
export default function VideoManagementPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [videos, setVideos] = useState([]);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [size, setSize] = useState("16:9");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  /* ---------------------------
      GENERATE VIDEO HANDLER
  --------------------------- */
 /* ---------------------------
      GENERATE VIDEO HANDLER
--------------------------- */
const handleGenerateClick = async () => {
  if (!prompt.trim() || !productName.trim())
    return showToast("Please fill in product name & prompt", "error");

  if (!productImage)
    return showToast("Please upload a product image", "error");

  setIsGenerating(true);
  setCountdown(120);

  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  try {
    // Convert image to Base64
    const base64Image = await fileToBase64(productImage);

    const payload = {
      product_name: productName,
      product_image: base64Image,
      user_insturction: prompt,
      size,
      duration: "8",
    };

    console.log("Sending Payload:", payload);

    // ⭐ DIRECT API CALL HERE (NO generateVideoAction FUNCTION)
    const res = await fetch("/api/video-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    console.log("API Response:", result);

    clearInterval(timer);

    if (result.success && result.data?.output) {
      const newVideo = {
        url: result.data.output,
        prompt,
        id: Date.now(),
      };

      setVideos((prev) => [newVideo, ...prev]);
      showToast("Video generated successfully! 🎉");

      // Reset fields
      setPrompt("");
      setProductName("");
      setProductImage(null);
    } else {
      throw new Error(result.error || "Video generation failed");
    }
  } catch (error) {
    console.error("GENERATION ERROR:", error);
    showToast(error.message, "error");
  } finally {
    setIsGenerating(false);
    setCountdown(0);
  }
};



  /* ---------------------------
      DOWNLOAD VIDEO
  --------------------------- */
  const handleDownload = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `limbu-ai-video-${Date.now()}.mp4`;
      a.click();

      showToast("Download started!", "success");
    } catch {
      showToast("Download failed", "error");
    }
  };

  /* ---------------------------
      SHARE VIDEO
  --------------------------- */
  const handleShare = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Video",
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {isGenerating && <LoadingOverlay countdown={countdown} />}

      <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 space-y-8">
       <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
rounded-3xl p-8 text-white shadow-2xl border-4 border-white 
flex flex-col items-center justify-center text-center">

  <h1 className="text-4xl font-black flex items-center gap-3 justify-center">
    <Video className="w-8 h-8" /> Video Management
  </h1>

  <p className="text-blue-100">
    Create stunning AI-powered videos from text in seconds 🎬
  </p>

</div>


        <VideoInput
          prompt={prompt}
          setPrompt={setPrompt}
          productName={productName}
          setProductName={setProductName}
          productImage={productImage}
          setProductImage={setProductImage}
          size={size}
          setSize={setSize}
          onGenerate={handleGenerateClick}
          loading={isGenerating}
        />

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                videoUrl={v.url}
                prompt={v.prompt}
                handleDownload={handleDownload}
                handleShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border-3 border-dashed border-gray-300 text-center shadow-xl">
            <div className="text-8xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-800">No videos yet</h3>
            <p className="text-gray-600">
              Generate your first AI-powered video above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
