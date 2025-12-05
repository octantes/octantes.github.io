---
tags: [herramientas, portfolio]
type: desarrollo
title: trackwithslate
description: herramienta simple para editar y organizar información tabular CSV directamente en el navegador
portada: portada.png
date: 2025-06-23
handle: kaste
---

[slate](https://github.com/octantes/trackwithslate) es una webapp local para *crear, organizar y exportar data tabular* en el browser
no necesita instalación ni internet: solo descargá el HTML y abrilo con el navegador

armado para tener una forma local y liviana de gestionar data sin dependencias
ideal para quienes buscan simpleza y privacidad: no pensada para uso profesional
sin embargo, se cubren algunos edge-cases importantes para asegurar practicidad

toda la información se mantiene en tu máquina, sin cuentas, servidores o syncs
la data *queda en tu browser hasta que la exportás* - hacé backups regularmente

cada release es estable, el objetivo es mantenerlo **simple**: abrilo y programá

*importar/exportar*: traé y guardá tu información en CSV, un formato plain text
*editar registros*: visualizá, modificá y ordená la tabla con bulk-delete y fuzzy-find
*autocompletado de categorías*: creá botones para llenar entradas rápidamente
*formatos de fecha*: autocompleta con la fecha actual en el formato que quieras
*almacenamiento*: todo se guarda dentro del browser cache usando localstorage
*tipos de datos*: definí columnas con restricciones para tipos de datos específicos
*superligero*: compatible con cualquier navegador, incluyendo móvil; solo ~100 KB

**wip**: campos con subdivisiones simbólicas > dataviz > múltiples databases

pro-tip: *guardalo como favorito para acceder rápidamente*