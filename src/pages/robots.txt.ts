import type { APIRoute } from "astro";

export const GET = (({ site }) => {
  if (!site) throw new Error("Astro.site must be configured");

  const sitemap = new URL("sitemap-index.xml", site).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}) satisfies APIRoute;
