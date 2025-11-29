import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const location = searchParams.get("location");

    if (!query || !location) {
      return NextResponse.json(
        { error: "query and location are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing SERPAPI_KEY in environment variables" },
        { status: 500 }
      );
    }

    // 🔥 FIX: google_local + required server-side headers
    const url = `https://serpapi.com/search.json?engine=google_local&q=${encodeURIComponent(
      query
    )}&location=${encodeURIComponent(location)}&api_key=${apiKey}`;

    const serpRes = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const serpJson = await serpRes.json();

    // 🔥 FIX: If SerpAPI blocked → return friendly error
    if (!serpJson.local_results && serpJson.error) {
      return NextResponse.json(
        { error: "SerpAPI returned no data", serpapi_error: serpJson.error },
        { status: 500 }
      );
    }

    // Extract Local Results
    const localResults = serpJson.local_results ?? [];

    // Extract keywords from titles, categories, reviews
   // Extract keywords from titles, categories, reviews
const keywords = [];

localResults.forEach((item) => {
  if (item.title)
    keywords.push({ text: item.title, source: "title" });

  if (item.category)
    keywords.push({ text: item.category, source: "category" });

  // 🔥 FIX: reviews may be array, number, or undefined
  if (Array.isArray(item.reviews)) {
    item.reviews.forEach((rev) => {
      if (rev.text) {
        keywords.push({ text: rev.text, source: "review" });
      }
    });
  }
});


    // clean keywords (limit)
    const cleanKeywords = keywords.slice(0, 30);

    // Stats
    const topRating = localResults[0]?.rating ?? null;
    const avgReviews = Math.round(
      localResults.reduce((sum, x) => sum + (x.reviews || 0), 0) /
        (localResults.length || 1)
    );

    return NextResponse.json({
      success: true,
      query,
      location,
      local_results: localResults,
      keywords: cleanKeywords,
      top_rating: topRating,
      avg_reviews: avgReviews,
      map_link: serpJson.search_metadata?.google_maps_url ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
