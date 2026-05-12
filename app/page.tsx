import type { ComponentType } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroTile } from "@/components/tiles/HeroTile";
import { GithubTile } from "@/components/tiles/GithubTile";
import { ExperienceTile } from "@/components/tiles/ExperienceTile";
import { WorkAccordionTile } from "@/components/tiles/WorkAccordionTile";
import { SkillsTile } from "@/components/tiles/SkillsTile";
import { AboutTile } from "@/components/tiles/AboutTile";
import { WakaTimeTile } from "@/components/tiles/WakaTimeTile";
import { EducationTile } from "@/components/tiles/EducationTile";
import { SpotifyTile } from "@/components/tiles/SpotifyTile";
import { ProjectsTile } from "@/components/tiles/ProjectsTile";
import { GlobeTile } from "@/components/tiles/GlobeTile";
import { PhotosTile } from "@/components/tiles/PhotosTile";

/**
 * Bento layout contract
 * ---------------------
 * The xl grid is 6 columns wide. Each `TileEntry` declares how many columns
 * (`cols`) and optional rows (`rows`) it occupies. Tiles are laid out in the
 * order declared in `TILES`, with `grid-flow-dense` filling any gaps.
 *
 * Rules to keep the page tidy and resilient to future additions:
 *   1. Every visual band should sum to exactly 6 columns. Examples:
 *      - 3 + 2 + 1
 *      - 3 + 3
 *      - 2 + 2 + 2
 *      - 6
 *   2. When two side-by-side tiles use `rows: 2`, they form a tall band.
 *      Both tiles must have similar content density so neither stretches
 *      with whitespace.
 *   3. To add a new tile: pick a band that needs filling, set `cols` so the
 *      band still totals 6, drop it into `TILES` in reading order.
 *   4. `cols` and `rows` are restricted to discrete tokens so Tailwind can
 *      see the class strings at build time.
 */

type TileCols = 1 | 2 | 3 | 4 | 6;
type TileRows = 2 | 3;

interface TileEntry {
  id: string;
  Component: ComponentType<{ span?: string }>;
  cols: TileCols;
  rows?: TileRows;
}

const COL_CLASS: Record<TileCols, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  6: "xl:col-span-6",
};

const ROW_CLASS: Record<TileRows, string> = {
  2: "xl:row-span-2",
  3: "xl:row-span-3",
};

const TILES: TileEntry[] = [
  // Band 1 — header (3 + 2 + 1 = 6)
  { id: "hero", Component: HeroTile, cols: 3 },
  { id: "github", Component: GithubTile, cols: 2 },
  { id: "experience", Component: ExperienceTile, cols: 1 },

  // Band 2 — story (3 + 3 = 6, both tall)
  { id: "work", Component: WorkAccordionTile, cols: 3, rows: 2 },
  { id: "skills", Component: SkillsTile, cols: 3, rows: 2 },

  // Band 3 — context (3 + 3 = 6, both tall)
  { id: "about", Component: AboutTile, cols: 3, rows: 2 },
  { id: "spotify", Component: SpotifyTile, cols: 3, rows: 2 },

  // Band 4 — credentials (3 + 3 = 6)
  { id: "wakatime", Component: WakaTimeTile, cols: 3 },
  { id: "education", Component: EducationTile, cols: 3 },

  // Band 5 — projects (6 = 6)
  { id: "projects", Component: ProjectsTile, cols: 6 },

  // Band 6 — closing (3 + 3 = 6, both tall)
  { id: "globe", Component: GlobeTile, cols: 3, rows: 2 },
  { id: "photos", Component: PhotosTile, cols: 3, rows: 2 },
];

function spanFor(t: TileEntry): string {
  return [
    "md:col-span-2",
    COL_CLASS[t.cols],
    t.rows ? ROW_CLASS[t.rows] : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-24 md:px-6 md:pt-28">
        <section className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-6 xl:gap-4 xl:grid-flow-dense xl:items-stretch">
          {TILES.map(({ id, Component, ...rest }) => (
            <Component
              key={id}
              span={spanFor({ id, Component, ...rest })}
            />
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
