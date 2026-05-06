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
import { CertificationsTile } from "@/components/tiles/CertificationsTile";
import { SpotifyTile } from "@/components/tiles/SpotifyTile";
import { ProjectsTile } from "@/components/tiles/ProjectsTile";
import { GlobeTile } from "@/components/tiles/GlobeTile";
import { PhotosTile } from "@/components/tiles/PhotosTile";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-24 md:px-6 md:pt-28">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <HeroTile span="md:col-span-2 xl:col-span-3 xl:row-span-2" />
          <GithubTile span="xl:col-span-2" />
          <ExperienceTile span="xl:col-span-1" />

          <WorkAccordionTile span="md:col-span-2 xl:col-span-2" />
          <SkillsTile span="md:col-span-2 xl:col-span-2" />
          <AboutTile span="xl:col-span-2" />

          <WakaTimeTile span="xl:col-span-2" />
          <EducationTile span="xl:col-span-2" />
          <CertificationsTile span="xl:col-span-2" />

          <SpotifyTile span="md:col-span-2 xl:col-span-2" />
          <ProjectsTile span="md:col-span-2 xl:col-span-2" />
          <GlobeTile span="md:col-span-2 xl:col-span-2" />

          <PhotosTile span="md:col-span-2 xl:col-span-4" />
        </section>
      </main>
      <Footer />
    </>
  );
}
