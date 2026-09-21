import { getSitemapEntries } from "@/lib/sitemap-generator";

/**
 * Fresh GSC path: /sitemaps/sitemap.xml
 * Submit this in Search Console (delete poisoned /sitemap.xml first).
 */
export const revalidate = 60;

export default async function sitemap() {
  return getSitemapEntries();
}
