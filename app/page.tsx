"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Branch } from "@/app/api/places/route";
import NearestBanner from "@/components/NearestBanner";
import { haversineDistance } from "@/lib/distance";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nearestBranch = useCallback((): Branch | null => {
    if (!userLocation || branches.length === 0) return null;
    return branches.reduce((best, b) => {
      const d = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      const bd = haversineDistance(userLocation.lat, userLocation.lng, best.lat, best.lng);
      return d < bd ? b : best;
    });
  }, [userLocation, branches]);

  const userDistance = useCallback(
    (b: Branch) =>
      userLocation ? haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng) : 0,
    [userLocation]
  );

  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch("/api/places");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setBranches(data.branches ?? []);
      } catch (e: any) {
        setError(e.message ?? "حدث خطأ");
      } finally {
        setLoading(false);
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 8000 }
      );
    }
    fetchBranches();
  }, []);

  const nearest = nearestBranch();

  return (
    <main className="relative w-screen h-screen overflow-hidden">

      {/* ── Header ── */}
      <header
        dir="rtl"
        className="absolute top-0 right-0 left-0 z-[1000] flex items-center gap-3 px-4 py-2 shadow-lg"
        style={{ background: "#D4241A" }}
      >
        <Image
          src="/logo.png"
          alt="كافتيريا السعودي"
          width={44}
          height={44}
          className="rounded-full border-2 shrink-0"
          style={{ borderColor: "#F5C000" }}
        />
        <div>
          <h1 className="font-black text-white text-base leading-tight tracking-wide">
            كافتيريا السعودي
          </h1>
          <p className="text-xs leading-tight" style={{ color: "#F5C000" }}>
            {loading
              ? "جاري تحميل الفروع..."
              : error
              ? "تعذّر تحميل الفروع"
              : `${branches.length} فرع — اضغط على الدبوس لتفاصيل الفرع`}
          </p>
        </div>

        {loading && (
          <div
            className="mr-auto w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#F5C000", borderTopColor: "transparent" }}
          />
        )}
      </header>

      {/* ── Map ── */}
      <div className="w-full h-full pt-[60px]">
        <Map
          branches={branches}
          userLocation={userLocation}
          nearestId={nearest?.id ?? null}
          userDistance={userDistance}
        />
      </div>

      {/* ── Legend ── */}
      <div
        dir="rtl"
        className="absolute top-[68px] right-3 z-[1000] bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 text-xs space-y-1"
      >
        <LegendRow dot="#1E7B1E" label="أقرب فرع" />
        <LegendRow dot="#D4241A" label="فروع أخرى" />
        <LegendRow dot="#2563EB" label="موقعك" circle />
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          dir="rtl"
          className="absolute top-[72px] right-4 left-4 z-[1000] bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm shadow"
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Nearest Banner ── */}
      {nearest && userLocation && (
        <NearestBanner branch={nearest} distance={userDistance(nearest)} />
      )}
    </main>
  );
}

function LegendRow({
  dot,
  label,
  circle,
}: {
  dot: string;
  label: string;
  circle?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          background: dot,
          width: 12,
          height: 12,
          borderRadius: circle ? "50%" : "50% 50% 50% 0",
          transform: circle ? undefined : "rotate(-45deg)",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span className="text-gray-700">{label}</span>
    </div>
  );
}
