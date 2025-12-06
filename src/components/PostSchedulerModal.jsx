"use client";
import { useState, useMemo } from "react";
import { X, Calendar, Key, Hash, DollarSign, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PostSchedulerModal({ isOpen, onClose, session }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keywords, setKeywords] = useState("");

  // Calculate the number of posts based on the date range
  const numPosts = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;

    // Calculate the difference in days (inclusive)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const COST_PER_POST = 150;

  const totalCost = numPosts * COST_PER_POST;

  const handleSchedule = async () => {
    if (!startDate || !endDate || !keywords.trim()) {
      toast.error("Please select a start date, end date, and enter keywords.");
      return;
    }
    if (numPosts <= 0) {
      toast.error("End date must be after or the same as the start date.");
      return;
    }

    // TODO: Implement the API call to your backend to save the schedule
    console.log("Scheduling posts with:", {
      userId: session?.user?.id,
      startDate,
      endDate,
      keywords,
      numPosts,
      totalCost,
    });

    toast.success(`${numPosts} posts have been scheduled successfully!`);
    onClose(); // Close modal on success
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Schedule Auto-Posts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Date Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Calendar className="w-5 h-5 text-gray-400 absolute top-9 left-3" />
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split("T")[0]} // Cannot select past dates
              />
            </div>
            <div className="relative">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Calendar className="w-5 h-5 text-gray-400 absolute top-9 left-3" />
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          </div>

          {/* Keywords Input */}
          <div className="relative">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <Key className="w-5 h-5 text-gray-400 absolute top-9 left-3" />
            <input
              type="text"
              id="keywords"
              placeholder="e.g., digital marketing, SEO services"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
            <h3 className="font-bold text-gray-800 text-center">Order Summary</h3>
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-600">Cost per Post:</p>
              <p className="font-semibold text-gray-800">₹{COST_PER_POST}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-600">Total Posts (1 per day):</p>
              <p className="font-semibold text-gray-800">{numPosts}</p>
            </div>
            <div className="flex justify-between items-center text-lg pt-2 border-t mt-2">
              <p className="font-bold text-gray-900">Total Amount:</p>
              <p className="font-bold text-blue-600">₹{totalCost}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button onClick={handleSchedule} disabled={numPosts <= 0} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
            Approve & Schedule Posts
          </button>
        </div>
      </div>
    </div>
  );
}