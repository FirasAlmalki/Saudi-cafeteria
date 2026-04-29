import { NextRequest, NextResponse } from "next/server";

export interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vicinity: string;
  rating: number | null;
  reviewsCount: number | null;
  phone: string | null;
  navUrl: string;
}

// Verified branches from Google Maps (via Apify scrape — April 2026)
// Coordinates are best-estimate from neighborhood names; navUrl uses accurate place_id
const HARDCODED_BRANCHES: Branch[] = [
  {
    id: "ChIJIfQmScr_wRURyoCECucuydU",
    name: "كافتيريا السعودي الشرائع",
    lat: 21.4630, lng: 39.8066,
    vicinity: "الشرائع، مكة المكرمة",
    rating: 4.0, reviewsCount: 736, phone: "+966 53 303 6119",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%20%D8%A7%D9%84%D8%B4%D8%B1%D8%A7%D8%A6%D8%B9&query_place_id=ChIJIfQmScr_wRURyoCECucuydU",
  },
  {
    id: "ChIJ9R56CcABwhURezOdBIX00wI",
    name: "شركة بوفية كافتيريا السعوديه",
    lat: 21.4610, lng: 39.8085,
    vicinity: "الشرائع، مكة المكرمة",
    rating: 4.4, reviewsCount: 193, phone: "+966 50 932 7022",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D8%B4%D8%B1%D9%83%D8%A9%20%D8%A8%D9%88%D9%81%D9%8A%D8%A9%20%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D9%87&query_place_id=ChIJ9R56CcABwhURezOdBIX00wI",
  },
  {
    id: "ChIJd5hBFlYFwhURv4kthYSn-DI",
    name: "كفتيريا السعودي",
    lat: 21.4350, lng: 39.8220,
    vicinity: "مكة المكرمة",
    rating: 4.0, reviewsCount: 928, phone: "+966 53 373 7611",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJd5hBFlYFwhURv4kthYSn-DI",
  },
  {
    id: "ChIJN3cjZLIFwhUR6FaVLK4aPNM",
    name: "كافتيريا السعودي",
    lat: 21.4360, lng: 39.8836,
    vicinity: "طريق الدائري الثالث، مكة المكرمة",
    rating: 3.8, reviewsCount: 899, phone: "+966 55 475 2623",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJN3cjZLIFwhUR6FaVLK4aPNM",
  },
  {
    id: "ChIJQd4nXD4BwhURPdHD-ccP54U",
    name: "كافتيريا السعودي",
    lat: 21.4650, lng: 39.8050,
    vicinity: "الشرائع، مكة المكرمة",
    rating: 4.0, reviewsCount: 73, phone: "+966 54 468 2748",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJQd4nXD4BwhURPdHD-ccP54U",
  },
  {
    id: "ChIJd_RbiZMFwhURee3bpp03Kro",
    name: "كافتيريا السعودي",
    lat: 21.4312, lng: 39.8198,
    vicinity: "شارع ذات النطاقين، مكة المكرمة",
    rating: 3.8, reviewsCount: 484, phone: "+966 55 467 1589",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJd_RbiZMFwhURee3bpp03Kro",
  },
  {
    id: "ChIJK_CUwxEDwhURXAknDyeOJng",
    name: "كافتيريا السعودي",
    lat: 21.3891, lng: 39.8579,
    vicinity: "منطقة الحج، مكة المكرمة",
    rating: 3.8, reviewsCount: 591, phone: "+966 50 170 4218",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJK_CUwxEDwhURXAknDyeOJng",
  },
  {
    id: "ChIJa4CFfAAHwhURjynQV8q7dOM",
    name: "كفتيريا السعودي فرع العوالي",
    lat: 21.5112, lng: 39.8128,
    vicinity: "العوالي، مكة المكرمة",
    rating: 3.6, reviewsCount: 100, phone: "+966 56 059 7984",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%20%D9%81%D8%B1%D8%B9%20%D8%A7%D9%84%D8%B9%D9%88%D8%A7%D9%84%D9%8A&query_place_id=ChIJa4CFfAAHwhURjynQV8q7dOM",
  },
  {
    id: "ChIJW7EaGAADwhUR9PDEJOYDXhE",
    name: "Cafeteria Saudi",
    lat: 21.4584, lng: 39.8619,
    vicinity: "حي جبل النور، مكة المكرمة",
    rating: 3.5, reviewsCount: 55, phone: "+966 53 268 7012",
    navUrl: "https://www.google.com/maps/search/?api=1&query=Cafeteria%20Saudi&query_place_id=ChIJW7EaGAADwhUR9PDEJOYDXhE",
  },
  {
    id: "ChIJ2_QU1EIEwhUR_y_SpoM45fs",
    name: "كافتيريا السعودي",
    lat: 21.4150, lng: 39.8380,
    vicinity: "مكة المكرمة",
    rating: 4.0, reviewsCount: 589, phone: "+966 56 534 8108",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJ2_QU1EIEwhUR_y_SpoM45fs",
  },
  {
    id: "ChIJJ194DdMbwhURDa2B0pGKh88",
    name: "كافتيريا السعودي",
    lat: 21.4186, lng: 39.8586,
    vicinity: "الشوقية، مكة المكرمة",
    rating: 3.8, reviewsCount: 528, phone: "+966 57 084 8292",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJJ194DdMbwhURDa2B0pGKh88",
  },
  {
    id: "ChIJKSnwGKkRwhUR8pdLAyVcj3Q",
    name: "كافتيريا السعودي",
    lat: 21.3996, lng: 39.8469,
    vicinity: "مكة المكرمة",
    rating: 4.2, reviewsCount: 284, phone: "+966 54 618 5690",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJKSnwGKkRwhUR8pdLAyVcj3Q",
  },
  {
    id: "ChIJ-7F0ZgABwhURvsARh2hHZ-o",
    name: "كافتيريا سعودي الخضراء",
    lat: 21.4580, lng: 39.8082,
    vicinity: "الشرائع، مكة المكرمة",
    rating: 3.3, reviewsCount: 31, phone: "+966 55 838 6953",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B6%D8%B1%D8%A7%D8%A1&query_place_id=ChIJ-7F0ZgABwhURvsARh2hHZ-o",
  },
  {
    id: "ChIJb6_8H44bwhURozQzWXfcYd0",
    name: "كفتريا وبرست السعودي",
    lat: 21.4135, lng: 39.8254,
    vicinity: "شارع الشيخ حسن المشاط، مكة المكرمة",
    rating: 3.9, reviewsCount: 195, phone: "+966 50 058 7701",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%AA%D8%B1%D9%8A%D8%A7%20%D9%88%D8%A8%D8%B1%D8%B3%D8%AA%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJb6_8H44bwhURozQzWXfcYd0",
  },
  {
    id: "ChIJK8gkKgAFwhURHscpCquK9Zs",
    name: "كفتريا السعودي",
    lat: 21.4192, lng: 39.8321,
    vicinity: "شارع أم المؤمنين أم سلمة، مكة المكرمة",
    rating: 3.6, reviewsCount: 81, phone: "+966 50 286 3582",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%AA%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJK8gkKgAFwhURHscpCquK9Zs",
  },
  {
    id: "ChIJgbajdPoFwhUROIWx62Rx994",
    name: "كافترياوبروست السعودي",
    lat: 21.5100, lng: 39.8356,
    vicinity: "شارع ثوبان النبوي، مكة المكرمة",
    rating: 3.6, reviewsCount: 122, phone: "+966 54 590 3735",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D8%B1%D9%8A%D8%A7%D9%88%D8%A8%D8%B1%D9%88%D8%B3%D8%AA%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJgbajdPoFwhUROIWx62Rx994",
  },
  {
    id: "ChIJbVA8MhMDwhURBcCZ0VC-IT0",
    name: "كافتيريا السعودي",
    lat: 21.4435, lng: 39.8115,
    vicinity: "مكة المكرمة",
    rating: 4.1, reviewsCount: 103, phone: "+966 59 549 5846",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJbVA8MhMDwhURBcCZ0VC-IT0",
  },
  {
    id: "ChIJI_MXEwAXwhURsj1O04wjjwE",
    name: "كافتيريا السعودي",
    lat: 21.3960, lng: 39.7875,
    vicinity: "شارع الأمير بدر، مكة المكرمة",
    rating: 3.6, reviewsCount: 36, phone: "+966 53 974 5066",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJI_MXEwAXwhURsj1O04wjjwE",
  },
  {
    id: "ChIJN55wfAADwhURzV4sBQteO8w",
    name: "كافتيريا السعودي",
    lat: 21.4600, lng: 39.8635,
    vicinity: "جبل النور، مكة المكرمة",
    rating: 3.1, reviewsCount: 18, phone: null,
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D8%A7%D9%81%D8%AA%D9%8A%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJN55wfAADwhURzV4sBQteO8w",
  },
  {
    id: "ChIJjehiXwAdwhURnnNCAxdZcTY",
    name: "كفتريا السعودي",
    lat: 21.4655, lng: 39.8044,
    vicinity: "الشرائع، مكة المكرمة",
    rating: 3.8, reviewsCount: 13, phone: "+966 55 482 0712",
    navUrl: "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%AA%D8%B1%D9%8A%D8%A7%20%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A&query_place_id=ChIJjehiXwAdwhURnnNCAxdZcTY",
  },
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
            lat, lng,
            vicinity: el.tags?.["addr:city"] ?? el.tags?.["addr:street"] ?? "",
            rating: null, reviewsCount: null, phone: null,
            navUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          };
        })
        .filter(Boolean);
      if (elements.length > 0) return elements;
    } catch { /* try next */ }
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
