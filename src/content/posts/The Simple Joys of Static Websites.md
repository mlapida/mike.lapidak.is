---
type: post
status: published
title: "The Simple Joys of Static Websites"
description: "Learning to embrace simplicity and bask in the speed of static websites with Gatsby"
publish_date: 2021-02-14
modified_date: 2022-12-10
source_url: https://empty.coffee/simple-joys-static-sites/
slug: simple-joys-static-sites
author: Mike Lapidakis
word_count: 1368
tags:
  - empty-coffee
  - published
  - guide
  - serverless
  - gatsby
  - aws
  - website
---

# The Simple Joys of Static Websites

> Learning to embrace simplicity and bask in the speed of static websites with Gatsby

I’ve maintained a website for nearly fifteen years. These sites started as slow WordPress blogs on shared servers and progressed over the years to managed solutions like Squarespace. I don’t update my site often, and never loved the idea of paying for dynamic websites that relied on relational databases to serve something that receives as little traffic, and changes as infrequently as my personal site.

I briefly experimented with a simple static HTML site, but found the site didn’t perform as well due to the lack of image optimization and dynamic loading. As I’m not a web developer by trade, my designs always suffered from optimization and performance limitations. I hosted the site on [GitHub Pages](https://pages.github.com/), and felt that, performance withstanding, the static site was the best solution for my purposes.

The past ten years have seen an increase in static site generating frameworks. These are programs that turn text files and templated HTML/JavaScript into an optimized static site ready to be deployed to any service that can serve objects. Static site generators started fairly straightforward, with apps like [Jekyll](https://jekyllrb.com/) able to quickly built HTML and the corresponding assets. Recently, thanks to the popularity of serverless architectures and next-generation front-end frameworks such as [React](https://reactjs.org/), a new breed of static site generator has emerged.

For this site, and my other [personal site](https://mike.lapidak.is/), I’ve landed on [Gatsby](https://www.gatsbyjs.com/) as my preferred static site generating engine. Gatsby, and others like it, create sites optimized for speed, backed by [GraphQL](https://graphql.org/) to dynamically load the static content. This creates a blazing fast website that costs nearly nothing to maintain. The communities that have emerged around these frameworks have also provided a way to learn, and a quick on ramp through templates designed by professionals.

## Why Static

While experimenting with a few different static site generators, I’ve observed a number of very real advantages to running a static site for personal use.

1. **Cost:** Static site generates shift the computational requirements of running a site from the servers that host the content to a build pipeline. Rather than requiring each request to a website to run a series of database queries to dynamically build a page for each request, static sites create all pages when a change occurs to the content, and distribute the static version of these pages to a storage service, such as [Amazon S3](https://aws.amazon.com/s3/), that can host the content. As websites are generally small, and object storage services capable of hosting are relatively inexpensive ($0.023/GB), maintaining a website can be nearly free.
2. **Performance:** Removing those database transactions also improves performance. A WordPress site, that you host yourself, will dynamically generate each page when a user navigates to it. This dynamic page generation is wasteful for most websites that don’t often change, or don’t require customization based on the user. This waste comes in the form of running a server required to perform the dynamic operations, but also the time it takes to serve the content to the end user. Static site generators create assets that are happily distributed to Content Delivery Networks (CDNs) to accelerate site loading times. The difference for users is truly staggering.
3. **Maintenance:** Servers require maintenance, including patching, tuning, and configuration. If you’re only posting a few times a year, logging in to patch and maintain each month can be a real burden. You’ll also have to back up your servers regularly to protect against disruption. It’s not just the servers, either. If you’re running in the cloud, you’ll likely need to configure the network and the firewall as well. With static sites, there’s no server to patch as the files are hosted and served through completely managed services.
4. **Security:** Servers require patches, and when you neglect to patch you run the risk of a malicious party taking over your site. Couple this with attack vectors that exist through the Content Management System, such as WordPress and its plugins, and the network hardening required to run a public website yourself, and the time commitment begins to stack up. You can, of course, opt for a fully managed hosting service for a fee. Static sites don’t have any entry points for a malicious party to exploit. The underlying managed service is ultimately responsible for securing the infrastructure.
5. **Portability:** Moving a server is a lot of work. Believe me, it’s what I do for a living. You can’t simply download a server and move it to a new cloud provider to get a better price or improved performance. With static sites, the static assets can be quickly deployed to new services with little configuration changes required. Build services read universal config files to get started quickly. Static sites provide the ultimate cloud-agnostic, portable solution.

## How to Get Started

As you can probably tell, I’m passionate about this shift to static sites. I’ve experienced the performance improvements while seeing my operation and maintenance costs plummet. Coupled with new frameworks that optimize the static assets for hyper fast distribution, and an ecosystem of build pipelines and there’s never been a better time to get started. Here’s what I’d recommend.

1. **Choose a Framework:** There are a ton of frameworks out there, with more popping up every day. For a directory to help get you started, check out [Jamstack](https://jamstack.org/). I’d recommend starting by selecting a templating language you’re familiar with or aspire to understand better. If you want to get started quickly, take a look at the available community developed templates for each framework as well.
2. **Create a Repository:** Log into GitHub or BitBucket and create a git repository to store the source code for your site. The repository will host the site’s source code, ready for processing and distribution. The repo will also automatically trigger a build when new code is committed. You can connect this repo to an iPad or multiple laptops to make deploying from anywhere easy. A centralized repo also makes collaboration possible.
3. **Select a Build Environment:** There are a few different ways to build your static site. You can choose to run the build entirely offline, using the framework’s CLI to generate the static assets. While this is one approach, it requires that you always deploy from the same computer/laptop. I prefer one of the many cloud-hosted code deployment services, such as [Netlify](https://www.netlify.com/), [AWS Amplify](https://aws.amazon.com/amplify/), or [Vercel](https://vercel.com/). You can also find build environments specific for the framework selected, such as [Gatsby Cloud](https://www.gatsbyjs.com/cloud/). These services let you build and run your site, and are also free for smaller sites such as this one.
4. **Deploy and Host:** Many build environments, such as Netlify, can handle the hosting of the site along with the build. If you’d prefer to build locally, or choose an agnostic build pipeline such as Jenkins, you may also need to select and configure a place to host your site. Most of the major cloud providers, including AWS, have static website hosting (on AWS, this is [through Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)) and Content Delivery Networks.
5. **Connect Your Domain:** Finally, you’ll want to make the site your own. Purchase a domain and point it to your hosting provider. If you choose to host through AWS Amplify or Netlify, you can even deploy an SSL certificate for free.

And with that, you’re up and running. There’s a bit of work to get it going, but once configured your static site will live on with little required maintenance from you. When you want to update the site, simply update the source code, run the framework’s CLI to test the changes, and push the new code to your repo. The build pipeline will take it from there.

## The Wrap

In closing, for most personal sites with infrequent updates, static sites provide a relatively inexpensive and performant option. These sites are happy to run for years with little maintenance, and the portability provides an easy option for moving if prices changes. Finally, the lack of a server to secure reduces the attack vector, preventing your personal brand from being dragged through the mud by some script kiddy. In my limited time running static sites on serverless infrastructure, I’ve been blown away by the performance and have had a blast learning this new generation of frameworks and tools.
