import type { APIRoute } from 'astro';
import { getPosts, postUrl } from '../../lib/blog';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const home = new URL('/blog/', site).href;
  const updated = (posts[0]?.data.updated ?? posts[0]?.data.date ?? new Date()).toISOString();

  const entries = posts
    .map((p) => {
      const url = new URL(postUrl(p), site).href;
      return `  <entry>
    <title>${esc(p.data.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <published>${p.data.date.toISOString()}</published>
    <updated>${(p.data.updated ?? p.data.date).toISOString()}</updated>
    <summary>${esc(p.data.description)}</summary>
${p.data.tags.map((t) => `    <category term="${esc(t)}"/>`).join('\n')}
  </entry>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Jovan Tomović — blog</title>
  <subtitle>Notes on events, hackathons and the tools I build.</subtitle>
  <link href="${home}"/>
  <link rel="self" href="${new URL('/blog/atom.xml', site).href}"/>
  <id>${home}</id>
  <updated>${updated}</updated>
  <author><name>Jovan Tomović</name></author>
${entries}
</feed>
`;
  return new Response(body, { headers: { 'content-type': 'application/atom+xml; charset=utf-8' } });
};
