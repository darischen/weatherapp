import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRecordSchema } from "@/lib/validation";
import { fetchDailyRange } from "@/lib/weather";

export async function GET() {
  const records = await prisma.locationRequest.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRecordSchema.parse(body);

    const daily = await fetchDailyRange(
      parsed.latitude, parsed.longitude,
      parsed.startDate, parsed.endDate
    );

    const out = await prisma.locationRequest.create({
      data: {
        query: parsed.query,
        name: parsed.name,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        dailyTemps: daily
      }
    });
    return NextResponse.json({ record: out }, { status: 201 });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Create failed" }, { status: 400 });
  }
}
