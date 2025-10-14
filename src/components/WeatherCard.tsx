"use client";
import { codeToSummary } from "@/lib/weather";
import { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning, CloudHail, Wind } from "lucide-react";
import { useMemo } from "react";

const IconMap: Record<string, any> = { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning, CloudHail };

export default function WeatherCard({ placeName, data }:{ placeName: string; data:any }) {
  const current = data.current_weather;
  const daily = data.daily;
  const iconName = codeToSummary(current.weathercode).icon;
  const Icon = useMemo(()=> IconMap[iconName] ?? Cloud, [iconName]);

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{placeName}</h2>
          <p className="opacity-70 text-sm">Updated: {new Date(current.time).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <Icon className="w-12 h-12" />
          <div className="text-5xl font-bold">{Math.round(current.temperature)}°</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Condition" value={codeToSummary(current.weathercode).label} />
        <Stat label="Wind" value={`${Math.round(current.windspeed)} km/h`} icon={<Wind className="w-4 h-4" />} />
        <Stat label="Sunrise" value={new Date(daily.sunrise[0]).toLocaleTimeString()} />
        <Stat label="Sunset" value={new Date(daily.sunset[0]).toLocaleTimeString()} />
      </div>
    </div>
  );
}
function Stat({ label, value, icon }:{label:string; value:string; icon?:any}){
  return (
    <div className="glass p-3">
      <div className="text-xs uppercase opacity-60">{label}</div>
      <div className="text-lg flex items-center gap-2">{icon}{value}</div>
    </div>
  );
}
