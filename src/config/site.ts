export const site = {
  name: 'Mike Lapidakis',
  url: 'https://mike.lapidak.is',
  description: 'Engineering leader, photographer, and tinkerer based in the Pacific Northwest.',
  role: 'Solutions Architect Manager · AWS · Denver, CO',
};

export const socials = [
  { label: 'LinkedIn',     href: 'https://linkedin.com/in/mikelapidakis' },
  { label: 'GitHub',       href: 'https://github.com/mlapidakis' },
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
