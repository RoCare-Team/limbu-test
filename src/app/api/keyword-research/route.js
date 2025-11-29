import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query missing" }, { status: 400 });
    }

    // 1️⃣ GOOGLE AUTOCOMPLETE
    const autoURL = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(
      query
    )}`;

    const autoRes = await fetch(autoURL);
    const autoJson = await autoRes.json();
    const suggestions = autoJson[1] || [];

    // 2️⃣ GOOGLE TRENDS + RELATED KEYWORDS (SERPAPI)
    const serpURL = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(
      query
    )}&geo=IN&api_key=${process.env.SERPAPI_KEY}`;

    const serpRes = await fetch(serpURL);
    const serpJson = await serpRes.json();

    // Extract volume score
    let volumeScore = 0;

    if (
      serpJson.interest_over_time &&
      serpJson.interest_over_time.timeline_data
    ) {
      const tl = serpJson.interest_over_time.timeline_data;
      volumeScore = tl[tl.length - 1]?.values[0]?.value || 0;
    }

    // Extract related keywords
    const related = serpJson.related_queries?.rising || [];
    const related_keywords = related.map((r) => r.query);

    return NextResponse.json({
      query,
      suggestions,
      volume_score: volumeScore,
      related_keywords,
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
