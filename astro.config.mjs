// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://jovantomovic.com',
  integrations: [mdx()],
  markdown: {
    // The design shows code as plain monospace, without colors.
    syntaxHighlight: false,
  },
  fonts: [
    {
      // Self-hosted from the official JetBrains Mono release (OFL), subset to Latin plus the
      // arrows, box-drawing, block and shape glyphs the ASCII art and timeline use. Google's
      // subsets leave those out, which would make the art fall back to a different font.
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.local(),
      fallbacks: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/JetBrainsMono-Regular.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/JetBrainsMono-Medium.woff2'], weight: 500, style: 'normal' },
          { src: ['./src/assets/fonts/JetBrainsMono-Bold.woff2'], weight: 700, style: 'normal' },
        ],
      },
    },
  ],
});
