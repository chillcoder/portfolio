"use client";

import { useEffect, useRef } from "react";
import Tilt from "react-parallax-tilt";
import { Tile } from "@/components/ui/Tile";
import { PROFILE } from "@/config/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroTile({ span }: { span?: string }) {
  const reduced = useReducedMotion();
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = nameRef.current;
    if (!el) return;

    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-letter]"));
    letters.forEach((letter, i) => {
      letter.style.opacity = "0";
      letter.style.transform = "translateY(0.4em)";
      letter.style.transition = `opacity 700ms cubic-bezier(.2,.7,.1,1) ${80 + i * 30}ms, transform 700ms cubic-bezier(.2,.7,.1,1) ${80 + i * 30}ms`;
    });

    requestAnimationFrame(() => {
      letters.forEach((letter) => {
        letter.style.opacity = "1";
        letter.style.transform = "translateY(0)";
      });
    });
  }, [reduced]);

  const letters = PROFILE.name.split("").map((char, i) => (
    <span key={i} data-letter className="inline-block">
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  const inner = (
    <Tile span={span} accent="primary" padded={false} className="min-h-[240px]">
      <div className="flex h-full flex-col justify-between gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
            {PROFILE.location}
          </span>
          <h1 className="text-balance text-3xl font-medium leading-tight md:text-5xl">
            <span ref={nameRef} aria-label={PROFILE.name}>
              {letters}
            </span>
          </h1>
          <p className="max-w-md text-balance text-sm text-[var(--color-fg-muted)] md:text-base">
            {PROFILE.title}. {PROFILE.bio}
          </p>
        </div>
      </div>
    </Tile>
  );

  if (reduced) return inner;

  return (
    <Tilt
      glareEnable={false}
      tiltMaxAngleX={3}
      tiltMaxAngleY={3}
      transitionSpeed={1500}
      tiltReverse
      className={span}
    >
      {inner}
    </Tilt>
  );
}
