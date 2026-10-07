---
tags: [branding, portfolio, web, meta]
type: diseño
title: octantes
description: diseño y desarrollo para esta página - experimentos, sistemas de contenido, shaders custom y animación
portada: portada.png
date: 2026-09-12
handle: kaste
style: trad
---

[!TEXT]

***octantes*** es mi página personal, que une diseño, desarrollo, escritura, música, juegos y experimentos. Quería que el sitio mismo se volviera una razón para hacer cosas, con sistemas que pudieran crecer alrededor de los proyectos.

![Ícono](icon.png)

El desafío fue construir una plataforma lo bastante amplia para sostener formatos distintos sin achatarlos ni volver la navegación un lío. Tenía que mantenerse abierta a nuevas ideas mientras se volvía mi foco principal.

### Inspiraciones

Siempre me interesó la estética de la web de los 2000s, especialmente la época de Flash y GeoCities. Kaliber10k fue una influencia grande: cada actualización se trataba como un zine, y la página entera se reconstruía alrededor del lanzamiento. Quería que *octantes* tuviera algo de esa libertad.

![Tablero](inspirations.png)

La pregunta central era: ¿cómo sería ese estilo con una arquitectura web y UX modernas? Elegí armar una SPA por la experiencia de navegación, pero cargar contenido nuevo puede ser un poco abrupto. Necesitaba una forma de hacer que esas transiciones se sintieran pulidas.

### Portal

El shader de portal es la respuesta a ese problema. Es un sistema de animación construido a mano en vanilla JS y manejado por una state machine, con animaciones específicas para revelar contenido según la ruta que seguimos.

![Portal](portal.gif)

Le aporta peso al acto de cargar, haciendo que se sienta como un motor físico. La navegación se pausa mientras corren las animaciones, como en la interfaz de Hearthstone.

Junto al shader hay una galería de cards con los posts reales. Seleccionar una dispara una transición y cambia el contenido debajo del portal. El resultado es que nunca ves realmente cómo cambia el contenido.

### Portfolio

También necesitaba un punto de entrada directo para mi trabajo de diseño y desarrollo. Los proyectos se muestran en una interfaz radial, donde se puede seleccionar cada uno para ver sus detalles antes de abrirlo en el portal principal.

![Portfolio](radial.gif)

El layout usa un sistema custom de slots calculados, shifts y ángulos que crece con el contenido sin requerir cambios de código. Esto mantiene el posicionamiento y permite que sea barato de renderizar.

### havitat y vitacora

*havitat* es una serie de habitaciones dibujadas a mano, que suman una forma alternativa de navegar por el sitio. Cada habitación contiene interfaces funcionales en el mismo estilo, renderizadas en tiempo real mientras exploras.

![havitat](havitat.gif)

El sistema implementa una definición de pincel propia con animaciones line boil estilo Flash, y mantiene todo liviano al usar SVG en vez de canvas o WebGL.

El mismo lenguaje dibujado se extiende a *vitacora*, un log visual continuo para pizarras de estudio y updates chicos que no encajan como posts separados. Las entradas se van sumando a un feed único continuo y se animan al scrollear, dejando que el log crezca en el tiempo.

### Archivo

Cada vez que se sube contenido nuevo, el sitio autogenera una versión de archivo de sí mismo. Cada página queda alcanzable a través de versiones HTML estilo GeoCities, servidas automáticamente a usuarios sin JS.

![Archivo](archive.gif)

Al sacar el portal, shaders y capas interactivas, el archivo mantiene la página completamente accesible sin importar hardware ni navegador.