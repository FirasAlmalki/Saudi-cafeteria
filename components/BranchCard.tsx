import type { Branch } from "@/app/api/places/route";
import { formatDistance } from "@/lib/distance";

interface BranchCardProps {
  branch: Branch;
  distance: number | null;
  isNearest: boolean;
}

export default function BranchCard({ branch, distance, isNearest }: BranchCardProps) {
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;

  return (
    <div dir="rtl" className="font-sans p-1 min-w-[200px]">
      {isNearest && (
        <span
          style={{ background: "#1E7B1E" }}
          className="inline-block text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5"
        >
          ✓ الأقرب لك
        </span>
      )}
      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{branch.name}</h3>

      {branch.vicinity && (
        <p className="text-gray-500 text-xs mb-2 leading-relaxed">{branch.vicinity}</p>
      )}

      {distance !== null && (
        <p className="text-xs font-semibold mb-2" style={{ color: "#D4241A" }}>
          📍 {formatDistance(distance)} منك
        </p>
      )}

      <a
        href={navUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ background: "#D4241A" }}
        className="block w-full text-center text-white text-xs font-bold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        🗺️ ابدأ التنقل
      </a>
    </div>
  );
}
