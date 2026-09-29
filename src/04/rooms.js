import { ROOM_WALLS } from './config.js'
import { furnish } from './map.js'

// CONTENT

export const LANDING_WALL = 'orange'

export const ROOM_TEXT = {
  es: { prev: 'pared anterior', next: 'pared siguiente', back: 'volver a la pared', items: 'en esta pared' },
  en: { prev: 'previous wall', next: 'next wall', back: 'back to the wall', items: 'on this wall' },
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
    corkboard:  { box: [750, 135, 660, 300], fill: '#804C49', anchor: { x: 'right' } },
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

// LAYOUT

const SHIFT = {
  x: { left: () => [0, 0], right: e => [e, 0], stretch: e => [0, e], center: e => [e / 2, 0] },
  y: { top: () => [0, 0], bottom: e => [e, 0], stretch: e => [0, e] },
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
