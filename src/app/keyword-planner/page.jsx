"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Tag, TrendingUp, X } from "lucide-react";

export default function KeywordPage() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [saved, setSaved] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  /* ---------- Fetch Google keywords ---------- */
  const searchKeywords = async (value) => {
    if (!value) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const res = await fetch(`/api/keyword-research?query=${value}`);
    const data = await res.json();

    if (data.success) setSuggestions(data.keywords);
    setIsSearching(false);
  };

  /* ---------- Add keyword ---------- */
  const addKeyword = async (keyword) => {
    const userId = localStorage.getItem("userId");
    await fetch("/api/keyword-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, keyword }),
    });
    fetchSavedKeywords();
    setSuggestions([]);
    setInput("");
  };

  /* ---------- Remove keyword ---------- */
  const deleteKeyword = async (id) => {
    await fetch(`/api/keyword-research?id=${id}`, {
      method: "DELETE",
    });
    fetchSavedKeywords();
  };

  /* ---------- Fetch saved keywords ---------- */
  const fetchSavedKeywords = async () => {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`/api/keyword-research?userId=${userId}`);
    const data = await res.json();
    if (data.success) setSaved(data.data);
  };

  useEffect(() => {
    fetchSavedKeywords();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Keyword Research</h1>
          <p className="text-gray-600">Discover and save the best keywords for your content</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 backdrop-blur-sm bg-opacity-90">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                searchKeywords(e.target.value);
              }}
              placeholder="Type keyword (e.g. mahindra office near me)"
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Google Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">Suggested Keywords</p>
              {suggestions.map((k, idx) => (
                <div
                  key={idx}
                  className="group flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200"
                  onClick={() => addKeyword(k)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{k}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addKeyword(k);
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Keywords */}
        <div className="bg-white rounded-3xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">My Keywords</h3>
              <p className="text-sm text-gray-500">{saved.length} keywords saved</p>
            </div>
          </div>

          {saved.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No keywords saved yet</p>
              <p className="text-gray-400 text-sm mt-2">Start by searching for keywords above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {saved.map((k) => (
                <div
                  key={k._id}
                  className="group relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span className="font-semibold text-gray-800">{k.keyword}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(k.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteKeyword(k._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 hover:bg-red-100 rounded-lg"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-600">{saved.length}</div>
            <div className="text-sm text-gray-600">Saved</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-600">{suggestions.length}</div>
            <div className="text-sm text-gray-600">Suggestions</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-pink-600">{input.length}</div>
            <div className="text-sm text-gray-600">Characters</div>
          </div>
        </div>
      </div>
    </div>
  );
}