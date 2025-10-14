const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_BASE = "https://archive-api.open-meteo.com/v1/era5";

export type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export async function geocodeQuery(query: string): Promise<GeocodeResult[]> {
  const url = new URL(GEO_BASE);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  if (!data || !data.results) return [];
  return data.results.map((r: any) => ({
    name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country : ""}`,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function fetchCurrentAndForecast(lat: number, lon: number) {
  const url = new URL(WEATHER_BASE);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,sunrise,sunset");
  url.searchParams.set("forecast_days", "5");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchDailyRange(lat: number, lon: number, start: string, end: string) {
  const url = new URL(ARCHIVE_BASE);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Archive fetch failed: ${res.status}`);
  return res.json();
}

export function codeToSummary(code: number) {
  const map: Record<number, { label: string; icon: string }> = {
    0: { label: "Clear sky", icon: "Sun" },
    1: { label: "Mainly clear", icon: "Sun" },
    2: { label: "Partly cloudy", icon: "CloudSun" },
    3: { label: "Overcast", icon: "Cloud" },
    45: { label: "Fog", icon: "CloudFog" },
    48: { label: "Depositing rime fog", icon: "CloudFog" },
    51: { label: "Light drizzle", icon: "CloudDrizzle" },
    53: { label: "Drizzle", icon: "CloudDrizzle" },
    55: { label: "Dense drizzle", icon: "CloudDrizzle" },
    56: { label: "Freezing drizzle", icon: "CloudDrizzle" },
    57: { label: "Dense freezing drizzle", icon: "CloudDrizzle" },
    61: { label: "Slight rain", icon: "CloudRain" },
    63: { label: "Rain", icon: "CloudRain" },
    65: { label: "Heavy rain", icon: "CloudRain" },
    66: { label: "Freezing rain", icon: "CloudRain" },
    67: { label: "Heavy freezing rain", icon: "CloudRain" },
    71: { label: "Slight snow fall", icon: "Snowflake" },
    73: { label: "Snow fall", icon: "Snowflake" },
    75: { label: "Heavy snow fall", icon: "Snowflake" },
    77: { label: "Snow grains", icon: "Snowflake" },
    80: { label: "Rain showers", icon: "CloudRain" },
    81: { label: "Heavy rain showers", icon: "CloudRain" },
    82: { label: "Violent rain showers", icon: "CloudRain" },
    85: { label: "Snow showers", icon: "Snowflake" },
    86: { label: "Heavy snow showers", icon: "Snowflake" },
    95: { label: "Thunderstorm", icon: "CloudLightning" },
    96: { label: "Thunderstorm with hail", icon: "CloudHail" },
    99: { label: "Thunderstorm with heavy hail", icon: "CloudHail" },
  };
  return map[code] || { label: "Unknown", icon: "Cloud" };
}
