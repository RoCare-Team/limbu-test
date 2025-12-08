"use client";
import { useEffect, useState } from "react";
import { Star, ExternalLink, CheckCircle, Sparkles } from "lucide-react";

export default function CustomerReviewPage({slug}) {
  console.log("slugslug",slug);
  
  const [business, setBusiness] = useState("");
  const [locality, setLocality] = useState("");
  const [locationId, setLocationId] = useState("");
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [reviewUri, setReviewUri] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  // Decode location data from URL slug
  useEffect(() => {
    // Get slug from pathname
    const pathname = window.location.pathname;
    const slug = pathname.split("/").pop();
    
    if (!slug) {
      setErrorMsg("❌ Invalid review link. Please scan the QR code again.");
      setLoading(false);
      return;
    }

    // Fetch business data from API using slug
    fetchBusinessDataBySlug(slug);
  }, []);

  // Fetch business data using slug
  const fetchBusinessDataBySlug = async (slug) => {
    try {
      setLoading(true);
      
      console.log("📍 Fetching data for slug:", slug);
      
      // Call API to get business info by slug
      const res = await fetch(`/api/review-page/${slug}`);
      const data = await res.json();

      console.log("📥 Received data:", data);

      if (data.error) {
        setErrorMsg(data.message || `❌ ${data.error}`);
        setLoading(false);
        return;
      }

      // Set business data
      setBusiness(data.title || "");
      setLocality(data.locality || "");
      setLocationId(data.locationId || "");
      setReviewUri(data.newReviewUri || "");
      
      if (!data.newReviewUri) {
        setErrorMsg("⚠ Google Review link not available for this location");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMsg("⚠ Unable to load review page. Please try again.");
      setLoading(false);
    }
  };

  // Save review to database
  const saveReviewToDB = async ({ name, rating, feedback }) => {
    try {
      const payload = {
        business,
        locality,
        locationId,
        rating,
        name: name?.trim() || "Anonymous",
        feedback: feedback?.trim() || "",
        timestamp: new Date().toISOString()
      };

      const response = await fetch("/api/customer-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Failed to save review");
      }
    } catch (err) {
      console.error("Save Review Error:", err);
    }
  };

  // When user clicks a star
  const handleRating = (value) => {
    setRating(value);

    if (value <= 3) {
      // Low rating - show feedback form
      setShowFeedback(true);
    } else {
      // High rating - redirect to Google
      if (!reviewUri) {
        setErrorMsg("⚠ Google review link is not available yet. Please try again.");
        return;
      }

      setRedirecting(true);

      setTimeout(async () => {
        // Save the rating
        await saveReviewToDB({
          name: customerName,
          rating: value,
        });

        // Open Google Review in new tab
        window.open(reviewUri, "_blank");

        setRedirecting(false);
        setShowSuccess(true);
      }, 1200);
    }
  };

  // Submit low-rating feedback
  const submitFeedback = async () => {
    if (!feedback.trim()) return;

    await saveReviewToDB({
      name: customerName,
      rating,
      feedback,
    });

    setShowFeedback(false);
    setShowSuccess(true);
    setFeedback("");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading review page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={16} />
            <span>Customer Feedback</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 capitalize">
            {business}
          </h1>
          {locality && (
            <p className="text-gray-500 text-lg font-medium mb-2">{locality}</p>
          )}
          <p className="text-gray-600 text-lg">Share your experience with us</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center max-w-xl mx-auto">
            {errorMsg}
          </div>
        )}

        {/* Customer Name Input */}
        {!errorMsg && (
          <>
            <div className="max-w-md mx-auto mb-8">
              <input
                type="text"
                placeholder="Enter your name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-center text-gray-700 bg-white shadow-sm transition-colors"
              />
            </div>

            {/* Rating Section */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-2xl mx-auto border border-gray-100">
              <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
                Rate Your Experience
              </h2>
              <p className="text-center text-gray-600 mb-8">Tap a star to share your rating</p>

              {/* Star Rating */}
              <div className="flex gap-3 justify-center mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={redirecting}
                    className="transform transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star
                      size={56}
                      className={`transition-all duration-300 ${
                        rating >= star ? "text-yellow-400 drop-shadow-lg" : "text-gray-300"
                      }`}
                      fill={rating >= star ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/* Success Message */}
              {showSuccess && !redirecting && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-800 mb-1">Thank You!</p>
                      <p className="text-sm text-green-600">Your feedback has been submitted successfully</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Redirecting Loader */}
      {redirecting && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
          <div className="max-w-2xl mx-auto relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-3xl p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10 animate-pulse"></div>
            
            <div className="relative flex flex-col items-center gap-5">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full opacity-30"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent border-r-transparent animate-spin"></div>
                
                <div className="absolute inset-2 border-4 border-emerald-300 rounded-full opacity-40"></div>
                <div className="absolute inset-2 border-4 border-emerald-600 rounded-full border-b-transparent border-l-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-3 bg-white rounded-full shadow-lg animate-pulse">
                    <ExternalLink className="text-green-600" size={32} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-2xl font-bold text-green-800 animate-pulse">
                  🎉 Something Amazing is Happening...
                </p>
                <p className="text-base text-green-700 font-medium">
                  Thank you for your wonderful feedback!
                </p>
                <p className="text-sm text-green-600">
                  Preparing your Google Review experience
                </p>
              </div>

              <div className="w-full max-w-xs h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex gap-3">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.15s'}}></div>
                <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.3s'}}></div>
              </div>

              <div className="flex gap-2 text-yellow-500">
                <Sparkles size={20} className="animate-pulse" />
                <Sparkles size={16} className="animate-pulse" style={{animationDelay: '0.3s'}} />
                <Sparkles size={20} className="animate-pulse" style={{animationDelay: '0.6s'}} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl transform animate-in">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-orange-100 rounded-2xl mb-4">
                <Star size={32} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Help Us Improve</h2>
              <p className="text-gray-600 text-sm">We appreciate your honest feedback</p>
            </div>

            <textarea
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors"
              placeholder="Share your thoughts with us..."
              rows="5"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                disabled={!feedback.trim()}
                onClick={submitFeedback}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}