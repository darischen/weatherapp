import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateRecordSchema } from "@/lib/validation";
import { fetchDailyRange } from "@/lib/weather";

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
  const rec = await prisma.locationRequest.findUnique({ where: { id: params.id }});
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ record: rec });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const body = await req.json();
    const parsed = updateRecordSchema.parse({ ...body, id: params.id });

    const daily = await fetchDailyRange(
      parsed.latitude, parsed.longitude, parsed.startDate, parsed.endDate
    );

    const out = await prisma.locationRequest.update({
      where: { id: params.id },
      data: {
        query: parsed.query,
        name: parsed.name,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        dailyTemps: daily,
        notes: parsed.notes ?? null
      }
    });
    return NextResponse.json({ record: out });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  try {
    await prisma.locationRequest.delete({ where: { id: params.id }});
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 400 });
  }
}
