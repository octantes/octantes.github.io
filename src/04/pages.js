import { SITE_URL, SITE_NAME, TAGLINE, SITE_DESCRIPTION, SECTIONS, ABOUT_PATH, ARCHIVE_VIEW, TWITTER } from './site-config.js'

export const SHARE_SIZE = { width: 1200, height: 675 }
export const ARCHIVE_FLAG = new RegExp(`[?&](${Object.values(ARCHIVE_VIEW).join('|')})(&|=|$)`)

const LOCALE     = { es: 'es_AR', en: 'en_US' }
const HOME_TITLE = { es: `${SITE_NAME} - portal multimedia`, en: `${SITE_NAME} - multimedia portal` }
const ABOUT_NAME = { es: 'info', en: 'about' }
const SITE_SHARE = `${SITE_URL}/assets/share.jpg`

const other = lang => lang === 'es' ? 'en' : 'es'

function sectionNamed(word) { return SECTIONS.find(s => s.es === word || s.en === word) }

export function sectionOf(word) { return sectionNamed(word)?.id }

export function wordOf(id, lang) { return SECTIONS.find(s => s.id === id)?.[lang] ?? id }

export function labelOf(id, lang) { return SECTIONS.find(s => s.id === id)?.label[lang] ?? id }

export function pageOf(route) {

  const path = route.path.length > 1 ? route.path.replace(/\/$/, '') : route.path
  const { type, slug, filterType } = route.params

  if (path === '/portfolio') return { kind: 'portfolio' }
  if (path === '/portal') return { kind: 'portal' }
  if (path === ABOUT_PATH.es || path === ABOUT_PATH.en) return { kind: 'about', lang: path === ABOUT_PATH.es ? 'es' : 'en' }
  if (slug && sectionOf(type)) return { kind: 'note', id: sectionOf(type), slug, lang: langOfWord(type) }
  if (filterType && sectionOf(filterType)) return { kind: 'section', id: sectionOf(filterType), lang: langOfWord(filterType) }
  if (path === '/') return { kind: 'home' }
  return { kind: 'other', path }

}

function langOfWord(word) {

  const section = sectionNamed(word)
  if (section.es === section.en) return null
  return word === section.en ? 'en' : 'es'

}

export function pathOf(page, lang) {

  switch (page.kind) {
    case 'home':      return '/'
    case 'portal':    return '/portal'
    case 'portfolio': return '/portfolio'
    case 'about':     return ABOUT_PATH[lang]
    case 'section':   return `/${wordOf(page.id, lang)}`
    case 'note':      return `/${wordOf(page.id, lang)}/${page.slug}`
    default:          return page.path
  }

}

export function urlOf(page, lang) { return `${SITE_URL}${page.kind === 'home' ? '' : pathOf(page, lang)}${page.kind === 'home' || page.kind === 'section' ? '/' : ''}` }

export function headFor(page, lang, post) {

  const description = `${TAGLINE[lang]} - ${SITE_DESCRIPTION[lang]}`
  const pair = { es: urlOf(page, 'es'), en: urlOf(page, 'en'), 'x-default': urlOf(page, 'es') }

  const head = {
    lang, title: HOME_TITLE[lang], name: SITE_NAME, description, canonical: `${SITE_URL}/`, alternates: null,
    type: 'website', image: SITE_SHARE, imageAlt: SITE_NAME, locale: LOCALE[lang], localeAlt: null, published: null, modified: null,
    ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/`, description, inLanguage: lang, author: { '@type': 'Person', name: 'kaste' } },
  }

  if (page.kind === 'section' || page.kind === 'about' || page.kind === 'portfolio') {
    const name = page.kind === 'section' ? labelOf(page.id, lang) : page.kind === 'about' ? ABOUT_NAME[lang] : 'portfolio'
    const paired = page.kind !== 'portfolio'
    Object.assign(head, { title: `${name} - ${SITE_NAME}`, name, canonical: urlOf(page, lang), alternates: paired ? pair : null, localeAlt: paired ? LOCALE[other(lang)] : null, ld: null })
  }

  if (page.kind === 'note' && post) {
    const shown = lang === 'en' && post.bilingual ? 'en' : 'es'
    const name = (shown === 'en' && post.titleEn) || post.title || post.slug
    const text = (shown === 'en' && post.descriptionEn) || post.description || description
    const handle = [].concat(post.handle || 'kaste')[0]
    const url = urlOf(page, shown)
    Object.assign(head, {
      lang: shown, title: `${name} - ${SITE_NAME}`, name, description: text, canonical: url, alternates: post.bilingual ? pair : null,
      type: 'article', image: post.share || SITE_SHARE, imageAlt: name, locale: LOCALE[shown], localeAlt: post.bilingual ? LOCALE[other(shown)] : null,
      published: post.isoDate, modified: post.modified || post.isoDate,
      ld: {
        '@context': 'https://schema.org', '@type': 'BlogPosting', mainEntityOfPage: { '@type': 'WebPage', '@id': url }, headline: name,
        image: post.share || SITE_SHARE, inLanguage: shown,
        author: { '@type': 'Person', name: handle, url: `https://x.com/${handle === 'kaste' ? TWITTER.slice(1) : handle}` },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
        datePublished: post.isoDate, dateModified: post.modified || post.isoDate, description: text, keywords: (post.tags || []).join(', '),
      },
    })
  }

  return head

}

const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function headTags(head) {

  const meta = (key, name, content) => content == null ? [] : [`<meta ${key}="${name}" content="${esc(content)}" data-head>`]

  return [
    ...meta('name', 'description', head.description),
    `<link rel="canonical" href="${esc(head.canonical)}" data-head>`,
    ...Object.entries(head.alternates || {}).map(([code, href]) => `<link rel="alternate" hreflang="${code}" href="${esc(href)}" data-head>`),
    ...meta('property', 'og:type', head.type),
    ...meta('property', 'og:site_name', SITE_NAME),
    ...meta('property', 'og:title', head.name),
    ...meta('property', 'og:description', head.description),
    ...meta('property', 'og:url', head.canonical),
    ...meta('property', 'og:image', head.image),
    ...meta('property', 'og:image:type', 'image/jpeg'),
    ...meta('property', 'og:image:width', SHARE_SIZE.width),
    ...meta('property', 'og:image:height', SHARE_SIZE.height),
    ...meta('property', 'og:image:alt', head.imageAlt),
    ...meta('property', 'og:locale', head.locale),
    ...meta('property', 'og:locale:alternate', head.localeAlt),
    ...meta('property', 'article:published_time', head.published),
    ...meta('property', 'article:modified_time', head.modified),
    ...meta('name', 'twitter:card', 'summary_large_image'),
    ...meta('name', 'twitter:site', TWITTER),
    ...meta('name', 'twitter:creator', TWITTER),
    ...meta('name', 'twitter:title', head.name),
    ...meta('name', 'twitter:description', head.description),
    ...meta('name', 'twitter:image', head.image),
    ...meta('name', 'twitter:image:alt', head.imageAlt),
    ...(head.ld ? [`<script type="application/ld+json" data-head>${JSON.stringify(head.ld).replace(/</g, '\\u003c')}</script>`] : []),
  ]

}

export function renderHead(head, indent = '    ') {

  return [`<title>${esc(head.title)}</title>`, ...headTags(head)].map(tag => indent + tag).join('\n').trimStart()

}

export function applyHead(head) {

  document.title = head.title
  for (const el of document.head.querySelectorAll('[data-head]')) el.remove()
  document.head.insertAdjacentHTML('beforeend', headTags(head).join(''))

}
