"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { Tile } from "@/components/ui/Tile";
import { TileSkeleton } from "@/components/ui/TileSkeleton";
import { StatTile } from "@/components/ui/StatTile";
import {
  HOME,
  HOME_MARKER_SLO,
  approximateTotalMiles,
  allVisitedCoords,
  hubArcsFromHome,
  travelMarqueeLines,
  tripOutboundJourneyCount,
  tripRouteArcs,
  uniqueCountries,
  visitedCityCount,
} from "@/config/travel";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track } from "@/lib/track";
import { cn } from "@/lib/cn";

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

type ArcMode = "hub" | "trip";

type GlobePoint = {
  lat: number;
  lng: number;
  name: string;
  isHome?: boolean;
  isSloHome?: boolean;
  isArea51?: boolean;
  size: number;
};

function pointLabelHtml(d: GlobePoint): string {
  if (d.isHome) {
    return `<div style="font-family:ui-monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#fff;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:4px;">${d.name}</div>`;
  }
  if (d.isSloHome) {
    return `<div style="font-family:ui-monospace;font-size:10px;letter-spacing:0.08em;color:#fff;background:rgba(0,0,0,0.75);padding:4px 8px;border-radius:4px;display:flex;align-items:center;gap:6px;"><span style="font-size:12px;line-height:1;">🏠</span><span>${d.name}</span></div>`;
  }
  if (d.isArea51) {
    return `<div style="font-family:ui-monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#a7f3d0;background:rgba(0,0,0,0.75);padding:4px 8px;border-radius:4px;display:flex;align-items:center;gap:6px;"><span style="font-size:13px;">🛸</span><span>${d.name}</span></div>`;
  }
  return `<div style="font-family:ui-monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#fff;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:4px;">${d.name}</div>`;
}

export function GlobeTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [interacted, setInteracted] = useState(false);
  const [arcMode, setArcMode] = useState<ArcMode>("hub");
  const [ufoActive, setUfoActive] = useState(false);
  const ufoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUfoTimeout = useCallback(() => {
    if (ufoTimeout.current) {
      clearTimeout(ufoTimeout.current);
      ufoTimeout.current = null;
    }
  }, []);

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
    () => (arcMode === "hub" ? hubArcsFromHome() : tripRouteArcs()),
    [arcMode],
  );

  const points = useMemo((): GlobePoint[] => {
    const sloKey = `${HOME_MARKER_SLO.lat.toFixed(4)},${HOME_MARKER_SLO.lng.toFixed(4)}`;
    const visited = allVisitedCoords();
    const rest: GlobePoint[] = visited.map((v) => {
      const key = `${v.lat.toFixed(4)},${v.lng.toFixed(4)}`;
      const isSlo = key === sloKey || v.name === HOME_MARKER_SLO.name;
      const isArea51 = v.name === "Area 51";
      return {
        lat: v.lat,
        lng: v.lng,
        name: v.name,
        isSloHome: isSlo,
        isArea51,
        size: isSlo ? 0.55 : isArea51 ? 0.52 : 0.4,
      };
    });
    return [
      { lat: HOME.lat, lng: HOME.lng, name: HOME.name, isHome: true, size: 0.8 },
      ...rest,
    ];
  }, []);

  const arcColor = useCallback(
    (d: unknown) => {
      const o = d as { mode?: string };
      if (arcMode === "hub") {
        return ["rgba(255,90,31,0.95)", "rgba(255,90,31,0.1)"] as unknown as string;
      }
      const m = (o.mode || "").toLowerCase();
      if (m.includes("train") || m.includes("bullet")) {
        return ["rgba(34,197,94,0.9)", "rgba(34,197,94,0.12)"] as unknown as string;
      }
      if (m.includes("car")) {
        return ["rgba(250,204,21,0.9)", "rgba(250,204,21,0.12)"] as unknown as string;
      }
      if (m.includes("seaplane")) {
        return ["rgba(56,189,248,0.95)", "rgba(56,189,248,0.12)"] as unknown as string;
      }
      return ["rgba(255,90,31,0.9)", "rgba(255,90,31,0.1)"] as unknown as string;
    },
    [arcMode],
  );

  const onPointHover = useCallback(
    (p: unknown) => {
      const point = p as GlobePoint | null;
      if (point?.isArea51) {
        clearUfoTimeout();
        setUfoActive(true);
        return;
      }
      clearUfoTimeout();
      ufoTimeout.current = setTimeout(() => setUfoActive(false), point ? 200 : 450);
    },
    [clearUfoTimeout],
  );

  const onPointClick = useCallback(
    (p: unknown) => {
      const point = p as GlobePoint | undefined;
      if (point?.isArea51) {
        clearUfoTimeout();
        setUfoActive(true);
        track("globe_area51_ufo", { source: "click" });
        ufoTimeout.current = setTimeout(() => setUfoActive(false), 2800);
      }
    },
    [clearUfoTimeout],
  );

  useEffect(() => () => clearUfoTimeout(), [clearUfoTimeout]);

  const totalMiles = useMemo(() => approximateTotalMiles(), []);
  const journeyCount = useMemo(() => tripOutboundJourneyCount(), []);
  const marqueeFacts = useMemo(
    () =>
      travelMarqueeLines({
        totalMiles,
        cities: visitedCityCount(),
        countries: uniqueCountries(),
        journeyCount,
      }),
    [totalMiles, journeyCount],
  );
  const marqueeRepeated = useMemo(() => {
    const joined = marqueeFacts.join("   ·   ");
    return `${joined}   ·   ${joined}`;
  }, [marqueeFacts]);

  return (
    <Tile
      span={span}
      eyebrow="Travel"
      title="Where I've been"
      accent="primary"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div
            className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-tile)] p-0.5"
            role="group"
            aria-label="Arc display mode"
          >
            <button
              type="button"
              onClick={() => setArcMode("hub")}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition",
                arcMode === "hub"
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "text-[var(--color-fg-muted)] hover:bg-[var(--color-tile-hover)]",
              )}
              aria-pressed={arcMode === "hub"}
            >
              From home
            </button>
            <button
              type="button"
              onClick={() => setArcMode("trip")}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition",
                arcMode === "trip"
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "text-[var(--color-fg-muted)] hover:bg-[var(--color-tile-hover)]",
              )}
              aria-pressed={arcMode === "trip"}
            >
              Trip routes
            </button>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)]">
            drag to spin
          </span>
        </div>
      }
    >
      <div className="mt-4 flex items-end justify-between gap-3">
        <StatTile value={visitedCityCount()} label="cities" />
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
        {ufoActive && (
          <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            aria-hidden
          >
            <span className="globe-ufo-fly absolute top-[18%] text-2xl opacity-90 drop-shadow-[0_0_8px_rgba(167,243,208,0.9)]">
              🛸
            </span>
          </div>
        )}
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
            arcColor={arcColor}
            arcDashLength={arcMode === "trip" ? 0.35 : 0.4}
            arcDashGap={arcMode === "trip" ? 1.6 : 2}
            arcDashAnimateTime={arcMode === "trip" ? 1800 : 2200}
            arcStroke={arcMode === "trip" ? 0.28 : 0.4}
            arcAltitudeAutoScale={0.45}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={0.01}
            pointRadius="size"
            pointColor={(d: unknown) => {
              const p = d as GlobePoint;
              if (p.isHome) return "#ffffff";
              if (p.isSloHome) return "#fbbf24";
              if (p.isArea51) return "#6ee7b7";
              return "#ff5a1f";
            }}
            pointLabel={(d: unknown) => pointLabelHtml(d as GlobePoint)}
            onPointHover={(p: unknown) => {
              const point = p as { name: string; isHome?: boolean } | null;
              if (point && !point.isHome) {
                track("globe_city_hover", { city: point.name });
              }
              onPointHover(p);
            }}
            onPointClick={onPointClick}
          />
        )}
      </div>
      <div className="mt-4 border-t border-[var(--color-border)] pt-4">
        <div className="flex justify-center">
          <StatTile
            value={`~${totalMiles.toLocaleString()}`}
            label="approx. miles (great circle)"
            hint="Includes return to SF per trip + round trips for repeat hubs"
          />
        </div>
        <div className="relative mt-3 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)]/35">
          <div className="marquee-track-travel flex gap-14 whitespace-nowrap px-1 py-2 font-mono text-[10px] leading-snug tracking-wide text-[var(--color-fg-muted)]">
            <span>{marqueeRepeated}</span>
            <span aria-hidden>{marqueeRepeated}</span>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10"
            style={{
              background:
                "linear-gradient(90deg, var(--color-bg) 0%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10"
            style={{
              background:
                "linear-gradient(270deg, var(--color-bg) 0%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </Tile>
  );
}
