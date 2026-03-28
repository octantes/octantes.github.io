---
tags: [herramientas, portfolio]
type: desarrollo
title: browsewithscroll
description: herramienta para previsualizar fuentes y multimedia con scroll directamente en el navegador
portada: portada.png
date: 2026-03-05
handle: kaste
---

*You can find this project in english in my [Github](https://github.com/octantes/browsewithscroll)*

scroll es una herramienta local para **previsualizar colecciones de fuentes y multimedia**
no necesita instalación ni internet: solo cloná el repo y ejecutá el script "launch.sh"

armado para diseñadores y creadores que necesiten una forma rápida de buscar recursos
ideal para quienes buscan simpleza y privacidad: no pensado para workflows complejos
sin embargo, por lo liviano que es, se encarga de directorios enormes sin problemas

toda la información se mantiene en tu máquina, sin cuentas, servidores o syncs
la herramienta *se salta el CORS al usar scripts* para "bakear" la lista de archivos

![screenshot](preview.gif)

cada release es estable, el objetivo es mantenerlo **simple**: abrilo y scrolleá

*cero dependencias*: sin librerías, los scripts usan solo herramientas estándar unix
*font-viewer*: previsualizá archivos .ttf, .otf y .woff con render de lorem ipsum
*multimedia*: soporte para formatos de imágenes comunes y videos (mp4, webm, ogg)
*launch y sync*: el script launch.sh actualiza la lista de assets y abre scroll
*modo shuffle*: explorá tu colección de forma aleatoria o en orden secuencial
*serverless*: funciona directamente vía protocolo file:// sin usar servidores
*hiperligero*: overhead mínimo para mantener la fluidez con miles de archivos

**wip**: modo grilla > texto personalizable > display de metadata básica > sistema de tags

recordá que los archivos nuevos **no se muestran hasta que volvés a correr el launcher!**

pro-tip: *guardalo como favorito para acceder rápidamente*
