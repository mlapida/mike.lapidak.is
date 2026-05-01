---
type: post
status: published
title: "Adding Logseq Sharing to Feedbin"
description: "A quick guide to adding a quick capture share extension for Logseq to Feedbin"
publish_date: 2022-12-05
modified_date: 2022-12-10
source_url: https://empty.coffee/logseq-feedbin-share-quick-capture/
feature_image: /post-images/logseq-feedbin-share-quick-capture/feature.png
slug: logseq-feedbin-share-quick-capture
author: Mike Lapidakis
word_count: 125
tags:
  - empty-coffee
  - published
  - guide
  - logseq
  - feedbin
  - rss
---

# Adding Logseq Sharing to Feedbin

> A quick guide to adding a quick capture share extension for Logseq to Feedbin

I've recently been playing around with [Logseq](https://logseq.com/) and loving it. One of my favorite features is the quick capture capability. From the [app](https://apps.apple.com/us/app/logseq/id1601013908), a [bookmarklet](https://jsfiddle.net/andelf/kvm5Le6z/7/), or various [extensions](https://addons.mozilla.org/en-US/firefox/addon/logseq-quick-capture/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search), you can quickly send URLs to your graph. This has the potential to eliminate the need for something like [Pinboard](https://pinboard.in/) in the future.

I use [Feedbin](https://feedbin.com/home) for reading RSS feeds. I wanted the ability to add new links from Feedbin to my Logseq environment in one click. Lucky for me, [Feedbin has a way to add custom sharing extensions](https://feedbin.com/help/sharing-read-it-later-services/) and Logseq has a [well-document URL schema](https://docs.logseq.com/#/page/Logseq%20Protocol).

You can send links directly to your Logseq graph by adding:  
`logseq://x-callback-url/quickCapture?url=${url}&title=${title}&page=TODAY&append=TRUE`

With this, I'm appending the link to the end of the current journal/today page. Slick!
