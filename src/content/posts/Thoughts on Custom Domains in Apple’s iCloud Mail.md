---
type: post
status: published
title: "Thoughts on Custom Domains in Apple’s iCloud Mail"
description: "Insights on Apple's iCloud Mail Custom Domains after three months of heavy use."
publish_date: 2021-11-06
modified_date: 2023-08-03
source_url: https://empty.coffee/thoughts-on-custom-domains-in-apple-icloud-mail/
feature_image: /post-images/thoughts-on-custom-domains-in-apple-icloud-mail/feature.jpg
slug: thoughts-on-custom-domains-in-apple-icloud-mail
author: Mike Lapidakis
word_count: 1311
tags:
  - empty-coffee
  - published
  - services
  - apple
  - email
  - fastmail
  - hey
---

# Thoughts on Custom Domains in Apple’s iCloud Mail

> Insights on Apple's iCloud Mail Custom Domains after three months of heavy use.

💡

August 2, 2023: I've [published a follow-up to this article](https://empty.coffee/custom-domains-in-apples-icloud-mail-two-years-later/).

In August, [Apple released iCloud+](https://www.macrumors.com/2021/08/25/icloud-custom-email-domain-feature-in-beta/) with the ability to add a custom domain to iCloud Mail. After several months of full-time use, I wanted to share my experience and some of the things to look out for if you’re considering making a move. In short, I’m optimistic, but a bit disappointed in Apple’s progress in offering custom domains to iCloud subscribers so far.

## Background

I couldn’t wait to get my hands on iCloud Mail’s custom domains, [silently announced as a new feature](https://9to5mac.com/2021/06/07/custom-domain-names-are-coming-to-icloud-mail-with-icloud/), part of the rebranded iCloud+ subscription service in June 2021. When choosing an email service, a few things are as important as privacy and security. I don’t want a tech company riffling through my emails to market ads to me, and it’s trivial to steal someone’s identity once you’ve gained access to their primary email account.

I also value portability, having the ability to move my domain from one provider to another without changing my address across many services. For years, I have used FastMail with great success. The web interface is, well, fast, and they provide fantastic security features. When [HEY! was launched over a year ago](https://github.com/mlapida/empty-coffee-v2/blob/master/on-hey-email), I decided to give the opinionated email service a go. I loved it initially, slowly learning to hate how heavy-handed the design really was.

I decided to move away from HEY in July and try the Microsoft Outlook Premium custom domain feature. Unfortunately, this required me to move my name server hosting to GoDaddy, of all places. While the service was rock solid, the features limited me to one domain and didn’t allow for creating alias addresses. I did love the security and privacy features, though, such as masking image URLs and scanning and proxying links within emails to prevent phishing.

In late August, Apple released the custom domain feature in the beta version of iCloud.com. I quickly tried to configure it, but ran into issues with routing on their end. This was well documented in the beta period and was only fixed before iOS 15 launched in September. When Apple resolved the routing issue, I moved my primary domain over and haven’t (really) looked back. Through this time, the [forums over at MacRumors](https://forums.macrumors.com/threads/icloud-s-new-custom-email-domain-feature-now-available-in-beta.2308628/) were critical for the handful of folks implementing the new feature to share what they’ve learned.

## The Good, the SPAM, and the Ugly

I’ve used iCloud Mail with Custom Domains for my primary personal email since iOS 15 officially launched. Along with my primary domain, I have four “project” domains; all configured as well. To be clear, I’ve had no issue with availability at this time and no known issues with deliverability. However, some things have me annoyed, and I’m sharing this to help others before they take the leap.

### The Good

1. **The Apple Ecosystem**  — In typical Apple fashion, once configured, the service just works. When a new Apple device is configured with my iCloud account, my custom email shows up instantly. They’ve done a solid job of allowing for customization around alias/multiple emails per domain as well.
2. **Privacy and Security**  — My iCloud account is locked down with Apple’s two-factor authentication, requiring me to confirm on a device to log in. Apple doesn’t scan my emails to show me “relevant” ads, either. So at the end of the day, I trust Apple to manage my data responsibly, for better or worse.
3. **Pricing**  — iCloud+, including iCloud Mail with Custom Domains, is included in any paid iCloud storage plan and uses the storage you’ve purchased. As a 2 TB Family plan subscriber, primarily used for photo storage, email is just included. Cutting out a subscription is a considerable benefit, even if the costs are relatively minimal. Each iCloud+ subscription comes with the ability to host five domains, with three addresses for each, and the ability to share with family members seamlessly.

## The SPAM and the Ugly

![](/post-images/thoughts-on-custom-domains-in-apple-icloud-mail/dkim-alignment.png)

DKIM Alignment Report

1. **Deliverability**  — There are some strange issues with the alignment of signatures for [DKIM](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail), a method used to validate the authenticity of a message. If sending from a device, alignment, and authentication is completely off, according to [MxToolbox](https://mxtoolbox.com/). If sending from iCloud.com, the authentication seems to be in place, but alignment is still off. This is something only Apple can fix. Currently, this means that sometimes messages sent end up in the receiving person’s SPAM folder. Deliverability is the second most important aspect of an email provider (behind security and privacy). This is really hurting my ability to recommend iCloud’s custom email implementation to others confidently. \[*update* As of February 1, DKIM authentication is now aligned\]
2. **Slow Web Interface**  — iCloud.com is a slow, ugly abomination. Email messages can take seconds to load, making the interface all but worthless for triaging when not using the client on a device. The design did get an upgrade recently, but it still doesn’t support threaded messages and is painfully slow to load. This isn’t my primary interface for working with iCloud Mail, so I found it excusable, but I would love to see Apple invest in bringing it up to snuff with the competition.
3. **Search is Broken**  — On-device search is serviceable, but can be slow when scanning older messages only on the server. Web search, the backstop for Gmail/Outlook/Fastmail folks, is an absolute nightmare. There’s no way to search across folders, no type ahead capability, and, of course, a painfully slow interface.
4. **Inconsistent SPAM Filtering**  — I find iCloud’s attempt to filter SPAM comical. A daily newsletter will land in SPAM 70% of the time and the inbox the other 30% with no rhyme or reason. Genuine messages may land in SPAM too, but sometimes end up in the actual inbox. Worst of all, I’ve had three terrible phishing attempts to land in my inbox. After moving them to the SPAM folder or marking them as junk, they seem to disappear, as if Apple realized how dangerous the message really is.
5. **One Mailbox**  — iCloud treats all custom domains as aliases to your iCloud email address. This means you have one monster mailbox for all custom domains configured, any aliases for those domains, and the default iCloud email addresses (@icloud.com). While this is fine for my workflow, I’ve heard others consider this a deal-breaker.

Finally, one last thing to note. A subset of folks believes separating your email address from your Apple ID is a critical security measure. The school of thought follows the logic that if you were to be locked out of your Apple ID, you would be unable to retrieve a code through your email to recover the account. There are two reasons I don’t believe this is a substantial risk. First, when deploying a custom email address, you can, at any moment, move to a new service with no intervention from the existing service. So, for example, if I’m locked out of iCloud, I can log into my domain registrar and move my MX records to a new email service. Second, Apple has deployed several new features, including [social recovery](https://support.apple.com/en-us/HT212513), to help those locked out of an account without resorting to email. I’ve set this up for my family and believe others should as well.

## Conclusion

To wrap, I’m clearly a fan of Apple and trust them with my data. I’m also excited to use my existing iCloud+ subscription to eliminate a dedicated email service subscription. With this in mind, I’m a bit bummed to see Apple missing, or botching, some pretty critical features. However, with their renewed investment in web services and a fresh focus on business and education account management, I’m confident that Apple will iron out many of these issues over the next year. For my use of personal email, I’m fine with iCloud’s shortcomings. If they’re not resolved by next year, though, I’ll likely look elsewhere for my email hosting needs.
