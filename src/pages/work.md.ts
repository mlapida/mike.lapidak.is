import type { APIRoute } from 'astro';
import { spotlight, experience, talks, skillGroups } from '../data/work';
import { socials } from '../config/site';

export const GET: APIRoute = () => {
  const lines: string[] = [];

  lines.push('# Mike Lapidakis · Work');
  lines.push('');
  lines.push('> Senior Manager of Security & Networking Specialist Solutions Architects at AWS, based in Denver, CO. Background, talks, and writing.');
  lines.push('');
  lines.push('Source: https://mike.lapidak.is/work');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Now');
  lines.push('');
  lines.push('I lead a team of specialist solutions architects at AWS covering Security and Networking for our largest customers. Most days are some mix of team development, untangling customer architecture decisions, and figuring out where the org should invest next. Builder by inclination.');
  lines.push('');

  lines.push('## Spotlight');
  lines.push('');
  for (const item of spotlight) {
    lines.push(`### ${item.title}`);
    lines.push('');
    lines.push(`*${item.type} · ${item.meta}*`);
    lines.push('');
    lines.push(item.desc);
    lines.push('');
    if (item.links.length) {
      lines.push(item.links.map(l => `[${l.label}](${l.href})`).join(' · '));
      lines.push('');
    }
  }

  lines.push('## Experience');
  lines.push('');
  for (const job of experience) {
    lines.push(`### ${job.company} · ${job.role}`);
    lines.push('');
    lines.push(`*${job.period} · ${job.location}*`);
    lines.push('');
    lines.push(job.description);
    lines.push('');
    if (job.tags.length) {
      lines.push(`Tags: ${job.tags.join(', ')}`);
      lines.push('');
    }
  }

  lines.push('## Skills & Tools');
  lines.push('');
  for (const group of skillGroups) {
    lines.push(`### ${group.label}`);
    lines.push('');
    lines.push(group.skills.map(s => `- ${s}`).join('\n'));
    lines.push('');
  }

  if (talks.length) {
    lines.push('## Talks & Writing');
    lines.push('');
    for (const talk of talks) {
      lines.push(`### ${talk.title}`);
      lines.push('');
      lines.push(`*${talk.type} · ${talk.event} · ${talk.year}*`);
      lines.push('');
      if (talk.desc) {
        lines.push(talk.desc);
        lines.push('');
      }
      if (talk.links.length) {
        lines.push(talk.links.map(l => `[${l.label}](${l.href})`).join(' · '));
        lines.push('');
      }
    }
  }

  lines.push('## Education');
  lines.push('');
  lines.push('### University of Toledo');
  lines.push('');
  lines.push('Bachelor of Science, Computer Science Engineering Technology · 2010');
  lines.push('');

  lines.push('## Elsewhere');
  lines.push('');
  for (const s of socials) {
    lines.push(`- [${s.label}](${s.href})`);
  }
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
