import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing GOOGLE_MAPS_API_KEY" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  if (!placeId) return NextResponse.json({ error: "Missing placeId" }, { status: 400 });

  const resp = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // Ask only for what we need to plot weather:
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
    },
    // No caching; we want fresh details:
    cache: "no-store",
  });

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data?.error?.message || "Place Details failed" }, { status: resp.status });
  }

  return NextResponse.json({
    id: data.id,
    name: data.displayName?.text || data.displayName,
    address: data.formattedAddress,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
  });
}
