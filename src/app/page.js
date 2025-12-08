"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Calendar, Send, ArrowRight, Star, TrendingUp, Shield, CheckCircle, PenTool, Clock, X, LogIn, Link2, LayoutGrid, Menu, ChevronRight, ChevronLeft, Gift } from 'lucide-react';
import LogoImage from "../../public/images/bg-logo.png"
import Image from 'next/image';
import Toast from '../components/Toast';


export default function LimbuAILanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [slidingTextIndex, setSlidingTextIndex] = useState(0); 
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookDemoModal, setShowBookDemoModal] = useState(false);
  const [demoDetails, setDemoDetails] = useState({ name: '', contact: '', time: 'today' });
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [toast, setToast] = useState(null);
  const [demoBooked, setDemoBooked] = useState(false);

  const now = new Date();
  const isAfter4PM = now.getHours() >= 16; // 4 PM
  const isSunday = now.getDay() === 0;

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Check login status
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Set default demo time based on current time
    if (isAfter4PM) {
      setDemoDetails(prev => ({ ...prev, time: 'tomorrow' }));
    }

    // Show signup popup after a delay if not logged in
    if (!token) {
      const popupTimer = setTimeout(() => {
        setShowSignupPopup(true);
      }, 5000); // Show after 5 seconds
    }
    
    // ESC key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setShowVideoModal(false);
        setShowBookDemoModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isAfter4PM]);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setSlidingTextIndex(prevIndex => (prevIndex + 1) % 5); // 5 is the number of slides
    }, 3000); // Change text every 3 seconds
    return () => clearInterval(sliderInterval);
  }, []);

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      window.location.href = path;
    } else {
      window.location.href = '/login';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBookDemoSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!demoDetails.name || !demoDetails.contact) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    setIsSubmittingDemo(true);

    try {
      const res = await fetch("/api/bookDemo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: demoDetails.name,
          phone: demoDetails.contact,
          seminarTime: `${demoDetails.time === 'today' ? 'Today' : 'Tomorrow'} 4:00 PM`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setDemoBooked(true);
      setTimeout(() => {
        setShowBookDemoModal(false);
        setDemoBooked(false); // Reset for next time
      }, 2500);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmittingDemo(false);
    }
  }, [demoDetails]);
  const handleDemoInputChange = (e) => {
    setDemoDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const features = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "AI Post Generation",
      description: "Create engaging GMB posts instantly with AI assistance",
      color: "from-blue-500 to-blue-600",
      link: "/post-management"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Auto-schedule posts at optimal times for maximum reach",
      color: "from-purple-500 to-purple-600",
      link: "/post-management"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Review Management",
      description: "Respond to reviews with AI-powered suggestions",
      color: "from-pink-500 to-pink-600",
      link: "/review-management"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Magic QR",
      description: "Filter negative reviews with smart QR technology",
      color: "from-indigo-500 to-indigo-600",
      link: "/get-magic-qr"
    }
  ];

  const stats = [
    { value: "1000+", label: "Active Businesses" },
    { value: "25k+", label: "Posts Created" },
    { value: "98%", label: "Success Rate" },
    { value: "2X", label: "Traffic Growth" }
  ];

  const postImages = [
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1764404571/tmpx28dvfi__qxwt1c.jpg",
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1764238151/tmp9x2d_a52_hvhpw8.jpg",
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1763974160/tmpvnt2q3jh_bpq5vr.jpg",
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1763959750/tmph8ajqrjv_hpteeq.jpg",
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1764303591/tmpaqv882lt_tre9wm.jpg",
    "https://res.cloudinary.com/dsnuzit6o/image/upload/v1764306448/tmpklqlkafr_b3ebuf.jpg"
  ];

  const steps = [
    {
      icon: <LogIn className="w-8 h-8" />,
      title: "Sign Up Free",
      description: "Start your free trial in seconds. No credit card required.",
      details: ["Enter your mobile number", "Verify with OTP", "Access dashboard instantly"]
    },
    {
      icon: <Link2 className="w-8 h-8" />,
      title: "Connect GMB",
      description: "Securely link your Google Business Profile.",
      details: ["One-click authentication", "100% secure connection", "Takes less than 30 seconds"]
    },
    {
      icon: <LayoutGrid className="w-8 h-8" />,
      title: "Start Automating",
      description: "Create posts, manage reviews, and grow your business.",
      details: ["AI-powered content creation", "Auto-schedule posts", "Smart review responses"]
    }
  ];

  const testimonials = [
    {
      quote: "Limbu.ai has been a game-changer for our local business. We're saving hours every week on social media management!",
      author: "Ravi Kumar",
      title: "Owner, Kumar Electronics",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      quote: "The AI post generator is fantastic. The content is relevant and engaging. Our customer interaction has doubled.",
      author: "Priya Sharma",
      title: "Manager, Sharma Sweets",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      quote: "I was skeptical about AI, but this tool is incredibly easy to use and delivers real results. The Magic QR feature is pure genius!",
      author: "Amit Singh",
      title: "Director, Singh & Co.",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg"
    }
  ];
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const slidingTexts = [
    { icon: "🚫", text: "No Subscriptions • No Hidden Fees" },
    { icon: "👍", text: "Zero Commitment • 100% Risk-Free" },
    { icon: "🕊️", text: "No Wallet Bound • Use Anytime" },
    { icon: "💳", text: "No Credit Card Needed • Start Instantly" },
    { icon: "🤖", text: "Fully Automated • No Technical Skills" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div 
          className="absolute w-96 h-96 bg-blue-300 rounded-full blur-3xl -top-48 -left-48"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-300 rounded-full blur-3xl top-1/2 -right-48"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Signup Popup */}
      {showSignupPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-white/50">
            <button onClick={() => setShowSignupPopup(false)} className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-200 transition">
              <X className="w-6 h-6" />
            </button>
            <div className="text-yellow-300 mb-4">
              <Gift className="w-16 h-16 mx-auto animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Hurry Up!</h2>
            <p className="text-white/90 text-lg mb-6">
              Sign up now to get <strong className="text-yellow-300">1000 bonus coins</strong> and create amazing posts instantly!
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Signup Fast & Get Coins
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Video Demo Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowVideoModal(false)}>
          <div className="relative bg-black rounded-2xl shadow-2xl w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowVideoModal(false)} className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-200 transition z-10">
              <X className="w-6 h-6" />
            </button>
            <iframe
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/aSwXK9wuCNk?autoplay=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Book Demo Modal */}
      {showBookDemoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <button onClick={() => setShowBookDemoModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
              <X className="w-6 h-6" />
            </button>
            {demoBooked ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Booked Successfully!</h2>
                <p className="text-slate-600">We will contact you shortly. The window will close automatically.</p>
              </div>
            ) : isSunday ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Seminars Unavailable</h2>
                <p className="text-slate-600">We are closed on Sundays. Please book a demo for another day.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Book Your Free Demo</h2>
                <form onSubmit={handleBookDemoSubmit} className="space-y-4">
                  <input type="text" name="name" placeholder="Your Name" value={demoDetails.name} onChange={handleDemoInputChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <input type="tel" name="contact" placeholder="Contact Number" value={demoDetails.contact} onChange={handleDemoInputChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Select Seminar Time:</p>
                    <div className={`grid ${isAfter4PM ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                      {!isAfter4PM && (
                        <label className={`block p-3 border rounded-lg cursor-pointer text-center transition-all ${demoDetails.time === 'today' ? 'bg-blue-100 border-blue-500 shadow-md' : 'bg-slate-50 border-slate-300 hover:border-slate-400'}`}>
                          <input type="radio" name="time" value="today" checked={demoDetails.time === 'today'} onChange={handleDemoInputChange} className="sr-only" />
                          <span className="font-bold">Today</span>
                          <span className="text-sm block text-slate-500">4:00 PM</span>
                        </label>
                      )}
                      <label className={`block p-3 border rounded-lg cursor-pointer text-center transition-all ${demoDetails.time === 'tomorrow' ? 'bg-blue-100 border-blue-500 shadow-md' : 'bg-slate-50 border-slate-300 hover:border-slate-400'}`}>
                        <input type="radio" name="time" value="tomorrow" checked={demoDetails.time === 'tomorrow'} onChange={handleDemoInputChange} className="sr-only" />
                        <span className="font-bold">Tomorrow</span>
                        <span className="text-sm block text-slate-500">4:00 PM</span>
                      </label>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingDemo} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-60 disabled:saturate-50">
                    {isSubmittingDemo ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}




      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/50 to-transparent"></div>
              <span className="text-xl sm:text-2xl relative z-10">
                                <Image src={LogoImage} alt="Limbu.ai Logo" className="w-6 h-6 sm:w-8 sm:h-8" />

              </span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">limbu.ai</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">GMB Automation</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">How It Works</a>
            <a href="#examples" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">Examples</a>
            <button
              onClick={() => setShowBookDemoModal(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Book a Demo
            </button>
            <a
              href="https://wa.me/919540384046"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition p-2 border border-green-500 rounded-lg animate-pulse-border"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current"><path d="M16 .667C7.64.667.667 7.64.667 16c0 2.77.72 5.47 2.08 7.87L.667 31.333 7.2 29.28c2.31 1.26 4.93 1.92 7.6 1.92 8.36 0 15.333-6.973 15.333-15.333S24.36.667 16 .667zm0 27.2c-2.42 0-4.78-.64-6.85-1.87l-.49-.29-4.07 1.07 1.09-3.97-.32-.51c-1.24-1.94-1.9-4.18-1.9-6.6 0-6.91 5.61-12.533 12.533-12.533 6.91 0 12.533 5.623 12.533 12.533S22.91 27.867 16 27.867zm7.15-9.63c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2-.26.39-1 1.27-1.23 1.53-.23.26-.46.29-.85.1-.39-.2-1.64-.6-3.12-1.91-1.15-1.03-1.93-2.31-2.15-2.7-.23-.39-.02-.6.17-.79.17-.17.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69-.1-.2-.88-2.12-1.21-2.9-.32-.78-.65-.67-.88-.68h-.76c-.26 0-.69.1-1.05.49-.36.39-1.37 1.34-1.37 3.27 0 1.93 1.41 3.79 1.61 4.05.2.26 2.78 4.24 6.73 5.95 3.95 1.72 3.95 1.15 4.66 1.08.72-.07 2.31-.94 2.64-1.85.33-.92.33-1.71.23-1.85-.1-.13-.36-.23-.75-.39z"/></svg>
              9540384046
            </a>
            
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="px-5 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Login
              </button>
            )}
          </nav>

          {/* Mobile: Call Now + Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <a 
              href="tel:9540384046" 
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              9540384046
            </a>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-800">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 md:hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700">How It Works</a>
            <a href="#examples" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700">Examples</a>
            <button onClick={() => { setShowBookDemoModal(true); setIsMobileMenuOpen(false); }} className="text-lg font-medium text-blue-600 text-left">
              Book a Demo
            </button>
            {isLoggedIn ? (
              <>
                <button onClick={() => handleNavigation('/dashboard')} className="mt-4 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold">
                  Dashboard
                </button>
                <button onClick={handleLogout} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => window.location.href = '/login'} className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold">
                Login
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Sliding Text Badge */}
          <div className="relative h-10 mb-6 sm:mb-8 flex items-center justify-center">
            {slidingTexts.map((item, index) => (
              <div
                key={index}
                className={`absolute w-full transition-opacity duration-500 ease-in-out ${index === slidingTextIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-blue-200 rounded-full shadow-sm">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{item.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-slate-900">Google Business Profile</span>
            <br />
            <span className="text-slate-900">Management </span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              On Autopilot
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Create AI-powered posts, schedule automatically, and manage reviews. 
            <strong> Save 10+ hours every week</strong> with smart automation.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleNavigation(isLoggedIn ? '/dashboard' : '/login')}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowVideoModal(true)}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-slate-300 text-slate-800 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-xl hover:border-slate-400 transition-all inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
              View Demo
            </button>
          </div>
          
          {/* <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-4">No credit card required • Free 7-day trial</p> */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-20 md:mt-24">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-slate-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples Section - Moved Up */}
      <section id="examples" className="relative bg-white py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">
              AI-Generated <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Post Examples</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">See what our AI creates for businesses like yours</p>
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl">
            <div className="flex gap-4 animate-scroll">
              {[...postImages, ...postImages].map((image, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-64 h-64 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`Post example ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative bg-white py-12 sm:py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">
              Everything You Need in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">One Place</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">Powerful features designed for busy business owners</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => handleNavigation(feature.link)}
                className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <div className={`w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br ${feature.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{feature.description}</p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  Try Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">
              Get Started in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">From signup to automation in under 5 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -z-10" />

            {steps.map((step, idx) => (
              <div key={idx} className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200 hover:shadow-2xl transition-all">
                {/* Step Number */}
                <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {idx + 1}
                </div>

                {/* Icon */}
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 mb-3 sm:mb-4 mt-4 sm:mt-6">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">{step.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">{step.description}</p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              Loved by Businesses <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Like Yours</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">Real stories from our happy customers</p>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 overflow-hidden">
              <div className="absolute top-8 left-8 text-6xl text-blue-100 -z-0">❞</div>
              <div className="relative z-10 transition-opacity duration-300">
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-700 mb-6 text-center">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="flex items-center justify-center">
                  <img src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].author} className="w-12 h-12 rounded-full mr-4 border-2 border-blue-200" />
                  <div>
                    <div className="font-bold text-slate-900">{testimonials[currentTestimonial].author}</div>
                    <div className="text-sm text-slate-500">{testimonials[currentTestimonial].title}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>


      {/* Examples Section */}
      {/* <section id="examples" className="relative bg-white py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">
              AI-Generated <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Post Examples</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 px-4">See what our AI creates for businesses like yours</p>
          </div>

          <div className="relative h-64 overflow-hidden rounded-2xl">
            <div className="flex gap-4 animate-scroll">
              {[...postImages, ...postImages].map((image, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-64 h-64 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`Post example ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* Trust Section */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-8 sm:gap-12 text-white">
            <div className="flex items-center gap-3">
              <Shield className="w-6 sm:w-8 h-6 sm:h-8" />
              <div>
                <div className="font-bold text-base sm:text-lg">Enterprise Security</div>
                <div className="text-blue-100 text-xs sm:text-sm">Bank-level encryption</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8" />
              <div>
                <div className="font-bold text-base sm:text-lg">99.9% Uptime</div>
                <div className="text-blue-100 text-xs sm:text-sm">Always available</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-6 sm:w-8 h-6 sm:h-8 fill-white" />
              <div>
                <div className="font-bold text-base sm:text-lg">5-Star Rated</div>
                <div className="text-blue-100 text-xs sm:text-sm">Loved by customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 px-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 px-4">
            Join 1000+ businesses automating their Google My Business today
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleNavigation(isLoggedIn ? '/dashboard' : '/login')}
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              {isLoggedIn ? "Go to Dashboard" : "Start Your Free Trial"}
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button 
              onClick={() => setShowBookDemoModal(true)}
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white border-2 border-slate-300 text-slate-800 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-xl hover:border-slate-400 transition-all"
            >
              Book a Demo
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-900 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Logo Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4 cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
                <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/50 to-transparent"></div>
                  <span className="text-lg sm:text-xl relative z-10">🍋</span>
                </div>
                <span className="font-bold text-base sm:text-lg">limbu.ai</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">Automate your Google My Business with AI</p>
            </div>

            {/* Links Columns */}
            {/* Links Columns */}
            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li><button onClick={() => handleNavigation('/post-management')} className="hover:text-white transition">Post Management</button></li>
                <li><button onClick={() => handleNavigation('/review-management')} className="hover:text-white transition">Review Management</button></li>
                <li><button onClick={() => handleNavigation('/magic-qr')} className="hover:text-white transition">Magic QR</button></li>
                <li><button onClick={() => handleNavigation('/dashboard')} className="hover:text-white transition">Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy</a></li>
                <li><a href="/terms-and-conditions" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
                <li><a href="/contact" className="hover:text-white transition">Help Center</a></li>
                <li><a href="tel:9540384046" className="hover:text-white transition">Call: 9540384046</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400">
            © {new Date().getFullYear()} limbu.ai. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:-top-16 sm:-right-16 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl group z-10"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Image Container */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage}
                alt="Enlarged post"
                className="w-full h-auto object-contain max-h-[80vh]"
              />
              
              {/* Image Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white font-semibold text-lg">AI Generated Post</p>
                <p className="text-white/80 text-sm">Created automatically for Google My Business</p>
              </div>
            </div>

            {/* Click Outside Hint */}
            <p className="text-white/60 text-center mt-4 text-sm">Click outside or press ESC to close</p>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
<a
  href="https://wa.me/919540384046"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-5 right-5 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
  aria-label="Chat on WhatsApp"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="w-9 h-9 fill-white"
  >
    <path d="M16 .667C7.64.667.667 7.64.667 16c0 2.77.72 5.47 2.08 7.87L.667 31.333 7.2 29.28c2.31 1.26 4.93 1.92 7.6 1.92 8.36 0 15.333-6.973 15.333-15.333S24.36.667 16 .667zm0 27.2c-2.42 0-4.78-.64-6.85-1.87l-.49-.29-4.07 1.07 1.09-3.97-.32-.51c-1.24-1.94-1.9-4.18-1.9-6.6 0-6.91 5.61-12.533 12.533-12.533 6.91 0 12.533 5.623 12.533 12.533S22.91 27.867 16 27.867zm7.15-9.63c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2-.26.39-1 1.27-1.23 1.53-.23.26-.46.29-.85.1-.39-.2-1.64-.6-3.12-1.91-1.15-1.03-1.93-2.31-2.15-2.7-.23-.39-.02-.6.17-.79.17-.17.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69-.1-.2-.88-2.12-1.21-2.9-.32-.78-.65-.67-.88-.68h-.76c-.26 0-.69.1-1.05.49-.36.39-1.37 1.34-1.37 3.27 0 1.93 1.41 3.79 1.61 4.05.2.26 2.78 4.24 6.73 5.95 3.95 1.72 3.95 1.15 4.66 1.08.72-.07 2.31-.94 2.64-1.85.33-.92.33-1.71.23-1.85-.1-.13-.36-.23-.75-.39z"/>
  </svg>
</a>



      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 5s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(34, 197, 94, 0.4); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { border-color: rgba(34, 197, 94, 1); box-shadow: 0 0 10px 0 rgba(34, 197, 94, 0.6); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}