// src/app/api/records/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateRecordSchema } from "@/lib/validation";
import { fetchDailyRange } from "@/lib/weather";

// GET /api/records/:id
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const record = await prisma.locationRequest.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ record });
}

// PUT /api/records/:id
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const body = await req.json();
  // validate + coerce with our Zod schema (includes date-range checks)
  const parsed = updateRecordSchema.parse({ ...body, id });

  // re-fetch ERA5 temps for the (possibly updated) date range
  const era = await fetchDailyRange(
    parsed.latitude,
    parsed.longitude,
    parsed.startDate,
    parsed.endDate
  );

  const updated = await prisma.locationRequest.update({
    where: { id },
    data: {
      query: parsed.query,
      name: parsed.name,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      dailyTemps: era, // store the raw daily payload; adjust if you shaped it elsewhere
      notes: parsed.notes ?? null,
    },
  });

  return NextResponse.json({ record: updated });
}

// DELETE /api/records/:id
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await prisma.locationRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
