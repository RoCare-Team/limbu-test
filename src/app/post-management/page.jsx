"use client";

import {
  fetchPostsAction,
  fetchAllPostsAction,
  getUserWalletAction,
  generateWithAiAgentAction,
  savePostAction,
  deductFromWalletAction,
  generateWithAssetsAction, deletePostFromGmbAction,
  updatePostStatusAction, postToGmbAction,
} from "@/app/actions/postActions";
import { deleteAssetAction, loadAssetsFromServerAction } from "@/app/actions/assetActions";
import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Send,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Toast from "../../components/Toast";
import LocationSelectionModal from "../../components/LocationSelectionModal";
import InsufficientBalanceModal from "../../components/InsufficientBalanceModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import SuccessOverlay from "../../components/SuccessOverlay";
import PostInput from "@/components/PostInput";
import TabButton from "@/components/TabButton";
import PostCard from "../../components/PostCard";
import RejectReasonModal from "../../components/RejectReasonModal";
import "./PostManagement.module.css";


// Main Component
export default function PostManagementPage() {
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
  const [postToAction, setPostToAction] = useState(null);
  const [showDeleteLocationModal, setShowDeleteLocationModal] = useState(false);

  const [assetId, setAssetId] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);


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
      const result = await loadAssetsFromServerAction(userId);

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
      } else {
        // If no assets are found, set default assets for the UI
        setUserAssets([
          { name: "Character", url: "" },
          { name: "Product", url: "" },
          { name: "Uniform", url: "" },
          { name: "Background", url: "" },
          { name: "Logo", url: "" },
          { name: "Size", url: "3:4" }, // Default aspect ratio
          { name: "Color", url: "warm, yellow, orange, red" }, // Default color palette
        ]);
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
    rejected: 0,
  });

  const tabs = [
    { id: "total", label: "Total Posts", shortLabel: "Total", icon: ImageIcon, count: allCounts.total },
    { id: "pending", label: "Pending", shortLabel: "Pending", icon: Clock, count: allCounts.pending },
    { id: "approved", label: "Approved", shortLabel: "Approved", icon: CheckCircle, count: allCounts.approved },
    { id: "rejected", label: "Rejected", shortLabel: "Rejected", icon: XCircle, count: allCounts.rejected },
    { id: "scheduled", label: "Scheduled", shortLabel: "Scheduled", icon: Calendar, count: allCounts.scheduled },
    { id: "posted", label: "Posted", shortLabel: "Posted", icon: Send, count: allCounts.posted },
  ];

  const fetchPosts = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const allPostsData = await fetchAllPostsAction(userId);

      if (allPostsData.success) {
        const allPosts = allPostsData.data;
        setPosts(allPosts);

        setAllCounts({
          total: allPosts.filter((p) => p.status !== "rejected").length,
          approved: allPosts.filter((p) => p.status === "approved").length,
          pending: allPosts.filter((p) => p.status === "pending").length,
          scheduled: allPosts.filter((p) => p.status === "scheduled").length,
          posted: allPosts.filter((p) => p.status === "posted").length,
          rejected: allPosts.filter((p) => p.status === "rejected").length,
        });
      } else {
        throw new Error(allPostsData.error || "Failed to fetch posts");
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
      const userData = await getUserWalletAction(userId);
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
      const apiResponse = await generateWithAiAgentAction(prompt, logoBase64, selectedAssets);

      clearInterval(timer);

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || "AI agent failed.");
      }

      const data = apiResponse.data || {};



      // Save post to database
      const postData = await savePostAction({
        userId,
        aiOutput: data.output,
        description: data.description,
        logoUrl: data.logoUrl,
        status: "pending",
        promat: data.user_input,
        locations: [], // No locations assigned yet
      });

      if (!postData.success) {
        throw new Error(postData.error || "Failed to save post in database.");
      }

      // Deduct 150 coins for AI generation
      const walletData = await deductFromWalletAction(userId, {
        amount: 150,
        type: "deduct",
        reason: "image_generated",
        metadata: {
          aiPrompt: prompt,
          logoUsed: !!logo,
        }
      });

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
      setSelectedAssets([]);
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
      const userData = await getUserWalletAction(userId);
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

      // Convert logo to base64 if provided
      let logoBase64 = null;
      if (logo) {
        logoBase64 = await fileToBase64(logo);
      }

      // Call the asset generation API
      const apiResponse = await generateWithAssetsAction({
        topic: prompt,
        colourPalette: userAssets.find(a => a.name === 'Color')?.url || "",
        size: userAssets.find(a => a.name === 'Size')?.url || "1:1",
        characterImage: selectedAssets.find(a => a.name === 'Character')?.url || "",
        uniformImage: selectedAssets.find(a => a.name === 'Uniform')?.url || "",
        productImage: selectedAssets.find(a => a.name.startsWith('Product'))?.url || "",
        backgroundImage: selectedAssets.find(a => a.name === 'Background')?.url || "",
        logoImage: selectedAssets.find(a => a.name === 'Logo')?.url || logoBase64 || "",
        platform: "gmb"
      });

      clearInterval(timer);


      // The direct response from n8n is now the data we need
      if (apiResponse.status !== "true" && !apiResponse.success) {
        throw new Error(apiResponse.error || apiResponse.message || "AI asset generation failed.");
      }

      const data = apiResponse.success ? apiResponse.data : apiResponse;

      const postData = await savePostAction({
        userId,
        aiOutput: data.image,
        description: data.description,
        logoUrl: data.logoUrl,
        status: "pending",
        promat: data.user_input,
        locations: [], // No locations assigned yet
      });

      if (!postData.success) {
        throw new Error(postData.error || "Failed to save post in database.");
      }

      // Deduct 150 coins for AI generation
      const walletData = await deductFromWalletAction(userId, {
        amount: 150,
        type: "deduct",
        reason: "image_generated",
        metadata: {
          aiPrompt: prompt,
          logoUsed: !!logo,
        }
      });

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
      const data = await updatePostStatusAction({
        id,
        status: newStatus,
        scheduledDate: scheduleDate,
        userId: userId,
      });
      if (!data.success) {
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
      const data = await updatePostStatusAction({
        id,
        description: newDescription,
        userId: userId,
        status: "pending"
      });
      if (!data.success) {
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
    if (post.status !== "approved" && post.status !== "scheduled" && post.status !== "posted") {
      showToast("Please approve the post first!", "error");
      return;
    }

    // Set the post to be actioned and open the location modal
    setPostToAction(post);
    setShowLocationModal(true);
  };

  const handleDeleteFromGMB = async (post) => {
    // First, check if the post has been published anywhere.
    if (!post.locations || post.locations.length === 0) {
      showToast("This post hasn't been published to any locations yet.", "error");
      return;
    }

    // Set the specific post to be actioned and open the modal for location selection.
    setPostToAction(post);
    setShowDeleteLocationModal(true);
  };
  const handleLocationConfirm = async (selectedLocationIds, checkmark) => {

    setShowLocationModal(false);

    if (selectedLocationIds.length === 0) {
      showToast("Please select at least one location", "error");
      return;
    }

    // Use the post from state instead of a global variable
    if (!postToAction) {
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
      const userData = await getUserWalletAction(userId);
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

      // Prepare location data for webhook
      const locationData = selectedLocations.map(loc => ({
        city: loc.locationId,
        cityName: loc.locality,
        bookUrl: loc.websiteUrl || "",
      }));

      // Send post to webhook
      const { ok: responseOk, data } = await postToGmbAction({
        account: selectedLocations[0]?.accountId || "",
        locationData: locationData,
        output: postToAction?.aiOutput || "",
        description: postToAction?.description || "",
        accessToken: session?.accessToken || "",
        checkmark: checkmark,
      });

      console.log("datata",data);
      

      // If post success → Deduct coins
      if (responseOk) {
        showToast("Post successfully sent to all locations!", "success");
        setShowSuccess(true);

        // Deduct coins from wallet (100 per location)
        const walletRes = await deductFromWalletAction(userId, {
          amount: totalPostCost,
          type: "deduct",
          reason: "Post-on-GMB",
          metadata: {
            aiPrompt: prompt,
            logoUsed: !!logo,
          }
        });

        if (walletRes.success) {
          const newBalance = walletBalance - totalPostCost;
          setUserWallet(newBalance);
          localStorage.setItem("walletBalance", newBalance);
          showToast(`${totalPostCost} coins deducted (${selectedLocationIds.length} locations × 50 coins)`, "info");
        } else {
          showToast("Post sent, but wallet deduction failed", "warning");
        }

        // Update post with selected locations
        await updatePostStatusAction({
          id: postToAction._id,
          locations: selectedLocations,
          status: "posted",
          userId: userId,
        });

        // Refresh posts
        await fetchPosts(activeTab);

      } else {
        console.error("Webhook failed:", data);
        showToast(`Failed to send post`, "error");
      }

    } catch (error) {
      console.error("Post error:", error);
      showToast("Network error: Failed to send post", "error");
    } finally {
      setIsPosting(false);
      setPostToAction(null);
    }
  };

  const handleDeleteLocationConfirm = async (selectedLocationIds) => {
    setShowDeleteLocationModal(false);
    if (selectedLocationIds.length === 0) return;

    if (!postToAction || !postToAction.locations) {
      showToast("Post or location data is missing for deletion.", "error");
      return;
    }

    // Find the full location objects based on the selected IDs.
    // The `LocationSelectionModal` passes back the `id` property of the location objects.
    const locationsToDelete = postToAction.locations.filter(loc => 
      selectedLocationIds.includes(loc.id)
    );

    setIsPosting(true); // Reuse the posting loading overlay for a consistent feel

    for (const location of locationsToDelete) {
      const payload = {
        locationIds: location.locationId,
        acc_id: location.accountId,
        access_token: session?.accessToken,
      };

      // try {
      //   const result = await deletePostFromGmbAction(payload);

      //   if (!result.success) {
      //     throw new Error(`Failed to delete from ${location.name}.`);
      //   }
      //   showToast(`Post deleted from ${location.name}.`, "success");
      // } catch (error) {
      //   showToast(error.message, "error");
      // }
    }

    setIsPosting(false);
    setPostToAction(null);
    // Optionally, refetch posts or update the post's `locations` array in the state
  };

  const handleReject = async (id) => {
    if (confirm("Are you sure you want to reject this post?")) {
      setRejectPostId(id);
      setShowRejectModal(true);
    }
  };

  const submitRejection = async () => {
    const userId = localStorage.getItem("userId");

    if (!rejectReason.trim()) {
      showToast("Please enter a reason!", "error");
      return;
    }

    try {
      const data = await updatePostStatusAction({
        id: rejectPostId,
        userId,
        status: "rejected",
        reason: rejectReason,
      });
      if (data.success) {
        showToast("Post rejected successfully! ❌");

        // ✅ Update status only (do not delete)
        setPosts((prev) =>
          prev.map((p) =>
            p._id === rejectPostId
              ? { ...p, status: "rejected", rejectReason: rejectReason }
              : p
          )
        );
  
        // ✅ Update counts
        setAllCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
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
      showToast("No image available to download.", "error");
      return
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
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = activeTab === "total" ? posts : posts.filter((post) => post.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Back button for mobile view */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Link href="/dashboard" passHref>
          <button
            aria-label="Go back to dashboard"
            className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {toast && <Toast message={toast.message} type={toast.type} />}
        {isGenerating && <LoadingOverlay countdown={countdown} />}
        {showLocationModal && (
          <LocationSelectionModal
            locations={availableLocations} // Show all available locations for posting
            onClose={() => setShowLocationModal(false)}
            onConfirm={handleLocationConfirm}
            title="Select Locations to Post"
            confirmText="Post"
          />
        )}
        {showDeleteLocationModal && (
          <LocationSelectionModal
            locations={postToAction?.locations || []} // Show only posted locations for deleting
            onClose={() => setShowDeleteLocationModal(false)}
            onConfirm={handleDeleteLocationConfirm}
            title="Select Locations to Delete From"
            confirmText="Delete"
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
        {showRejectModal && (
          <RejectReasonModal
            onClose={() => setShowRejectModal(false)}
            onSubmit={submitRejection}
            reason={rejectReason}
            setReason={setRejectReason}
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

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-4 border-white">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-8 h-8" />
            Post Management
          </h1>
          <p className="text-blue-100 text-sm sm:text-base font-medium">
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
          selectedAssets={selectedAssets}
          setSelectedAssets={setSelectedAssets}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
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
                handleDeleteFromGMB={handleDeleteFromGMB}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center border-3 border-dashed border-gray-300 shadow-xl">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-600 text-base">
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