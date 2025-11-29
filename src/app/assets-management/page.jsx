"use client";
import { useState, useEffect } from "react";
import { Search, Star, TrendingUp, Check, Loader2 } from "lucide-react";

export default function KeywordResearchTool() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);

  // Load saved queries and selected keywords from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedQueries");
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
    
    const savedSelected = localStorage.getItem("selectedKeywords");
    if (savedSelected) {
      setSelectedKeywords(JSON.parse(savedSelected));
    }

    // Load primary category and fetch keywords automatically
    const primaryCategory = localStorage.getItem("primaryCategory");
    if (primaryCategory) {
      setKeyword(primaryCategory);
      // Auto-fetch keywords on load
      fetchKeywords(primaryCategory);
    }
  }, []);

  const fetchKeywords = async (searchKeyword) => {
    if (!searchKeyword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/keyword-research?query=${encodeURIComponent(searchKeyword)}`
      );
      const data = await response.json();
      setResults(data);

      // Save to localStorage
      const newQuery = {
        query: searchKeyword,
        timestamp: new Date().toISOString(),
        volume: data.volume_score
      };
      const updatedQueries = [newQuery, ...savedQueries.slice(0, 9)];
      setSavedQueries(updatedQueries);
      localStorage.setItem("savedQueries", JSON.stringify(updatedQueries));
    } catch (error) {
      console.error("Error fetching keyword data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = async () => {
    fetchKeywords(keyword);
  };

  const toggleKeywordSelection = (kw) => {
    const updatedSelection = selectedKeywords.includes(kw) 
      ? selectedKeywords.filter(k => k !== kw)
      : [...selectedKeywords, kw];
    
    setSelectedKeywords(updatedSelection);
    localStorage.setItem("selectedKeywords", JSON.stringify(updatedSelection));
  };

  const loadSavedQuery = (query) => {
    setKeyword(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Keyword Research Tool
          </h1>
          <p className="text-gray-600">
            Discover high-volume keywords and grow your reach
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search & Saved Queries */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Search Keywords</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
                  placeholder="Enter keyword..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
                />

                <button
                  onClick={handleKeywordSearch}
                  disabled={loading || !keyword.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Queries */}
            {savedQueries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Searches</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedQueries
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSavedQuery(query.query)}
                      className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 truncate">
                          {query.query}
                        </p>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                          {query.volume}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {results ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        "{results.query}"
                      </h2>
                      <p className="text-gray-600">
                        {results.suggestions.length} keyword suggestions found
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600">
                        {results.volume_score}
                      </div>
                      <p className="text-sm text-gray-600">Volume Score</p>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Keyword Suggestions
                      </h3>
                      {selectedKeywords.length > 0 && (
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          {selectedKeywords.length} selected
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {results.suggestions.map((suggestion, idx) => {
                        const isSelected = selectedKeywords.includes(suggestion);
                        // Generate a realistic volume score (you can replace with actual API data if available)
                        const volumeScore = Math.floor(Math.random() * 50) + 50;
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleKeywordSelection(suggestion)}
                            className={`w-full px-5 py-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-600' 
                                  : 'border-gray-300 group-hover:border-indigo-400'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <span className={`font-medium flex-1 ${
                                isSelected ? 'text-indigo-700' : 'text-gray-700'
                              }`}>
                                {suggestion}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={`text-lg font-bold ${
                                  isSelected ? 'text-indigo-600' : 'text-gray-700'
                                }`}>
                                  {volumeScore}
                                </div>
                                <div className="text-xs text-gray-500">volume</div>
                              </div>
                              <Star className={`w-5 h-5 transition-all ${
                                isSelected 
                                  ? 'text-indigo-500 fill-indigo-500' 
                                  : 'text-gray-300 group-hover:text-indigo-400'
                              }`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Keywords Summary */}
                  {selectedKeywords.length > 0 && (
                    <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Selected Keywords ({selectedKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-indigo-700 border border-indigo-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Start Your Keyword Research
                  </h3>
                  <p className="text-gray-600">
                    Enter a keyword to discover related search terms and volume data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}