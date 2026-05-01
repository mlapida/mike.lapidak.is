---
type: post
status: published
title: "HEY for Work: Getting Personal"
description: "Sharing the experience of using HEY for Work for a personal, custom domain name."
publish_date: 2021-02-27
modified_date: 2022-12-10
source_url: https://empty.coffee/hey-for-work-personal/
slug: hey-for-work-personal
author: Mike Lapidakis
word_count: 938
tags:
  - empty-coffee
  - published
  - review
  - services
  - email
  - hey
  - fastmail
---

# HEY for Work: Getting Personal

> Sharing the experience of using HEY for Work for a personal, custom domain name.

Last summer I [wrote up some of my initial thoughts about HEY](https://empty.coffee/on-hey-email/), a new email service from the creators of Basecamp. I concluded that, while I enjoyed the interface and workflow, I didn’t love that I had to forward in emails from a custom domain provider or switch to their @hey.com email address. At the time, the HEY team promised custom domain support within a year.

Six months later and the team launched [HEY for Work](https://hey.com/work/), a variant of HEY intended for professional use with the ability to use a custom domain. I received an invitation to try out HEY for Work in January and have since completely migrated my custom domain from Fastmail.

I’m using HEY for Work for personal use as the ability to use a custom domain was a significant driver. HEY for Work costs nearly 50% more than standard HEY ($144/year vs $99/year), though you pay monthly rather than annually and there are a handful of additional features included. In this post, I’ll cover the setup, the new features, and observations while using HEY for Work for personal domains.

As a note, changing email services that use a custom domain can be nerve-racking. There’s a period of time when changes aren’t fully propagated, and you’ll receive emails to both services. Having confidence that your emails are still getting through and not ending up in the spam folder can also be a concern. I don’t take switching email providers lightly.

## Setup

![HEY for Work Setup](/post-images/hey-for-work-personal/heysetup.jpg)

HEY for Work Setup

Setting up HEY for Work is straightforward, assuming you know your way around configuring domain names. You first sign up, specifying a domain name and backup email. Then you must verify ownership of the domain by adding a small text record to the root of your domain. The setup wizard does a fantastic job of reading existing records and coaching you through the process.

![HEY for Work Domain Configuration](/post-images/hey-for-work-personal/heyverify.jpg)

HEY for Work Domain Configuration

After ownership is confirmed, you’ll be prompted to add user accounts and configure billing. Finally, the wizard will ask you to adjust the DKIM, DMARC, and MX records, making it clear that once complete, emails will begin to flow into HEY. The most glaring missing feature is the ability to migrate mail into the service. I’m not sure how a company of a reasonable size would feel comfortable moving to HEY without the ability to import old emails.

For personal use, with one user, this setup was a breeze. The HEY for Work wizard confirms the correct entries at each step, reducing concerns around misconfigurations that may lead to lost email.

## Features

HEY for Work has all the marquee features of HEY, including the unique workflow, the fantastic search, the screener, and more. It also adds a few nice-to-have collaboration features such as “collections”, a place to share groups of emails with others and extensions, the ability to set up addresses beyond the user accounts (i.e. [\[email protected\]](https://empty.coffee/cdn-cgi/l/email-protection#71020401011e0305311514071e01025f02191e1402)).

HEY has implemented the ability to [link multiple accounts together](https://hey.com/link-multiple-accounts/). For me, I linked my original @hey.com account with my new HEY for Work hosted custom domain. This provides a unified experience with visual indicators in the form of shapes dictating which address received the email. HEY has also made it easy for this configuration to extend beyond a single client; each place I’m logged in shares the linked accounts and matching shapes. It’s one of the better multi-account integrations I’ve come across.

![HEY for Work Deliverability](/post-images/hey-for-work-personal/deliverability.jpg)

HEY for Work Deliverability

On deliverability, one of the areas that concerns me the most when hosting email for a custom domain, HEY for Work knocks it out of the park. In my initial testing, HEY for Work successfully delivers my emails to the recipients’ inbox every time, avoiding the dreaded spam folder. When running a deliverability test, my HEY for Work email scores perfectly.

## Impressions

For hosting a personal domain, HEY for Work is nearly perfect. All of HEY’s marquee features translate over, and some new and improved features have been added including “extensions”. Since switching over a month ago, I haven’t experienced a single issue sending or receiving emails. If you’ve tried and enjoyed HEY, and were holding out for custom email support to completely dive in, now’s the time.

The experience isn’t without some shortcomings. HEY for Work only support one domain name, which is a real bummer. Paying for a bunch of HEY for Work accounts to use with other domains I own isn’t a reasonable option. I’m also disappointed with HEY’s approach to portability. While I understand their version of email is unique and import/export of emails would be challenging, I do think it’s a required feature for a service as critical as email. Not being able to import old emails, and concerns on the ability to search and archive emails exported form HEY, is the biggest issue I have for my ongoing use of HEY for Work. I hope they reconsider this decision.

## Conclusion

Wrapping up, if you own a domain that acts as your primary personal email address today, and have found HEY’s email workflow compelling, it’s worth giving HEY for Work a try. At $12 per user/month, it’s definitely not the cheapest way to host your email. After using HEY for six months, I can say the feature set is enough to keep me hooked, as it has improved the signal-to-noise ratio of modern email. I also appreciate their robust [privacy](https://hey.com/spy-trackers/) and [security](https://hey.com/security/) features. Overall, I’ve enjoyed HEY’s reinvention of email, and I’m pleased that I can now use my email domain with the service. I’m also looking forward to experiencing where the HEY team takes email next.
