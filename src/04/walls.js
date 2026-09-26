export const LANDING_WALL = 'orange'

export const WALLS = [

  { id: 'grey', es: 'gris', en: 'grey', color: '#8F9195', size: [1712, 877], items: [
    { id: 'sign',     box: [86, 78, 268, 113],     fill: '#8F9195', anchor: { x: 'left',    y: 'top'     } },
    { id: 'rod',      box: [455, 100, 1215, 58],   fill: '#242627', anchor: { x: 'stretch', y: 'top'     } },
    { id: 'shelf',    box: [30, 225, 420, 615],    fill: '#B7BAC0', anchor: { x: 'left',    y: 'stretch' } },
    { id: 'poster',   box: [95, 303, 285, 435],    fill: '#242627', anchor: { x: 'left',    y: 'top'     } },
    { id: 'window',   box: [455, 238, 995, 590],   fill: '#CCCED2', anchor: { x: 'stretch', y: 'stretch' } },
    { id: 'lamp',     box: [462, 510, 36, 130],    fill: '#242627' },
    { id: 'cabinet',  box: [440, 635, 835, 200],   fill: '#8F9195' },
    { id: 'curtain',  box: [1410, 150, 290, 690],  fill: '#303233', anchor: { x: 'right',   y: 'stretch' } },
  ] },

  { id: 'orange', es: 'naranja', en: 'orange', color: '#CA895D', size: [1712, 866], items: [
    { id: 'door',     box: [186, 193, 435, 640],   fill: '#8F9195' },
    { id: 'panel',    box: [750, 135, 660, 300],   fill: '#804C49', anchor: { x: 'right'   } },
    { id: 'riser',    box: [750, 510, 775, 125],   fill: '#636467', anchor: { x: 'right'   } },
    { id: 'speakerL', box: [684, 368, 127, 193],   fill: '#909295', anchor: { x: 'right'   } },
    { id: 'monitor',  box: [883, 353, 393, 218],   fill: '#805C83', anchor: { x: 'right'   } },
    { id: 'screen',   box: [1320, 256, 226, 322],  fill: '#749BA2', anchor: { x: 'right'   } },
    { id: 'speakerR', box: [1520, 355, 150, 200],  fill: '#909296', anchor: { x: 'right'   } },
    { id: 'desk',     box: [690, 640, 990, 195],   fill: '#CBCDD1', anchor: { x: 'right'   } },
  ] },

  { id: 'green', es: 'verde', en: 'green', color: '#69A268', size: [1712, 866], items: [
    { id: 'frame',    box: [30, 118, 215, 160],    fill: '#8F9195', anchor: { x: 'left'    } },
    { id: 'wardrobe', box: [432, 219, 856, 620],   fill: '#909296' },
    { id: 'table',    box: [40, 700, 245, 125],    fill: '#CCCED2', anchor: { x: 'left'    } },
    { id: 'box',      box: [1430, 690, 250, 145],  fill: '#303233', anchor: { x: 'right'   } },
  ] },

  { id: 'blue', es: 'azul', en: 'blue', color: '#5681BB', size: [1712, 866], items: [
    { id: 'sofa',     box: [30, 600, 445, 230],    fill: '#8F9195', anchor: { x: 'left'    } },
    { id: 'speakerA', box: [614, 510, 103, 217],   fill: '#303233' },
    { id: 'speakerB', box: [748, 578, 96, 160],    fill: '#8F9195' },
    { id: 'table',    box: [575, 725, 310, 105],   fill: '#CACCD0' },
    { id: 'wardrobe', box: [864, 225, 441, 600],   fill: '#303233' },
    { id: 'desk',     box: [1370, 635, 310, 195],  fill: '#CCCFD3', anchor: { x: 'right'   } },
    { id: 'antenna',  box: [1385, 535, 60, 95],    fill: '#7C5154', anchor: { x: 'right'   } },
    { id: 'radio',    box: [1470, 512, 210, 112],  fill: '#B5B8BE', anchor: { x: 'right'   } },
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
