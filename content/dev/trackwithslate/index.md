---
tags: [herramientas, portfolio]
type: dev
title: trackwithslate
description: herramienta simple para editar y organizar información tabular CSV directamente en el navegador
portada:
date: 2025-07-04
handle: kaste
-------------

[slate](https://github.com/octantes/trackwithslate) es una herramienta local para *crear, organizar y exportar data tabular* en el browser
no necesita instalarse ni una conexión a internet: solo descargá el HTML y se va a abrir como si fuera una página web normal

armado pensando en personas que necesitan una forma local y liviana de gestionar data personal sin dependencias externas
ideal para quienes prefieren simplicidad y privacidad; no está pensada para uso profesional, pero se cubren algunos edge-cases

toda la información se queda en tu máquina, sin cuentas, servidores o sincronización: solo recordá exportar frecuentemente

**slate** es estable y funcional, con el objetivo de mantenerse minimalista: abrí el HTML y empezá a trackear

* *importar/exportar*: traé y guardá tu información en CSV, un formato plain text y totalmente abierto
* *editar registros*: visualizá, modificá y organizá entradas en la tabla, incluyendo bulk-delete y fuzzy-search
* *autocompletado de categorías*: etiquetá cualquier columna como una categoría para crear botones que las llenen automáticamente
* *formatos de fecha*: marcá columnas como fecha para aplicar autocompletado con la fecha actual en el formato que quieras
* *almacenamiento*: todo se guarda dentro del browser usando localstorage y puede ser fácilmente exportado a CSV
* *tipos de datos*: definí columnas con restricciones de tipo de datos como texto, número, fecha o booleano
* *superligero*: compatible con cualquier navegador moderno, incluyendo móvil, pesando solo ~100 KB

**wip**: campos internos con símbolos para subdividir > visualizaciones de datos > múltiples bases de datos

recordá que **toda la información se queda en tu browser hasta que la exportás** - hacé backups regularmente

pro-tip: *guardá como favorito para acceder rápidamente*