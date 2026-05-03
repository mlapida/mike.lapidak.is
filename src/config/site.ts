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
