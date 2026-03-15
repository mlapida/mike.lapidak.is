export const site = {
  name: 'Mike Lapidakis',
  url: 'https://mike.lapidak.is',
  description: 'Engineering leader, photographer, and tinkerer based in the Pacific Northwest.',
  role: 'Security & Networking SA Leader · AWS · Denver, CO',
  bio: "I've spent 10 years at AWS — the last 6 building and leading specialist teams across security, networking, and generative AI. I still get into the weeds when it matters, and I build things meant to last. Dad, photographer, perpetual tinkerer.",
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
  ['LinkedIn', 'GitHub', 'glass.photo', 'empty.coffee'].includes(s.label)
);

// Subset shown in the footer
export const footerSocials = socials.filter(s =>
  ['LinkedIn', 'Threads', 'Mastodon', 'Bluesky', 'GitHub', 'glass.photo'].includes(s.label)
);
