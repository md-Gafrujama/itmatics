import { getSitemapEntries } from "@/lib/sitemap-generator";

export const revalidate = 60;

export default async function sitemap() {
  return getSitemapEntries();
}
