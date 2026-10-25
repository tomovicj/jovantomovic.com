import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../../lib/blog';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  return rss({
    title: 'Jovan Tomović — blog',
    description: 'Notes on Solana, security, hackathons and the tools I build.',
    site: site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: p.data.tags,
    })),
  });
};
