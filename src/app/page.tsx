import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeHero from "@/components/home/HomeHero";
import HomeHeroEmpty from "@/components/home/HomeHeroEmpty";
import HomeLatestGrid from "@/components/home/HomeLatestGrid";
import HomeTopicStrip from "@/components/home/HomeTopicStrip";
import HomeFeatures from "@/components/home/HomeFeatures";
import SubscribeBand from "@/components/SubscribeBand";
import { getHomePageData } from "@/lib/home-data";

export const revalidate = 300;

export default async function Page() {
  const {
    lead,
    railStories,
    riverStories,
    mostRead,
    featureStories,
    topicCards,
  } = await getHomePageData();

  return (
    <>
      <SiteHeader homeActive />
      <main>
        {lead ? (
          <HomeHero lead={lead} railStories={railStories} />
        ) : (
          <HomeHeroEmpty />
        )}

        <HomeLatestGrid stories={riverStories} mostRead={mostRead} />
        <HomeTopicStrip topics={topicCards} />
        <HomeFeatures stories={featureStories} />
        <SubscribeBand />
      </main>
      <SiteFooter />
    </>
  );
}

