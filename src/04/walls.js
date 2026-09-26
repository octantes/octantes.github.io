export const LANDING_WALL = 'orange'

export const WALLS = [

  { id: 'grey', es: 'gris', en: 'grey', color: '#8F9195', size: [1712, 877], items: [
    { id: 'sign',     label: { es: 'cartel', en: 'sign' },
                  description: { es: 'el cartel con el VIII', en: 'the sign with the VIII' },
                  box: [86, 78, 268, 113],     fill: '#8F9195', anchor: { x: 'left',    y: 'top'     } },
    { id: 'rod',      label: { es: 'riel', en: 'rod' },
                  description: { es: 'el riel que sostiene la cortina', en: 'the rail that holds the curtain' },
                  box: [455, 100, 1215, 58],   fill: '#242627', anchor: { x: 'stretch', y: 'top'     } },
    { id: 'shelf',    label: { es: 'pared', en: 'wall' },
                  description: { es: 'la pared del costado, con su póster', en: 'the side wall, with its poster' },
                  box: [30, 225, 420, 615],    fill: '#B7BAC0', anchor: { x: 'left',    y: 'stretch' } },
    { id: 'poster',   label: { es: 'póster', en: 'poster' },
                  description: { es: 'un póster negro sobre la pared', en: 'a black poster on the wall' },
                  box: [95, 303, 285, 435],    fill: '#242627', anchor: { x: 'left',    y: 'top'     } },
    { id: 'window',   label: { es: 'ventana', en: 'window' },
                  description: { es: 'la ventana grande del living', en: 'the big living room window' },
                  box: [455, 238, 995, 590],   fill: '#CCCED2', anchor: { x: 'stretch', y: 'stretch' } },
    { id: 'lamp',     label: { es: 'lámpara', en: 'lamp' },
                  description: { es: 'una lámpara chica sobre la mesa', en: 'a small lamp on the table' },
                  box: [462, 510, 36, 130],    fill: '#242627' },
    { id: 'cabinet',  label: { es: 'mesa', en: 'table' },
                  description: { es: 'la mesa baja bajo la ventana', en: 'the low table under the window' },
                  box: [440, 635, 835, 200],   fill: '#8F9195' },
    { id: 'curtain',  label: { es: 'cortina', en: 'curtain' },
                  description: { es: 'la cortina blackout', en: 'the blackout curtain' },
                  box: [1410, 150, 290, 690],  fill: '#303233', anchor: { x: 'right',   y: 'stretch' } },
  ] },

  { id: 'orange', es: 'naranja', en: 'orange', color: '#CA895D', size: [1712, 866], items: [
    { id: 'door',     label: { es: 'puerta', en: 'door' },
                  description: { es: 'la puerta de entrada', en: 'the front door' },
                  box: [186, 193, 435, 640],   fill: '#8F9195' },
    { id: 'panel',    label: { es: 'cuadro', en: 'panel' },
                  description: { es: 'el cuadro detrás de los monitores', en: 'the panel behind the monitors' },
                  box: [750, 135, 660, 300],   fill: '#804C49', anchor: { x: 'right'   } },
    { id: 'riser',    label: { es: 'estante', en: 'riser' },
                  description: { es: 'el estante que levanta los monitores', en: 'the shelf that lifts the monitors' },
                  box: [750, 510, 775, 125],   fill: '#636467', anchor: { x: 'right'   } },
    { id: 'speakerL', label: { es: 'parlante izquierdo', en: 'left speaker' },
                  description: { es: 'el parlante del lado izquierdo', en: 'the speaker on the left' },
                  box: [684, 368, 127, 193],   fill: '#909295', anchor: { x: 'right'   } },
    { id: 'monitor',  label: { es: 'monitor', en: 'monitor' },
                  description: { es: 'el monitor principal del escritorio', en: 'the main monitor on the desk' },
                  box: [883, 353, 393, 218],   fill: '#805C83', anchor: { x: 'right'   } },
    { id: 'screen',   label: { es: 'pantalla', en: 'screen' },
                  description: { es: 'la segunda pantalla, vertical', en: 'the second screen, standing upright' },
                  box: [1320, 256, 226, 322],  fill: '#749BA2', anchor: { x: 'right'   } },
    { id: 'speakerR', label: { es: 'parlante derecho', en: 'right speaker' },
                  description: { es: 'el parlante del lado derecho', en: 'the speaker on the right' },
                  box: [1520, 355, 150, 200],  fill: '#909296', anchor: { x: 'right'   } },
    { id: 'desk',     label: { es: 'escritorio', en: 'desk' },
                  description: { es: 'el escritorio de trabajo', en: 'the work desk' },
                  box: [690, 640, 990, 195],   fill: '#CBCDD1', anchor: { x: 'right'   } },
  ] },

  { id: 'green', es: 'verde', en: 'green', color: '#69A268', size: [1712, 866], items: [
    { id: 'frame',    label: { es: 'cuadro', en: 'frame' },
                  description: { es: 'un cuadro colgado en la pared', en: 'a frame hanging on the wall' },
                  box: [30, 118, 215, 160],    fill: '#8F9195', anchor: { x: 'left'    } },
    { id: 'wardrobe', label: { es: 'placard', en: 'wardrobe' },
                  description: { es: 'el placard grande', en: 'the big wardrobe' },
                  box: [432, 219, 856, 620],   fill: '#909296' },
    { id: 'table',    label: { es: 'mesita', en: 'side table' },
                  description: { es: 'una mesita de apoyo', en: 'a small side table' },
                  box: [40, 700, 245, 125],    fill: '#CCCED2', anchor: { x: 'left'    } },
    { id: 'box',      label: { es: 'caja', en: 'box' },
                  description: { es: 'una caja en el piso', en: 'a box on the floor' },
                  box: [1430, 690, 250, 145],  fill: '#303233', anchor: { x: 'right'   } },
  ] },

  { id: 'blue', es: 'azul', en: 'blue', color: '#5681BB', size: [1712, 866], items: [
    { id: 'sofa',     label: { es: 'sillón', en: 'sofa' },
                  description: { es: 'el sillón del living', en: 'the living room sofa' },
                  box: [30, 600, 445, 230],    fill: '#8F9195', anchor: { x: 'left'    } },
    { id: 'speakerA', label: { es: 'parlante', en: 'speaker' },
                  description: { es: 'un parlante de pie', en: 'a standing speaker' },
                  box: [614, 510, 103, 217],   fill: '#303233' },
    { id: 'speakerB', label: { es: 'lámpara', en: 'lamp' },
                  description: { es: 'una lámpara de pie', en: 'a standing lamp' },
                  box: [748, 578, 96, 160],    fill: '#8F9195' },
    { id: 'table',    label: { es: 'mesa ratona', en: 'coffee table' },
                  description: { es: 'la mesa ratona frente al sillón', en: 'the coffee table by the sofa' },
                  box: [575, 725, 310, 105],   fill: '#CACCD0' },
    { id: 'wardrobe', label: { es: 'ropero', en: 'wardrobe' },
                  description: { es: 'el ropero oscuro', en: 'the dark wardrobe' },
                  box: [864, 225, 441, 600],   fill: '#303233' },
    { id: 'desk',     label: { es: 'escritorio', en: 'desk' },
                  description: { es: 'el escritorio chico con la radio', en: 'the small desk with the radio' },
                  box: [1370, 635, 310, 195],  fill: '#CCCFD3', anchor: { x: 'right'   } },
    { id: 'antenna',  label: { es: 'antena', en: 'antenna' },
                  description: { es: 'la antena de la radio', en: 'the radio antenna' },
                  box: [1385, 535, 60, 95],    fill: '#7C5154', anchor: { x: 'right'   } },
    { id: 'radio',    label: { es: 'radio', en: 'radio' },
                  description: { es: 'la radio', en: 'the radio' },
                  box: [1470, 512, 210, 112],  fill: '#B5B8BE', anchor: { x: 'right'   } },
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
