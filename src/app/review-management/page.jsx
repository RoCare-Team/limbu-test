"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  Star,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Zap,
  RefreshCw,
  AlertCircle,
  Download,
  Building2,
  MapPin,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userPlan, setUserPlan] = useState(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [hasLoadedReviews, setHasLoadedReviews] = useState(false);
  const [error, setError] = useState(null);
  const reviewsPerPage = 5;

  const { data: session, status } = useSession();
  const router = useRouter();

  // Load reviews from localStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem("cachedReviews");
    const savedTimestamp = localStorage.getItem("reviewsFetchedAt");
    
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        setReviews(parsedReviews);
        setHasLoadedReviews(true);
        console.log(`Loaded ${parsedReviews.length} cached reviews from localStorage`);
        
        if (savedTimestamp) {
          const fetchedDate = new Date(parseInt(savedTimestamp));
          console.log(`Reviews last fetched at: ${fetchedDate.toLocaleString()}`);
        }
      } catch (err) {
        console.error("Error parsing cached reviews:", err);
        localStorage.removeItem("cachedReviews");
        localStorage.removeItem("reviewsFetchedAt");
      }
    }
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get location details from localStorage
      const locationDetailsStr = localStorage.getItem("locationDetails");
      console.log("Raw locationDetails from localStorage:", locationDetailsStr);
      
      if (!locationDetailsStr) {
        throw new Error("No location details found in localStorage");
      }

      const locationDetails = JSON.parse(locationDetailsStr);

      const token = session?.accessToken;
      console.log("Session token exists:", !!token);

      if (!locationDetails || !Array.isArray(locationDetails) || locationDetails.length === 0) {
        throw new Error("Location details are empty or invalid");
      }

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const acc_id = locationDetails[0]?.accountId;
      const locationIds = locationDetails.map((loc) => loc.locationId).filter(Boolean);


      if (!acc_id) {
        throw new Error("Account ID is missing from location details");
      }

      if (locationIds.length === 0) {
        throw new Error("No valid location IDs found");
      }

      let allReviews = [];
      let pageToken = null;
      let pageCount = 0;
      const maxPages = 10; // Safety limit to prevent infinite loops

      do {
        pageCount++;
        console.log(`Fetching reviews page ${pageCount}...`);

        const requestBody = {
          acc_id,
          locationIds,
          access_token: token,
          ...(pageToken && { pageToken })
        };

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const res = await fetch("https://n8n.srv968758.hstgr.cloud/webhook/b3f4dda4-aef1-4e87-a426-b503cee3612b", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error Response:", errorText);
          throw new Error(`API request failed with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("API Response:", data);

        if (data.reviews && Array.isArray(data.reviews)) {
          console.log(`Received ${data.reviews.length} reviews on page ${pageCount}`);
          allReviews = [...allReviews, ...data.reviews];
          pageToken = data.nextPageToken || null;
        } else {
          console.log("No reviews in response or invalid format");
          pageToken = null;
        }

        // Safety check to prevent infinite loops
        if (pageCount >= maxPages) {
          console.warn("Reached maximum page limit");
          break;
        }

      } while (pageToken);

      console.log(`Total reviews fetched: ${allReviews.length}`);

      // Sort reviews: latest first (by createTime)
      const sortedReviews = allReviews.sort((a, b) => {
        const dateA = new Date(a.createTime);
        const dateB = new Date(b.createTime);
        return dateB - dateA;
      });

      // Save reviews to localStorage
      localStorage.setItem("cachedReviews", JSON.stringify(sortedReviews));
      localStorage.setItem("reviewsFetchedAt", Date.now().toString());
      console.log("Reviews saved to localStorage");

      setReviews(sortedReviews);
      setHasLoadedReviews(true);
      
      if (sortedReviews.length === 0) {
        toast.success("No reviews found for your locations", {
          duration: 3000,
          position: "top-center",
        });
      } else {
        toast.success(`Successfully loaded ${sortedReviews.length} reviews`, {
          duration: 3000,
          position: "top-center",
        });
      }

    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
      setHasLoadedReviews(true);
      toast.error(`Error: ${err.message}`, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const plan = localStorage.getItem("Plan");
    const normalizedPlan = plan ? plan.trim() : null;
    setUserPlan(normalizedPlan);
    setCheckingPlan(false);
    
    console.log("User plan detected:", normalizedPlan);
  }, []);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIdx = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startIdx, startIdx + reviewsPerPage);

  const StarRating = ({ rating }) => {
    const filled =
      rating === "FIVE" ? 5 : rating === "FOUR" ? 4 : rating === "THREE" ? 3 : rating === "TWO" ? 2 : 1;
    return (
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const handleAIReply = async (review, setLocalReply, setShowReplyInput, setGeneratingAI) => {
    try {
      setGeneratingAI(true);
      
      const { 
        name, 
        reviewId, 
        comment, 
        starRating, 
        reviewer 
      } = review;
      
      const starRatingMap = {
        "FIVE": "Five",
        "FOUR": "Four",
        "THREE": "Three",
        "TWO": "Two",
        "ONE": "One"
      };

      const [, accountId, , locationId] = name?.split('/') || [];

      console.log("Sending AI Reply Request:", {
        accountId,
        locationId,
        reviewId,
        reviewerName: reviewer?.displayName,
        starRating: starRatingMap[starRating],
        comment
      });

      const res = await fetch("https://n8n.srv968758.hstgr.cloud/webhook/59634515-0550-4cb5-9031-0d82bc0a303d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session?.accessToken,
          acc_id: accountId,
          locationIds: locationId,
          Reviewer_Name: reviewer?.displayName || "Anonymous",
          Star_Rating: starRatingMap[starRating] || "Five",
          Review_Content: comment || "No comment provided",
          Review_ID: reviewId
        }),
      });

      const data = await res.json();

      console.log("AI Reply Response:", data);
      
      if (data.status === true) {
        setLocalReply(data.reply);
        setShowReplyInput(true);
        toast.success("AI reply generated successfully!", {
          duration: 3000,
          position: "top-center",
        });
        
        // Refresh reviews to show the new reply in real-time
        await fetchReviews();
      } else {
        toast.error("Failed to generate AI reply. Please try manual reply.", {
          duration: 3000,
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("AI Reply Error:", err);
      toast.error("Error generating AI reply. Please try manual reply.", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const ReviewCard = ({ review }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [localReply, setLocalReply] = useState("");
    const [generatingAI, setGeneratingAI] = useState(false);
    const isReplying = replyingTo === review.reviewId;

    // Get location details for this review
    const getLocationDetails = () => {
      try {
        const locationDetailsStr = localStorage.getItem("locationDetails");
        if (!locationDetailsStr) return null;
        
        const locationDetails = JSON.parse(locationDetailsStr);
        const [, , , locationId] = review.name?.split('/') || [];
        
        const location = locationDetails.find(loc => loc.locationId === locationId);
        return location;
      } catch (err) {
        console.error("Error getting location details:", err);
        return null;
      }
    };

    const locationInfo = getLocationDetails();

    const handleManualReply = async () => {
      if (!localReply.trim()) return;

      try {
        setReplyingTo(review.reviewId);
        
        const { name, reviewId, starRating, reviewer } = review;
        const starRatingMap = {
          "FIVE": "Five",
          "FOUR": "Four",
          "THREE": "Three",
          "TWO": "Two",
          "ONE": "One"
        };
        
        const [, accountId, , locationId] = name?.split('/') || [];
        
        const res = await fetch("https://n8n.srv968758.hstgr.cloud/webhook/45f3a8db-b8d2-46ec-b692-4ec5fe90acc7", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session?.accessToken,
            acc_id: accountId,
            locationIds: locationId,
            Reviewer_Name: reviewer?.displayName || "Anonymous",
            Star_Rating: starRatingMap[starRating] || "Five",
            Review_Content: review.comment || "No comment provided",
            Review_ID: reviewId,
            reply_review: localReply
          }),
        });
        
        const data = await res.json();
        console.log("Manual Reply Response:", data);
        
        if (res.ok && data.status === true) {
          toast.success("Reply posted successfully!", {
            duration: 3000,
            position: "top-center",
          });
          await fetchReviews();
          setShowReplyInput(false);
          setLocalReply("");
        } else {
          toast.error("Failed to post reply. Please try again.", {
            duration: 3000,
            position: "top-center",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Error posting reply. Please try again.", {
          duration: 3000,
          position: "top-center",
        });
      } finally {
        setReplyingTo(null);
      }
    };

    return (
     <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Location Info Banner - Enhanced Design */}
        {locationInfo && (
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-lg mb-1 truncate">
                  {locationInfo.title}
                </h4>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-100 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-50 leading-relaxed">
                    {locationInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0">
              {review.reviewer?.profilePhotoUrl ? (
                <img
                  src={review.reviewer.profilePhotoUrl}
                  alt={review.reviewer?.displayName}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 shadow-sm object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {review.reviewer?.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {review.reviewer?.displayName || "Anonymous User"}
              </h3>
              <span className="text-sm text-gray-400">
                {new Date(review.createTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>

              <StarRating rating={review.starRating} />
              <p className="text-gray-700 mt-2">{review.comment || "No comment provided."}</p>

              {review.reviewReply && review.reviewReply.comment && review.reviewReply.comment.trim() !== "" && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-green-900 mb-1">Your Reply</p>
                  <p className="text-sm text-green-800">{review.reviewReply.comment}</p>
                </div>
              )}

              {(!review.reviewReply || !review.reviewReply.comment || review.reviewReply.comment.trim() === "") && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleAIReply(review, setLocalReply, setShowReplyInput, setGeneratingAI)}
                    disabled={generatingAI || isReplying}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI Reply
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="bg-white text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 inline-block mr-2" />
                    Manual Reply
                  </button>
                </div>
              )}

              {showReplyInput && (
                <div className="mt-4">
                  <textarea
                    value={localReply}
                    onChange={(e) => setLocalReply(e.target.value)}
                    placeholder="Write your reply here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows="3"
                    disabled={isReplying}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleManualReply}
                      disabled={isReplying || !localReply?.trim()}
                      className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                    <button
                      onClick={() => setShowReplyInput(false)}
                      className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (checkingPlan || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Toaster />
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Customer Reviews</h1>
          <p className="text-gray-600 text-lg text-center px-4">
            Manage and respond to your Google Business reviews with AI assistance
          </p>
        </div>

        {!hasLoadedReviews ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Download className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Your Reviews</h2>
              <p className="text-gray-600 mb-8">
                Click the button below to fetch all your customer reviews from Google Business Profile
              </p>
              <button
                onClick={fetchReviews}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Fetching Reviews...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Get Your Reviews
                  </>
                )}
              </button>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 p-8 rounded-2xl text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Reviews</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="space-y-4">
              <button
                onClick={fetchReviews}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Try Again
              </button>
              <div className="text-sm text-gray-600 max-w-2xl mx-auto">
                <p className="font-semibold mb-2">Troubleshooting tips:</p>
                <ul className="text-left space-y-1">
                  <li>• Check your browser console (F12) for detailed error logs</li>
                  <li>• Verify that location details are saved in localStorage</li>
                  <li>• Ensure you're properly authenticated with Google</li>
                  <li>• Try logging out and logging back in</li>
                </ul>
              </div>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-100">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No reviews found</p>
            <p className="text-gray-400 text-sm mb-6">Your business doesn't have any reviews yet</p>
            <button
              onClick={fetchReviews}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Check Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700 font-medium">
                Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={fetchReviews}
                disabled={loading}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>

            <div className="grid gap-6">
              {currentReviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-gray-600 hover:text-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white text-gray-600 hover:text-blue-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}