"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Object3D } from "three";
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

/** Camera altitude (globe-relative); lower = closer. */
const DEFAULT_POV_ALTITUDE = 1.42;

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

/** Central angle in degrees between two surface positions (great-circle). */
function angularDistanceDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const cos =
    Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

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
  /** Nearest city from geographic hit-test (not sprite raycast). */
  const [geoHover, setGeoHover] = useState<GlobePoint | null>(null);
  const [geoLabelPos, setGeoLabelPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const lastTrackedCityHover = useRef<string | null>(null);
  const lastGeoHoverFlush = useRef(0);

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

  const syncGlobeControls = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    const r = g.getGlobeRadius();
    controls.autoRotate = !reduced && !interacted;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.65;
    controls.enablePan = false;
    controls.minDistance = r * 1.28;
    controls.maxDistance = r * 22;
    g.pointOfView({ lat: HOME.lat, lng: HOME.lng, altitude: DEFAULT_POV_ALTITUDE }, 900);
  }, [reduced, interacted]);

  useEffect(() => {
    if (size.w <= 0) return;
    syncGlobeControls();
  }, [size, syncGlobeControls]);

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

  const respondToHoverTarget = useCallback(
    (point: GlobePoint | null) => {
      if (point?.isArea51) {
        clearUfoTimeout();
        setUfoActive(true);
        return;
      }
      clearUfoTimeout();
      ufoTimeout.current = setTimeout(
        () => setUfoActive(false),
        point ? 200 : 450,
      );
    },
    [clearUfoTimeout],
  );

  /**
   * Ignore point sprites (billboard hitboxes) and flight arcs for picking.
   * Arc objects use destination `name` (see hubArcsFromHome); hovering lines
   * near SF would otherwise show those labels via the default arc tooltip.
   */
  const pointerEventsFilter = useCallback((object: Object3D) => {
    const t = (object as unknown as { __globeObjType?: string }).__globeObjType;
    return t !== "point" && t !== "arc";
  }, []);

  const flushGeoHover = useCallback(
    (clientX: number, clientY: number) => {
      const root = containerRef.current;
      const g = globeRef.current;
      if (!root || !g) return;

      const r = root.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) {
        lastTrackedCityHover.current = null;
        setGeoHover(null);
        setGeoLabelPos(null);
        respondToHoverTarget(null);
        return;
      }

      const geo = g.toGlobeCoords(x, y);
      if (!geo) {
        lastTrackedCityHover.current = null;
        setGeoHover(null);
        setGeoLabelPos(null);
        respondToHoverTarget(null);
        return;
      }

      const pov = g.pointOfView();
      const alt = Math.max(0.12, pov.altitude);
      const maxDeg = Math.min(15, Math.max(3.2, 3.8 * Math.sqrt(alt)));

      let best: GlobePoint | null = null;
      let bestD = Infinity;
      for (const pt of points) {
        const d = angularDistanceDeg(geo.lat, geo.lng, pt.lat, pt.lng);
        if (d < bestD) {
          bestD = d;
          best = pt;
        }
      }

      if (!best || bestD > maxDeg) {
        lastTrackedCityHover.current = null;
        setGeoHover(null);
        setGeoLabelPos(null);
        respondToHoverTarget(null);
        return;
      }

      if (!best.isHome && best.name !== lastTrackedCityHover.current) {
        lastTrackedCityHover.current = best.name;
        track("globe_city_hover", { city: best.name });
      }
      if (best.isHome) lastTrackedCityHover.current = null;

      setGeoHover(best);
      setGeoLabelPos(g.getScreenCoords(best.lat, best.lng, 0.02));
      respondToHoverTarget(best);
    },
    [points, respondToHoverTarget],
  );

  const onPointerMoveGeo = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const now = performance.now();
      if (now - lastGeoHoverFlush.current < 24) return;
      lastGeoHoverFlush.current = now;
      flushGeoHover(e.clientX, e.clientY);
    },
    [flushGeoHover],
  );

  const onPointerLeaveGeo = useCallback(() => {
    lastGeoHoverFlush.current = 0;
    lastTrackedCityHover.current = null;
    setGeoHover(null);
    setGeoLabelPos(null);
    respondToHoverTarget(null);
  }, [respondToHoverTarget]);

  const onGlobeClick = useCallback(
    (coords: { lat: number; lng: number }) => {
      const clickMaxDeg = 2.35;
      for (const pt of points) {
        if (!pt.isArea51) continue;
        const d = angularDistanceDeg(coords.lat, coords.lng, pt.lat, pt.lng);
        if (d <= clickMaxDeg) {
          clearUfoTimeout();
          setUfoActive(true);
          track("globe_area51_ufo", { source: "click" });
          ufoTimeout.current = setTimeout(() => setUfoActive(false), 2800);
          return;
        }
      }
    },
    [clearUfoTimeout, points],
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
            drag · scroll to zoom
          </span>
        </div>
      }
    >
      <div className="mt-4 grid grid-cols-3 gap-3 items-end">
        <StatTile value={visitedCityCount()} label="cities" />
        <StatTile value={uniqueCountries()} label="countries" />
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-3xl tabular-nums leading-none text-[var(--color-fg)] md:text-4xl">
            SF
          </span>
          <span className="text-right text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
            home base
          </span>
          <span className="sr-only">{HOME.name}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        onPointerDown={() => setInteracted(true)}
        onPointerMove={onPointerMoveGeo}
        onPointerLeave={onPointerLeaveGeo}
        className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl bg-black/85"
      >
        {geoHover && geoLabelPos && (
          <div
            className="pointer-events-none absolute z-[15] max-w-[min(92%,220px)] -translate-x-1/2 -translate-y-full text-left"
            style={{ left: geoLabelPos.x, top: geoLabelPos.y - 6 }}
            dangerouslySetInnerHTML={{ __html: pointLabelHtml(geoHover) }}
          />
        )}
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
            onGlobeReady={syncGlobeControls}
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
            arcLabel=""
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
            pointerEventsFilter={pointerEventsFilter}
            onGlobeClick={onGlobeClick}
          />
        )}
      </div>
      <div className="mt-4 border-t border-[var(--color-border)] pt-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-xl tabular-nums leading-none text-[var(--color-fg)] md:text-2xl">
            ~{totalMiles.toLocaleString()}
          </span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
            approx. mi
          </span>
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
