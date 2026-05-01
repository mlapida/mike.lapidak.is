---
type: post
status: published
title: "Photo Backup Bakeoff: PhotoPrism vs Immich"
description: "Which self-hosted photo and video platform is right for you? PhotoPrism and Immich both offer robust open source options for backing up, searching, and sharing your photographs on your own hardware. This is a review of the two options, from first hand experience."
publish_date: 2023-11-21
modified_date: 2023-11-22
source_url: https://empty.coffee/photo-backup-bakeoff-photoprism-vs-immich-review/
feature_image: /post-images/photo-backup-bakeoff-photoprism-vs-immich-review/feature.png
slug: photo-backup-bakeoff-photoprism-vs-immich-review
author: Mike Lapidakis
word_count: 2579
tags:
  - empty-coffee
  - published
  - review
  - photography
  - homelab
  - immich
  - photoprism
---

# Photo Backup Bakeoff: PhotoPrism vs Immich

> Which self-hosted photo and video platform is right for you? PhotoPrism and Immich both offer robust open source options for backing up, searching, and sharing your photographs on your own hardware. This is a review of the two options, from first hand experience.

I enjoy taking photos. Whether of my family, the places I visit, or outdoor activities; capturing memories is one of my favorite past times. So much so, in fact, that I've accumulated nearly 100,000 photos and videos taking up nearly 1.6 TB of storage space. This footprint makes moving photos around challenging, and makes data loss a top concern for me. These photos and videos are one of my most prized possessions.

I'm bought into the [Apple](https://empty.coffee/tag/apple/) ecosystem, and as such, I use iCloud as my primary photo and video storage solution. I appreciate the privacy and security features of iCloud, and the integration into the iPhone's camera roll makes it a no-brainer for those of us who take too many pictures. The introduction of [shared libraries](https://support.apple.com/en-us/HT213248) last year was also a massive addition, as my wife and I can now keep a single version of each asset backed up.

It's not enough, though, to have a copy of all of these photos stored in the cloud. For something as valuable and important as memories, a good backup strategy is critical. For this, I've opted for something on my home network, running in my basement, in my home lab. I have a Synology NAS with 12 TB of storage, and a small 12th generation Intel NUC server with integrated graphics and 32 GB of memory for hosting the software.

I set out searching for a self-hosted photo solution earlier this year, shortly after setting up the NUC.

My criteria:

- **Seamless backup –** I need a solution that automates the backup process. I know, after the first month, I won't want to tweak, tune, or manually trigger a backup. The solution requires a good app or process.
- **Organization –** The solution must have some way to organize and discover assets. Machine learning tags, such as objects and people, are a plus but not required. File system-level organization is a requirement, though. The assets should be moved into a storage structure that makes finding assets natural.
- **Security –** The solution should incorporate up-to-date security best practices. Ideally, this means using an external identity provider (OIDC), but at minimum it should have multifactor authentication.
- **Performance –** The solution should be responsive. Running in a container on my NUC server means this setup will have far more resources than many others running this software.
- **Sharing –** While not a dealbreaker, it would be fantastic if I can share assets publicly right from the service, without needing to send them somewhere else. I use Cloudflare Tunnels to make the service publicly accessible with a domain.
- **Active development –** The project backing the service should be under active development. I would rather not invest my time and resources setting something up only to find it out of development. I'd also really like a way to support the developers.
- **Open source –** Finally, I'd like the solution to be open source. While solutions like Synology Backup do a good enough job, the closed source nature and reliance on under powered NAS hardware makes the solution not ideal.

With these criteria in mind, I set out to find a short list of solutions to test. Two projects consistently bubbled to the top; [PhotoPrism](https://www.photoprism.app/) and [Immich](https://immich.app/).

### Summary

Sharing the good stuff up front, as this is a long one.

|  | **PhotoPrism** | **Immich** |
| --- | --- | --- |
| **Backup** | Third-Party App Required | Native App |
| **Organization** | Great | Great |
| **Security** | No OIDC/MFA | OIDC |
| **Performance** | Good | Great |
| **Sharing** | Yes | Yes |
| **Active Development** | Slow/Methodical | Rapid |
| **Open Source** | GNU | MIT |

## PhotoPrism Review

![A screenshot of PhotoPrism](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-09.33.03@2x.png)

The PhotoPrism homepage

I started using PhotoPrism in April, configuring the app to run within Docker on the NUC server with thumbnails and converted assets hosted on the local SSD, and original assets stored on the NAS. PhotoPrism converts nearly everything (HEIC, RAW, and most video formats), so having fast access to writable storage was important for performance.

PhotoPrism is a progressive web app (PWA), with no native apps in development. This means all image uploads and backups occur over the WebDAV endpoint PhotoPrism hosts.

### Backup

You can interact with PhotoPrism through WebDAV. Mounting a drive is easy, and you have some customization at your fingertips. For my setup, I wanted an “import” folder where I can dump the assets, and from there PhotoPrism can take over.

For backing up resources from my phone, I used [PhotoSync](https://www.photosync-app.com/home), a third part application that supports PhotoPrism's WebDAV setup and automate the backup process. There are layers of settings in PhotoSync, with an ability to set up different endpoints based on the type of sync you want to perform. For this, I set up a local endpoint when on my home network to reduce sending the assets out to the internet.

### Organization

PhotoPrism excels at organization. There are two approaches to file level organization; keep the assets in their original folder structure or move the assets into a folder structure of your choosing. For my setup, I opted to move the assets into a clean, date driving folder structure on my NAS.

In addition, the mountable WebDAV endpoints mean accessing assets from outside the application is straightforward. Couple this with the folder configuration, and locating resources is easy.

Within the application, PhotoPrism takes a more traditional approach. Assets appear in a list, sorted by the selection at the top. There is no “timeline”, like you would find in Google Photos, so locating assets on a specific date requires a search. The web app does provide automatic photo stacking for bursts and RAW sidecars, which is a benefit over Immich, for now.

PhotoPrism bills itself as “AI-drive”, though in my experience I've found these features lacking. Face recognition is terrible. Many faces aren't recognized, and grouping photos is hit or miss. For example, photos of my wife, one of the most common subjects in my photos, are rarely tagged correctly. Beyond faces, object tagging is nearly worthless, with inconsistent results. For both faces and objects, I've noticed material discrepancies in tagging accuracy between nearly identical photos. I would not select PhotoPrism for face or object tagging.

### Security

![A screenshot of the PhotoPrism login screen](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-09.30.41@2x.png)

The PhotoPrism login page

PhotoPrism currently has basic, form-based authentication. There's no multifactor authentication, and the roadmap has included OpenID Connect (OIDC) for ages. The application is also single user, with no concept of multiple users with unique libraries (you can create users, but they all share on library). For many, seeing the lack of OIDC and multifactor authentication may be enough to look beyond PhotoPrism.

If you subscribe to their [Plus membership](https://www.photoprism.app/editions), you'll unlock additional web security features, though most of these can be added for free when using something like Cloudflare.

### Performance

In my experience, on a moderately well-equipped system and an optimized configuration, performance is fine. While initial loading is adequate, many user-initiated write operations, such as face matching, can cause things to hang for up to a minute. Adding photos to an album is also not the speediest. When importing new photos through WebDAV, it can take quite a while to trigger, convert, index, and tag the assets. Indexing a large library will take days, if not a week to complete on larger setups.

Before running it on the NUC server, I tried to run PhotoPrism from a container on my Synology NAS. It was nearly unusable. If you're considering PhotoPrism with a large library, I'd recommend at least 16 GB of memory and an integrated graphics card with hardware acceleration configured. A local SSD for caching thumbnails is also a plus.

### Sharing

![A screenshot of an album in PhotoPrism](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-10.12.27@2x.png)

An album view in PhotoPrism

There are two ways to share photos through PhotoPrism. If you have a route exposed and a domain attached, you can create a link to share with the world. Alternatively, you can use the share function to send the photos to another WebDAV endpoint for sharing. The albums themselves are basic, but fine.

You can check out a [test shared album here](https://photos.down.house/s/2gf2406hy2/camping-2023).

### Active Development

PhotoPrism is, indeed, under active development. There is a [roadmap](https://github.com/orgs/photoprism/projects/5), which includes features like multiple libraries and OIDC. Unfortunately, this development is extremely slow. Some features, such as OIDC, are coming up on their third anniversary on the roadmap. For many, this methodical, intentional, slow development won't be an issue, especially for a home lab service for backing up photos.

### Open Source

PhotoPrism is, indeed, [open source](https://github.com/photoprism/photoprism) with a GNU Affero General Public License. While open source, some features (like the advanced web security mentioned above) are locked behind membership tiers, intended to help fund the development of the application. The shift to locking features behind a paywall soured many, though I understand the need to help incentivize development.

I am a paying Pro member.

### Conclusion

PhotoPrism was a challenge to set up, with a plethora of settings that must be tweaked to get things working as you'd expect. Performance is also below average for a self-hosted solution, with significant resource requirements for large libraries. The AI features leave quite a bit to be desired, with mixed results across the board.

Wheat PhotoPrism lacks in AI capabilities, it makes up for in its standards-driven approach to asset management. I've come to love the WebDAV support, especially for accessing videos when editing. With that, I really wish there was a native web app.

## Immich Review

![A screenshot of the main Immich timeline](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-10.02.21@2x.png)

The Immich photo timeline

I first came across Immich in April when I began setting up PhotoPrism. At the time, many of the key features, such as face recognition, were missing from the new service. With a banner at the top warning prospective users about rapid breaking changes, I opted to wait a few months for things to settle down. Since then, the team has shipped many features to close the gap between the two services. As of this writing, I would say Immich has surpassed PhotoPrism in feature set.

### Backup

Immich takes an app-first approach to back up. There are [official mobile apps](https://immich.app/docs/features/mobile-app), and a [CLI tool](https://immich.app/docs/features/command-line-interface) for those that are looking for a way to automate large imports. There's even a relatively simply [Python example](https://immich.app/docs/guides/python-file-upload) for scripting imports and backups.

In my first few weeks running Immich, I've found the mobile app a bit lacking for the initial import, though it does a fantastic job at backing up newly captured photos and videos. When trying to back up ~40k assets, I've found the app regularly hanging and running into issues. From what I can tell, this is the result of assets offload to iCloud, and requiring a re-download.

I was able to bulk load ~40k assets from the NAS using the CLI. This process was relatively easy, and I can imagine scripting a similar solution for quickly uploading assets from an SD card after a trip or holiday. I appreciate that the CLI compares GUIDs of assets before starting the upload.

### Organization

![A screenshot of the admin panel in Immich](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-12-at-17.57.14@2x.png)

A peek at the administrative settings

Immich has a robust storage templating engine that is used to customize the folder structure and file naming for uploaded assets. I really appreciated the customization here, and the transparency. If an adjustment to the template is made, a storage migration job will handle the heavy lifting of moving and re-mapping assets.

From the UI, Immich focuses on a timeline view, organizing everything by date similar to Google Photos. I find this very intuitive, and it makes quickly scrolling through the timeline to find a photo simple. At the top of the timeline, you’ll find “memories” with collections of photos from years past.

Tagging seems to work well, along with the face recognition features. I’ve found face recognizing nearly on par with Apple or Google’s, which is impressive when considering the hardware I have it running on. On of my favorite features of the photo recognition service is the ability to add the person’s birthday, which then displays their age when the photo was taken. It’s a fun little addition that makes those “how old were we?!” chats with friends a bit easier to answer.

One downside I’ve observed is the lack of RAW photo stacking. When uploading RAW assets, they will be displayed alongside JPEG. Immich has limited RAW conversion support for thumbnails, so some file types, like those generated by Fuji cameras, are displayed as broken images.

### Security

![A screenshot of the Immich login page with Authentik OIDC configured](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-09.31.20@2x.png)

The Immich login page with OIDC configured

Immich offers OIDC out of the box. I’ve configured my instance to use Authentik as the provider, and it has worked flawlessly so far. In addition, it provided the option to completely remove the password authentication from the UI. I feel this is a good solution, as it removes the risk of a bug in the login form resulting in exposure.

### Performance

I’ve been extremely impressed by the performance of Immich. The web app is fast, and adding new assets is as quick as you’d imagine. One fundamental advantage is Immich’s decision to use configurable, parallel jobs to tag and process new assets. I’ve found this process much more intuitive, and resilient, than the linear processing queue with automatically triggered processing that PhotoPrism adopted.

I’ve noticed that there is no configuration option for storing thumbnails, as they are automatically stored in the same directory as the original assets. With the NAS setup that I have, I assumed this would cause performance issues, but so far it is working flawlessly.

### Sharing

![A screenshot of an album in Immich](/post-images/photo-backup-bakeoff-photoprism-vs-immich-review/CleanShot-2023-11-21-at-10.08.26@2x.png)

An album in Immich - looks like Google Photos to me

Immich provides a sharing experience more akin to Google Photos than a file storage app. Albums can have additional information, formatted titles, and include geolocation information. In my experience, the sharing experience feels natural and performs as you’d expect.

You can find a [sample album here](https://immich.down.house/share/ug8V2gyFSQo0ar-h2LacebPQ9m1n9TVsJhyHMg4sOiiCcdPn58HLerg_qYTICA8ZxgE).

### Active Development

Immich is under extremely active development, and I don’t say that lightly. There seems to be a new release every few days, and the [milestone timeline](https://immich.app/milestones) shows regular, major updates over the past year and a half.

I personally appreciate this development cycle. It can cause a bit more work, as the mobile app and server must run on the same version, but the new features make it worthwhile.

### Open Source

Immich is open source under the MIT license. There are no features or functions locked behind a paywall, and the roadmap and issues are all managed through GitHub.

### Conclusion

I really enjoy setting up and using Immich. Most settings are managed through the web UI, the mobile apps are solid, the CLI is a great addition, and the machine learning and organizational capabilities are nearly on par with those built into Google Photos. Performance is also snappy, and the active development gives me the confidence that this project will be around for a while.

The only downside that I’ve observed is the challenge of moving photos in through the app when photos are backed up to iCloud. Downloading the originals takes time, and stalls often.

---

## Wrapping up

In summary, I’ve found that both PhotoPrism and Immich are sufficient for backing up photos from Google or Apple (or any other hosting provider). While their approach to backing up differs dramatically, both applications can provide an option to storing your memories on hardware you own.

The distinguishing factor may be whether you chose to use a cloud provider at all. If you do, you’ll find both solutions sufficient. If you are looking for a complete replacement of a cloud hosted option, and you’re ok with a project under active development, then Immich is the best solution.

For me, I’ll continue to run both, but am confident that Immich will ultimately win me over.
