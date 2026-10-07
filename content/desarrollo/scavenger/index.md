---
tags: [portfolio, software, malleable]
type: desarrollo
title: scav - substrato para una web portable
description: Toda la web es un repositorio de componentes para tus proyectos - robá una pieza, reconectala, conservala para siempre
portada: portada.png
date: 2026-09-15
handle: kaste
style: trad
---

***

*Podés encontrar el repositorio del proyecto en mi [Github](https://github.com/octantes/scavenger)*

***

```
> Cosechá cualquier cosa de la web y conectala en algo nuevo
> Exportalo como archivo html, usalo en cualquier lugar y publicalo
> La UI es una función del estado, y el estado es una función del DOM
```

![loop](loop.gif)

**scavenger es un substrato para herramientas web portables.** Cualquier cosa que construyas con scav se vuelve portable por definición, exportándose a un único archivo HTML independiente que funciona en cualquier lugar.

Sin paquetes, sin pasos de compilación, sin frameworks, sin cuentas, y *sin llamar a casa* a menos que lo quieras explícitamente.

El kit de herramientas tiene cuatro primitivas principales, deliberadamente diferentes en su forma porque cada una tiene la forma natural para lo que hace. **No necesitás todas para construir algo**, pero juntas forman el proyecto completo.

### Las Cuatro Herramientas

[kernel](https://github.com/octantes/scavenger/blob/main/docs/kernel.md)

El script que ejecutás en cualquier sitio web para cosechar componentes, extraer datos y ejecutar herramientas de debugging visual o interactuar con cualquier página.

![harvest](harvest.gif)

Cosechar no es scrapear HTML o sacar una captura de pantalla. Consiste en **tomar un componente renderizado de una página en vivo y reconstruirlo** como un Web Component independiente: resolviendo los estilos que el navegador realmente aplicó, preservando la cascada, unidades responsivas, variables, pseudo-elementos, fuentes, recursos, estado de los formularios y el comportamiento de diseño relevante.

[patchbay](https://github.com/octantes/scavenger/blob/main/docs/patchbay.md)

El entorno de ejecución, donde colocás componentes y los conectás, exportando el proyecto como está a HTML.

![wiring](wiring.gif)

[quests](https://github.com/octantes/scavenger/blob/main/docs/quests.md)

El puente hacia los datos externos en vivo, convirtiendo selectores CSS en canales para que patchbay los consuma como valores o componentes de una página que se actualizan en vivo.

![quests](quests.gif)

[compiler](https://github.com/octantes/scavenger/blob/main/docs/compiler.md)

El entorno de creación, donde creás nuevos nodos lógicos y componentes que extienden patchbay.

![component](component.gif)

## Filosofía

Este proyecto parte de una premisa simple: **el navegador ya es un substrato computacional maleable.**

El Modelo de Objetos del Documento (DOM) no es solo la representación de una interfaz; es un espacio de estado en vivo y direccionable que el navegador sabe cómo renderizar, mutar, serializar, persistir y rehidratar. Esto lleva a un modelo simple: la interfaz de usuario (UI) es una función del estado, y todo **estado persistente es una función del DOM.**

```
htmx dice
"no mantengas una segunda representación de la UI del lado del cliente
el HTML es la representación"

scav dice
"no mantengas una segunda representación de la aplicación
el DOM contiene el estado"
```

La consecuencia de esta conceptualización es que **el documento no es una representación de la aplicación, la aplicación es una rehidratación del documento.** Si el estado vive en los atributos de los elementos, los valores pueden ser serializados en el markup, y si el entorno de ejecución lee el documento en sí, no hay un modelo oculto que pueda desincronizarse. Guardar es un volcado de memoria, el archivo simplemente bootea.

La misma propiedad que hace posible la serialización del estado también hace que la web en tiempo de ejecución sea **un material a partir del cual podés construir**. La web primitiva en sí misma fue construida alrededor de documentos que podían ser enlazados, copiados, guardados, editados y servidos sin pedir permiso a una plataforma.

Esto sigue siendo cierto. El modelo subyacente no ha cambiado, pero *las capas de herramientas y la complejidad creciente lo han oscurecido.* Dejamos de notarlo - scav hace que esas propiedades sean evidentes y directamente utilizables. Lo que se distribuye a tu máquina es tuyo para cosechar, reconectar y reutilizar, y lo que construyas con ello puede persistir como un documento.

El navegador moderno es la aproximación funcional más cercana al modelo conceptual que el Memex imaginó, que Engelbart demostró, y sobre el que Nelson pasó toda una vida escribiendo: hipertexto del que sos autor, no solo consumidor. scavenger es menos una invención y más la comprensión de que el modelo **ya está acá**, instalado en casi todas las computadoras personales.

El argumento largo vive en un ensayo complementario - *Artesanías del Runtime* - sobre el navegador como un entorno de ejecución cosechable y **el tercer dominio** de herramientas que solo existen ahí: no son CLI, ni aplicaciones web, sino un entorno de ejecución visual prioritariamente local (local-first visual runtime). (Próximamente.)