export const site = {
  name: 'Mike Lapidakis',
  url: 'https://mike.lapidak.is',
  description: 'Builder, photographer, dad of two boys in Denver. Writing on homelab, self-hosted services, and the tools I use to think.',
  role: 'Security & Networking SA Leader · AWS · Denver, CO',
  bio: "Builder, photographer, dad of two boys. I tinker with software and the homelab, ride gravel when I can, and write about what I'm making. Denver. Day job at AWS.",
};

export const socials = [
  { label: 'LinkedIn',     href: 'https://linkedin.com/in/mikelapidakis' },
  { label: 'GitHub',       href: 'https://github.com/mlapida' },
  { label: 'Threads',      href: 'https://www.threads.net/@mikelapidakis' },
  { label: 'Mastodon',     href: 'https://lap.social/@mike',              rel: 'me' },
  { label: 'Bluesky',      href: 'https://bsky.app/profile/mike.lapidak.is' },
  { label: 'glass.photo',  href: 'https://glass.photo/lap' },
  { label: 'empty.coffee', href: 'https://empty.coffee' },
];

// Subset shown in the hero (keep it short)
export const heroSocials = socials.filter(s =>
  ['LinkedIn', 'GitHub', 'glass.photo'].includes(s.label)
);

// Subset shown in the footer
export const footerSocials = socials.filter(s =>
  ['LinkedIn', 'Threads', 'Mastodon', 'Bluesky', 'GitHub', 'glass.photo'].includes(s.label)
);

// Giscus comments configuration. Driven by GitHub Discussions on the
// repo backing this site. repoId / categoryId come from the GitHub
// GraphQL API; everything else is rendered as data-* on the giscus
// script tag (see src/components/Comments.astro).
//
// To rotate to a different repo or category, fetch new IDs with:
//   gh api graphql -f query='query { repository(owner:"...", name:"...") { id discussionCategories(first:25) { nodes { id name } } } }'
export const giscus = {
  repo: 'mlapida/mike.lapidak.is',
  repoId: 'R_kgDOILEDxA',
  category: 'Comments',
  categoryId: 'DIC_kwDOILEDxM4C8qSx',
  mapping: 'pathname',
  strict: '1',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  // Built-in giscus themes — cleanest default for now. A future
  // pass can swap these to URLs pointing at custom CSS files for
  // paper/ink palette parity (see "Pending" in CLAUDE.md).
  themeLight: 'light',
  themeDark: 'dark',
  lang: 'en',
  loading: 'lazy',
} as const;
