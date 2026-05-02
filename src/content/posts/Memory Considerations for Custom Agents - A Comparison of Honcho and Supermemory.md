---
type: post
status: draft
title: "Memory Considerations for Custom Agents: A Comparison of Honcho and Supermemory"
description: "Notes from running two memory layers side by side under a real personal-agent stack. What each one captures, where they break, and why memory architecture matters more than memory features."
slug: memory-considerations-for-custom-agents
author: Mike Lapidakis
tags:
  - ai
  - memory
  - honcho
  - supermemory
  - agents
---

*Draft - work in progress*

---

I asked two AI memory systems the same four questions about myself, side by side. Who am I, what did I do tonight, who are my friends, what are my hobbies. The two systems gave me very different answers. One described how I think. The other described who I am. Neither of those is the same thing. Neither was sufficient by itself.

If you've been building custom agents (Discord bots, Signal assistants, scheduled cron jobs that whisper updates to your terminal), you've probably hit the same problem I did. Each agent has a tiny amount of context about the person it's serving. None of them share. The agent that knows your fitness data doesn't know your finances. The agent that handles your calendar can't reason about your relationships. You either re-state context every time you start a new conversation, or you accept that each agent operates with partial information.

Two products in the AI memory space are aimed at this. They're addressing the same problem but modeling it very differently.

---

## What I Was Trying to Solve

I run a small personal agent stack on my home lab. There's a primary assistant called Moltbot that I talk to over Signal and a webchat. There are specialized agents for fitness, finance, home automation, and media. They all run on the same machine, but each one talks to me through its own channel and accumulates its own session history.

What I wanted: one consistent picture of *me* that any of them could draw from. Not just "Mike's calendar" or "Mike's gym schedule," but a continuous, queryable understanding of who I am, what I value, and what I've been working on lately. Plus a parallel understanding of each agent itself, so the assistant I trust with my finances doesn't need a personality reset every time I open a new session.

Two memory layers showed up as plausible answers.

---

## Honcho

[Honcho](https://honcho.dev) is an open-source memory service from [Plastic Labs](https://plasticlabs.ai). It's MIT-licensed, you can self-host it, and the model is interesting: every entity is a *peer*. I'm a peer. The assistant is a peer. In principle, my wife or my manager could each be peers too, with their own representations.

Each peer accumulates a continuously-updated representation from the conversations it participates in. You query the representation with a *dialectic chat* call, which uses an LLM to reason over what it knows and answer in prose. You can also write durable conclusions explicitly via the SDK.

I had Honcho running on a tailnet endpoint, with a Claude Code plugin pointing at it for IDE conversations and a separate integration handling the OpenClaw side. Data has been accumulating quietly for a few weeks.

---

## Supermemory

[Supermemory](https://supermemory.ai) is a SaaS memory service. You ship facts and observations to it via API or MCP, and it builds a synthesized profile of you, plus an item graph connecting the underlying memories. Cross-tool, cross-session, single profile. The simplest possible answer to "I want one memory layer that all my tools see."

The tradeoff is the obvious one: your model of yourself lives on someone else's infrastructure. They're a small early-stage team. The service is real and works today, but the vendor risk is the kind you have to plan for, not paranoia.

I had Supermemory running with two containers (one vault-scoped, one for a global profile). Captures came from a mix of explicit saves, an auto-capture pipeline tied to my journaling, and conversations I marked durable.

---

## The Four-Question Test

I asked each system the same four questions, restricted to its own data, no fallbacks. Here's what came back, summarized.

**Who is Mike?**

Honcho returned behavioral patterns. "Strong systems-thinking tendency," "places correctness above performance," "trust-but-verify mindset," "diagnose-first troubleshooting style." All true. All things I'd say about myself if I had to introspect. None of them include my name, my role, my employer, or any biographical fact.

Supermemory returned a biography. Name, role, employer, family, the rough shape of my professional history, my personal aspirations in my own words ("being a better photographer, a better father"). Less granular on personality. Much sharper on identity.

**What did he do tonight?**

Honcho returned the most recent technical work it had captured: a filesystem cleanup session from a few nights earlier. Honest answer for the data it had. Wrong answer for what I actually did (a poker game with friends, plus some server work I was procrastinating on).

Supermemory returned tonight correctly: poker, the procrastinated work. It had captured the conversation it observed me having about it earlier in the day.

**Who are some of his friends and peers?**

Honcho: nothing. No names, no relationships, no people in any of the representations I queried. Not because the architecture can't model them. Because no observations had been written about them. The conversations Honcho had captured didn't talk about people.

Supermemory: a list. My wife, my children, my closest friends, my manager, a realtor who'd helped me find a piece of land. Names and roles, in some cases birthdays, a sense of who matters in my orbit and how.

**What are his hobbies and traits?**

Honcho returned more behavioral patterns plus implied interests pulled from technical context. "Mike applies quantification and instrumentation across health, finance, vehicle state, photography, and infrastructure." Useful as a meta-observation. Not a hobby.

Supermemory returned literal hobbies and habits. Strength training schedule, cardio cadence, gravel cycling, photography, this blog, daily rhythm (early workout, early bed), specific writing voice rules I've articulated for myself. Things I'd put in a personal description.

---

## What the Test Actually Showed

Honcho and Supermemory aren't competing products. They're aimed at different problems.

Supermemory is keyed on *the user*. Its job is to know me. It does that well, given how it's been fed.

Honcho is keyed on *peer relationships*. Its job is to model entities and how they interact. The user is one peer; the assistant is another; in principle, anyone you talk *about* can be modeled as a peer too.

That distinction sounds academic until you sit with it. Supermemory can't have a continuous, evolving sense of itself across conversations because there's no "self" in its model. It's a database of facts about a user, queried by stateless callers. Honcho's peer model means the assistant I'm talking to could in principle have its own continuously-updated representation, distinct from mine, that grows as we talk over months. A relationship that evolves on both sides, not just mine.

In practice, neither is delivering on its full architectural potential today. Supermemory's depth comes from how much I've fed it (a lot, deliberately, over months). Honcho's peer-model advantage requires deliberate scaffolding to surface (per-agent representations, hooks that inject the assistant's own context, periodic self-observations) that nobody ships out of the box yet.

But the architectures are doing different things. Pretending they substitute for each other is a category error.

---

## The Privacy Tradeoffs

You can't talk about memory layers without talking about who holds what.

Supermemory is hosted. They run the service, they store the data, you have an API. If they go away, your model of yourself goes with them unless you've been exporting. The economics of an early-stage SaaS company mean this is a real risk to plan for, not paranoia.

Honcho is open source. You can host it yourself on a small VM behind a tailnet, which is what I do. The data lives on my hardware. If Plastic Labs goes away, the server keeps working. There's also a hosted option (with a much nicer admin UI), and the migration path between hosted and self-hosted is tractable because it's the same software.

For me, the deeper privacy answer wasn't actually about the memory layer. It was about the substrate underneath.

My Obsidian vault holds 2,200 markdown notes going back to 2012. That's the source of truth for who I am over time. Both Honcho and Supermemory are caches over that truth, more or less. As long as the vault stays canonical, the memory cache is replaceable. The sovereignty lives in the vault, not in which API I'm calling this week.

That reframing changed my decision calculus more than any feature comparison. If you're choosing between memory layers, ask whether your truth lives somewhere durable underneath them. If it does, the SaaS-vs-self-hosted question is smaller than it looks. If it doesn't, you're betting your self-model on a vendor relationship.

---

## What This Space Will Probably Look Like

A few predictions, with caveats.

**Convergence.** Both products will likely add what the other has. Supermemory will probably introduce richer entity modeling (something peer-shaped). Honcho will probably ship better default capture pipelines and a less-DIY admin experience. The gap will close, but the underlying architectural stance will keep coloring how each system feels to use.

**An open standard, eventually.** The memory layer is going to look ridiculous in a few years if every tool has its own incompatible store. Something MCP-shaped or RFC-shaped will emerge to let memory be portable across providers, the way OAuth made identity portable. I don't know who builds it. I'd bet against any single vendor.

**Multi-agent peer modeling becoming a real category.** As more people stand up personal agent stacks (which is happening fast), the demand for "my finance agent and my fitness agent see the same picture of me" will make peer-model memory the more valuable architecture, not the more academic one. Honcho's bet is early but well-shaped for this.

**Privacy stratification.** The serious privacy-conscious users will self-host. The pragmatic majority will run hosted SaaS with a vendor risk hedge. Both are reasonable. The unreasonable position is treating the memory layer as inherently neutral when it's the most personal thing your stack will store.

---

## What I'd Tell Someone Choosing Today

If you want one memory layer that knows you well across every tool you run, and you can accept a SaaS vendor relationship, Supermemory does this cleanly today. Plug it in, capture deliberately, you get a coherent profile.

If you want a memory layer that can model the assistant itself as a continuous entity, that lets multiple agents accumulate distinct perspectives on you, and you're willing to wire some of it yourself, Honcho is structurally the right tool. Self-host if sovereignty matters to you.

If you want both, and you have the patience for a system with two layers serving different purposes, that's actually a defensible answer. Supermemory for biographical recall. Honcho for agent-side continuity. More to maintain, but the architecture supports it.

The thing I wouldn't do: treat memory as a small product decision. The system that holds your model of yourself isn't a side feature. It's the substrate that determines whether the next tool you adopt feels like a stranger or a continuation of a relationship.

I'm still working through which of those substrates I want to commit to. I'll write again when the answer is less in flux.
