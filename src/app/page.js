"use client"
import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, MessageSquare, Calendar, Zap, ArrowRight, Star, TrendingUp, Shield, CheckCircle, PenTool, Clock, Send, ThumbsUp, Mail, X, LogIn, Link2, LayoutGrid, Menu } from 'lucide-react';
import Link from 'next/link';
import LogoImage from "../../public/images/bg-logo.png"
import Image from 'next/image';

import PostImage1 from '../../public/images/post-1.jpg';
import PostImage2 from '../../public/images/post-2.jpg';
import PostImage3 from '../../public/images/post-3.jpg';
import PostImage4 from '../../public/images/post-4.jpg';
import PostImage6 from '../../public/images/post-6.jpg';

export default function LimbuAILanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [buttonStatus,setButtonStatus] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
  localStorage.clear();   // Clear full storage
  setButtonStatus(false); // Update UI instantly

  // Redirect to login page
  window.location.href = "/login";
};


  useEffect(()=>{
    const token = localStorage.getItem("token")
    if(token){
    setButtonStatus(true)
    }
  },[])

  const features = [
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "AI Post Generation",
      description: "Create engaging GMB posts at any level with AI assistance"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Schedule posts automatically to optimal times"
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "Auto Publish to GMB",
      description: "Direct integration with your Google My Business"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Review Management",
      description: "Respond to reviews with AI-powered suggestions"
    }
  ];

  const stats = [
    { value: "10k+", label: "Posts Created", icon: <PenTool className="w-5 h-5" /> },
    { value: "500+", label: "Businesses", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "98%", label: "Response Rate", icon: <MessageSquare className="w-5 h-5" /> },
    { value: "2X", label: "traffic in 90 days", icon: <Clock className="w-5 h-5" /> }
  ];

  const postImages = [
    { name: "Post 1", image: PostImage1 },
    { name: "Post 2", image: PostImage2 },
    { name: "Post 3", image: PostImage3 },
    { name: "Post 4", image: PostImage4 },
    { name: "Post 6", image: PostImage6 },
  ];

  const howItWorksSteps = [
    {
      icon: <LogIn className="w-8 h-8" />,
      title: "Visit Website & Start Free Trial",
      points: [
        "Go to limbu.ai and click 'Start Free Trial'.",
        "Enter your mobile number and the OTP to log in.",
        "You're in! Start exploring the dashboard.",
      ]
    },
    {
      icon: <Link2 className="w-8 h-8" />,
      title: "Connect Your Google Business Profile",
      points: [
        "Click 'Connect Business Profile' and follow Google's secure authentication.",
        "This process is safe, secure, and essential for integration.",
        "Ensure you're logged into the correct Google account for your business.",
      ]
    },
    {
      icon: <LayoutGrid className="w-8 h-8" />,
      title: "Explore & Use Limbu.ai",
      points: [
        "Create stunning AI images and schedule auto-posts.",
        "Use AI to reply to reviews instantly.",
        "Filter negative reviews with our Magic QR feature.",
        "Analyze GMB insights and boost visibility with Citations.",
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-200/30 rounded-full blur-3xl top-1/2 -right-48 animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.2}px)`, animationDelay: '1s' }}
        />
        <div 
          className="absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="relative w-12 h-12 bg-gradient-to-br  rounded-xl flex items-center justify-center shadow-lg shadow-blue-300/50">
            <Image src={LogoImage} alt="Limbu Logo image" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              limbu.ai
            </h1>
            <p className="text-xs text-blue-600">GMB Automation</p>
          </div>
        </div>

        <nav className={`hidden md:flex items-center gap-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">How It Works</a>
          <a href="/contact" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">Contact</a>
         {buttonStatus ? (
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Logout
          </button>
        ) : (
          <Link href="/login">
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
              Login
            </button>
          </Link>
        )}

        </nav>

        {/* Mobile Menu Button and Phone */}
        <div className="md:hidden flex items-center gap-4">
          <a href="tel:9540384046" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-md hover:bg-blue-600 transition-all">
            Call Now
          </a>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-800">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col md:hidden animate-fadeIn">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl font-bold text-slate-800">LimbuAi</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-600"/></button>
          </div>
          <nav className="flex flex-col gap-6 text-center">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 hover:text-blue-600 transition">How It Works</a>
            <a href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 hover:text-blue-600 transition">Contact</a>
            <div className="mt-6">
            {buttonStatus ? (
  <button
    onClick={handleLogout}
    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
  >
    Logout
  </button>
) : (
  <Link href="/login">
    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
      Login
    </button>
  </Link>
)}
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-8">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-blue-700">Trusted by 500+ businesses worldwide</span>
          </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-900 text-center">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Automate Your GMB
            </span>
            <br />
            <span>with AI Power</span>

          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Generate engaging posts, schedule automatically, publish to GMB, and manage reviews—all powered by AI. 
            Save hours every week with intelligent automation.
          </p>



          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-300/50 transition-all hover:scale-105 flex items-center gap-2">
              {buttonStatus ? "Go to Dashboard": "Start Free Trial"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
          
          </div>
          
          {/* Brands Slider */}
          <div className="mt-24 mb-20 animate-fadeIn" style={{animationDelay: '0.5s'}}>
            <p className="text-sm font-semibold text-slate-500 mb-8 text-center">Explore high-quality posts crafted automatically for your brand and published to GMB.</p>
            <div className="relative h-48 group flex overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
              <div className="flex items-center justify-around flex-shrink-0 animate-scroll-x group-hover:[animation-play-state:paused]">
                {postImages.map((post, index) => (
                  <div key={index} className="w-48 h-48 p-2 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(post.image)}>
                    <Image src={post.image} alt={post.name} className="rounded-lg shadow-lg object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
              {/* Duplicate for seamless scroll */}
              <div className="flex items-center justify-around flex-shrink-0 animate-scroll-x group-hover:[animation-play-state:paused]" aria-hidden="true">
                {postImages.map((post, index) => (
                  <div key={`clone-${index}`} className="w-48 h-48 p-2 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(post.image)}>
                    <Image 
                      src={post.image} 
                      alt={post.name} 
                      className="rounded-lg shadow-lg object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="features" className="mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-slate-600">Everything you need to manage your GMB presence</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works Section */}
        <div id="how-it-works" className="mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Use Limbu.ai in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">3 Easy Steps</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">A simple, powerful, and secure way to automate your GMB.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Dashed line connector for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px">
              <svg width="100%" height="2" className="absolute top-[-2.5rem]">
                <path d="M0 1 H1000" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="10 10" />
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {howItWorksSteps.map((step, idx) => (
              <div key={idx} className="relative bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 text-left hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:scale-105">
                <div className="absolute -top-6 left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="absolute -top-6 right-8 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-2 border-white">
                  {idx + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4 mt-12 text-slate-800">{step.title}</h3>
                <ul className="space-y-3 text-slate-600">
                  {step.points.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 text-center hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
    

        {/* Trust Section */}
        <div className="mt-32 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-6 bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-500" />
              <span className="font-semibold text-slate-800">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-slate-800">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-slate-800">5-Star Rated</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your GMB Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses automating their Google My Business with AI
            </p>
           <Link href="/login">
            <button className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl cursor-pointer">
              Start Your Free Trial
            </button></Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-200 bg-white/50 backdrop-blur-xl py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Logo + Text */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-800">limbu.ai</div>
              <div className="text-xs text-slate-600">© {new Date().getFullYear()} All rights reserved</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-600 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="#features" className="text-slate-600 hover:text-blue-600 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition">
              How It Works
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition">
              Contact
            </Link>
            <Link href="/privacy-policy" className="text-slate-600 hover:text-blue-600 transition">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-slate-600 hover:text-blue-600 transition">
              Terms & Conditions
            </Link>
            <Link href="/cancellation-policy" className="text-slate-600 hover:text-blue-600 transition">
              Cancellation
            </Link>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={selectedImage} 
              alt="Enlarged post" 
              className="rounded-xl shadow-2xl w-full h-auto object-contain"
            />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center text-2xl font-bold hover:scale-110 transition-transform shadow-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-scroll-x {
          animation: scroll-x 40s linear infinite;
        }
      `}</style>
    </div>
  );
}