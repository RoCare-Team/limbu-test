"use client";
import { useEffect, useState } from "react";
import { 
  Star, Download, Copy, Check, Sparkles, QrCode, 
  MessageSquare, Share2, Printer 
} from "lucide-react";

export default function BusinessQR() {
  const [business, setBusiness] = useState("");
  const [reviewUri, setReviewUri] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [qrImage, setQrImage] = useState("");
  
  const [copied, setCopied] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const [allLocations, setAllLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Get all locations from localStorage
  const getAllLocations = () => {
    try {
      const raw = localStorage.getItem("locationDetails");
      if (!raw) return [];
      
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error("localStorage parse error", e);
      return [];
    }
  };

  // Fetch Google Review URL via API
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

  // Create review URL - clean URL without query params
  const createReviewUrl = (location) => {
    const title = location.title || "";
    // Get locality from storefrontAddress (matching MongoDB structure)
    const locality = location.storefrontAddress?.locality || location.locality || "";
    
    // Create slug for SEO-friendly URL with locality
    const slug = `${title}${locality ? `-${locality}` : ""}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/reviews/${slug}`;
  };

  // Create display name with locality
  const getDisplayName = (location) => {
    const title = location.title || "";
    const locality = location.storefrontAddress?.locality || location.locality || "";
    return locality ? `${title} - ${locality}` : title;
  };

  // Init Load
  useEffect(() => {
    const locations = getAllLocations();
    setAllLocations(locations);

    if (locations.length === 0) return;

    const firstLocation = locations[0];
    setSelectedLocationId(firstLocation.locationId);

    const title = firstLocation.title || "";
    setBusiness(title);

    if (!title) return;

    // Fetch Google Review URL
    getGoogleReviewURL(title);

    // Create review URL with encoded data
    const finalReviewURL = createReviewUrl(firstLocation);
    setReviewUrl(finalReviewURL);

    // Generate QR code
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalReviewURL)}`;
    setQrImage(qr);
  }, []);

  // Handle location change
  const handleLocationChange = (locationId) => {
    setSelectedLocationId(locationId);
    
    const selected = allLocations.find(loc => loc.locationId === locationId);
    if (!selected) return;

    const displayName = getDisplayName(selected);
    setBusiness(displayName);

    if (!selected.title) return;

    // Fetch Google Review URL for this specific location
    getGoogleReviewURL(selected.title);

    // Create review URL with encoded data
    const finalReviewURL = createReviewUrl(selected);
    setReviewUrl(finalReviewURL);

    // Generate QR code
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalReviewURL)}`;
    setQrImage(qr);
  };

  // Download QR with branding
  const downloadQR = () => {
    if (!qrImage) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = qrImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const padding = 80;
      const qrSize = 600;
      const totalWidth = qrSize + (padding * 2);
      const titleHeight = 100;
      const urlHeight = 60;
      const poweredByHeight = 50;
      const spacing = 40;
      
      canvas.width = totalWidth;
      canvas.height = titleHeight + qrSize + urlHeight + poweredByHeight + (spacing * 3) + (padding * 2);

      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let currentY = padding;

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 48px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(business, canvas.width / 2, currentY + 60);
      
      currentY += titleHeight + spacing;

      ctx.drawImage(img, padding, currentY, qrSize, qrSize);
      
      currentY += qrSize + spacing;

      ctx.fillStyle = "#4b5563";
      ctx.font = "28px Arial, sans-serif";
      ctx.textAlign = "center";
      const urlText = reviewUrl.length > 50 ? reviewUrl.substring(0, 47) + "..." : reviewUrl;
      ctx.fillText(urlText, canvas.width / 2, currentY + 20);
      
      currentY += urlHeight + spacing;

      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 32px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Powered by LimbuAI", canvas.width / 2, currentY + 15);

      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${business}-qr-review.png`;
      a.click();
    };
  };

  const printQR = () => {
    if (!qrImage) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR - ${business}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .print-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              max-width: 600px;
            }
            .business-name {
              font-size: 32px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 30px;
            }
            .qr-image {
              width: 400px;
              height: 400px;
              margin: 0 auto 30px;
              display: block;
            }
            .review-url {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 30px;
              word-break: break-all;
            }
            .powered-by {
              font-size: 18px;
              color: #1f2937;
              font-weight: bold;
              margin-top: 20px;
            }
            @media print {
              body { background: white; }
              .print-container { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="business-name">${business}</div>
            <img src="${qrImage}" class="qr-image" alt="QR Code" />
            <div class="review-url">${reviewUrl}</div>
            <div class="powered-by">Powered by LimbuAI</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reviewUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="bg-white shadow-xl rounded-3xl p-10 max-w-md w-full text-center border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Connect Your Business First
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Please connect your business before accessing the review system.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
            <Sparkles size={16} />
            <span>Smart Review System</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 mb-4">
            {business}
          </h1>

          {allLocations.length > 1 && (
            <div className="max-w-md mx-auto mb-4">
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl 
                           text-gray-800 font-semibold shadow-sm hover:border-blue-300 
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                           transition-all cursor-pointer"
              >
                {allLocations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.title} - {loc.locality}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Collect feedback, grow your reputation, and guide customers effortlessly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <QrCode className="text-blue-600" size={26} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your QR Code</h2>
            </div>

            <div className="mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-inner">
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{business}</h3>
                  
                  {qrImage && (
                    <img
                      src={qrImage}
                      className="w-full max-w-xs mx-auto rounded-xl mb-4"
                      alt="QR Code"
                    />
                  )}
                  
                  <p className="text-sm text-gray-600 mb-4 break-all px-2">{reviewUrl}</p>
                  
                  <p className="text-base text-gray-700 font-bold">Powered by LimbuAI</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={downloadQR}
                className="bg-blue-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 
                           hover:bg-blue-700 transition shadow-md font-semibold"
              >
                <Download size={20} />
                Download
              </button>
              
              <button
                onClick={printQR}
                className="bg-indigo-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 
                           hover:bg-indigo-700 transition shadow-md font-semibold"
              >
                <Printer size={20} />
                Print
              </button>
            </div>

            {reviewUrl && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Share2 size={20} className="text-blue-600" />
                  <span>Share Review Link</span>
                </div>

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
      </div>

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
  );
}