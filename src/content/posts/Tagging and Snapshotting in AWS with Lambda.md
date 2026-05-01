---
type: post
status: published
title: "Tagging and Snapshotting in AWS with Lambda"
description: "Two Lambda functions for AWS housekeeping: propagating EC2 instance tags to attached EBS volumes, ENIs, and snapshots, plus daily volume snapshots with automatic cleanup."
publish_date: 2016-01-16
modified_date: 2022-12-10
source_url: https://empty.coffee/tagging-and-snapshotting-with-lambda/
feature_image: /post-images/tagging-and-snapshotting-with-lambda/feature.jpeg
slug: tagging-and-snapshotting-with-lambda
author: Mike Lapidakis
word_count: 897
tags:
  - empty-coffee
  - published
  - guide
  - development
  - aws
---

# Tagging and Snapshotting in AWS with Lambda

> Two Lambda functions for AWS housekeeping: propagating EC2 instance tags to attached EBS volumes, ENIs, and snapshots, plus daily volume snapshots with automatic cleanup.

*Update \[February 10, 2021\]: The Github community has actively contributed to the below code snippets over the past five years. I’d recommend reading the comments [on the Gist page before](https://gist.github.com/mlapida/931c03cce1e9e43f147b#file-ec2-tag-assets-lambda-py) proceeding with this post. Thank you, Github community!*

---

One of the more challenging aspects to managing a large AWS infrastructure can be tag management for cost allocation and tracking. When you create an EC2 instance, several other assets are created with it, some of which generate charges that should be tracked over time. While keeping an instance’s tags updated is fairly straightforward, ensuring that its EBS volumes, elastic IPs, elastic network interfaces and snapshots stay tagged appropriately can be a real headache.

In my quest to streamline the operations of my clients’ AWS infrastructure using Lambda, I’ve created a Lambda Function that will write and update specific tags from an EC2 instance to that instance’s attached volumes and network interfaces. I have this function’s event set to trigger every hour to ensure the tags stay up to date.

*Active [Gist](https://gist.github.com/mlapida/931c03cce1e9e43f147b#file-ec2-tag-assets-lambda-py)*

```python
from __future__ import print_function

import json
import boto3
import logging

#setup simple logging for INFO
logger = logging.getLogger()
logger.setLevel(logging.ERROR)

#define the connection region
ec2 = boto3.resource('ec2', region_name="us-west-2")

#Set this to True if you don't want the function to perform any actions
debugMode = False

def lambda_handler(event, context):
    #List all EC2 instances
    base = ec2.instances.all()

    #loop through by running instances
    for instance in base:

        #Tag the Volumes
        for vol in instance.volumes.all():
            #print(vol.attachments[0]['Device'])
            if debugMode == True:
                print("[DEBUG] " + str(vol))
                tag_cleanup(instance, vol.attachments[0]['Device'])
            else:
                tag = vol.create_tags(Tags=tag_cleanup(instance, vol.attachments[0]['Device']))
                print("[INFO]: " + str(tag))

        #Tag the Network Interfaces
        for eni in instance.network_interfaces:
            #print(eni.attachment['DeviceIndex'])
            if debugMode == True:
                print("[DEBUG] " + str(eni))
                tag_cleanup(instance, "eth"+str(eni.attachment['DeviceIndex']))
            else:
                tag = eni.create_tags(Tags=tag_cleanup(instance, "eth"+str(eni.attachment['DeviceIndex'])))
                print("[INFO]: " + str(tag))

#------------- Functions ------------------
#returns the type of configuration that was performed

def tag_cleanup(instance, detail):
    tempTags=[]
    v={}

    for t in instance.tags:
        #pull the name tag
        if t['Key'] == 'Name':
            v['Value'] = t['Value'] + " - " + str(detail)
            v['Key'] = 'Name'
            tempTags.append(v)
        #Set the important tags that should be written here
        elif t['Key'] == 'Application Owner':
            print("[INFO]: Application Owner Tag " + str(t))
            tempTags.append(t)
        elif t['Key'] == 'Cost Center':
            print("[INFO]: Cost Center Tag " + str(t))
            tempTags.append(t)
        elif t['Key'] == 'Date Created':
            print("[INFO]: Date Created Tag " + str(t))
            tempTags.append(t)
        elif t['Key'] == 'Requestor':
            print("[INFO]: Requestor Tag " + str(t))
            tempTags.append(t)
        elif t['Key'] == 'System Owner':
            print("[INFO]: System Owner Tag " + str(t))
            tempTags.append(t)
        else:
            print("[INFO]: Skip Tag - " + str(t))

    print("[INFO] " + str(tempTags))
    return(tempTags)
```

Using the tagging Lambda function with a snapshotting function that copies a volume’s tags to all newly created snapshots will ensure your billing reports and charge backs capture all charges associated with running that instance in AWS, nearly automatically.

The following snapshot script also cleans up old snapshot (you can set the offset on line 15). I normally set this function’s event to trigger once a day, during a low transactional point. I also recommend setting the timeout on this function to five minutes, as the cleanup process can to take a very long time, depending on the number of snapshots you keep and the number of volumes you’re snapshotting.

*Active [Gist](https://gist.github.com/mlapida/770aba3ad3be76f6b31f#file-ec2-snapshot-lambda-py)*

```python
import boto3
import logging
import datetime
import re
import time

#setup simple logging for INFO
logger = logging.getLogger()
logger.setLevel(logging.ERROR)

#define the connection
ec2 = boto3.resource('ec2', region_name="us-west-2")

#set the snapshot removal offset
cleanDate = datetime.datetime.now()-datetime.timedelta(days=5)

#Set this to True if you don't want the function to perform any actions
debugMode = False

def lambda_handler(event, context):

    if debugMode == True:
        print("-------DEBUG MODE----------")

    #snapshot the instances
    for vol in ec2.volumes.all():
        tempTags=[]

        #Prepare Volume tags to be imported into the snapshot
        if vol.tags != None:
            for t in vol.tags:

                #pull the name tag
                if t['Key'] == 'Name':
                    instanceName =  t['Value']
                    tempTags.append(t)
                else:
                    tempTags.append(t)
        else:
            print("Issue retrieving tag")
            instanceName = "NoName"
            t['Key'] = 'Name'
            t['Value'] = 'Missing'
            tempTags.append(t)

        description = str(datetime.datetime.now()) + "-" + instanceName + "-" + vol.id + "-automated"

        if debugMode != True:
            #snapshot that server
            snapshot = ec2.create_snapshot(VolumeId=vol.id, Description=description)

            #write the tags to the snapshot
            tags = snapshot.create_tags(
                    Tags=tempTags
                )
            print("[LOG] " + str(snapshot))

        else:
            print("[DEBUG] " + str(tempTags))

    print "[LOG] Cleaning out old entries starting on " + str(cleanDate)

    #clean up old snapshots
    for snap in ec2.snapshots.all():

        #verify results have a value
        if snap.description.endswith("-automated"):

            #Pull the snapshot date
            snapDate = snap.start_time.replace(tzinfo=None)
            if debugMode == True:
                print("[DEBUG] " + str(snapDate) +" vs " + str(cleanDate))

            #Compare the clean dates
            if cleanDate > snapDate:
                print("[INFO] Deleting: " + snap.id + " - From: " + str(snapDate))
                if debugMode != True:
                    try:
                        snapshot = snap.delete()
                    except:

                        #if we timeout because of a rate limit being exceeded, give it a rest of a few seconds
                        print("[INFO]: Waiting 5 Seconds for the API to Chill")
                        time.sleep(5)
                        snapshot = snap.delete()
                    print("[INFO] " + str(snapshot))
```

Using these two function with one another will not only streamline your chargeback and tagging models, but also ensure you have consistent snapshots of all of your instances over time. While I don’t recommend snapshots as your sole backup method, I do recommend keeping at least one per day to accelerate the recovery process if a disaster does occur.

If you’re looking for a solid snapshotting and tagging solution, give these Lambda Functions a try. If you have any questions or suggestions, please leave a comment below or contact me on Twitter. I’m constantly looking for better ways to write and run these functions.
