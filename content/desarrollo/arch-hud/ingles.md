---
tags: [tools, portfolio]
type: desarrollo
title: arch-hud
description: suckless tool pack to turn arch linux into a heads up display
portada: portada.png
date: 2025-09-14
handle: kaste
---

*You can find the project repo in my [Github](https://github.com/octantes/arch-hud)*

arch-hud is a personal build of [suckless](https://suckless.org/) tools for daily use on arch

the tools were implemented thinking of building a *heads up display*
aiming to make the computer a tool again instead of a cognitive black hole
several DWM patches were implemented along with a retro-style aesthetic
no gaps, no transparency, no compositor by default; **no unnecessary distractions**


![screenshot](screenshot.png)


to compile, enter each dir and run *sudo make clean install* or use build.sh

[dwm](https://dwm.suckless.org/) - tiling windows manager
[dmenu](https://tools.suckless.org/dmenu/) - dynamic script menu
[st](https://st.suckless.org/) - simple terminal emulator
[surf](https://surf.suckless.org/) - very minimal browser
[tabbed](https://tools.suckless.org/tabbed/) - window tabbing for st and surf
[dunst](https://github.com/dunst-project/dunst) - notification daemon

you can add the [picom](https://github.com/yshui/picom) compositor if you experience screen tearing or glitches
