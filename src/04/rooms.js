import { ROOM_WALLS } from './config.js'
import { furnish } from './map.js'

// CONTENT

export const LANDING_WALL = 'orange'

export const ROOM_TEXT = {
  es: { prev: 'pared anterior', next: 'pared siguiente', back: 'volver a la pared', items: 'en esta pared', tabs: 'pestañas', page: 'página' },
  en: { prev: 'previous wall', next: 'next wall', back: 'back to the wall', items: 'on this wall', tabs: 'tabs', page: 'page' },
}

const ITEMS = {

  grey: [
    { id: 'roof',      label: { es: 'techo', en: 'roof' }, description: { es: 'el techo bajo', en: 'the lower roof' }, decor: true },
    { id: 'sign',      label: { es: 'cartel', en: 'sign' }, description: { es: 'el cartel con el VIII', en: 'the sign with the VIII' } },
    { id: 'rod',       label: { es: 'riel', en: 'rod' }, description: { es: 'el riel que sostiene la cortina', en: 'the rail that holds the curtain' } },
    { id: 'side',      label: { es: 'pared', en: 'wall' }, description: { es: 'la pared del costado, con su póster', en: 'the side wall, with its poster' }, decor: true },
    { id: 'poster',    label: { es: 'póster', en: 'poster' }, description: { es: 'un póster negro sobre la pared', en: 'a black poster on the wall' } },
    { id: 'thermos',   label: { es: 'termo', en: 'thermos' }, description: { es: 'el termo del mate', en: 'the thermos for mate' } },
    { id: 'table',     label: { es: 'mesa', en: 'table' }, description: { es: 'la mesa baja', en: 'the low table' } },
    { id: 'curtain',   label: { es: 'cortina', en: 'curtain' }, description: { es: 'la cortina', en: 'the curtain' } },
  ],

  orange: [
    { id: 'door',      label: { es: 'puerta', en: 'door' }, description: { es: 'la puerta de entrada', en: 'the front door' } },
    { id: 'corkboard', label: { es: 'corcho', en: 'corkboard' }, description: { es: 'el corcho detrás de los monitores', en: 'the corkboard behind the monitors' } },
    { id: 'riser',     label: { es: 'estante', en: 'riser' }, description: { es: 'el estante que levanta los monitores', en: 'the shelf that lifts the monitors' } },
    { id: 'speakerL',  label: { es: 'parlante izquierdo', en: 'left speaker' }, description: { es: 'el parlante del lado izquierdo', en: 'the speaker on the left' } },
    { id: 'monitor',   label: { es: 'monitor', en: 'monitor' }, description: { es: 'el monitor principal del escritorio', en: 'the main monitor on the desk' }, to: '/' },
    { id: 'screen',    label: { es: 'pantalla', en: 'screen' }, description: { es: 'la segunda pantalla, vertical', en: 'the second screen, standing upright' }, to: '/portfolio' },
    { id: 'speakerR',  label: { es: 'parlante derecho', en: 'right speaker' }, description: { es: 'el parlante del lado derecho', en: 'the speaker on the right' } },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' }, description: { es: 'el escritorio de trabajo', en: 'the work desk' } },
  ],

  green: [
    { id: 'ac',        label: { es: 'aire acondicionado', en: 'air conditioner' }, description: { es: 'el aire acondicionado', en: 'the air conditioner' } },
    { id: 'window',    label: { es: 'ventana', en: 'window' }, description: { es: 'la ventana con blackout', en: 'the blackout window' } },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' }, description: { es: 'el escritorio, visto desde este lado', en: 'the desk, seen from this side' } },
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' }, description: { es: 'el sillón, visto desde este lado', en: 'the sofa, seen from this side' } },
  ],

  blue: [
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' }, description: { es: 'el sillón del living', en: 'the living room sofa' } },
    { id: 'fan',       label: { es: 'ventilador', en: 'fan' }, description: { es: 'el ventilador de pie', en: 'the standing fan' } },
    { id: 'lamp',      label: { es: 'lámpara', en: 'lamp' }, description: { es: 'una lámpara de pie', en: 'a standing lamp' } },
    { id: 'coffee',    label: { es: 'mesa ratona', en: 'coffee table' }, description: { es: 'la mesa ratona frente al sillón', en: 'the coffee table by the sofa' } },
    { id: 'indoor',    label: { es: 'indoor', en: 'grow tent' }, description: { es: 'el indoor de cannabis', en: 'the cannabis grow tent' } },
    { id: 'console',   label: { es: 'mesa de arrimo', en: 'entry table' }, description: { es: 'donde van quedando las cosas sueltas', en: 'where loose things end up' } },
    { id: 'spike',     label: { es: 'pinchapapeles', en: 'paper spike' }, description: { es: 'el pinche donde van los papeles', en: 'the spike where notes go' } },
    { id: 'portraits', label: { es: 'retratos', en: 'portraits' }, description: { es: 'un juego de retratos', en: 'a set of portraits' } },
  ],

}

const draft = (tab, n) => Array.from({ length: n }, (_, i) => ({
  title: { es: `${tab.es}, página ${i + 1}`, en: `${tab.en}, page ${i + 1}` },
  text:  { es: 'texto de ejemplo hasta que llegue el contenido real de esta pestaña.', en: 'placeholder text until the real content for this tab arrives.' },
}))

export const BOARD = { tabs: [
  { id: 'one',   label: { es: 'uno', en: 'one' }, pages: draft({ es: 'uno', en: 'one' }, 4) },
  { id: 'two',   label: { es: 'dos', en: 'two' }, pages: draft({ es: 'dos', en: 'two' }, 4) },
  { id: 'three', label: { es: 'tres', en: 'three' }, pages: draft({ es: 'tres', en: 'three' }, 4) },
  { id: 'four',  label: { es: 'cuatro', en: 'four' }, pages: draft({ es: 'cuatro', en: 'four' }, 4) },
] }

export const WALLS = furnish(ROOM_WALLS.map(wall => ({ ...wall, items: ITEMS[wall.id] })))

// ART

export const LINE  = 18
export const DEPTH = { grow: 2, fill: .6 }

const ART = {

  grey: { color: '#CCCED2', size: [1712, 877], items: {
    roof:       { box: [9, 9, 1694, 216], fill: '#8F9195', anchor: { x: 'stretch', y: 'top' } },
    sign:       { box: [86, 78, 268, 113], fill: '#8F9195', anchor: { x: 'left', y: 'top' } },
    rod:        { box: [450, 100, 1253, 58], fill: '#242627', anchor: { x: 'stretch', y: 'top' } },
    side:       { box: [9, 225, 441, 643], fill: '#B7BAC0', anchor: { x: 'left', y: 'stretch' } },
    poster:     { box: [95, 303, 285, 435], fill: '#242627', anchor: { x: 'left', y: 'top' } },
    thermos:    { box: [462, 505, 36, 130], fill: '#242627', anchor: { x: 'left' } },
    table:      { box: [450, 635, 825, 233], fill: '#8F9195', anchor: { x: 'left' } },
    curtain:    { box: [1410, 150, 293, 718], fill: '#303233', anchor: { x: 'right', y: 'stretch' }, solo: true, hover: { box: [.6, 0, .4, 1] } },
  } },

  orange: { color: '#CA895D', size: [1712, 866], items: {
    door:       { box: [186, 193, 435, 664], fill: '#8F9195', hover: { box: [0, 0, .55, 1] } },
    corkboard:  { box: [750, 135, 660, 300], fill: '#804C49', anchor: { x: 'right' }, depth: { color: '#B7BAC1', layout: 'board' } },
    riser:      { box: [750, 510, 775, 130], fill: '#636467', anchor: { x: 'right' } },
    speakerL:   { box: [684, 368, 127, 193], fill: '#909295', anchor: { x: 'right' } },
    monitor:    { box: [883, 353, 393, 218], fill: '#805C83', anchor: { x: 'right' } },
    screen:     { box: [1320, 256, 226, 322], fill: '#749BA2', anchor: { x: 'right' } },
    speakerR:   { box: [1553, 355, 150, 200], fill: '#909296', anchor: { x: 'right' } },
    desk:       { box: [690, 640, 1013, 217], fill: '#CBCDD1', anchor: { x: 'right' } },
  } },

  green: { color: '#69A268', size: [1712, 866], items: {
    ac:         { box: [9, 118, 236, 160], fill: '#8F9195', anchor: { x: 'left' } },
    window:     { box: [432, 219, 856, 638], fill: '#909296' },
    desk:       { box: [9, 700, 276, 157], fill: '#CCCED2', anchor: { x: 'left' } },
    sofa:       { box: [1430, 690, 273, 167], fill: '#303233', anchor: { x: 'right' } },
  } },

  blue: { color: '#5681BB', size: [1712, 866], items: {
    sofa:       { box: [9, 600, 466, 257], fill: '#8F9195', anchor: { x: 'left' } },
    fan:        { box: [614, 510, 103, 215], fill: '#303233' },
    lamp:       { box: [748, 578, 96, 147], fill: '#8F9195' },
    coffee:     { box: [575, 725, 289, 132], fill: '#CACCD0' },
    indoor:     { box: [864, 225, 441, 632], fill: '#303233' },
    console:    { box: [1370, 635, 333, 222], fill: '#CCCFD3', anchor: { x: 'right' } },
    spike:      { box: [1385, 535, 60, 100], fill: '#7C5154', anchor: { x: 'right' } },
    portraits:  { box: [1493, 512, 210, 123], fill: '#B5B8BE', anchor: { x: 'right' } },
  } },

}

export function drawnWall(wall) {

  const art = ART[wall.id]
  return { ...wall, color: art.color, size: art.size, items: wall.items.map(item => ({ ...item, ...art.items[item.id] })) }

}

const CORNERS = [[.9, .05], [.1, .5], [.9, .95]]
const CURVE   = { cut: .25, steps: 8 }

function rounded(corners) {
  return corners.flatMap((c, i) => {
    const [p, n] = [corners.at(i - 1), corners[(i + 1) % corners.length]]
    const [a, b] = [p, n].map(o => [c[0] + (o[0] - c[0]) * CURVE.cut, c[1] + (o[1] - c[1]) * CURVE.cut])
    return Array.from({ length: CURVE.steps + 1 }, (_, k) => {
      const t = k / CURVE.steps
      return [0, 1].map(d => (1 - t) ** 2 * a[d] + 2 * (1 - t) * t * c[d] + t * t * b[d])
    })
  })
}

export const ARROW = { stroke: rounded(CORNERS), box: [12, 20, 96, 200] }

const BOARD_ART = {
  size:  [1712, 866], card: '#B7BAC1', tab: '#909296', badge: '#7D5A80',
  frame: [256, 278, 1200, 325], badgeBox: [348, 360, 288, 162], text: [713, 344, 672, 198],
  tabs:  { x: 256, w: 276, raised: 97, lowered: 53, under: 10 },
  pages: { x: 308, w: 92, raised: 82, lowered: 40, under: 13 },
}

const TONE = { dark: '#616365', mid: '#909296', light: '#ADB0B4', ink: '#242627' }

export const STICKER = { id: 'sticker', color: TONE.mid, size: [1712, 840], camo: { seed: 3, scale: 2.4, drift: .35, levels: [.43, .57], grid: [112, 56], aspect: 2, pad: .03 }, items: [
  { id: 'camoDark',  box: [0, 0, 1712, 840], fill: TONE.dark,  bare: true, anchor: { x: 'stretch', y: 'stretch' }, camo: 'low' },
  { id: 'camoLight', box: [0, 0, 1712, 840], fill: TONE.light, bare: true, anchor: { x: 'stretch', y: 'stretch' }, camo: 'high' },
  { id: 'label', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0, -0.003], [0.019, 0.006], [0.039, -0.001], [0.059, 0.006], [0.078, -0.004], [0.098, 0.003], [0.117, -0.004], [0.137, 0.006], [0.157, -0.003], [0.176, 0.003], [0.196, -0.004], [0.216, 0.006], [0.235, -0.005], [0.255, 0.006], [0.274, -0.002], [0.294, 0.007], [0.314, -0.003], [0.333, 0.005], [0.353, -0.003], [0.373, 0.003], [0.392, -0.005], [0.412, 0.006], [0.431, -0.005], [0.451, 0.006], [0.471, -0.004], [0.49, 0.006], [0.51, -0.004], [0.529, 0.003], [0.549, -0.004], [0.569, 0.006], [0.588, -0.004], [0.608, 0.004], [0.628, -0.004], [0.647, 0.007], [0.667, -0.001], [0.686, 0.007], [0.706, -0.002], [0.726, 0.004], [0.745, -0.004], [0.765, 0.006], [0.785, -0.002], [0.804, 0.005], [0.824, -0.003], [0.843, 0.005], [0.863, -0.004], [0.883, 0.003], [0.902, -0.003], [0.922, 0.006], [0.942, -0.003], [0.961, 0.006], [0.981, -0.002], [1.003, 0.001], [0.998, 0.038], [1.002, 0.075], [0.997, 0.112], [1.002, 0.149], [0.999, 0.186], [1.003, 0.223], [0.999, 0.26], [1.002, 0.297], [0.999, 0.334], [1.002, 0.371], [0.998, 0.408], [1.004, 0.445], [0.999, 0.482], [1.003, 0.519], [0.999, 0.556], [1.002, 0.593], [0.998, 0.63], [1.003, 0.667], [0.998, 0.705], [1.002, 0.742], [0.998, 0.779], [1.002, 0.816], [0.997, 0.853], [1.003, 0.89], [0.999, 0.927], [1.003, 0.964], [1, 1.005], [0.981, 0.995], [0.961, 1.005], [0.942, 0.996], [0.922, 1.003], [0.902, 0.997], [0.883, 1.005], [0.863, 0.997], [0.843, 1.005], [0.824, 0.996], [0.804, 1.004], [0.785, 0.997], [0.765, 1.003], [0.745, 0.999], [0.726, 1.005], [0.706, 0.997], [0.686, 1.004], [0.667, 0.995], [0.647, 1.003], [0.628, 0.997], [0.608, 1.005], [0.588, 0.997], [0.569, 1.005], [0.549, 0.998], [0.529, 1.003], [0.51, 0.997], [0.49, 1.006], [0.471, 0.998], [0.451, 1.005], [0.431, 0.997], [0.412, 1.005], [0.392, 0.995], [0.373, 1.007], [0.353, 0.998], [0.333, 1.004], [0.314, 0.997], [0.294, 1.005], [0.274, 0.996], [0.255, 1.003], [0.235, 0.998], [0.216, 1.003], [0.196, 0.995], [0.176, 1.005], [0.157, 0.996], [0.137, 1.006], [0.117, 0.995], [0.098, 1.005], [0.078, 0.997], [0.059, 1.006], [0.039, 0.996], [0.019, 1.004], [-0.003, 1.001], [0.003, 0.964], [-0.003, 0.927], [0.002, 0.89], [-0.002, 0.853], [0.002, 0.816], [-0.003, 0.779], [0.002, 0.742], [-0.002, 0.705], [0.002, 0.667], [-0.003, 0.63], [0.002, 0.593], [-0.002, 0.556], [0.002, 0.519], [-0.002, 0.482], [0.001, 0.445], [-0.002, 0.408], [0.002, 0.371], [-0.002, 0.334], [0.002, 0.297], [-0.003, 0.26], [0.001, 0.223], [-0.002, 0.186], [0.002, 0.149], [-0.002, 0.112], [0.003, 0.075], [-0.003, 0.038], [0, -0.003], [0.019, 0.006]]] },
  { id: 'stripe', box: [398, 185, 902, 473], fill: TONE.mid, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.051, 0.372], [0.069, 0.374], [0.086, 0.364], [0.103, 0.369], [0.12, 0.357], [0.137, 0.36], [0.154, 0.352], [0.172, 0.355], [0.187, 0.345], [0.202, 0.32], [0.211, 0.287], [0.222, 0.257], [0.235, 0.237], [0.243, 0.209], [0.257, 0.19], [0.264, 0.161], [0.277, 0.141], [0.286, 0.113], [0.304, 0.107], [0.321, 0.092], [0.34, 0.087], [0.357, 0.071], [0.372, 0.091], [0.357, 0.11], [0.347, 0.14], [0.333, 0.161], [0.323, 0.19], [0.311, 0.214], [0.298, 0.238], [0.292, 0.271], [0.279, 0.296], [0.273, 0.329], [0.262, 0.358], [0.246, 0.371], [0.234, 0.397], [0.22, 0.418], [0.203, 0.414], [0.186, 0.421], [0.169, 0.42], [0.152, 0.428], [0.135, 0.425], [0.119, 0.433], [0.102, 0.43], [0.085, 0.439], [0.068, 0.434], [0.05, 0.441], [0.053, 0.408], [0.051, 0.372], [0.069, 0.374]]] },
  { id: 'pillar', box: [398, 185, 902, 473], fill: TONE.mid, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.788, 0.09], [0.804, 0.097], [0.822, 0.092], [0.825, 0.122], [0.835, 0.147], [0.84, 0.175], [0.85, 0.199], [0.854, 0.229], [0.864, 0.253], [0.866, 0.289], [0.876, 0.32], [0.879, 0.354], [0.895, 0.333], [0.908, 0.306], [0.918, 0.283], [0.92, 0.252], [0.93, 0.229], [0.933, 0.2], [0.94, 0.175], [0.941, 0.147], [0.947, 0.117], [0.962, 0.135], [0.956, 0.169], [0.957, 0.204], [0.951, 0.238], [0.952, 0.273], [0.95, 0.309], [0.941, 0.333], [0.938, 0.363], [0.928, 0.386], [0.925, 0.416], [0.914, 0.44], [0.908, 0.469], [0.898, 0.492], [0.893, 0.521], [0.886, 0.553], [0.888, 0.586], [0.882, 0.618], [0.883, 0.651], [0.877, 0.682], [0.877, 0.716], [0.873, 0.75], [0.855, 0.746], [0.834, 0.747], [0.841, 0.716], [0.84, 0.682], [0.847, 0.651], [0.846, 0.618], [0.852, 0.586], [0.851, 0.553], [0.854, 0.521], [0.855, 0.49], [0.85, 0.46], [0.851, 0.429], [0.848, 0.399], [0.849, 0.368], [0.844, 0.338], [0.843, 0.308], [0.837, 0.276], [0.827, 0.248], [0.82, 0.215], [0.81, 0.187], [0.805, 0.154], [0.795, 0.126], [0.788, 0.09], [0.804, 0.097]]] },
  { id: 'body', box: [398, 185, 902, 473], fill: TONE.light, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.051, 0.516], [0.069, 0.518], [0.085, 0.506], [0.102, 0.505], [0.119, 0.491], [0.135, 0.494], [0.151, 0.487], [0.167, 0.491], [0.183, 0.483], [0.199, 0.488], [0.215, 0.481], [0.23, 0.48], [0.243, 0.459], [0.251, 0.43], [0.266, 0.412], [0.274, 0.383], [0.285, 0.359], [0.297, 0.336], [0.303, 0.305], [0.316, 0.282], [0.323, 0.253], [0.334, 0.229], [0.342, 0.199], [0.358, 0.184], [0.37, 0.159], [0.385, 0.143], [0.398, 0.119], [0.416, 0.117], [0.432, 0.107], [0.449, 0.11], [0.466, 0.098], [0.483, 0.091], [0.499, 0.098], [0.516, 0.09], [0.533, 0.098], [0.55, 0.09], [0.567, 0.098], [0.583, 0.091], [0.6, 0.097], [0.617, 0.09], [0.634, 0.096], [0.651, 0.092], [0.667, 0.096], [0.684, 0.092], [0.701, 0.098], [0.718, 0.091], [0.735, 0.092], [0.748, 0.111], [0.764, 0.117], [0.778, 0.133], [0.781, 0.164], [0.789, 0.191], [0.792, 0.223], [0.802, 0.248], [0.804, 0.28], [0.814, 0.307], [0.812, 0.338], [0.817, 0.368], [0.815, 0.4], [0.821, 0.429], [0.819, 0.46], [0.825, 0.49], [0.828, 0.521], [0.823, 0.553], [0.823, 0.586], [0.818, 0.618], [0.819, 0.651], [0.813, 0.682], [0.814, 0.715], [0.811, 0.751], [0.795, 0.746], [0.778, 0.752], [0.761, 0.743], [0.744, 0.752], [0.727, 0.745], [0.71, 0.751], [0.693, 0.744], [0.676, 0.749], [0.66, 0.745], [0.643, 0.752], [0.626, 0.745], [0.609, 0.75], [0.592, 0.743], [0.575, 0.75], [0.558, 0.746], [0.541, 0.75], [0.525, 0.744], [0.508, 0.749], [0.491, 0.746], [0.474, 0.752], [0.457, 0.744], [0.44, 0.752], [0.423, 0.745], [0.406, 0.752], [0.39, 0.745], [0.373, 0.75], [0.356, 0.743], [0.339, 0.751], [0.322, 0.745], [0.305, 0.751], [0.288, 0.745], [0.271, 0.752], [0.254, 0.744], [0.236, 0.748], [0.234, 0.716], [0.227, 0.686], [0.222, 0.657], [0.213, 0.629], [0.199, 0.613], [0.188, 0.592], [0.171, 0.582], [0.154, 0.583], [0.136, 0.573], [0.119, 0.577], [0.102, 0.575], [0.085, 0.583], [0.068, 0.581], [0.049, 0.587], [0.053, 0.554], [0.051, 0.516], [0.069, 0.518]]] },
  { id: 'window', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.37, 0.225], [0.39, 0.228], [0.408, 0.215], [0.427, 0.211], [0.444, 0.219], [0.461, 0.214], [0.478, 0.224], [0.496, 0.22], [0.513, 0.229], [0.53, 0.222], [0.547, 0.231], [0.564, 0.228], [0.582, 0.236], [0.599, 0.231], [0.616, 0.241], [0.633, 0.236], [0.652, 0.238], [0.66, 0.267], [0.674, 0.286], [0.683, 0.315], [0.697, 0.334], [0.709, 0.36], [0.707, 0.388], [0.713, 0.414], [0.714, 0.443], [0.697, 0.438], [0.681, 0.446], [0.664, 0.44], [0.648, 0.446], [0.631, 0.44], [0.615, 0.448], [0.598, 0.44], [0.582, 0.448], [0.566, 0.443], [0.549, 0.451], [0.533, 0.444], [0.516, 0.449], [0.5, 0.445], [0.483, 0.451], [0.467, 0.448], [0.451, 0.453], [0.434, 0.449], [0.418, 0.456], [0.401, 0.448], [0.385, 0.455], [0.368, 0.449], [0.352, 0.456], [0.335, 0.455], [0.334, 0.422], [0.328, 0.392], [0.324, 0.36], [0.332, 0.33], [0.335, 0.297], [0.342, 0.265], [0.357, 0.249], [0.37, 0.225], [0.39, 0.228]]] },
  { id: 'dotTop', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.375, 0.513], [0.374, 0.524], [0.37, 0.534], [0.365, 0.54], [0.359, 0.542], [0.353, 0.54], [0.349, 0.534], [0.345, 0.524], [0.344, 0.513], [0.345, 0.502], [0.349, 0.492], [0.353, 0.486], [0.359, 0.483], [0.365, 0.486], [0.37, 0.492], [0.374, 0.502], [0.375, 0.513], [0.374, 0.524]]] },
  { id: 'dotBottom', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.379, 0.646], [0.378, 0.657], [0.374, 0.667], [0.369, 0.673], [0.364, 0.675], [0.358, 0.673], [0.353, 0.667], [0.349, 0.657], [0.348, 0.646], [0.349, 0.635], [0.353, 0.625], [0.358, 0.619], [0.364, 0.617], [0.369, 0.619], [0.374, 0.625], [0.378, 0.635], [0.379, 0.646], [0.378, 0.657]]] },
  { id: 'lineTop', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.41, 0.553], [0.404, 0.55], [0.4, 0.544], [0.397, 0.534], [0.397, 0.523], [0.4, 0.514], [0.404, 0.507], [0.41, 0.505], [0.718, 0.513], [0.723, 0.515], [0.728, 0.522], [0.73, 0.531], [0.73, 0.542], [0.728, 0.552], [0.723, 0.558], [0.718, 0.561], [0.41, 0.553], [0.404, 0.55]]] },
  { id: 'lineBottom', box: [398, 185, 902, 473], fill: TONE.ink, bare: true, paste: true, anchor: { x: 'center', y: 'center' }, strokes: [[[0.424, 0.665], [0.418, 0.662], [0.414, 0.656], [0.411, 0.646], [0.411, 0.635], [0.414, 0.626], [0.418, 0.619], [0.424, 0.617], [0.718, 0.609], [0.723, 0.611], [0.728, 0.618], [0.73, 0.627], [0.73, 0.638], [0.728, 0.648], [0.723, 0.654], [0.718, 0.657], [0.424, 0.665], [0.418, 0.662]]] },
] }

// LAYOUT

const SHIFT = {
  x: { left: () => [0, 0], right: e => [e, 0], stretch: e => [0, e], center: e => [e / 2, 0] },
  y: { top: () => [0, 0], bottom: e => [e, 0], stretch: e => [0, e], center: e => [e / 2, 0] },
}

function touches([x, y, w, h], vw, vh) {

  const edge = LINE / 2
  return { left: x <= edge, right: x + w >= vw - edge, top: y <= edge, bottom: y + h >= vh - edge }

}

function beyondEdge([x, y, w, h], { left, right, top, bottom }) {

  return [left ? x - LINE : x, top ? y - LINE : y, w + (left ? LINE : 0) + (right ? LINE : 0), h + (top ? LINE : 0) + (bottom ? LINE : 0)]

}


function view(size, width, height) {

  const scale = Math.min(width / size[0], height / size[1])
  return [width / scale, height / scale]

}

export function layoutDepth(wall, item, width, height) {

  const [vw, vh] = view(wall.size, width, height)
  const [, , w, h] = item.box
  const grow = Math.min(DEPTH.grow, DEPTH.fill * vw / w, DEPTH.fill * vh / h)
  const box  = [(vw - w * grow) / 2, (vh - h * grow) / 2, w * grow, h * grow]

  return { size: [vw, vh], items: [{ ...item, box, hidden: {} }] }

}

export function layoutWall(wall, width, height) {

  const [bw, bh] = wall.size
  const [vw, vh] = view(wall.size, width, height)

  const items = wall.items.map(item => {
    const [x, y, w, h] = item.box
    const [dx, dw] = SHIFT.x[item.anchor?.x ?? 'center'](vw - bw)
    const [dy, dh] = SHIFT.y[item.anchor?.y ?? 'bottom'](vh - bh)
    const box    = [x + dx, y + dy, w + dw, h + dh]
    const hidden = touches(box, vw, vh)
    return { ...item, box: beyondEdge(box, hidden), hidden }
  })

  return { size: [vw, vh], items }

}

export function layoutBoard(tab, page, width, height) {

  const { size, card, tab: grey, badge, frame, badgeBox, text, tabs, pages } = BOARD_ART
  const [vw, vh] = view(size, width, height)
  const moved = ([x, y, w, h]) => [x + (vw - size[0]) / 2, y + (vh - size[1]) / 2, w, h]
  const [fx, fy, fw, fh] = frame

  const tabAt  = i => { const h = i === tab ? tabs.raised : tabs.lowered; return [tabs.x + i * tabs.w, fy - h, tabs.w, h] }
  const pageAt = i => [pages.x + i * pages.w, fy + fh, pages.w, i === page ? pages.raised : pages.lowered]
  const count  = { tabs: BOARD.tabs.length, pages: BOARD.tabs[tab].pages.length }
  const under  = ([x, y, w, h], extra, top) => top ? [x, y - extra, w, h + extra] : [x, y, w, h + extra]
  const range  = n => Array.from({ length: n }, (_, i) => i)

  const raised = ([tx, ty, tw]) => {
    const box = [fx, ty, fw, fy + fh - ty]
    const corners = [[fx + fw / 2, fy + fh], [fx, fy + fh], [fx, fy], [tx, fy], [tx, ty], [tx + tw, ty], [tx + tw, fy], [fx + fw, fy], [fx + fw, fy + fh]]
      .filter((p, i, all) => i === 0 || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1])
    const line = corners.flatMap((a, i) => {
      const b = corners[(i + 1) % corners.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 60))
      return range(n).map(k => [(a[0] + (b[0] - a[0]) * k / n - box[0]) / box[2], (a[1] + (b[1] - a[1]) * k / n - box[1]) / box[3]])
    })
    return { id: 'card', box, fill: card, strokes: [[...line, line[0], line[1]]] }
  }

  const items = [
    ...range(count.pages).map(i => ({ id: `page${i}`, box: under(pageAt(i), pages.under, true), fill: grey })),
    ...range(count.tabs).filter(i => i !== tab).map(i => ({ id: `tab${i}`, box: under(tabAt(i), tabs.under), fill: grey })),
    raised(tabAt(tab)),
    { id: 'badge', box: badgeBox, fill: badge },
  ].map(item => ({ hidden: {}, ...item, box: moved(item.box) }))

  return { size: [vw, vh], items, slots: { text: moved(text), tabs: range(count.tabs).map(i => moved(tabAt(i))), pages: range(count.pages).map(i => moved(pageAt(i))) } }

}