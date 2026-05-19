"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Tile } from "@/components/ui/Tile";
import { Badge } from "@/components/ui/Badge";
import { SKILLS } from "@/config/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Mode = "physics" | "organized";

type LabelBody = Matter.Body & { _label?: string };

export function SkillsTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>(reduced ? "organized" : "physics");

  useEffect(() => {
    if (reduced) setMode("organized");
  }, [reduced]);

  return (
    <Tile
      span={span}
      eyebrow="Skills"
      title="What I work in"
      accent="secondary"
      action={
        <button
          type="button"
          onClick={() => setMode((m) => (m === "physics" ? "organized" : "physics"))}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-tile)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] transition hover:bg-[var(--color-tile-hover)]"
          aria-pressed={mode === "organized"}
          aria-label={`Toggle to ${mode === "physics" ? "organized" : "physics"} mode`}
        >
          {mode === "physics" ? "Tidy" : "Tumble"}
        </button>
      }
    >
      <div className="relative mt-4">
        {mode === "organized" ? (
          <ul className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </ul>
        ) : (
          <PhysicsField key="physics" skills={SKILLS} />
        )}
      </div>
    </Tile>
  );
}

type MouseWithHandlers = Matter.Mouse & {
  element: HTMLElement;
  mousemove: EventListener;
  mousedown: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
};

/**
 * Matter.Render is skipped: its canvas clear uses `source-in` + transparent fill,
 * which can erase the whole surface under backdrop-filter / some GPUs. We run
 * Matter.Runner + a plain 2D draw loop on a React-owned canvas instead.
 */
function PhysicsField({ skills }: { skills: readonly string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    /** Non-null once physics has started (avoids double-init on ResizeObserver). */
    let dispose: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let rafKick = 0;

    const start = (width: number, height: number) => {
      if (cancelled || dispose) return false;
      if (width < 32 || height < 32) return false;

      const Engine = Matter.Engine;
      const Runner = Matter.Runner;
      const World = Matter.World;
      const Bodies = Matter.Bodies;
      const Composite = Matter.Composite;
      const Mouse = Matter.Mouse;
      const MouseConstraint = Matter.MouseConstraint;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.setAttribute("data-pixel-ratio", String(dpr));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      const engine = Engine.create({
        gravity: { x: 0, y: 0.6, scale: 0.001 },
      });

      const t = 40;
      // Bottom + sides only. A thick top slab made bodies stick on its upper surface (y ≈ -40)
      // instead of falling through into the visible area (they never reached y > 0).
      const walls = [
        Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, { isStatic: true }),
        Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, { isStatic: true }),
      ];

      const bodies = skills.map((skill, i) => {
        const w = 12 + skill.length * 8;
        const h = 28;
        const x = 40 + Math.random() * Math.max(20, width - 80);
        const y = -120 - i * 36;
        const r = Math.min(12, w / 2 - 1, h / 2 - 1);
        const body = Bodies.rectangle(x, y, w, h, {
          chamfer: { radius: Math.max(2, r) },
          restitution: 0.35,
          friction: 0.4,
        });
        (body as LabelBody)._label = skill;
        return body;
      });

      World.add(engine.world, walls);
      World.add(engine.world, bodies);

      const mouse = Mouse.create(canvas);
      // matter-js v0.20 reads `data-pixel-ratio` via parseInt which truncates
      // fractional DPRs (1.5, 1.75 etc.) and makes mouse coordinates miss the
      // bodies. Reassign explicitly to the real dpr, and reset scale/offset in
      // case stale state survived a Strict Mode double-invoke.
      mouse.pixelRatio = dpr;
      Mouse.setScale(mouse, { x: 1, y: 1 });
      Mouse.setOffset(mouse, { x: 0, y: 0 });

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      World.add(engine.world, mouseConstraint);

      const runner = Runner.create();
      Runner.run(runner, engine);

      const palette = { fg: "#1a1a1a", stroke: "rgba(255,90,31,0.45)", fill: "rgba(255,255,255,0.08)" };

      const readPalette = () => {
        const styles = getComputedStyle(document.documentElement);
        const fg = styles.getPropertyValue("--color-fg").trim();
        const accent = styles.getPropertyValue("--color-accent-primary").trim();
        const theme = document.documentElement.getAttribute("data-theme") ?? "light";
        const isDarkBg = theme === "dark" || theme === "terminal";
        if (fg) palette.fg = fg;
        if (accent) palette.stroke = `color-mix(in oklab, ${accent} 55%, transparent)`;
        if (theme === "epaper") {
          palette.fill = "rgba(0,0,0,0.05)";
        } else {
          palette.fill = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)";
        }
      };
      readPalette();

      const themeObserver = new MutationObserver(readPalette);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      let drawRaf = 0;
      const draw = () => {
        if (cancelled) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const all = Composite.allBodies(engine.world);
        for (let i = 0; i < all.length; i++) {
          const b = all[i] as LabelBody;
          if (!b._label) continue;

          const verts = b.vertices;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let j = 1; j < verts.length; j++) {
            ctx.lineTo(verts[j].x, verts[j].y);
          }
          ctx.closePath();
          ctx.fillStyle = palette.fill;
          ctx.strokeStyle = palette.stroke;
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();

          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          ctx.fillStyle = palette.fg;
          ctx.font =
            '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b._label, 0, 0);
          ctx.restore();
        }

        drawRaf = requestAnimationFrame(draw);
      };
      drawRaf = requestAnimationFrame(draw);

      const detachMouse = () => {
        const m = mouse as MouseWithHandlers;
        const el = m.element;
        el.removeEventListener("mousemove", m.mousemove);
        el.removeEventListener("mousedown", m.mousedown);
        el.removeEventListener("mouseup", m.mouseup);
        el.removeEventListener("wheel", m.mousewheel);
        el.removeEventListener("touchmove", m.mousemove);
        el.removeEventListener("touchstart", m.mousedown);
        el.removeEventListener("touchend", m.mouseup);
        Mouse.clearSourceEvents(mouse);
      };

      dispose = () => {
        cancelAnimationFrame(drawRaf);
        themeObserver.disconnect();
        Runner.stop(runner);
        detachMouse();
        World.clear(engine.world, false);
        Engine.clear(engine);
      };

      return true;
    };

    const measure = () => {
      const r = container.getBoundingClientRect();
      return { width: Math.floor(r.width), height: Math.floor(r.height) };
    };

    const tryStart = () => {
      const { width, height } = measure();
      return start(width, height);
    };

    if (!tryStart()) {
      rafKick = requestAnimationFrame(() => {
        if (cancelled || dispose) return;
        if (tryStart()) return;
        resizeObserver = new ResizeObserver(() => {
          if (cancelled || dispose) return;
          if (tryStart() && resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
          }
        });
        resizeObserver.observe(container);
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafKick);
      resizeObserver?.disconnect();
      dispose?.();
    };
  }, [skills, reduced]);

  return (
    <div
      ref={containerRef}
      className="relative h-72 min-h-[18rem] w-full min-w-[10rem] shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)]/50 [isolation:isolate]"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto absolute inset-0 block size-full max-h-none max-w-none cursor-grab touch-none select-none active:cursor-grabbing"
        aria-hidden
      />
    </div>
  );
}
