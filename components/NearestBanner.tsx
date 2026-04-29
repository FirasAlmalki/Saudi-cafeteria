import type { Branch } from "@/app/api/places/route";
import { formatDistance } from "@/lib/distance";

interface NearestBannerProps {
  branch: Branch;
  distance: number;
}

export default function NearestBanner({ branch, distance }: NearestBannerProps) {
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 right-4 left-4 md:left-auto md:w-[380px] z-[1000] rounded-2xl shadow-2xl overflow-hidden"
      style={{ border: "2px solid #F5C000" }}
    >
      {/* Yellow top strip */}
      <div style={{ background: "#F5C000" }} className="px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs font-black" style={{ color: "#D4241A" }}>
          📍 أقرب فرع لك
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 text-sm truncate">{branch.name}</p>
          {branch.vicinity && (
            <p className="text-gray-500 text-xs truncate mt-0.5">{branch.vicinity}</p>
          )}
          <p className="text-xs font-bold mt-1" style={{ color: "#1E7B1E" }}>
            {formatDistance(distance)} منك
          </p>
        </div>
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#D4241A" }}
          className="flex-shrink-0 text-white font-black text-sm py-2.5 px-5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          روح الحين
        </a>
      </div>
    </div>
  );
}
