import React, { useState, useEffect } from "react";

export default function LocalSeoDashboard() {
  const [query, setQuery] = useState("RO service");
  const [location, setLocation] = useState("Agra, Uttar Pradesh, India");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Fetch Data
  async function fetchData() {
    try {
      setError(null);
      setLoading(true);
      setData(null);

      const url = `/api/serp?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Auto fetch first time
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Local SEO Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Live competitor insights for your business (Powered by SerpAPI)
          </p>
        </header>

        {/* SEARCH SECTION */}
        <section className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

            {/* Query */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Business / Query</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="RO service, AC repair, Salon..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Agra, Delhi, Mumbai..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={() => {
                  setQuery("RO service");
                  setLocation("Agra, Uttar Pradesh, India");
                }}
                className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                Reset
              </button>
            </div>

          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700">
            Error: {error}
          </div>
        )}

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview Cards */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
              <p className="text-sm text-gray-500 mt-2">
                Summary of competitors in the selected location.
              </p>

              {data && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="p-4 rounded-lg bg-indigo-50">
                    <div className="text-sm text-gray-500">Total Results</div>
                    <div className="text-2xl font-bold text-indigo-700 mt-1">
                      {data.local_results?.length ?? 0}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="text-sm text-gray-500">Top Rating</div>
                    <div className="text-2xl font-bold text-green-700 mt-1">
                      {data.top_rating ?? "—"}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-50">
                    <div className="text-sm text-gray-500">Average Reviews</div>
                    <div className="text-2xl font-bold text-yellow-700 mt-1">
                      {data.avg_reviews ?? "—"}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* KEYWORDS */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Top Keywords</h3>

              {!data?.keywords?.length && (
                <div className="mt-4 text-gray-500">No keywords found</div>
              )}

              {data?.keywords?.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {data.keywords.map((k, i) => (
                    <div key={i} className="p-3 rounded-md border flex justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{k.text}</div>
                        <div className="text-xs text-gray-500">source: {k.source}</div>
                      </div>
                      <div className="text-sm text-gray-600">—</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMPETITORS LIST */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Local Competitors</h3>

              {data?.local_results?.length > 0 ? (
                <div className="divide-y">
                  {data.local_results.map((biz, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row gap-4">

                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {biz.thumbnail ? (
                          <img src={biz.thumbnail} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-md font-semibold">{biz.title}</div>
                            <div className="text-sm text-gray-500">{biz.address}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm">{biz.rating ?? "—"} ★</div>
                            <div className="text-xs text-gray-500">{biz.reviews ?? 0} reviews</div>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          {biz.description || "—"}
                        </div>

                        <div className="mt-3 flex gap-2">
                          {biz.links?.website && (
                            <a href={biz.links.website} target="_blank" className="text-indigo-600">
                              Website
                            </a>
                          )}
                          {biz.phone && (
                            <a href={`tel:${biz.phone}`} className="text-gray-700">
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No competitors found.</div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <aside className="space-y-6">

            {/* MAP */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Map Preview</h3>
              <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                {data?.map_link ? (
                  <iframe src={data.map_link} className="w-full h-full border-0" />
                ) : (
                  <span className="text-gray-400">Map not available</span>
                )}
              </div>
            </div>

            {/* REVIEWS INFO (google_local does not provide full review objects) */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
              <p className="text-gray-500 mt-3 text-sm">
                Google Local API does not provide full review details.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Actions</h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-center">
                  Refresh Data
                </button>

                <a
                  href={`https://www.google.com/search?q=${query} ${location}`}
                  target="_blank"
                  className="px-4 py-2 border rounded-md text-center">
                  Open Google Search
                </a>
              </div>
            </div>

          </aside>

        </div>

        <footer className="text-center text-gray-500 mt-10">
          Built for DoctorFresh • Powered by SerpAPI
        </footer>
      </div>
    </div>
  );
}
