import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentAndForecast } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }
  try {
    const data = await fetchCurrentAndForecast(Number(lat), Number(lon));
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Weather fetch failed" }, { status: 500 });
  }
}
