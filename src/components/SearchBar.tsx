// src/components/SearchBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Crosshair } from "lucide-react";

type PlaceOut = {
  name: string;
  latitude: number;
  longitude: number;
  query: string;
};

type Suggestion = {
  placeId: string;
  description: string;
  distanceMeters?: number | null;
  // internal (from server payload; used for ranking)
  _types?: string[];
};

type Props = {
  onSelect: (place: PlaceOut) => void;
};

const ADDRESS_HINT_RE =
  /\b(\d{1,5}\s|st\b|ave\b|rd\b|blvd\b|ln\b|dr\b|way\b|road\b|street\b|avenue\b|highway\b|suite\b|apt\b)/i;

function looksLikeAddress(q: string) {
  return ADDRESS_HINT_RE.test(q);
}

function parseLatLon(text: string) {
  const m = text.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const latitude = parseFloat(m[1]);
  const longitude = parseFloat(m[2]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return { latitude, longitude };
}

function newSessionToken() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

/** Higher score ranks higher in the list */
function rankTypes(types: string[] = []) {
  const t = types.map((x) => x.toLowerCase());
  if (t.includes("locality") || t.includes("postal_town")) return 100; // city
  if (t.includes("sublocality") || t.includes("sublocality_level_1")) return 95; // district
  if (t.includes("neighborhood")) return 92; // neighborhood (e.g., Otay Ranch)
  if (t.includes("administrative_area_level_2")) return 85; // county
  if (t.includes("administrative_area_level_1")) return 80; // state
  if (t.includes("route")) return 20; // street
  return 50;
}

export default function SearchBar({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preds, setPreds] = useState<Suggestion[]>([]);
  const [sessionToken, setSessionToken] = useState<string>("");

  // debounce timer
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionToken) setSessionToken(newSessionToken());
  }, [sessionToken]);

  const fetchAutocomplete = async (input: string) => {
    if (!input.trim()) {
      setPreds([]);
      return;
    }
    try {
      const body: any = {
        input,
        sessionToken,
        includedRegionCodes: ["us"], // bias to US; remove if you want global
        // intentionally NOT setting includedPrimaryTypes so neighborhoods aren't excluded
        // optionally send `origin: { latitude, longitude }` to bias nearby
      };

      const res = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Autocomplete failed");

      const raw: any[] = data.suggestions ?? [];

      // Sort: prefer neighborhood/sublocality/locality, then shorter label
      raw.sort((a, b) => {
        const wt = rankTypes(b.types) - rankTypes(a.types);
        if (wt !== 0) return wt;
        return (a.description?.length || 0) - (b.description?.length || 0);
      });

      const mapped: Suggestion[] = raw.map((p) => ({
        placeId: p.placeId,
        description: p.structuredFormat
          ? `${p.structuredFormat.mainText?.text ?? p.description}${p.structuredFormat.secondaryText?.text ? " — " + p.structuredFormat.secondaryText.text : ""}`
          : p.description,
        distanceMeters: p.distanceMeters ?? null,
        _types: p.types ?? [],
      }));

      // If query looks like an address, let address-y results through; otherwise lightly de-prioritize "route"/streets
      const isAddr = looksLikeAddress(input);
      const final = isAddr ? mapped : mapped.filter((m) => !((m._types || []).map((x) => x.toLowerCase()).includes("route")));

      setPreds(final);
      setError(null);
    } catch {
      // If Google Places isn’t configured or errors, don’t hard-error here; we fallback on submit.
      setPreds([]);
    }
  };

  const onChange = (v: string) => {
    setQ(v);
    if (tRef.current) clearTimeout(tRef.current);
    if (!v.trim()) {
      setPreds([]);
      return;
    }
    tRef.current = setTimeout(() => fetchAutocomplete(v), 200);
  };

  const pickSuggestion = async (s: Suggestion) => {
    try {
      setLoading(true);
      const r = await fetch(`/api/places/details?placeId=${encodeURIComponent(s.placeId)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Place details failed");
      if (d?.latitude && d?.longitude) {
        onSelect({
          name: d.name || s.description,
          latitude: d.latitude,
          longitude: d.longitude,
          query: s.description,
        });
        setPreds([]);
        setQ(d.name || s.description);
        setSessionToken(newSessionToken()); // end current session
        setError(null);
        return;
      }
      throw new Error("No coordinates returned for selected place.");
    } catch (e: any) {
      setError(e.message || "Failed to resolve place");
    } finally {
      setLoading(false);
    }
  };

  // Fallback search if there are no predictions or Places isn’t available:
  const fallbackGeocode = async (input: string) => {
    // 1) Coordinates?
    const ll = parseLatLon(input);
    if (ll) {
      onSelect({
        name: `(${ll.latitude.toFixed(4)}, ${ll.longitude.toFixed(4)})`,
        latitude: ll.latitude,
        longitude: ll.longitude,
        query: input,
      });
      return;
    }
    // 2) Use our geocode API (OpenStreetMap + Open-Meteo path)
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(input)}&preferPlacesOverAddresses=true`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Geocode failed");
    const first = (data.results || [])[0];
    if (!first) throw new Error("No matching locations found.");
    onSelect({
      name: first.name,
      latitude: first.latitude,
      longitude: first.longitude,
      query: input,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (preds.length > 0) {
        // Choose the top suggestion on Enter
        await pickSuggestion(preds[0]);
      } else {
        // No predictions? Fall back to coordinates or our geocoder.
        await fallbackGeocode(q);
      }
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim() || loading) return;
    await handleSubmit();
  };

  const useCurrent = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onSelect({
          name: "Your location",
          latitude,
          longitude,
          query: `${latitude},${longitude}`,
        });
        setPreds([]);
        setQ(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Search a place, neighborhood, ZIP, or "lat,lon"'
          className="flex-1 rounded-xl px-4 py-3 glass outline-none text-slate-900 dark:text-slate-100"
          aria-label="Search location"
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="glass px-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={useCurrent}
          title="Use current location"
          className="glass px-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </form>

      {error && <p className="text-red-700 mt-2">{error}</p>}

      {/* Predictions dropdown */}
      {preds.length > 0 && (
        <div className="mt-3 glass rounded-xl overflow-hidden">
          <ul className="divide-y divide-white/15">
            {preds.map((p) => (
              <li key={p.placeId}>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-white/10"
                  onClick={() => pickSuggestion(p)}
                >
                  {p.description}
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 text-xs opacity-70">
            {/* Required attribution when showing Places predictions without a Google Map */}
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
}
