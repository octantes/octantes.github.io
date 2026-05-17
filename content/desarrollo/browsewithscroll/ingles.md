---
tags: [tools, portfolio]
type: desarrollo
title: browsewithscroll
description: tool to preview fonts and multimedia with scroll directly in the browser
portada: portada.png
date: 2026-03-05
handle: kaste
---

*You can find the project repo in my [Github](https://github.com/octantes/browsewithscroll)*

scroll is a local tool to **preview font and multimedia collections**
no installation or internet needed: just clone the repo and run the "launch.sh" script

built for designers and creators who need a fast way to browse resources
ideal for those seeking simplicity and privacy: not meant for complex workflows
however, being so lightweight, it handles huge directories without issues

all information stays on your machine, no accounts, servers or syncs
the tool *bypasses CORS by using scripts* to "bake" the file list

![screenshot](preview.gif)

each release is stable, the goal is to keep it **simple**: open it and scroll

*zero dependencies*: no libraries, scripts use only standard unix tools
*font-viewer*: preview .ttf, .otf and .woff files with lorem ipsum rendering
*multimedia*: support for common image formats and videos (mp4, webm, ogg)
*launch and sync*: the launch.sh script updates the asset list and opens scroll
*shuffle mode*: explore your collection randomly or in sequential order
*serverless*: works directly via file:// protocol without using servers
*hyperlight*: minimal overhead to maintain fluidity with thousands of files

**wip**: grid mode > customizable text > basic metadata display > tagging system

remember new files **won't show until you run the launcher again!**

pro-tip: *save it as a bookmark for quick access*
