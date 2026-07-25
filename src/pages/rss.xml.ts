import rss from '@astrojs/rss';
import { getAllPosts, SITE_NAME, SITE_DESCRIPTION } from '../lib/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = await getAllPosts();
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site ?? new URL('https://example.com'),
    items: posts.map((p) => ({
      title: p.title,
      description: p.excerpt,
      link: `/blog/${p.slug}`,
      pubDate: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      categories: [p.category, ...p.tags],
    })),
    customData: `<language>ko-KR</language>`,
  });
};
