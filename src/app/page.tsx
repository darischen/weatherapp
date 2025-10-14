"use client";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import Forecast from "@/components/Forecast";
import MapView from "@/components/MapView";
import Records from "@/components/Records";

type Place = { name: string; latitude: number; longitude: number; query: string };

export default function Page() {
  const [place, setPlace] = useState<Place | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);

  const fetchWeather = async (p: Place) => {
    setError(null); setLoading(true); setData(null);
    try {
      const res = await fetch(`/api/weather?lat=${p.latitude}&lon=${p.longitude}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Weather failed");
      setData(d);
      const v = await fetch(`/api/videos?q=${encodeURIComponent(p.name)}`).then(r=>r.json()).catch(()=>({videos:[]}));
      setVideos(v.videos || []);
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if (!place && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos)=>{
        const p = { name: "Your location", latitude: pos.coords.latitude, longitude: pos.coords.longitude, query: `${pos.coords.latitude},${pos.coords.longitude}` };
        setPlace(p);
        fetchWeather(p);
      }, ()=>{}, { enableHighAccuracy: true, timeout: 5000 });
    }
  }, [place]);

  const onSelect = (p: Place) => {
    setPlace(p);
    fetchWeather(p);
  };

  return (
    <main className="space-y-6">
      <SearchBar onSelect={onSelect} />
      {error && <p className="text-red-700">{error}</p>}
      {loading && <div className="glass p-6">Loading weather…</div>}
      {place && data && (
        <div className="space-y-4">
          <WeatherCard placeName={place.name} data={data} />
          <Forecast data={data} />
          <MapView lat={place.latitude} lon={place.longitude} />
          <Records place={place} />
          {!!videos.length && (
            <div className="glass p-4">
              <h3 className="text-xl font-semibold mb-3">Popular on YouTube</h3>
              <div className="grid md:grid-cols-4 gap-3">
                {videos.map((v:any)=> (
                  <a key={v.id} className="glass rounded overflow-hidden hover:scale-[1.01] transition" target="_blank"
                    href={`https://www.youtube.com/watch?v=${v.id}`}>
                    {v.thumb && <img src={v.thumb} alt={v.title} className="w-full" />}
                    <div className="p-2 text-sm">
                      <div className="font-medium line-clamp-2">{v.title}</div>
                      <div className="opacity-70">{v.channel}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {!place && (
        <div className="glass p-6">
          <p className="opacity-80">Search for a city, landmark, ZIP code, or enter coordinates like <code>37.7749,-122.4194</code>. Or use the crosshair button to detect your location.</p>
        </div>
      )}
    </main>
  );
}
