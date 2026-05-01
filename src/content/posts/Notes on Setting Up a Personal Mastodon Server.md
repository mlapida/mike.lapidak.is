---
type: post
status: published
title: "Notes on Standing Up a Mastodon Server"
description: "A compilation of lessons learned while installing and tuning a small Mastodon server on AWS."
publish_date: 2022-12-11
modified_date: 2023-01-01
source_url: https://empty.coffee/notes-on-standing-up-a-mastodon-server-aws/
feature_image: /post-images/notes-on-standing-up-a-mastodon-server-aws/feature.jpg
slug: notes-on-standing-up-a-mastodon-server-aws
author: Mike Lapidakis
word_count: 1495
tags:
  - empty-coffee
  - published
  - guide
  - aws
  - mastodon
---

# Notes on Standing Up a Mastodon Server

> A compilation of lessons learned while installing and tuning a small Mastodon server on AWS.

In mid-November, numerous folks I follow on Twitter, primarily those in the cybersecurity space, began to flee. This push created a snowball of like-minded tech folks into the [Fediverse](https://fediverse.party/), primarily onto Mastodon servers.

Selecting a server is the first thing a prospective Mastodon user must do to post and interact. Servers, [like the one the cybersecurity crowd joined](https://empty.coffee/notes-on-standing-up-a-mastodon-server-aws/infosec.exchange/), tend to be focused on a specific domain. Performance, security, community, and moderation are critical elements to consider while finding a server. Expecting someone to run a server on donations, forever, and expecting community members to volunteer to moderate content is a steep ask. If any of these things aren't done correctly, other servers in the Fediverse may choose to block yours, called defederation.

With this in mind, I decided to build and host a small personal Mastodon server. This allowed me to control the above considerations, and ensures that as long as I'm paying the hosting bill, my account will stay online.

The process started easily enough, using the [Digital Ocean image](https://docs.digitalocean.com/products/marketplace/catalog/mastodon/) to quickly stand up a small server. It's a great option, but I wanted to learn how Mastodon works, feel comfortable maintaining it over the long run, tune it to my liking, and more. This led me to [install a server from source](https://docs.joinmastodon.org/admin/install/) on AWS. This post contains my notes on hosting [this server](https://lap.social/@mike), along with a preview of the costs so far.

## Lessons Learned

A quick hit list of lessons learned:

- Don't start with an instance that has less than 2 GB RAM. You won't get through the setup.
- If you're running a smaller instance (< 4 GB RAM), [set up a swap](https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04) file.
- If you're using Cloudflare as a CDN, do not [auto-minify files](https://support.cloudflare.com/hc/en-us/articles/200168196-Using-Cloudflare-Auto-Minify). Minifying the files causes them to fail the integrity check from Mastodon, and the website won't load.
- [Relays](https://joinfediverse.wiki/index.php?title=Fediverse_relays&mobileaction=toggle_view_desktop) add activity, cost, and risk. Choose them wisely.

## Compute Setup

![A Datadog dashboard of my server, lap.social](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-17.12.43@2x.png)

A Datadog dashboard of my server, lap.social

Mastodon requires four services to run; the web server (nginx & Ruby), the database (PostgreSQL), a background process handler (Sidekiq), and a caching layer (Redis). Running all four of these on a single server requires adequate resources. In cloud terms, I found the minimum to get the performance I wanted was 2 vCPU and 2 GB RAM.

On AWS, I selected a `t4g.small` running the arm variant of Ubuntu 22.04 in `us-west-2`. Even with 2 GB of memory, the setup required a swap file for the more memory intensive operations, like [building the site for the first time](https://docs.joinmastodon.org/admin/install/). Running out of memory while building Mastodon is frustrating, and not obvious. It's best to [set up the swap](https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04) as soon as the server launches.

For storage, since most of the media will be hosted on S3, I'm opting for a 30 GB GP3 EBS volume.

## Media Setup

With AWS selected as the cloud provider, and the initial server online, I decided to configure media storage on S3 and CloudFront. This reduces the load on my small server and improves performance. I found [a solid blog post](https://stanislas.blog/2018/05/moving-mastodon-media-files-to-wasabi-object-storage/) on how to migrate to S3 after initial setup.

![](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2023-01-01-at-09.17.15@2x.png)

CloudFront data transfer over 30 days

There are undocumented configuration options that are critical to setting this up correctly. First, you'll want to configure S3 and CloudFront to use the [origin access identity](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html), and block public access. Mastodon's default S3 configuration writes objects with a “public” ACL. To take advantage of origin access identity and a locked down bucket, you'll need to add `S3_PERMISSION=private` to the Mastodon configuration file; a not-so-obvious addition.

![CloudFront data transfer over 30 days](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-10.09.22@2x.png)

CloudFront data transfer over 30 days

With this, all media for my instance is delivered from CloudFront. CloudFront has a fantastic “ [free tier](https://empty.coffee/notes-on-standing-up-a-mastodon-server-aws/aws.amazon.com/free) ” that provides one terabyte of egress traffic each month for free, forever. My little server is well within this threshold.

![A screenshot of S3 storage over time](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-10.11.00@2x.png)

S3 Storage

There's a direct correlation between the number of relays added and the people you follow, with the storage used. With a [fairly active relay server](https://relay.fedi.tools/app/) added to my setup, and a 3-day retention period for media configured, S3 averages 55 GB of media files stored.

![A screenshot of the media retention settings in Mastodon 4.x](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-10.14.42@2x.png)

The media retention setting found in Mastodon 4.x

Finally, set up the retention rules from the Server Settings page. The default retention period is 7 days, and may result in higher storage charges based on volume. I chose three days for my configuration.

## Security

Hosting a chatty server on the internet is a risky proposition. Ports left open will be probed, nefarious actors will look for vulnerabilities in the application, attacks will happen. There are a few basic things you can do to protect your server.

![](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2023-01-01-at-09.16.02@2x.png)

A screenshot of the Cloudflare analytics dashboard

First, if you're running on AWS, use an [IAM instance profile](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html) instead of storing IAM credentials in the Mastodon configuration file. This is something that, at first, is not obvious as all the sample configuration files show credentials stored in plain text. In practice, you can use an instance profile and forgo the static credentials. You'll also want to make sure the IAM policy is limited to the specific bucket you're using.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "0",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": ["arn:aws:s3:::{bucket-name}"]
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": ["arn:aws:s3:::{bucket-name}"]
        }
    ]
}
```

An example IAM policy for least privileged access to an S3 bucket

Second, lock down the server. Use [Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html), along with the IAM instance profile, to manage the server. With this setup, you won't need port 22 open on the security group and have one less surface to attack.

![A screenshot of the Cloudflare analytics dashboard](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-17.29.32@2x.png)

A screenshot of the Cloudflare analytics dashboard

Third, use a CDN that provides distributed denial of service (DDoS) protection. [Cloudflare](https://www.cloudflare.com/) is a robust, free solution that will work wherever your server is hosted. Along with DDoS protection, Cloudflare provides a free web application firewall (WAF) and the ability to configure WAF rules, such blocking specific countries.

Finally, disable version one of the [metadata service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) on the EC2 instance (IMDSv1) in favor of [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html). It's easiest to do this while launching the instance, though you can also do it after launch with a few CLI commands. Disabling IMDSv1 means all requests to the local metadata service on the EC2 instance require signing.

As a bonus, if you're using Cloudflare, you can lock the instance down further using a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps). Cloudflare Tunnels use a local agent to proxy traffic from the server to Cloudflare's points-of-presence without the need to expose ports or IPs addresses. With both a Cloudflare Tunnel and AWS Systems Manager Session Manager configured, the security group can be completely closed. I discuss this concept on my [Home Assistant Zero Trust post](https://empty.coffee/home-assistant-cloudflare-zero-trust-setup/).

## Moderation

On large instances, moderation can be a full-time job (or several volunteers full-time job). As a small, single-user server, this isn't much of a concern for the content I host. Where things get tricky is when connecting to relays.

A relay acts as a gateway to other servers. If you subscribe to a relay, all of your posts will publish to all other members of the relay. Inversely, everything published by the other participating servers is sent to yours. This provides amplification of your posts and additional activity, such as trends and hashtag follows, from others.

The more active a relay, or the more relays added, the more active the federated feed will be on your server. The risk is that not all relays moderate who can subscribe and participate. This means that you may find content in your federated feed, and subsequently stored in your S3 bucket, that is not pleasant.

![](/post-images/notes-on-standing-up-a-mastodon-server-aws/CleanShot-2022-12-10-at-12.23.27@2x.png)

The Mastodon setting for blocking a server

Defederating servers is the number one form of moderation you'll need to perform as a small server administrator. The easiest way to do this is by taking a look at other servers “about” pages, where they may list the servers they've blocked (called “moderated servers”). It's best to get ahead of this before it becomes a problem.

## Cost

The following is a breakdown estimate of my costs:

- *Compute* – `t4g.small` in `us-east-2` & 30 GB gp3 = $14.66
- *Storage* – S3 55 GB/month = $5.32
- *Transit* – CloudFront 1 TB/month = free

You can reduce the price further by committing to a year of EC2 through a [compute savings plan](https://aws.amazon.com/savingsplans/compute-pricing/). This will cut the monthly cost to for compute to around $10.

## Closing

Wrapping up, building a Mastodon server and running into some rougher edges has given me the opportunity to learn a few of the more nuanced elements of hosting the application. Interacting with the Mastodon admin community (#mastoadmin) has also introduced me to some really great, like-minded folks. I've enjoyed learning how to install, tune, and operator Mastodon, and look forward to continuing to learn from the community and share what I find along the way.

## Additional Resources

Adding a list of other great articles for those Mastodon Admins:
