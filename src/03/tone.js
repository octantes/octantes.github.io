export const rgb   = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
export const luma  = hex => { const [r, g, b] = rgb(hex); return (r * .299 + g * .587 + b * .114) / 255 }
export const light = hex => luma(hex) > .5
export const mix   = (a, b, t) => '#' + rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * t).toString(16).padStart(2, '0')).join('')

export function wear(ground) {
  const root = document.documentElement
  root.style.setProperty('--page', ground?.startsWith('#') ? ground : `var(--${ground ?? 'carbon'})`)
  return light(getComputedStyle(root).getPropertyValue('--page').trim())
}