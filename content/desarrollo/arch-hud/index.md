---
tags: [herramientas, portfolio]
type: desarrollo
title: arch-hud
description: pack de herramientas suckless para convertir arch linux en un heads up display
portada: portada.png
date: 2025-09-14
handle: kaste
---

[arch-hud](https://github.com/octantes/arch-hud) es una build personal de herramientas [suckless](https://suckless.org/) para uso diario en arch

las herramientas fueron implementadas pensando en armar un *heads up display*
buscando que la pc vuelva a ser una herramienta y no un agujero negro cognitivo
se implementaron varios parches sobre DWM junto a una estética de estilo retro
sin gaps, transparencia ni compositor por defecto; **sin distracciones innecesarias**

para compilar, entrá en cada dir y ejecutá *sudo make clean install* o usa build.sh

[dwm](https://dwm.suckless.org/) - tiling windows manager
[dmenu](https://tools.suckless.org/dmenu/) - menú de scripts dinámico
[st](https://st.suckless.org/) - emulador de terminal simple
[surf](https://surf.suckless.org/) - navegador muy minimalista
[tabbed](https://tools.suckless.org/tabbed/) - ventanas para st y surf
[dunst](https://github.com/dunst-project/dunst) - daemon de notificaciones

podés sumar el compositor [picom](https://github.com/yshui/picom) si experimentás screen tearing o glitches