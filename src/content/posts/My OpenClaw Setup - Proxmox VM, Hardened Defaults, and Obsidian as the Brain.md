---
type: post
status: draft
title: "My OpenClaw Setup: Proxmox VM, Hardened Defaults, and Obsidian as the Brain"
description: "How I set up a dedicated Proxmox VM for OpenClaw, with sensible hardening and Obsidian wired in as long-term memory."
slug: my-openclaw-setup
author: Mike Lapidakis
tags:
  - openclaw
  - proxmox
  - homelab
  - obsidian
---

*Draft - work in progress*

---

[OpenClaw](https://openclaw.ai) has been making the rounds lately, and for good reason - it's a solid open-source platform for running a personal AI agent on your own hardware. I've been using it for a few weeks on a dedicated VM on my Proxmox server. The assistant is called Moltbot - a Bigfoot who lives in my basement.

This post covers three things: how I set up the VM with sensible security defaults, how I connected it to my Obsidian vault as a long-term memory store, and some practical guidance if you want to do the same.

---

## The VM: Isolated by Design

My home server runs [Proxmox](https://www.proxmox.com/), a hypervisor I've written about before. Proxmox makes it easy to spin up KVM virtual machines and LXC containers, keep them isolated from one another, and manage resources without much ceremony. For Moltbot, I created a dedicated Ubuntu 24.04 LTS virtual machine - 4 vCPUs, 4 GB RAM, 50 GB storage - and treated it like I'd treat any internet-facing server: minimal footprint, hardened defaults.

A few things I did intentionally:

**No email or social media access.** The VM has no email client, no social accounts, no credentials to post or send on my behalf without going through explicit tool calls and my approval. OpenClaw has a permission model that lets you define which outbound actions are available; I've left most write actions gated. The assistant can read and search, but it can't fire off a tweet or send an email on its own.

**Tailscale-only external access.** The VM isn't exposed to the public internet. I access the OpenClaw web UI and API via [Tailscale](https://tailscale.com/), which means it's only reachable on my tailnet. Outbound traffic is allowed (the assistant needs to search the web and call APIs), but inbound is locked down to Tailscale peers.

**No raw API keys on disk.** Instead of storing Anthropic API keys directly, I route all model traffic through [Tailscale Aperture](https://aperture.tailscale.com/), which acts as an AI gateway on my tailnet. Devices tagged `ai` can authenticate to the endpoint using Tailscale identity - no API keys to rotate, store, or accidentally leak in a dotfile.

**Untrusted context is firewalled from tool use.** This is an OpenClaw-specific feature. Content pulled from the web, webhooks, or messaging surfaces is wrapped in untrusted content blocks and can't directly invoke tool calls or modify agent behavior. Prompt injection from a malicious web page doesn't get far when the content is labeled and scoped from the start.

**Daily automated security audit.** I have a cron job that runs every morning using Claude Opus - the most capable model in the stack - to audit the host. It checks listening ports against a known baseline, runs `openclaw security audit --deep`, verifies the OpenClaw version is current, and scans for unexpected processes or services. Results are delivered via Signal. Most days it's a one-liner confirmation that everything looks clean. When something flags - like a skill that reads environment variables before making network calls - it surfaces for review. It's not a replacement for real security hygiene, but it's a useful daily pulse check.

The practical result: Moltbot can look things up, take notes, control my smart home, and chat with me over Signal - but it can't send emails, post publicly, or quietly exfiltrate data. The blast radius for any mistake is small.

---

## Obsidian as the Brain

The part of this setup I'm most pleased with is the Obsidian integration. I've been using [Obsidian](https://obsidian.md/) as my personal knowledge base for years. My vault has over 2,200 notes: daily journal entries going back to 2012, saved web clips, reading highlights from Readwise, blog drafts, project notes, and a gear inventory. It's where I keep things I want to be able to find later.

OpenClaw has a `memory_search` tool that performs semantic search over markdown files. You point it at a directory, and the agent can search it using a locally-run embedding model. The key insight: my Obsidian vault is just a folder of markdown files. So I pointed OpenClaw at it.

```json
"memorySearch": {
  "extraPaths": ["<openclaw-workspace>/Source"],
  "provider": "local",
  "local": {
    "modelPath": "hf:nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.Q4_K_M.gguf"
  }
}
```

Now when I ask Moltbot something like "what's my iCloud calendar sync setup?" it searches the vault and surfaces the relevant note. It can also write to the vault - when something happens worth capturing, it appends a bullet to the `### Moltbot` section in that day's daily note.

### Keeping the Vault in Sync

The missing piece is keeping the vault current on the server. Obsidian has an official sync service - [Obsidian Sync](https://obsidian.md/sync) - that handles bidirectional sync across devices. There's a headless CLI client called `ob` (the [`obsidian-headless`](https://www.npmjs.com/package/obsidian-headless) package on npm) that can run on a server without a desktop or GUI.

Install it:

```bash
npm install -g obsidian-headless
```

Authenticate with your Obsidian account:

```bash
ob login
```

Set up sync for your vault:

```bash
ob sync-setup --path <openclaw-workspace>/Source --vault "Source"
```

Then run it continuously in the background:

```bash
ob sync --continuous &
```

I initially set this up as a systemd service, but ended up running it as a plain background process instead - simpler to manage and restart if needed. The `--continuous` flag keeps it polling for changes. Within about 30 seconds of editing a note on my iPhone or Mac, it's reflected on the server and searchable by the assistant.

---

## Best Practices for the Obsidian Brain Approach

If you want to replicate this setup, here's what I've learned so far.

### Structure your vault with the assistant in mind

OpenClaw searches your vault semantically, but clear folder structure and consistent naming still matter. A few conventions that work well in my setup:

**Clippings/** - Web articles saved with the [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension. Each note includes the source URL, author, published date, and the full article text. This is where links I save end up. When I ask "what was that article I read about Matter and VLAN isolation?", the assistant finds it here.

A clipping note looks like this:

```markdown
---
title: "Thread / Matter Router Rules and Firewalls"
source: "https://community.home-assistant.io/t/thread-matter-router-rules-and-firewalls/583774"
author:
  - "[[Home Assistant Community]]"
created: 2025-11-08
tags:
  - clippings
---

[article content]
```

**Daily Notes/** - Organized as `📓 Daily Notes/YYYY/MM/YYYY-MM-DD.md`. These are sparse - not every day has an entry - but when something worth remembering happens, it lands here. The `### Moltbot` section at the bottom of each daily note is where the assistant writes its own captures: links I've shared, context from conversations, things I've asked it to remember.

**Personal/Gear & Assets/** - A personal inventory. Cameras, bikes, electronics, appliances. Useful when the assistant needs to know what gear I own or check warranty information without me having to look it up.

**Blog Drafts/** - Where my blog posts live while in progress. Having drafts in the vault means the assistant can search across them, pick up context from older pieces, and help with new ones.

### Move the vault into the agent workspace

OpenClaw's file tools (`read`, `write`, `edit`) are sandboxed to the agent's workspace directory - the OpenClaw working directory. This is a deliberate guardrail. Initially I had the vault at a separate path, which meant the agent had to shell out via `exec` to write to it. Functional, but clunky.

The cleaner solution: move the vault inside the workspace.

```bash
mv ~/YourVault <openclaw-workspace>/Source
```

Update `ob sync` to point at the new path, update `obsidian-cli`'s default vault, and restart the sync process. Now file tools can read and write vault notes directly - no `exec` needed, no symlink hacks (OpenClaw blocks symlinks pointing outside the workspace). The file tools' workspace restriction becomes a feature rather than a limitation: the agent's entire world is the working directory, and the vault lives inside it.

### People notes

One of the more useful conventions I've landed on: a note per person in `Personal/Family/` and `Personal/Friends/`. Each note has a consistent frontmatter structure (name, birthday, relationship) and sections for Summary, Interests, Important Dates, Gift Ideas, Notes, and How We Met.

When I mention someone in conversation - "went hiking with my son today" - the agent adds a bullet to today's daily note linking to their person note via Obsidian backlink: `[[Person Name]]`. And when something relevant comes up in that person's note (a gift idea, a preference, a milestone), it links back to the daily note where it came from: `[[2026-03-01]]`.

It's a lightweight CRM inside the vault. Works well.

### Orient the assistant with a CLAUDE.md

Borrowing a convention from coding agents: a `CLAUDE.md` file at the vault root documents the structure and conventions of the vault. When the assistant is working with the vault for the first time, or needs context about where things live, it reads this file.

Mine documents the folder structure, naming conventions, key templates (daily notes, decision register, meeting notes), and which plugins are active. It's a map of the vault in plain language - which is exactly the format the agent handles best.

### Be explicit about what the assistant can write

I've set up clear conventions for what Moltbot writes vs. what it reads. It reads everything. It writes to:

- Today's daily note (`### Moltbot` section) for quick captures
- `📥 Inbox/` for longer notes worth processing later
- Blog drafts folder for posts I've asked it to help create

This keeps the vault coherent. The assistant isn't creating notes in random locations, and I always know where to find its contributions.

### Write in full sentences where it matters

The embedding model used for semantic search ([`nomic-embed-text-v1.5`](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF)) works best on natural language. A note that reads "iCloud Mail custom domain setup - switched from Microsoft 365 in June, SPF issues with Cloudflare forwarding, BIMI support added" will surface in searches much more reliably than a bare bullet list. It doesn't mean turning every note into an essay, but a sentence or two of context around key facts pays dividends later.

---

## What This Looks Like Day to Day

An average day: Moltbot sends me a morning briefing over Signal - weather, upcoming calendar events from TripIt, any blog updates from feeds I follow. Throughout the day I drop it links, ask questions, request a scene change in Home Assistant, or ask it to check if a movie is available on Plex. When I ask something about a past decision or project, it searches the vault and comes back with relevant notes.

I also have an hourly cron that syncs health data (in my case WHOOP) into the daily note - recovery score, sleep performance, and any workouts logged. It runs on a lightweight model and takes about 15 seconds. By the time I'm drinking coffee in the morning, the daily note already has a health summary section with the previous night's numbers.

The setup isn't magic. The embedding model runs locally and is slower than a cloud API. The assistant occasionally misses context I wish it had found. But the combination of a properly isolated VM, Obsidian Sync keeping the vault current, and semantic search across thousands of notes has made it genuinely useful in a way a generic cloud AI assistant isn't - because it knows my setup, my gear, my decisions, and my writing.

Moltbot lives in my basement. He earns his keep.

---

*Tagged: home lab, AI, Obsidian, Proxmox, self-hosted, OpenClaw*
