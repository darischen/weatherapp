import { NextRequest, NextResponse } from "next/server";
import { geocodeQuery } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });
  try {
    const results = await geocodeQuery(q);
    return NextResponse.json({ results });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Geocode failed" }, { status: 500 });
  }
}
