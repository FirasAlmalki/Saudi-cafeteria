import { NextRequest, NextResponse } from "next/server";

export interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vicinity: string;
}

// Known branches of كافتيريا السعودي (Saudi Sandwich) — used as fallback
const HARDCODED_BRANCHES: Branch[] = [
  { id: "h1",  name: "كافتيريا السعودي — الرياض (العليا)",    lat: 24.6972, lng: 46.6833, vicinity: "شارع العليا، الرياض" },
  { id: "h2",  name: "كافتيريا السعودي — الرياض (البطحاء)",   lat: 24.6860, lng: 46.7094, vicinity: "البطحاء، الرياض" },
  { id: "h3",  name: "كافتيريا السعودي — الرياض (المعذر)",    lat: 24.7305, lng: 46.7561, vicinity: "المعذر، الرياض" },
  { id: "h4",  name: "كافتيريا السعودي — جدة (البلد)",        lat: 21.4858, lng: 39.1925, vicinity: "البلد، جدة" },
  { id: "h5",  name: "كافتيريا السعودي — جدة (الروضة)",       lat: 21.5433, lng: 39.1728, vicinity: "الروضة، جدة" },
  { id: "h6",  name: "كافتيريا السعودي — مكة المكرمة",        lat: 21.3891, lng: 39.8579, vicinity: "مكة المكرمة" },
  { id: "h7",  name: "كافتيريا السعودي — المدينة المنورة",    lat: 24.4672, lng: 39.6150, vicinity: "المدينة المنورة" },
  { id: "h8",  name: "كافتيريا السعودي — الدمام",             lat: 26.4207, lng: 50.0888, vicinity: "الدمام، المنطقة الشرقية" },
  { id: "h9",  name: "كافتيريا السعودي — الخبر",              lat: 26.2172, lng: 50.1971, vicinity: "الخبر، المنطقة الشرقية" },
  { id: "h10", name: "كافتيريا السعودي — الطائف",             lat: 21.2703, lng: 40.4158, vicinity: "الطائف" },
  { id: "h11", name: "كافتيريا السعودي — أبها",               lat: 18.2164, lng: 42.5053, vicinity: "أبها، عسير" },
  { id: "h12", name: "كافتيريا السعودي — تبوك",               lat: 28.3998, lng: 36.5709, vicinity: "تبوك" },
];

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const SA_BBOX = "16.0,34.5,32.5,55.5";

const QUERY = `[out:json][timeout:20];
(
  node["name"~"Saudi Sandwich",i](${SA_BBOX});
  node["name"~"كافتيريا السعودي",i](${SA_BBOX});
  way["name"~"Saudi Sandwich",i](${SA_BBOX});
  way["name"~"كافتيريا السعودي",i](${SA_BBOX});
);
out center;`;

async function tryOverpass(): Promise<Branch[]> {
  for (const url of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!res.ok) continue;
      const data = await res.json();
      const elements: Branch[] = (data.elements ?? [])
        .map((el: any) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (!lat || !lng) return null;
          return {
            id: String(el.id),
            name:
              el.tags?.["name:ar"] ??
              el.tags?.name ??
              "كافتيريا السعودي",
            lat,
            lng,
            vicinity:
              el.tags?.["addr:city"] ??
              el.tags?.["addr:street"] ??
              el.tags?.["addr:full"] ??
              "",
          };
        })
        .filter(Boolean);

      if (elements.length > 0) return elements;
    } catch {
      // try next mirror
    }
  }
  return [];
}

export async function GET(_req: NextRequest) {
  const osm = await tryOverpass();
  // Merge OSM results with hardcoded, deduplicate by proximity (~500m)
  const merged = [...osm];
  for (const hb of HARDCODED_BRANCHES) {
    const duplicate = osm.some(
      (b) => Math.abs(b.lat - hb.lat) < 0.005 && Math.abs(b.lng - hb.lng) < 0.005
    );
    if (!duplicate) merged.push(hb);
  }
  return NextResponse.json({ branches: merged });
}
