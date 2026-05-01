---
type: post
status: published
title: "Sending Mastodon Bookmarks to Readwise"
description: "A guide on using Zapier to pull bookmarks in from Mastodon and send them to Readwise Reader."
publish_date: 2023-01-08
modified_date: 2023-01-08
source_url: https://empty.coffee/sending-mastodon-bookmarks-to-readwise-zapier/
slug: sending-mastodon-bookmarks-to-readwise-zapier
author: Mike Lapidakis
word_count: 885
tags:
  - empty-coffee
  - published
  - guide
  - mastodon
  - automation
  - productivity
---

# Sending Mastodon Bookmarks to Readwise

> A guide on using Zapier to pull bookmarks in from Mastodon and send them to Readwise Reader.

One of the features I miss the most from Twitter is the [Readwise](https://readwise.io/) integration. It's dead simple to send any tweets you'd like to save for later to Readwise, by either replying to a tweet including the Readwise handle or sending the Readwise account a direct message with a link to the tweet. I've used the content capture and review service for years, and I rely on it for recalling meaningful content across all the mediums I consume. With their launch of [Readwise Reader](https://readwise.io/read), the service's importance to my workflow has been further solidified.

As more meaningful content is shared and conversation had on [Mastodon](https://empty.coffee/tag/mastodon/), I wanted a way to extend my Readwise workflow to the budding social media alternative. I'm confident, with the plethora of integrations today, an official Readwise integration will launch in the future. I wanted to avoid waiting, though, so I strung together an integration in [Zapier](https://zapier.com/).

This post demonstrates how to use Zapier to pull in Mastodon Bookmarks and send them to the new Readwise Reader API to save. Through this, I learned that the Mastodon API sends HTML for the post content, and working with that can be challenging with a minimal orchestration service like Zapier. I also learned that Mastodon sends additional information about links/cards when available that may make these integrations more interesting in the future.

As a note, I've had my Zapier account for a long time, and I'm grandfathered into a free-tier that includes their webhooks integration. Without this, Zapier can be expensive. If you'd like me to explore launching this on a service like AWS Lambda, leave a comment below or [reach out](https://lapidak.is/@mike).

## Prerequisites

To get started, you'll need to create an Application in Mastodon and write down the access token. You'll need to do the same for Readwise.

![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.13.48@2x.png)

The new application page in Mastodon. This information is secret! Don't share it (I've deleted this app already).

1. Log into your Mastodon instance and navigate to Preference > Development > New application.
2. Create a new application with only the `read:bookmarks` scope selected. Name it Zapier, or something else memorable.
3. Take note of the contents of “Your access token”.
4. Next, navigate to [readwise.io/access\_token](https://readwise.io/access_token) and select “Get Access Token”. Copy the contents.
![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.16.01@2x.png)

The Readwise Access Token page

At this point, you should have the URL of your Mastodon instance, the Mastodon access token, and the Readwise access token. You're ready to log into Zapier and get started.

## Reading Mastodon Bookmarks in Zapier

It's now time to create the Zapier integration. First, create a [Zapier](https://zapier.com/) account if you don't have one already.

![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.20.30@2x.png)

A sample data set read by the Mastodon API

1. From the upper left, create a new “Zap”. Select Webhooks for the first step and set the Event to “Retrieve Poll”. With this integration type, Zapier will periodically poll the endpoint and action based on the new content found.
2. The URL will be `https://<your mastodon url>/api/v1/bookmarks`. In the Headers section, enter `Authorization` for the key and `Bearer <your Mastodon access token>` for the value.
3. Click continue, and test the webhook integration. If successful, you will see a sample of the data that Zapier pulls from this API.
![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.24.06@2x.png)

A sample data set read by the Mastodon API

## Sending Data to Readwise Reader in Zapier

Next, we'll configure another webhook, this time for Readwise. A note on the Readwise API; there are currently two active APIs, the [classic Readwise highlight API](https://readwise.io/api_deets) (v2) and the [new Readwise Reader API](https://readwise.io/reader_api) (v3). For this, I'm using the new API (v3), as it's a bit more flexible with the types of data that it will accept.

![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.31.48@2x.png)

The contents of a Mastodon post displayed in Readwise Reader

1. On the next step, create another webhook integration, this time with the event type of POST.
2. The URL will be `https://readwise.io/api/v3/save/`. The payload type will be `json`.
3. For the data fields, we have options. I've chosen to send the post HTML content to Readwise directly. I'm doing this because, in my experience, Readwise Reader doesn't do the best job of parsing Mastodon URLs yet. Furthermore, I've seen it bring in a random text from around the post, and it gets a bit messy. Another option would be sending the URL of the embedded card/link, if there's one present in the bookmark. This would be a better option for those that use bookmarks to save links, rather than post content. You can see the acceptable fields in the [Readwise API documentation](https://readwise.io/reader_api), and select which approach would be best for you.
4. Finally, for the headers section, add `Authorization` to the key and `Token <your Readwise access token>` to the value. The remaining values can stay the same.
5. With that, you can test your action and make sure the data is sent to Readwise Reader the way you would like. If you log into Readwise Reader, you should see the newly bookmarked Mastodon post on your home page.
![](/post-images/sending-mastodon-bookmarks-to-readwise-zapier/CleanShot-2023-01-08-at-09.38.58@2x.png)

The contents of a Mastodon post displayed in Readwise Reader

## Conclusion

Through this, I've learned how to pull in data from Mastodon and how to send data to Readwise Reader in Zapier. While I'm confident that Readwise will close this feature gap this year, learning how to interact with both APIs in a managed orchestration service like Zapier will prove useful for future project.
