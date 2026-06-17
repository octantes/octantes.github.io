# SEO Assessment — octantes.github.io

Estructura actual del sitio:

```
SPA (Vue Router)          archivo.html / archive.html
├─ / → home                ├─ Sin meta tags SEO
├─ /:type/:slug (post)     ├─ Sin OG/Twitter/JSON-LD
├─ /portfolio              └─ Sin canonical/hreflang
├─ /:filterType
└─ /:catchAll(.*) (404)    Post Estáticos (buildstep.js)
                           ├─ /posts/:type/:slug/index.html    (ES)
                           └─ /posts/:type/:slug/ingles.html   (EN)
```

---

## 🔴 Críticos

### 1. Canonical URL no coincide con la real

Google recibe señal contradictoria → posible pérdida de ranking.

`canonicalUrl = ${webURL}/${type}/${slug}/` (sin `/posts/`), pero el archivo está en `/posts/${type}/${slug}/`. El sitemap también usa `/posts/...`, así que ni siquiera sitemap y canonical coinciden.

**Archivo**: `buildstep.js:438`

```
canonicalUrl = `https://octantes.github.io/${postType}/${slug}/`
```

Pero la URL real es: `https://octantes.github.io/posts/${postType}/${slug}/`

### 2. `.nojekyll` ausente en `docs/`

GH Pages podría procesar con Jekyll → archivos con `_` ignorados, builds lentos. El `.nojekyll` está en `.github/workflows/` (no sirve para Pages). Ni `docs/` ni `dist/` tienen uno.

### 3. Archive pages sin SEO

`archivo.html` / `archive.html` no tienen `<meta description>`, OG tags, Twitter cards, JSON-LD, canonical, ni hreflang. Tampoco están en el sitemap.

**Archivo**: `buildstep.js:658`

---

## 🟠 Mayores

### 4. SPA `index.html` no tiene hreflang

Google no entiende que el SPA es bilingüe. Faltan `<link rel="alternate" hreflang="es/en/x-default">` en `index.html`.

**Archivo**: `index.html:12-18`

### 5. `og:image` en SPA hardcodeado

Shares siempre muestran `portada.webp` aunque se comparta un post específico. No hay script que actualice OG tags cuando se navega dentro del SPA.

**Archivo**: `index.html:60`

### 6. OG/Twitter tags en SPA no se actualizan al cambiar idioma

Shares en inglés muestran descripción en español. El inline script (`index.html:25-42`) solo actualiza `<title>` y `<meta name="description">`, no los OG equivalents.

**Archivo**: `index.html:33-41`

### 7. EN JSON-LD usa título ES

Search engines ven headline incorrecto en inglés. `articleJsonEn` usa `attributes.title` (ES) en vez de `enAttributes.title`.

**Archivo**: `buildstep.js:476`

```
"headline": attributes.title || slug,  // debería ser attrEn.title || attributes.title || slug
```

---

## 🟡 Moderados

### 8. Sitemap solo URLs ES, sin archive

Archive no se indexa. `writeSitemap()` omite `/archivo.html` y `/archive.html`.

**Archivo**: `buildstep.js:850`

### 9. Sin `article:published_time` / `article:modified_time`

Redes sociales no ven fechas. Faltan OG tags temporales.

**Archivo**: `templates/post.html`, `buildstep.js`

### 10. `dateModified` en JSON-LD es copia de `datePublished`

Google no detecta actualizaciones. No hay campo de modificación en frontmatter.

**Archivo**: `buildstep.js:459,481`

### 11. RSS feed solo títulos ES

Suscriptores inglés ven títulos en español. `feed.xml` usa `post.title` sin alternativa EN.

**Archivo**: `buildstep.js:884`

### 12. 404 no tiene contenido propio

Search bots ven SPA con meta tags de home en vez de "not found". `404.html` es copia de `index.html`.

**Archivo**: `buildstep.js:948`

---

## 🟢 Menores

### 13. `twitter:creator` en SPA hardcodeado `@octantes`

Autor incorrecto en posts compartidos desde SPA. Debería ser `@kaste` o el handle del post actual.

**Archivo**: `index.html:67`

### 14. `<html lang="es">` inicial aunque el user tenga EN

Google puede confundirse momentáneamente. El inline script lo corrige, pero después del render inicial.

**Archivo**: `index.html:3`
