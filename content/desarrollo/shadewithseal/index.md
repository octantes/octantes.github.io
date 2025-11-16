---
tags: [herramientas, portfolio]
type: desarrollo
title: shadewithseal
description: playground para programar y grabar fragment shaders GLSL directamente en el navegador
portada:
date: 2025-07-03
handle: kaste
---

[seal](https://github.com/octantes/shadewithseal) es una herramienta local para *crear, guardar y grabar frag shaders* en el browser
no necesita instalación ni tener internet: solo descargá el HTML y abrilo con el navegador

armado para artistas/programadores que quieran un playground liviano para prototipar
ideal para quienes buscan simplicidad y privacidad: no está pensada para uso profesional
sin embargo, se cubren algunos edge-cases importantes

toda la información se mantiene en tu máquina, sin cuentas, servidores o sincronización
la información *queda en tu browser hasta que la exportás* - hacé backups regularmente

cada release es estable, con el objetivo de mantenerlo **simple**: abrilo y empezá a codear

*live-coding*: programá shaders en GLSL mientras ves los resultados en tiempo real
*renderizado*: render-loop simple y minimalista basado en webGL (por ahora solo 1.0)
*compatibilidad*: se implementaron la mayoría de las variables custom de shadertoy
*grabación*: funciones para grabar, reproducir, pausar y descargar el shader a .webm
*almacenamiento*: todo se guarda dentro del browser cache usando indexedDB
*superligero*: compatible con cualquier navegador, incluyendo móvil; solo ~100 KB

**wip**: webGL2 > export JSON > overlay de canvas + blending modes > aspect ratios

pro-tip: *guardalo como favorito para acceder rápidamente*