"use client";
import { useEffect, useState } from "react";
import { 
  Star, Download, Copy, Check, Sparkles, QrCode, 
  MessageSquare, TrendingUp, Share2 
} from "lucide-react";
import { useRouter } from "next/navigation";


export default function BusinessQR() {

  // ------------------------- STATES -------------------------
  const [business, setBusiness] = useState("");             // dynamic title
  const [reviewUri, setReviewUri] = useState("");           // google review link (API)
  const [reviewUrl, setReviewUrl] = useState("");           // our review page URL
  const [qrImage, setQrImage] = useState("");               // QR url
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [submittedRatings, setSubmittedRatings] = useState([]);




  // ------------------------- GET BUSINESS FROM LOCALSTORAGE -------------------------
  const getLocalBusinessTitle = () => {
    try {
      const raw = localStorage.getItem("locationDetails");
      if (!raw) return "";
      
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].title || "";
      }
      return "";
    } catch (e) {
      console.log("localStorage parse error", e);
      return "";
    }
  };


  // ------------------------- FETCH GOOGLE REVIEW URL VIA API -------------------------
  const getGoogleReviewURL = async (title) => {
    try {
      const encoded = encodeURIComponent(title);
      const res = await fetch(`/api/user-bussiness/${encoded}`);
      const data = await res.json();

      if (data?.newReviewUri) {
        setReviewUri(data.newReviewUri);
      } else {
        setReviewUri("");
      }

    } catch (e) {
      console.error("API error:", e);
      setReviewUri("");
    }
  };


  // ------------------------- INIT LOAD -------------------------
  useEffect(() => {
    const title = getLocalBusinessTitle();
    setBusiness(title);

    if (!title) return;

    // Fetch Google Review URL
    getGoogleReviewURL(title);

    // Create slug
    const slug = title.toLowerCase().replace(/\s+/g, "-");

    // Our review page URL
    const baseUrl = window.location.origin;
    const finalReviewURL = `${baseUrl}/reviews/${slug}`;
    setReviewUrl(finalReviewURL);

    // Generate QR code
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalReviewURL)}`;
    setQrImage(qr);

  }, []);



  // ------------------------- RATING HANDLER -------------------------
  const handleRating = (value) => {
    setRating(value);

    if (value <= 3) {
      setShowFeedback(true);
    } else {
      if (!reviewUri) {
        alert("Google Review link not found");
        return;
      }

      setRedirecting(true);

      setTimeout(() => {
        window.open(reviewUri, "_blank");
        setRedirecting(false);
        setShowSuccess(true);
        saveRating(value, "Positive rating redirected to Google");
      }, 1500);
    }
  };


  // ------------------------- SAVE RATING -------------------------
  const saveRating = (stars, note) => {
    const entry = {
      id: Date.now(),
      stars,
      note,
      date: new Date().toLocaleString(),
    };
    setSubmittedRatings([entry, ...submittedRatings]);
  };


  // ------------------------- FEEDBACK SUBMIT -------------------------
  const submitFeedback = () => {
    if (!feedback.trim()) return;

    saveRating(rating, feedback);
    setShowFeedback(false);
    setShowSuccess(true);
    setFeedback("");
  };


  // ------------------------- DOWNLOAD QR IMAGE -------------------------
  const downloadQR = () => {
    if (!qrImage) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = qrImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 3;
      canvas.height = img.height * 3;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${business}-qr.png`;
      a.click();
    };
  };


  // ------------------------- COPY LINK -------------------------
  const copyToClipboard = () => {
    navigator.clipboard.writeText(reviewUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  // ------------------------- SHARE LINK -------------------------
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Review ${business}`,
          text: "Share your feedback!",
          url: reviewUrl,
        });
      } catch (e) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };


  console.log("businessbusiness",business);


 // If business NOT found → show message + redirect button
if (!business) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">

      <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full text-center border border-blue-100">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Connect Your Business First
        </h2>

        <p className="text-gray-600 mb-8 text-lg">
          Please connect your business before accessing the Our Magic review system.
        </p>

        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg 
                     hover:bg-blue-700 transition shadow-lg w-full font-semibold"
        >
          Go to Dashboard
        </button>
      </div>

    </div>
  );
}

  



  // ------------------------- UI START -------------------------
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

  {/* TOP BAR */}
  <div className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center">
    {/* <button
      onClick={() => router.back()}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                 rounded-lg shadow-sm hover:bg-gray-100 transition text-gray-700 font-medium"
    >
      ← Back
    </button> */}
  </div>

  <div className="container mx-auto px-4 py-12">

    {/* HEADER */}
    <div className="text-center mb-14">
      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
        <Sparkles size={16} />
        <span>Smart Review System</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 mb-2">
        {business || "Loading..."}
      </h1>

      <p className="text-gray-600 text-lg max-w-xl mx-auto">
        Collect feedback, grow your reputation, and guide customers effortlessly.
      </p>
    </div>


    {/* MAIN GRID */}
    <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">

      {/* LEFT SECTION — QR CARD */}
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
            <QrCode className="text-blue-600" size={26} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Your QR Code</h2>
        </div>

        {/* QR IMAGE */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-1 rounded-2xl shadow-inner">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {qrImage && (
                <img
                  src={qrImage}
                  className="w-full max-w-sm mx-auto rounded-xl"
                />
              )}
            </div>
          </div>
        </div>

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={downloadQR}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 
                     hover:bg-blue-700 transition shadow-md font-semibold mb-8"
        >
          <Download size={20} />
          Download QR Code
        </button>


        {/* SHARE LINK SECTION */}
        {reviewUrl && (
          <div className="space-y-5">

            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Share2 size={20} className="text-blue-600" />
              <span>Share Review Link</span>
            </div>

            {/* COPY BOX */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                />

                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-600" />
                  )}
                </button>
              </div>

              {copied && (
                <p className="mt-2 flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Check size={16} /> Link copied successfully!
                </p>
              )}
            </div>

            {/* SHARE BUTTON */}
            <button
              onClick={shareLink}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 
                         rounded-xl flex items-center justify-center gap-2 hover:opacity-90 
                         transition-all shadow-md font-semibold"
            >
              <Share2 size={20} />
              Share Review Link
            </button>

          </div>
        )}
      </div>


      {/* RIGHT SECTION — HOW IT WORKS */}
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl shadow-sm">
              <MessageSquare className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">How It Works</h2>
          </div>

          <button
            onClick={() => setShowDemo(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            View Demo
          </button>
        </div>

        {/* LOW RATING */}
        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <Star key={i} size={20} className="text-orange-500" fill="currentColor" />
              ))}
            </div>
            <span className="font-bold text-gray-800">1–3 Stars</span>
            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Private
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">
            Customers can share concerns privately — protecting your reputation while helping you improve.
          </p>
        </div>


        {/* HIGH RATING */}
        <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={20} className="text-green-600" fill="currentColor" />
              ))}
            </div>
          <span className="font-bold text-gray-800">4–5 Stars</span>
          <span className="ml-auto bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Public
          </span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">
          Positive reviewers are redirected directly to your Google Profile to boost your public ratings.
        </p>
      </div>


      {/* QR DESTINATION BOX */}
      <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 mt-6 shadow-sm">
        <p className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
          🎯 QR Destination
        </p>

        <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
          <code className="text-xs text-indigo-700 break-all block">
            {reviewUrl}
          </code>
        </div>

        <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
          <Check size={14} className="text-green-600" />
          Customers see this page when they scan your QR code.
        </p>
      </div>

    </div>
  </div>


  {/* ----------------------- FEEDBACK MODAL ----------------------- */}
  {showFeedback && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100">

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">We Value Your Feedback</h2>

        <textarea
          rows={5}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 
                     focus:ring-2 focus:ring-blue-100 resize-none"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowFeedback(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition font-semibold text-gray-700"
          >
            Cancel
          </button>

          <button
            disabled={!feedback.trim()}
            onClick={submitFeedback}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 
                       transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </button>
        </div>

      </div>
    </div>
  )}


  {/* ----------------------- DEMO MODAL ----------------------- */}
  {showDemo && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100">

        <h2 className="text-2xl font-bold text-center mb-6">Quick Guide</h2>

        <div className="space-y-4">

          <div className="flex gap-4 items-start p-5 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map(n => (
                <Star key={n} size={18} className="text-orange-500" fill="currentColor" />
              ))}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 mb-1">1–3 Stars (Private)</p>
              <p className="text-sm text-gray-600">Customer submits private feedback.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-5 bg-green-50 rounded-xl border border-green-200">
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={18} className="text-green-600" fill="currentColor" />
              ))}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 mb-1">4–5 Stars (Public)</p>
              <p className="text-sm text-gray-600">Redirects to Google Reviews.</p>
            </div>
          </div>

        </div>

        <button
          onClick={() => setShowDemo(false)}
          className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  )}

</div>
</div>
    </>
  );
}
