"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Tile } from "@/components/ui/Tile";
import { Badge } from "@/components/ui/Badge";
import { SKILLS } from "@/config/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

type Mode = "physics" | "organized";

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
      <div
        className={cn(
          "relative mt-4 transition-opacity",
          mode === "physics" && "h-72",
        )}
      >
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

function PhysicsField({ skills }: { skills: readonly string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = containerRef.current;
    if (!el) return;

    const width = el.clientWidth;
    const height = el.clientHeight;
    if (width === 0 || height === 0) return;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create({
      gravity: { x: 0, y: 0.6, scale: 0.001 },
    });

    const render = Render.create({
      element: el,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });

    const wallStyle = { fillStyle: "transparent" } as Matter.IBodyDefinition["render"];
    const walls = [
      Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true, render: wallStyle }),
      Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true, render: wallStyle }),
      Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true, render: wallStyle }),
      Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true, render: wallStyle }),
    ];
    World.add(engine.world, walls);

    const bodies = skills.map((skill, i) => {
      const w = 12 + skill.length * 8;
      const h = 28;
      const x = 40 + Math.random() * (width - 80);
      const y = -100 - i * 30;
      const body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: 14 },
        restitution: 0.4,
        friction: 0.4,
        render: {
          fillStyle: "rgba(255,255,255,0.04)",
          strokeStyle: "rgba(255,90,31,0.4)",
          lineWidth: 1,
        },
      });
      (body as Matter.Body & { _label?: string })._label = skill;
      return body;
    });
    World.add(engine.world, bodies);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const ctx = render.context;
    Matter.Events.on(render, "afterRender", () => {
      ctx.save();
      ctx.font =
        '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-fg");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      bodies.forEach((b) => {
        const label = (b as Matter.Body & { _label?: string })._label;
        if (!label) return;
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.fillText(label, 0, 1);
        ctx.restore();
      });
      ctx.restore();
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [skills, reduced]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)]/50"
    />
  );
}
