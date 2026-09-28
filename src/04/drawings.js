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
