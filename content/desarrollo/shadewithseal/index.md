---
tags: [herramientas, portfolio]
type: desarrollo
title: shadewithseal
description: playground para programar y grabar fragment shaders GLSL directamente en el navegador
portada: portada.png
date: 2025-07-03
handle: kaste
---

[seal](https://github.com/octantes/shadewithseal) es una herramienta local para *crear, guardar y grabar frag shaders* glsl
no necesita instalación ni internet: solo descargá el HTML y abrilo con el navegador

armado para artistas técnicos que quieran un playground liviano para prototipar
ideal para quienes buscan simpleza y privacidad: no pensado para uso profesional
sin embargo, se cubren algunos edge-cases importantes para asegurar practicidad

toda la información se mantiene en tu máquina, sin cuentas, servidores o syncs
la data *queda en tu browser hasta que la exportás* - hacé backups regularmente

cada release es estable, el objetivo es mantenerlo **simple**: abrilo y programá

*live-coding*: programá shaders GLSL mientras ves los resultados en tiempo real
*renderizado*: render-loop simple y minimal basado en webGL (por ahora solo 1.0)
*compatibilidad*: se implementaron la mayoría de las variables custom de shadertoy
*grabación*: funciones para grabar, reproducir, pausar y descargar el video a webm
*almacenamiento*: todo se guarda dentro del browser cache usando indexedDB
*superligero*: compatible con cualquier navegador, incluyendo móvil; solo ~100 KB

**wip**: webGL2 > export JSON > overlay de canvas + blending modes > aspect ratios

pro-tip: *guardalo como favorito para acceder rápidamente*