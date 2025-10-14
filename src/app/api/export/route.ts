import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";
import { create } from "xmlbuilder2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();

  const records = await prisma.locationRequest.findMany({ orderBy: { createdAt: "desc" }});

  if (format === "json") return NextResponse.json(records);

  if (format === "csv") {
    const flat = records.map(r => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      query: r.query,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      startDate: r.startDate?.toISOString() ?? "",
      endDate: r.endDate?.toISOString() ?? "",
      notes: r.notes ?? ""
    }));
    const csv = Papa.unparse(flat);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=records.csv"
      }
    });
  }

  if (format === "xml") {
    const doc = create({ version: "1.0" }).ele("records");
    records.forEach(r => {
      const rec = doc.ele("record");
      rec.ele("id").txt(r.id);
      rec.ele("createdAt").txt(r.createdAt.toISOString());
      rec.ele("updatedAt").txt(r.updatedAt.toISOString());
      rec.ele("query").txt(r.query);
      rec.ele("name").txt(r.name);
      rec.ele("latitude").txt(String(r.latitude));
      rec.ele("longitude").txt(String(r.longitude));
      if (r.startDate) rec.ele("startDate").txt(r.startDate.toISOString());
      if (r.endDate) rec.ele("endDate").txt(r.endDate.toISOString());
      if (r.notes) rec.ele("notes").txt(r.notes);
    });
    const xml = doc.end({ prettyPrint: true });
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": "attachment; filename=records.xml"
      }
    });
  }

  if (format === "md" || format === "markdown") {
    const md = ["# Saved Weather Records\n"];
    for (const r of records) {
      md.push(`## ${r.name}`);
      md.push(`- Query: \`${r.query}\``);
      md.push(`- Coords: ${r.latitude}, ${r.longitude}`);
      md.push(`- Range: ${r.startDate?.toISOString() ?? "—"} → ${r.endDate?.toISOString() ?? "—"}`);
      md.push("");
    }
    return new NextResponse(md.join("\n"), {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": "attachment; filename=records.md"
      }
    });
  }

  return NextResponse.json({ error: "Unsupported format. Use json,csv,xml,md" }, { status: 400 });
}
