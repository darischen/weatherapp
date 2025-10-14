import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing GOOGLE_MAPS_API_KEY" }, { status: 500 });

  const {
    input,
    sessionToken,
    includedRegionCodes,          // e.g. ["us"]
    origin,                       // optional { latitude, longitude } to bias
    // ⚠️ intentionally NOT using includedPrimaryTypes so neighborhoods aren't excluded
    includeQueryPredictions,
  } = await req.json();

  if (!input?.trim()) return NextResponse.json({ error: "Missing input" }, { status: 400 });

  const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // Ask for richer data so we can rank results client-side
      "X-Goog-FieldMask": [
        "suggestions.placePrediction.placeId",
        "suggestions.placePrediction.text",
        "suggestions.placePrediction.structuredFormat",
        "suggestions.placePrediction.types",
        "suggestions.placePrediction.distanceMeters",
      ].join(","),
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes,
      origin,
      includeQueryPredictions: !!includeQueryPredictions,
      // no includedPrimaryTypes — let Google return neighborhoods/sublocalities/localities/etc.
    }),
    next: { revalidate: 15 },
  });

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data?.error?.message || "Places Autocomplete failed" }, { status: resp.status });
  }

  const suggestions = (data?.suggestions ?? [])
    .map((s: any) => s.placePrediction)
    .filter(Boolean)
    .map((p: any) => ({
      placeId: p.placeId || p.place,
      description: p.text?.text ?? "",
      structuredFormat: p.structuredFormat ?? null,
      types: p.types ?? [],
      distanceMeters: p.distanceMeters ?? null,
    }));

  return NextResponse.json({ suggestions });
}
