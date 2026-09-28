export const HINT = { w: 288, h: 110, gap: 12, arrow: 14 }

export function placeHint(frame, [left, top, w, h]) {

  const west  = left + w / 2 < frame.left + frame.width / 2
  const north = top + h / 2 < frame.top + frame.height / 2
  const space = { left: left - frame.left, right: frame.right - left - w, above: top - frame.top, below: frame.bottom - top - h }

  const beside = () => space.right > space.left
    ? { at: [left + w + HINT.gap, top + h / 2], place: `left-${north ? 'start' : 'end'}` }
    : { at: [left - HINT.gap, top + h / 2], place: `right-${north ? 'start' : 'end'}` }
  const around = () => space.below > space.above
    ? { at: [left + w / 2, top + h + HINT.gap], place: `top-${west ? 'start' : 'end'}` }
    : { at: [left + w / 2, top - HINT.gap], place: `bottom-${west ? 'start' : 'end'}` }

  const reach = HINT.gap + HINT.arrow
  const fits  = { beside: Math.max(space.left, space.right) > HINT.w + reach, around: Math.max(space.above, space.below) > HINT.h + reach }
  const wide  = frame.width > frame.height
  const [first, second] = wide ? [beside, around] : [around, beside]
  return (wide ? fits.beside : fits.around) ? first() : second()

}
