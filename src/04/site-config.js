export const SITE_URL = 'https://octantes.github.io'
export const TAGLINE = { es: 'tejiendo hechizos', en: 'weaving spells' }
export const CONTACT_EMAIL = 'facugerbino@gmail.com'
export const POPUP_LINK = 'https://www.youtube.com/watch?v=pwzLUeVghDc'

export const SECTIONS = [
  { id: 'portal',        es: 'portal',        en: 'portal'  },
  { id: 'dise\u00f1o',   es: 'dise\u00f1o',   en: 'design'  },
  { id: 'desarrollo',    es: 'desarrollo',    en: 'dev'     },
  { id: 'musica',        es: 'musica',        en: 'music'   },
  { id: 'textos',        es: 'textos',        en: 'writing' },
  { id: 'juegos',        es: 'juegos',        en: 'games'   },
]

export const ABOUT_PATH = { es: '/info', en: '/about' }

export const MOBILE_MAX = 1080

export const GITHUB_URL = 'https://github.com/octantes'

export const MAIN_PROJECTS = [
  { name: 'scavenger', desc: { es: 'cuatro herramientas para puentear internet!', en: 'four tools to hotwire the entire web!' }, url: 'https://github.com/octantes/scavenger' },
]

export const STATUS = 'frenzy'

export const STATUSES = {
  frenzy:   { emoji: '❤️‍🔥', es: 'in a frenzy!',        en: 'in a frenzy!' },
  dominion: { emoji: '🪡',   es: 'dominando el mundo', en: 'dominating the world' },
  stuck:    { emoji: '🌀',   es: 'stuck in a loop',    en: 'stuck in a loop' },
}

export const GIF_AS_VIDEO = true
export const GIF_ENCODE   = { crf: '26', preset: 'slow' }

export const POEM = {
  color:  '#8AB6BB',
  typeMs:  55,
  holdMs:  8500,
  cells:   13,
  voidMs:  700,
  floor:   0.55,
  lift:    2.5,
  clicks:  5,
  window:  2500,
  idleMs:  60000,
  beatMs:  1000,
}

export const POEMS = {

  es: [
    [ { text: 'nadie es dueño', dx:  -12, dy: -5 },
      { text: 'de la luz', dx:   -2, dy: -1 },
      { text: 'que emite', dx:   -7, dy:  2 },
      { text: 'tu pantalla', dx:    1, dy:  5 } ],

    [ { text: 'ruido', dx:   -6, dy: -5 },
      { text: 'en la red', dx:    1, dy: -1 },
      { text: 'silencio', dx:   -5, dy:  2 },
      { text: 'en el nodo', dx:   -1, dy:  5 } ],

    [ { text: 'lo que el monolito', dx:  -15, dy: -5 },
      { text: 'esconde', dx:   -2, dy: -1 },
      { text: 'el cable', dx:    0, dy:  2 },
      { text: 'lo revela', dx:   -6, dy:  5 } ],

    [ { text: 'en el repo', dx:  -10, dy: -5 },
      { text: 'el código muere', dx:   -4, dy: -1 },
      { text: 'en el runtime', dx:  -10, dy:  2 },
      { text: 'es presente continuo', dx:   -8, dy:  5 } ],

    [ { text: 'solo tres colores', dx:  -11, dy: -4 },
      { text: 'contienen', dx:    1, dy:  0 },
      { text: 'millones', dx:   -8, dy:  4 } ],

    [ { text: 'cuando se apaga', dx:  -11, dy: -5 },
      { text: 'la ciudad', dx:   -5, dy: -1 },
      { text: 'se enciende', dx:    0, dy:  2 },
      { text: 'la mente', dx:   -2, dy:  5 } ],
  ],

  en: [
    [ { text: 'no one owns', dx:  -10, dy: -5 },
      { text: 'the light', dx:   -2, dy: -1 },
      { text: 'your screen', dx:   -8, dy:  2 },
      { text: 'gives off', dx:    2, dy:  5 } ],

    [ { text: 'noise', dx:   -6, dy: -5 },
      { text: 'on the network', dx:   -2, dy: -1 },
      { text: 'silence', dx:   -4, dy:  2 },
      { text: 'in the node', dx:   -1, dy:  5 } ],

    [ { text: 'what the monolith', dx:  -14, dy: -5 },
      { text: 'hides', dx:   -1, dy: -1 },
      { text: 'the cable', dx:    0, dy:  2 },
      { text: 'reveals', dx:   -5, dy:  5 } ],

    [ { text: 'in the repo', dx:  -10, dy: -5 },
      { text: 'the code dies', dx:   -3, dy: -1 },
      { text: 'in the runtime', dx:  -11, dy:  2 },
      { text: 'it is present tense', dx:   -7, dy:  5 } ],

    [ { text: 'only three colours', dx:  -12, dy: -4 },
      { text: 'hold', dx:    3, dy:  0 },
      { text: 'millions', dx:   -8, dy:  4 } ],

    [ { text: 'when the city', dx:  -10, dy: -5 },
      { text: 'goes dark', dx:   -5, dy: -1 },
      { text: 'the mind', dx:    1, dy:  2 },
      { text: 'lights up', dx:   -2, dy:  5 } ],
  ],

}
