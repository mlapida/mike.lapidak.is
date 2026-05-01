---
type: post
status: published
title: "NextDNS Part 2: Caching and the Unifi Dream Machine"
description: "A year later, and NextDNS is faster and quicker to set up"
publish_date: 2021-01-22
modified_date: 2022-12-10
source_url: https://empty.coffee/nextdns-cacheing-unifi-dream-machine/
slug: nextdns-caching-unifi-dream-machine
author: Mike Lapidakis
word_count: 500
tags:
  - empty-coffee
  - published
  - guide
  - nextdns
  - networking
  - dns
  - security
---

# NextDNS Part 2: Caching and the Unifi Dream Machine

> A year later, and NextDNS is faster and quicker to set up

[Last year, I wrote](https://github.com/mlapida/empty-coffee-v2/blob/master/replacing-pi-hole-with-nextdns) about replacing Pi-Hole with [NextDNS](https://nextdns.io/?from=vysg25gu) on my home network. At the time, the [NextDNS CLI](https://github.com/nextdns/nextdns) was incompatible with the Unifi Dream Machine Pro and required an external server to handle the requests. I also mentioned that, due to the location of the closest NextDNS resolver, I was taking a slight hit on performance by switching from CloudFlare’s DNS.

A year later, and I’m glad to report that NextDNS has addressed both caveats and added additional performance enhancing features. I’m ecstatic with the results and NextDNS’s continued development.

## Performance Improvements

![NextDNS Ping Performance Page](/post-images/nextdns-cacheing-unifi-dream-machine/ping.jpg)

NextDNS Ping Performance Page

NextDNS has launched a number of points-of-presence (POPs) around the globe to help improve resolution performance, as well as the launch of ultra-low latency endpoints. For me, I’ve observed two new locations in Denver to resolve requests, cutting the response time in half (12ms vs 29ms when resolving to Dallas). NextDNS launched [ping.nextdns.io](https://ping.nextdns.io/) to let users measure the latency to the various POPs and identify which locations they’re using.

Along with more points of presence, NextDNS [added caching](https://github.com/nextdns/nextdns/wiki/Cache-Configuration) to the CLI/proxy. On my networking, the cached DNS record is served around 70% of the time, further speeding up DNS resolution. This new feature is enabled by updating the CLI to the latest version and running `sudo nextdns config set -cache-size=10MB`. In my experience, 10MB is plenty, and won’t strain the resource utilization of your server as the cache is held in memory. You can also see how well the cache is performing with `nextdns cache-stats`.

With these three performance improvements (new POPs, ultra-low latency endpoints, and local caching) I’ve observed a significant increase in performance when using NextDNS. The addition of tools like [ping](https://pinig.nextdns.io/) and the [diagnostics CLI](https://help.nextdns.io/t/y4hmvcx/report-network-latency-issue) provide more ways to verify the configuration is optimized and performing as expected.

## NextDNS on Unifi Dream Machine Pro

![NextDNS Unifi CLI Prompt](/post-images/nextdns-cacheing-unifi-dream-machine/unifi.jpg)

NextDNS Unifi CLI Prompt

The NextDNS CLI was updated to support installation on the Unifi Dream Machine (UDM) and Dream Machine Pro (UDMP). This removed the requirement to run a Raspberry Pi or other local server to set up the NextDNS proxy if you’re using these newer Unifi gateways. Installation is as straightforward as it gets. I’ve run this configuration for over three months with no disruptions.

To configure NextDNS on a UDMP:

1. Enable SSH access to the gateway [from the configuration page](https://help.ui.com/hc/en-us/articles/360049612874-UniFi-UDM-How-to-Login-to-the-Dream-Machine-using-SSH).
2. SSH into the UDMP and run: `sh -c 'sh -c "$(curl -sL https://nextdns.io/install)"'`. NextDNS has [published a wiki](https://github.com/nextdns/nextdns/wiki/UnifiOS) on this process as well.
3. If you’ve previously configured DNS settings for the network in the UDMP, remove the settings and restore to default.
4. That’s it! You’re all set.

In my experience, the settings persist through reboots and firmware upgrades, and the process is stable. Updating is a breeze as well by simply re-running the installation command and selecting upgrade from the options. This config has replaced my Raspberry Pi’s for DNS resolution in my home.

Overall, [NextDNS](https://nextdns.io/?from=vysg25gu) continues to impress, and has justified a paid DNS service for our family.
