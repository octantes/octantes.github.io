---
tags: [herramientas, portfolio]
type: dev
title: arch-hud
description: pack de herramientas suckless para convertir arch linux en un heads up display
portada:
date: 2025-09-14
handle: kaste
---

[arch-hud](https://github.com/octantes/arch-hud) es una build personal de herramientas [suckless](https://suckless.org/) para uso diario en arch linux

las herramientas fueron implementadas pensando en el concepto de un *heads up display*
buscando que la pc vuelva a ser una herramienta y deje de ser un agujero negro cognitivo
se implementaron varios parches sobre DWM junto a una estética simple de estilo retro
sin gaps, transparencia ni compositor por defecto; **sin distracciones innecesarias**

para compilar, entrá en cada dir y ejecutá *sudo make clean install* (script pendiente)

[dwm](https://dwm.suckless.org/) - tiling windows manager
[dmenu](https://tools.suckless.org/dmenu/) - menú de scripts dinámico
[st](https://st.suckless.org/) - emulador de terminal simple
[surf](https://surf.suckless.org/) - navegador minimalista
[tabbed](https://tools.suckless.org/tabbed/) - implementa pestañas en la terminal y el browser
[dunst](https://github.com/dunst-project/dunst) - daemon de notificaciones súper simple

podés sumar el compositor [picom](https://github.com/yshui/picom) si experimentás screen tearing