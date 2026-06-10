---
type: post
status: published
title: "Comparing Mastodon and GoToSocial"
description: "A brief comparison of Mastodon and GoToSocial from a systems administrator"
publish_date: 2022-12-24
modified_date: 2023-08-03
feature_image: /post-images/mastodon-vs-gotosocial/feature.png
slug: mastodon-vs-gotosocial
author: Mike Lapidakis
word_count: 879
tags:
  - journal
  - mastodon
  - social
---

With the Fediverse having its moment, there's a growing group of enthusiasts, myself included, who are looking for the most efficient way to run a server. Mastodon has emerged as the strong front-runner for small and large servers alike, though it isn't without its sharp edges.

I've run a [Mastodon](https://empty.coffee/tag/mastodon/) server for two months now, and have cut myself on those sharp edges several times. The most challenging aspect of running a small Mastodon server is cost and complexity. Mastodon uses three major components, each of which need their fair share of resources. Things can get pricey, quick.

For this reason, I started exploring other Mastodon-compatible [ActivityPub](https://activitypub.rocks/) services. The first of these that I'm experimenting with is [GoToSocial](https://github.com/superseriousbusiness/gotosocial).

GoToSocial is a lightweight alternative to Mastodon written in [Go](https://go.dev/), which can run on one fourth of the resources. It's currently in alpha, with minimal features. Presently, it's focused on providing a backend with a corresponding API for use with the many web, desktop, and mobile applications that work with Mastodon.

I want to emphasize one point again – GoToSocial is still in alpha (version 0.6.0 as of this writing). The development team maintains a list of APIs that have, and have not yet, been implemented along with a roadmap. It's worth [taking a look at these](https://github.com/superseriousbusiness/gotosocial/blob/main/ROADMAP.md) before proceeding further.

Alpha status not withstanding, I decided to [stand up a server](https://gts.lapidak.is/) and give it a whirl. I've written up my initial findings here.

## Cost

![](/post-images/mastodon-vs-gotosocial/CleanShot-2022-12-24-at-09.41.42@2x.webp)

With a server half the size of the one I use for Mastodon, GoToSocial has 42% of available memory free

The single biggest decision points for many folks thinking about standing up a server in the Fediverse will be cost. For a small, family-sized server, a full Mastodon install can be excessive. I've outlined my costs for a small Mastodon instance running on AWS [in my notes post](https://empty.coffee/notes-on-standing-up-a-mastodon-server-aws/), but to summarize, I deployed a `t4g.small` server which costs roughly $14 a month before bulk pricing discounts.

In comparison, GoToSocial requires far less resources. With a SQLite database, no Redis server, and a code base written in Go, it requires roughly 500 MBs of memory compared to the suggested 2 GB for Mastodon. With this, I'm using a `t4g.micro` which is roughly half the cost, at $6.50 per month. Performance appears to be comparable, with no observed slow-downs in my initial testing.

## Features

![](/post-images/mastodon-vs-gotosocial/CleanShot-2022-12-24-at-09.18.02@2x.webp)

The GoToSocial admin interface

As [outlined in the roadmap](https://github.com/superseriousbusiness/gotosocial/blob/main/ROADMAP.md) page of their GitHub repository, GoToSocial is still working on many of the features that make Mastodon great.

A few of note:

- Lists
- Bookmarks
- Pinned posts
- Hashtag following
- Verified links in profiles
- Video posting and playback

While some of these aren't dealbreakers, others are fairly important, such as video functionality. Some, more nuanced, issues start to show the longer I use GoToSocial. For example, follower counts don't propagate to my server. Users I follow on GoToSocial only show one follower, me.

Along with these feature gaps, GoToSocial requires an app to use, as the web interface is limited to viewing and updating profile information along with light server administration capabilities. For a single user (or family) server, this trade-off is fair. Using less resources, reducing cost, but requiring an app (which I primarily use anyway) is a fair trade-off.

One feature built into GoToSocial that I really enjoy [is the ability to use a different URL for usernames](https://docs.gotosocial.org/en/latest/installation_guide/advanced/). For example, if you'd like your username to be `[email protected]` but you're already running a site at `example.com`, you may need to host the server on a subdomain such as `social.example.com`. Doing this will cause your username to be `[email protected]` which is not ideal. GoToSocial can be configured to use the root domain, in this case `[email protected]` and has instructions for configuring the webfinger redirect. It's a slick solution that I'm thankful the development team included.

## Compatibility

![](/post-images/mastodon-vs-gotosocial/CleanShot-2022-12-24-at-10.11.50@2x.webp)

My GoToSocial profile page

By far the biggest issue I've had with GoToSocial compared to Mastodon is app compatibility. Many of the desktop and mobile apps I use regularly, such as [Mammoth](https://getmammoth.app/), don't know how to handle the missing features of GoToSocial's API implementation (Mammoth works now!). Most of the apps fail to authenticate, with some crashing after the first sync.

In my testing, [Pinafore](https://pinafore.social/) works well on the desktop/web, and the official Mastodon iOS app is rock solid on mobile. It's not clear to me if the issues are with the app developers not following the ActivityPub spec, and instead writing the apps for Mastodon specifically, or if the GoToSocial API responses are the culprit. Either way, I've not had good luck with third-party apps, which is the backbone for making GoToSocial work.

## Conclusion

At this time, I'm sticking with resource hungry Mastodon for hosting my Fediverse profile. Mastodon is feature complete, compatible with the leading mobile applications, stable, and has advanced administration capabilities such as adding relays and moderation. In this early stage of growth, stability and consistency across the Fediverse is key.

With this in mind, I'll continue to run a GoToSocial server, keeping an eye on development and how resource costs change over time. My goal is to follow over 100 active accounts that can simulate normal usage. I'll follow up when it's closer to feature parity.
