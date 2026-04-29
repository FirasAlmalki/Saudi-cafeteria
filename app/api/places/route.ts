import { NextRequest, NextResponse } from "next/server";

export interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vicinity: string;
}

// Bounding box for Saudi Arabia
const SA_BBOX = "16.0,34.5,32.5,55.5";

export async function GET(_req: NextRequest) {
  const query = `
[out:json][timeout:30];
(
  node["name"~"كافتيريا السعودي|Saudi Sandwich|Saudi Cafeteria",i](${SA_BBOX});
  way["name"~"كافتيريا السعودي|Saudi Sandwich|Saudi Cafeteria",i](${SA_BBOX});
  relation["name"~"كافتيريا السعودي|Saudi Sandwich|Saudi Cafeteria",i](${SA_BBOX});
);
out center;
`.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    const branches: Branch[] = (data.elements ?? [])
      .map((el: any) => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!lat || !lng) return null;
        return {
          id: String(el.id),
          name: el.tags?.name ?? el.tags?.["name:ar"] ?? "كافتيريا السعودي",
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

    return NextResponse.json({ branches });
  } catch {
    return NextResponse.json({ error: "Overpass fetch failed" }, { status: 502 });
  }
}
