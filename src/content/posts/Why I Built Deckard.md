---
type: post
status: published
title: "Why I Built Deckard"
description: "Building a Mac MCP server that lets my autonomous AI agents reach iCloud-hosted content over a Tailscale network, with per-token ACLs and a real trust boundary between agent and OS."
publish_date: 2026-05-09
feature_image: /post-images/icloud-mcp-server-deckard/feature.jpeg
slug: icloud-mcp-server-deckard
author: Mike Lapidakis
tags:
  - project
  - ai
  - development
  - openclaw
  - hermes
  - claude
  - security
---

If my email gets compromised, so does every other account that resets through it. Banking, social, services I forgot I signed up for. Anywhere I've ever clicked "forgot password" and waited for a link.

That's the contents-and-control problem. There's also the identity problem. Mail sent *from* my address carries weight. People act on it. A compromised inbox isn't just data exfiltration. It's a forgery vector with my name attached.

So when I started thinking about extending my AI agents into Mail and Calendar, I had a constraint that ruled out almost everything I could find: nothing else took security into account.

So I built [Deckard](https://github.com/lapidakis/Deckard).

Deckard is a Mac-resident MCP server (the protocol AI agents use for tool access) that hands my agents access to Mail, Calendar, iCloud Drive, Voice Memos, Reminders, and Contacts. Per-agent tokens, scoped ACLs, content filtering both directions, and a full audit log. Open source, runs entirely on my Mac.

Without something like it, an agent fed a prompt-injected email can quietly forward your inbox to a stranger, or send a password-reset link to itself. The bridge exists so it can't.

## What I tried first

Rocky, my Claude Code-powered personal assistant, was happy on my Mac. The trust boundary was the OS process. The daemon and the agent ran as the same user, macOS kept the gate closed against anything else, and the AppleScript-and-tape bridge I'd put together did the job.

Then I started running agents that don't live on my Mac. [OpenClaw](https://openclaw.ai) on a Proxmox VM, helping me draft and route messages. Then Eleanor, a [Paperclip](https://paperclip.ing)-powered house manager on a Linux LXC, triaging my inbox and calendar. [Hermes](https://hermes-agent.org) joined after on Telegram, broader-scoped and still finding its role. Different jobs, different scopes, all on my tailnet, all of them at some point needing context that lived only on my Mac.

Which sent me looking for the network-capable version. The field of existing MCP servers for Apple services turned out to be a Cambrian explosion of "expose Mail to your agent in 50 lines of AppleScript." The bearer holder gets everything the daemon can reach. Whatever lands in the agent's context is whatever the tool returned, with no marker on whether the sender was a stranger and no concept of which agent was even doing the calling.

That works for a single trusted agent on a single trusted machine. It is not the right starting point for "I have agents on different boxes and the credential is going across the wire."

## The decision the rest follows from

When I sat down to build, the architectural question wasn't "how do I add auth on top of an AppleScript wrapper." It was: *which* agent is calling? Once you ask that question, the answer can't be "it doesn't matter."

Each agent gets its own bearer token. Each token references its own ACL profile. Rocky on my Mac runs a `trusted` profile with the full surface, but `mail.send` still routes through an approval dialog. Eleanor on the tailnet runs a `mail-cal-readonly` profile with read access to mail and calendar and absolutely nothing else. Hermes and OpenClaw queue up after that, each landing in its own profile as the scope they need crystallizes. A readonly experiment runs against a profile that can't write anywhere.

Default-deny is the floor. Adding a tool to the binary doesn't silently expand any token's reach. The same evaluator that decides at call time also filters which tools the agent sees in the first place, so an agent only ever sees tools its token can actually call. Capability discovery matches capability reality.

Once that spine was set, the rest fell into place. The audit log records who called, what they tried, what was decided, and how long it took. Argument keys land in the row, never values. Outbound tool results pass through redaction so secret-shaped substrings get rewritten before they reach the model. Inbound mail bodies and calendar invites come back wrapped in `<untrusted>` markers so the agent treats them as data rather than instructions. Irreversible tools like `mail.send` route through a macOS approval dialog that lands on whichever Space I'm using, instead of getting swallowed by the hidden one the LaunchAgent first attached to.

Each piece is small. Stacked together they make a bridge where the trust boundary is concentrated in one place, rather than distributed across the surface in fragments. That's the part most existing options skipped.

## Where I deliberately stopped short

The tailnet listener doesn't maintain its own peer allowlist. That policy already lives in the Tailscale admin console, and re-implementing it in config would just create drift between two systems that say almost the same thing. The bridge runs `tailscale whois` per request to attribute audit rows to peer plus user, but the question of which peers reach the listener at all is the tailnet's call. Bearer auth still applies on top.

## On building this without Claude Code

I would not have built this without Claude Code.

That's not a hedge. It's the actual cost calculus. The decisions that needed me were architectural ones: what shape the per-token ACL takes, what belongs in the audit log and what doesn't, where the line between bridge and tailnet sits when you're tempted to duplicate Tailscale's policy. Those took thought. The implementation around them didn't. Claude wrote the code-signing script that picks up my Developer ID identity and falls back to adhoc with a warning. Claude wrote the schema validator that walks every tool. Claude wired up the auto-update pipeline whose signing key only CI knows. None of that work is hard once the design has been pinned. All of it would have been weeks of yak-shaving alone.

If you read v1.0.0-beta.3's surface area as one engineer's evenings, "overbuilt" is the wrong frame. The floor on what one person can ship has moved, and the construction stopped being the gating cost.

A few years ago, "I'll write something that takes security seriously" meant deciding whether to spend three months on it. Now it means deciding whether the design is sound and then building across a couple weeks of evenings. That changes what "homelab tool" can mean.

## Why "Deckard"

Deckard Cain in Diablo was the lore-keeper, the one who identified unknown items before you used them. You'd hand him something you'd just looted and he'd tell you what it actually was. Whether the chest you opened gave you a sword or a curse. "Stay awhile, and listen" was the prompt to pause and look at a thing before acting on it.

The bridge does the same job for AI agents reaching into iCloud. It identifies which agent is calling rather than treating every bearer the same. It tags content from external senders so the model knows what it's reading and where it came from. The approval dialog for irreversible tools is the literal stay-awhile-and-look-at-what-this-call-does step before letting it through.

(The project was called iCloud-Bridge before this. That name was both a misnomer and trademark-fragile, so it had to go.)

## The pitch

If you're running AI agents against your own Apple accounts and the trust model has been bothering you, [Deckard is on GitHub](https://github.com/lapidakis/Deckard). Open source, currently at v1.0.0-beta.3. Codesigned and notarized DMG on the Releases page, six-step menubar onboarding, copy-paste `claude mcp add` line at the end.

I built it because I want my agents to help with my email without becoming me on my email. Identity is what separates "a tool I delegated to" from "a hand on the wheel of my actual life," and the bridge is where that line gets drawn.
