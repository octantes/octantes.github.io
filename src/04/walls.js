export const LANDING_WALL = 'orange'

export const WALLS = [

  { id: 'grey', es: 'gris', en: 'grey', color: '#8F9195', size: [1712, 877], items: [
    { id: 'sign',      label: { es: 'cartel', en: 'sign' },
                       description: { es: 'el cartel con el VIII', en: 'the sign with the VIII' },
                       box: [86, 78, 268, 113], fill: '#8F9195', anchor: { x: 'left', y: 'top' } },
    { id: 'rod',       label: { es: 'riel', en: 'rod' },
                       description: { es: 'el riel que sostiene la cortina', en: 'the rail that holds the curtain' },
                       box: [450, 100, 1253, 58], fill: '#242627', anchor: { x: 'stretch', y: 'top' } },
    { id: 'side',      label: { es: 'pared', en: 'wall' },
                       description: { es: 'la pared del costado, con su póster', en: 'the side wall, with its poster' },
                       box: [9, 225, 441, 643], fill: '#B7BAC0', anchor: { x: 'left', y: 'stretch' } },
    { id: 'poster',    label: { es: 'póster', en: 'poster' },
                       description: { es: 'un póster negro sobre la pared', en: 'a black poster on the wall' },
                       box: [95, 303, 285, 435], fill: '#242627', anchor: { x: 'left', y: 'top' } },
    { id: 'kitchen',   label: { es: 'cocina', en: 'kitchen' },
                       description: { es: 'la cocina', en: 'the kitchen' },
                       box: [450, 225, 960, 643], fill: '#CCCED2', anchor: { x: 'stretch', y: 'stretch' }, decor: true },
    { id: 'thermos',   label: { es: 'termo', en: 'thermos' },
                       description: { es: 'el termo del mate', en: 'the thermos for mate' },
                       box: [462, 505, 36, 130], fill: '#242627', anchor: { x: 'left' } },
    { id: 'table',     label: { es: 'mesa', en: 'table' },
                       description: { es: 'la mesa baja', en: 'the low table' },
                       box: [450, 635, 825, 233], fill: '#8F9195', anchor: { x: 'left' } },
    { id: 'curtain',   label: { es: 'cortina', en: 'curtain' },
                       description: { es: 'la cortina', en: 'the curtain' },
                       box: [1410, 150, 293, 718], fill: '#303233', anchor: { x: 'right', y: 'stretch' } },
  ] },

  { id: 'orange', es: 'naranja', en: 'orange', color: '#CA895D', size: [1712, 866], items: [
    { id: 'door',      label: { es: 'puerta', en: 'door' },
                       description: { es: 'la puerta de entrada', en: 'the front door' },
                       box: [186, 193, 435, 664], fill: '#8F9195' },
    { id: 'corkboard', label: { es: 'corcho', en: 'corkboard' },
                       description: { es: 'el corcho detrás de los monitores', en: 'the corkboard behind the monitors' },
                       box: [750, 135, 660, 300], fill: '#804C49', anchor: { x: 'right' } },
    { id: 'riser',     label: { es: 'estante', en: 'riser' },
                       description: { es: 'el estante que levanta los monitores', en: 'the shelf that lifts the monitors' },
                       box: [750, 510, 775, 130], fill: '#636467', anchor: { x: 'right' } },
    { id: 'speakerL',  label: { es: 'parlante izquierdo', en: 'left speaker' },
                       description: { es: 'el parlante del lado izquierdo', en: 'the speaker on the left' },
                       box: [684, 368, 127, 193], fill: '#909295', anchor: { x: 'right' } },
    { id: 'monitor',   label: { es: 'monitor', en: 'monitor' },
                       description: { es: 'el monitor principal del escritorio', en: 'the main monitor on the desk' },
                       box: [883, 353, 393, 218], fill: '#805C83', anchor: { x: 'right' } },
    { id: 'screen',    label: { es: 'pantalla', en: 'screen' },
                       description: { es: 'la segunda pantalla, vertical', en: 'the second screen, standing upright' },
                       box: [1320, 256, 226, 322], fill: '#749BA2', anchor: { x: 'right' } },
    { id: 'speakerR',  label: { es: 'parlante derecho', en: 'right speaker' },
                       description: { es: 'el parlante del lado derecho', en: 'the speaker on the right' },
                       box: [1553, 355, 150, 200], fill: '#909296', anchor: { x: 'right' } },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' },
                       description: { es: 'el escritorio de trabajo', en: 'the work desk' },
                       box: [690, 640, 1013, 217], fill: '#CBCDD1', anchor: { x: 'right' } },
  ] },

  { id: 'green', es: 'verde', en: 'green', color: '#69A268', size: [1712, 866], items: [
    { id: 'ac',        label: { es: 'aire acondicionado', en: 'air conditioner' },
                       description: { es: 'el aire acondicionado', en: 'the air conditioner' },
                       box: [9, 118, 236, 160], fill: '#8F9195', anchor: { x: 'left' } },
    { id: 'window',    label: { es: 'ventana', en: 'window' },
                       description: { es: 'la ventana con blackout', en: 'the blackout window' },
                       box: [432, 219, 856, 638], fill: '#909296' },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' },
                       description: { es: 'el escritorio, visto desde este lado', en: 'the desk, seen from this side' },
                       box: [9, 700, 276, 157], fill: '#CCCED2', anchor: { x: 'left' } },
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' },
                       description: { es: 'el sillón, visto desde este lado', en: 'the sofa, seen from this side' },
                       box: [1430, 690, 273, 167], fill: '#303233', anchor: { x: 'right' } },
  ] },

  { id: 'blue', es: 'azul', en: 'blue', color: '#5681BB', size: [1712, 866], items: [
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' },
                       description: { es: 'el sillón del living', en: 'the living room sofa' },
                       box: [9, 600, 466, 257], fill: '#8F9195', anchor: { x: 'left' } },
    { id: 'fan',       label: { es: 'ventilador', en: 'fan' },
                       description: { es: 'el ventilador de pie', en: 'the standing fan' },
                       box: [614, 510, 103, 215], fill: '#303233' },
    { id: 'lamp',      label: { es: 'lámpara', en: 'lamp' },
                       description: { es: 'una lámpara de pie', en: 'a standing lamp' },
                       box: [748, 578, 96, 147], fill: '#8F9195' },
    { id: 'coffee',    label: { es: 'mesa ratona', en: 'coffee table' },
                       description: { es: 'la mesa ratona frente al sillón', en: 'the coffee table by the sofa' },
                       box: [575, 725, 289, 132], fill: '#CACCD0' },
    { id: 'indoor',    label: { es: 'indoor', en: 'grow tent' },
                       description: { es: 'el indoor de cannabis', en: 'the cannabis grow tent' },
                       box: [864, 225, 441, 632], fill: '#303233' },
    { id: 'console',   label: { es: 'mesa de arrimo', en: 'entry table' },
                       description: { es: 'donde van quedando las cosas sueltas', en: 'where loose things end up' },
                       box: [1370, 635, 333, 222], fill: '#CCCFD3', anchor: { x: 'right' } },
    { id: 'spike',     label: { es: 'pinchapapeles', en: 'paper spike' },
                       description: { es: 'el pinche donde van los papeles', en: 'the spike where notes go' },
                       box: [1385, 535, 60, 100], fill: '#7C5154', anchor: { x: 'right' } },
    { id: 'portraits', label: { es: 'retratos', en: 'portraits' },
                       description: { es: 'un juego de retratos', en: 'a set of portraits' },
                       box: [1493, 512, 210, 123], fill: '#B5B8BE', anchor: { x: 'right' } },
  ] },

]

const SHIFT = {
  x: { left: () => [0, 0], right: e => [e, 0], stretch: e => [0, e], center: e => [e / 2, 0] },
  y: { top: () => [0, 0], bottom: e => [e, 0], stretch: e => [0, e] },
}

export function layoutWall(wall, width, height) {

  const [bw, bh] = wall.size
  const scale = Math.min(width / bw, height / bh)
  const [vw, vh] = [width / scale, height / scale]

  const items = wall.items.map(item => {
    const [x, y, w, h] = item.box
    const [dx, dw] = SHIFT.x[item.anchor?.x ?? 'center'](vw - bw)
    const [dy, dh] = SHIFT.y[item.anchor?.y ?? 'bottom'](vh - bh)
    return { ...item, box: [x + dx, y + dy, w + dw, h + dh] }
  })

  return { size: [vw, vh], items }

}
