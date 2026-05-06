"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { StatTile } from "@/components/ui/StatTile";
import { HOME, VISITED, uniqueCountries } from "@/config/travel";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track } from "@/lib/track";

const Globe = dynamic(() => import("react-globe.gl").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <TileSkeleton lines={2} />
    </div>
  ),
});

const GLOBE_IMAGE =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_IMAGE = "https://unpkg.com/three-globe/example/img/earth-topology.png";

export function GlobeTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = !reduced && !interacted;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
    g.pointOfView({ lat: HOME.lat, lng: HOME.lng, altitude: 2.2 }, 1200);
  }, [reduced, interacted, size]);

  const arcs = useMemo(
    () =>
      VISITED.map((v) => ({
        startLat: HOME.lat,
        startLng: HOME.lng,
        endLat: v.lat,
        endLng: v.lng,
        name: v.name,
        country: v.country,
      })),
    [],
  );

  const points = useMemo(
    () => [
      { lat: HOME.lat, lng: HOME.lng, name: HOME.name, isHome: true, size: 0.8 },
      ...VISITED.map((v) => ({
        lat: v.lat,
        lng: v.lng,
        name: v.name,
        isHome: false,
        size: 0.4,
      })),
    ],
    [],
  );

  return (
    <Tile
      span={span}
      eyebrow="Travel"
      title="Where I've been"
      accent="primary"
      action={
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
          drag to spin
        </span>
      }
    >
      <div className="mt-4 flex items-end justify-between gap-3">
        <StatTile value={VISITED.length} label="cities" />
        <StatTile value={uniqueCountries()} label="countries" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
          home · {HOME.name}
        </span>
      </div>
      <div
        ref={containerRef}
        onPointerDown={() => setInteracted(true)}
        className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl bg-black/85"
      >
        {size.w > 0 && (
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={GLOBE_IMAGE}
            bumpImageUrl={BUMP_IMAGE}
            atmosphereColor="#ff5a1f"
            atmosphereAltitude={0.18}
            arcsData={arcs}
            arcColor={() =>
              ["rgba(255,90,31,0.95)", "rgba(255,90,31,0.1)"] as unknown as string
            }
            arcDashLength={0.4}
            arcDashGap={2}
            arcDashAnimateTime={2200}
            arcStroke={0.4}
            arcAltitudeAutoScale={0.45}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={0.01}
            pointRadius="size"
            pointColor={(d: unknown) =>
              (d as { isHome: boolean }).isHome ? "#ffffff" : "#ff5a1f"
            }
            pointLabel={(d: unknown) => `<div style="font-family:ui-monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#fff;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:4px;">${(d as { name: string }).name}</div>`}
            onPointHover={(p: unknown) => {
              if (p) {
                const point = p as { name: string; isHome: boolean };
                if (!point.isHome) {
                  track("globe_city_hover", { city: point.name });
                }
              }
            }}
          />
        )}
      </div>
    </Tile>
  );
}
