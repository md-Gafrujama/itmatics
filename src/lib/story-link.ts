export function storyHref(story: { slug: string }): string {
  return `/article/${story.slug}`;
}
