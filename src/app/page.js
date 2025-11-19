"use client"
import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, MessageSquare, Calendar, Zap, ArrowRight, Star, TrendingUp, Shield, CheckCircle, PenTool, Clock, Send, ThumbsUp, Mail } from 'lucide-react';
import Link from 'next/link';
import LogoImage from "../../public/images/bg-logo.png"
import Image from 'next/image';

export default function LimbuAILanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [buttonStatus,setButtonStatus] = useState(false)

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
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-8">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-blue-700">Trusted by 500+ businesses worldwide</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-slate-900">
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

          {/* Dashboard Preview */}
         <div id="how-it-works" className="mt-32 mb-20">
           <div className={`relative max-w-6xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-3xl blur-3xl opacity-20 animate-pulse" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-blue-100 p-8 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              {/* How <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">its Works</span> */}
            </h2>
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 bg-blue-50 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'posts' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <PenTool className="w-4 h-4 inline mr-2" />
                  Post Generation
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'schedule' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Scheduling
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'reviews' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Reviews
                </button>
              </div>

              {/* Post Generation View */}
              {activeTab === 'posts' && (
                <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-800">AI Post Generator</h3>
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-2">Topic/Keywords</label>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="h-3 bg-gradient-to-r from-blue-300 to-purple-300 rounded w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-2">Tone & Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-100 text-blue-700 rounded-lg p-2 text-xs font-semibold text-center">Professional</div>
                          <div className="bg-white border-2 border-blue-300 text-blue-600 rounded-lg p-2 text-xs font-semibold text-center">Friendly</div>
                          <div className="bg-white border border-blue-200 text-slate-600 rounded-lg p-2 text-xs font-semibold text-center">Casual</div>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                        <Sparkles className="w-4 h-4" />
                        Generate Post
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-800">Generated Post</h3>
                      {/* <Image className="w-5 h-5 text-blue-500" /> */}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-blue-100 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-blue-100 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-3 bg-blue-100 rounded w-4/6 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-32 flex items-center justify-center">
                        {/* <Image className="w-12 h-12 text-blue-400" /> */}
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition">
                          <Send className="w-3 h-3 inline mr-1" />
                          Publish Now
                        </button>
                        <button className="flex-1 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling View */}
              {activeTab === 'schedule' && (
                <div className="animate-fadeIn">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      Content Calendar
                    </h3>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={idx} className="text-center text-xs font-semibold text-slate-600 py-2">
                          {day}
                        </div>
                      ))}
                      {[...Array(28)].map((_, idx) => (
                        <div key={idx} className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 cursor-pointer ${
                          idx % 7 === 2 || idx % 7 === 5 ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md' : 
                          idx % 7 === 4 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 
                          'bg-white text-slate-600 border border-slate-200'
                        }`}>
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">Summer Sale Announcement</div>
                            <div className="text-sm text-slate-500 mt-1">Scheduled: Wed, 10:00 AM</div>
                          </div>
                          <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800">Weekend Special Offer</div>
                            <div className="text-sm text-slate-500 mt-1">Scheduled: Sat, 9:00 AM</div>
                          </div>
                          <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Management View */}
              {activeTab === 'reviews' && (
                <div className="animate-fadeIn space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-800">Recent Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-slate-800">4.8</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Review 1 */}
                      <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                              JD
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">John Doe</div>
                              <div className="flex gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Great service! The team was professional and helpful...
                        </p>
                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">AI Suggested Response</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            Thank you John! We thrilled you had a great experience...
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition">
                              <ThumbsUp className="w-3 h-3 inline mr-1" />
                              Send Reply
                            </button>
                            <button className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Review 2 */}
                      <div className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                              SM
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">Sarah Miller</div>
                              <div className="flex gap-1 mt-1">
                                {[...Array(4)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                ))}
                                <Star className="w-3 h-3 text-slate-300" />
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">5 hours ago</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          Good experience overall could improve waiting time...
                        </p>
                        <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Generate AI Response
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
      `}</style>
    </div>
  );
}