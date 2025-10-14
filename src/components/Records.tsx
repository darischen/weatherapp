"use client";
import { useEffect, useState } from "react";

type Place = { name: string; latitude: number; longitude: number; query: string };

export default function Records({ place }:{ place: Place | null }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const canCreate = place && startDate && endDate;

  const refresh = async () => {
    const res = await fetch("/api/records");
    const data = await res.json();
    setRecords(data.records || []);
  };

  useEffect(()=>{ refresh(); }, []);

  const onCreate = async () => {
    if (!place) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: place.query, name: place.name,
          latitude: place.latitude, longitude: place.longitude,
          startDate, endDate, notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      await refresh();
      setNotes("");
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    await refresh();
  };

  const onUpdateDates = async (r:any) => {
    const s = prompt("New start date (YYYY-MM-DD)", r.startDate?.slice(0,10));
    if (!s) return;
    const e = prompt("New end date (YYYY-MM-DD)", r.endDate?.slice(0,10));
    if (!e) return;
    const res = await fetch(`/api/records/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: r.id, query: r.query, name: r.name,
        latitude: r.latitude, longitude: r.longitude,
        startDate: s, endDate: e, notes: r.notes
      })
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Update failed");
    await refresh();
  };

  const exportLink = (fmt: string) => `/api/export?format=${fmt}`;

  return (
    <div className="glass p-4 space-y-4">
      <h3 className="text-xl font-semibold">Saved Records (CRUD)</h3>
      {place && (
        <div className="glass p-3 grid md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-2">
            <div className="text-xs uppercase opacity-60">Location</div>
            <div className="font-medium">{place.name}</div>
            <div className="text-xs opacity-70">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</div>
          </div>
          <div>
            <label className="text-xs block opacity-60">Start Date</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="glass px-2 py-1 rounded w-full"/>
          </div>
          <div>
            <label className="text-xs block opacity-60">End Date</label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="glass px-2 py-1 rounded w-full"/>
          </div>
          <div>
            <label className="text-xs block opacity-60">Notes (optional)</label>
            <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="E.g., trip planning" className="glass px-2 py-1 rounded w-full"/>
          </div>
          <div className="md:col-span-5 flex gap-2">
            <button disabled={!canCreate || loading} onClick={onCreate} className="glass px-4 py-2 rounded hover:scale-[1.02]">Create</button>
            {error && <span className="text-red-700">{error}</span>}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <span className="text-sm opacity-70">Export:</span>
        <a className="glass px-3 py-1 rounded" href={exportLink("json")}>JSON</a>
        <a className="glass px-3 py-1 rounded" href={exportLink("csv")}>CSV</a>
        <a className="glass px-3 py-1 rounded" href={exportLink("xml")}>XML</a>
        <a className="glass px-3 py-1 rounded" href={exportLink("md")}>Markdown</a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left opacity-70">
              <th className="p-2">When</th>
              <th className="p-2">Name</th>
              <th className="p-2">Coords</th>
              <th className="p-2">Range</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r=> (
              <tr key={r.id} className="border-t border-white/20">
                <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}</td>
                <td className="p-2">{r.startDate?.slice(0,10)} → {r.endDate?.slice(0,10)}</td>
                <td className="p-2 flex gap-2">
                  <button className="glass px-2 py-1 rounded" onClick={()=>onUpdateDates(r)}>Update</button>
                  <button className="glass px-2 py-1 rounded" onClick={()=>onDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
