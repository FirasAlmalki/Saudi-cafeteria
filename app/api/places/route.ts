import { NextRequest, NextResponse } from "next/server";

export interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vicinity: string;
}

// Branches extracted from Google Maps search results — Mecca-focused chain
const HARDCODED_BRANCHES: Branch[] = [
  { id: "h1",  name: "كافتيريا السعودي",         lat: 21.4411, lng: 39.8892, vicinity: "طريق الدائري الثالث، مكة المكرمة" },
  { id: "h2",  name: "كافترياوبروست السعودي",     lat: 21.4284, lng: 39.8560, vicinity: "شارع ثوبان النبوي، مكة المكرمة" },
  { id: "h3",  name: "كافتيريا السعودي",         lat: 21.4302, lng: 39.8580, vicinity: "الشوقية، مكة المكرمة" },
  { id: "h4",  name: "كفتريا السعودي",           lat: 21.4267, lng: 39.8325, vicinity: "شارع أم المؤمنين أم سلمة، مكة المكرمة" },
  { id: "h5",  name: "كافتيريا السعودي",         lat: 21.3883, lng: 39.8500, vicinity: "طريق جبل ثور، مكة المكرمة" },
  { id: "h6",  name: "كافتيريا سعودي",           lat: 21.4011, lng: 39.8811, vicinity: "مكة المكرمة" },
  { id: "h7",  name: "كافتيريا السعودي",         lat: 21.4150, lng: 39.8690, vicinity: "مكة المكرمة" },
  { id: "h8",  name: "كفتيريا السعودي",          lat: 21.3950, lng: 39.8730, vicinity: "منطقة الحج، مكة المكرمة" },
  { id: "h9",  name: "كافتيريا السعودي",         lat: 21.4584, lng: 39.8619, vicinity: "حي جبل النور، مكة المكرمة" },
  { id: "h10", name: "كافتيريا السعودي الشرائع", lat: 21.4693, lng: 39.8052, vicinity: "الشرائع، مكة المكرمة" },
  { id: "h11", name: "كافتيريا سعودية",          lat: 21.4178, lng: 39.8264, vicinity: "مكة المكرمة" },
  { id: "h12", name: "Al Qurayyat Cafeteria",    lat: 31.3329, lng: 37.3425, vicinity: "القريات" },
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
            name: el.tags?.["name:ar"] ?? el.tags?.name ?? "كافتيريا السعودي",
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
  const merged = [...osm];
  for (const hb of HARDCODED_BRANCHES) {
    const duplicate = osm.some(
      (b) => Math.abs(b.lat - hb.lat) < 0.005 && Math.abs(b.lng - hb.lng) < 0.005
    );
    if (!duplicate) merged.push(hb);
  }
  return NextResponse.json({ branches: merged });
}
