import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ videos: [], note: "Set YOUTUBE_API_KEY to enable videos." });

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "4");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) return NextResponse.json({ error: "YouTube fetch failed" }, { status: 500 });
  const data = await res.json();
  const videos = (data.items || []).map((it:any)=> ({
    id: it.id.videoId,
    title: it.snippet.title,
    channel: it.snippet.channelTitle,
    thumb: it.snippet.thumbnails?.medium?.url
  }));
  return NextResponse.json({ videos });
}
