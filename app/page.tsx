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

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-24 md:px-6 md:pt-28">
        <section className="grid auto-rows-auto grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-6 xl:gap-4 xl:items-stretch xl:grid-flow-dense">
          {/* Hero is single-row on xl so Skills can sit directly beneath it (no dead space). */}
          <HeroTile span="md:col-span-2 xl:col-span-3" />
          <GithubTile span="md:col-span-2 xl:col-span-2" />
          <ExperienceTile span="md:col-span-2 xl:col-span-1" />

          <SkillsTile span="md:col-span-2 xl:col-span-3 xl:row-span-2" />
          <WorkAccordionTile span="md:col-span-2 xl:col-span-3 xl:row-span-2" />
          <AboutTile span="md:col-span-2 xl:col-span-3" />

          <WakaTimeTile span="md:col-span-2 xl:col-span-2" />
          <EducationTile span="md:col-span-2 xl:col-span-2" />
          <SpotifyTile span="md:col-span-2 xl:col-span-2 xl:row-span-2" />

          <ProjectsTile span="md:col-span-2 xl:col-span-4" />

          <GlobeTile span="md:col-span-2 xl:col-span-3 xl:row-span-2" />
          <PhotosTile span="md:col-span-2 xl:col-span-3 xl:row-span-2" />
        </section>
      </main>
      <Footer />
    </>
  );
}
