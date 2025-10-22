---
tags: [herramientas, portfolio]
type: dev
title: shadewithseal
description: playground para programar y grabar fragment shaders GLSL directamente en el navegador
portada:
date: 2025-07-04
handle: kaste
---

[seal](https://github.com/octantes/shadewithseal) es una herramienta local para crear, guardar y grabar fragment shaders GLSL directamente en el navegador
no necesita instalarse ni una conexión a internet: solo descargá el HTML y se va a abrir como si fuera una página web normal

armado pensando en artistas y programadores que necesiten un playground liviano para prototipar y archivar shaders
ideal para quienes prefieren simplicidad y privacidad; no está pensada para uso profesional, pero se cubren algunos edge-cases

toda la información se queda en tu máquina, sin cuentas, servidores o sincronización: solo recordá exportar frecuentemente

**seal** es estable y funcional, con el objetivo de mantenerse minimalista: abrí el HTML y empezá a programar

* *live-coding*: programá fragment shaders GLSL mientras ves los resultados en tiempo real con logs de errores en el canvas
* *renderizado*: render-loop simple y minimalista basado en webGL - implementa la mayoría de las variables custom de shadertoy
* *grabación*: funciones para grabar, reproducir, pausar y descargar el shader a .webm con solo un clic (aspect ratio fijo 1:1)
* *almacenamiento*: organizá los shaders en carpetas y guardalos directamente en el browser usando indexedDB
* *superligero*: compatible con cualquier navegador moderno, incluyendo móvil, pesando solo ~100 KB

**wip**: soporte para webGL2 > export de indexedDB a JSON > superposición de canvas y blending modes > aspect ratios ajustables

recordá que **toda la información se queda en tu browser hasta que la exportás** - hacé backups regularmente

pro-tip: *guardá como favorito para acceder rápidamente*