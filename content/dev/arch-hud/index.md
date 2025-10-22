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

construido en base al concepto de un *heads-up display* para hacer que la compu se vuelva a sentir como una herramienta y no un agujero negro cognitivo
implementa varios patches mínimos sobre DWM junto a una estética simple basada en una paleta de ocho colores y fuentes pixeladas

sin gaps, transparencia ni compositor, **sin distracciones** - podés sumar [picom](https://github.com/yshui/picom) si experimentás screen tearing

para instalar simplemente entrás en cada directorio y ejecutá *sudo make clean install* (script para automatizar pendiente)

* [dwm](https://dwm.suckless.org/) - tiling windows manager
* [dmenu](https://tools.suckless.org/dmenu/) - menú de scripts dinámico
* [st](https://st.suckless.org/) - emulador de terminal simple
* [surf](https://surf.suckless.org/) - navegador minimalista
* [tabbed](https://tools.suckless.org/tabbed/) - implementa pestañas en la terminal y el browser
* [dunst](https://github.com/dunst-project/dunst) - daemon de notificaciones super simple