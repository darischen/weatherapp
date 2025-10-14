"use client";
import { codeToSummary } from "@/lib/weather";

export default function Forecast({ data }:{ data:any }) {
  const d = data.daily;
  if (!d?.time?.length) return null;
  return (
    <div className="glass p-4">
      <h3 className="text-xl font-semibold mb-3">5-Day Forecast</h3>
      <div className="grid md:grid-cols-5 gap-3">
        {d.time.map((t:string, i:number)=> (
          <div key={t} className="glass p-3 text-center">
            <div className="text-sm opacity-70">{new Date(t).toLocaleDateString()}</div>
            <div className="text-sm">{codeToSummary(d.weathercode[i]).label}</div>
            <div className="text-2xl font-bold">{Math.round(d.temperature_2m_max[i])}°</div>
            <div className="text-xs opacity-70">min {Math.round(d.temperature_2m_min[i])}°</div>
            {"precipitation_probability_max" in d && d.precipitation_probability_max?.[i] != null && (
              <div className="text-xs mt-1">Rain chance: {d.precipitation_probability_max[i]}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
