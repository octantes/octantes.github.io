export const LANDING_WALL = 'orange'

export const WALLS = [

  { id: 'grey', es: 'gris', en: 'grey', items: [
    { id: 'roof',      label: { es: 'techo', en: 'roof' }, description: { es: 'el techo bajo', en: 'the lower roof' }, decor: true },
    { id: 'sign',      label: { es: 'cartel', en: 'sign' }, description: { es: 'el cartel con el VIII', en: 'the sign with the VIII' } },
    { id: 'rod',       label: { es: 'riel', en: 'rod' }, description: { es: 'el riel que sostiene la cortina', en: 'the rail that holds the curtain' } },
    { id: 'side',      label: { es: 'pared', en: 'wall' }, description: { es: 'la pared del costado, con su póster', en: 'the side wall, with its poster' }, decor: true },
    { id: 'poster',    label: { es: 'póster', en: 'poster' }, description: { es: 'un póster negro sobre la pared', en: 'a black poster on the wall' } },
    { id: 'thermos',   label: { es: 'termo', en: 'thermos' }, description: { es: 'el termo del mate', en: 'the thermos for mate' } },
    { id: 'table',     label: { es: 'mesa', en: 'table' }, description: { es: 'la mesa baja', en: 'the low table' } },
    { id: 'curtain',   label: { es: 'cortina', en: 'curtain' }, description: { es: 'la cortina', en: 'the curtain' } },
  ] },

  { id: 'orange', es: 'naranja', en: 'orange', items: [
    { id: 'door',      label: { es: 'puerta', en: 'door' }, description: { es: 'la puerta de entrada', en: 'the front door' } },
    { id: 'corkboard', label: { es: 'corcho', en: 'corkboard' }, description: { es: 'el corcho detrás de los monitores', en: 'the corkboard behind the monitors' } },
    { id: 'riser',     label: { es: 'estante', en: 'riser' }, description: { es: 'el estante que levanta los monitores', en: 'the shelf that lifts the monitors' } },
    { id: 'speakerL',  label: { es: 'parlante izquierdo', en: 'left speaker' }, description: { es: 'el parlante del lado izquierdo', en: 'the speaker on the left' } },
    { id: 'monitor',   label: { es: 'monitor', en: 'monitor' }, description: { es: 'el monitor principal del escritorio', en: 'the main monitor on the desk' }, to: '/' },
    { id: 'screen',    label: { es: 'pantalla', en: 'screen' }, description: { es: 'la segunda pantalla, vertical', en: 'the second screen, standing upright' }, to: '/portfolio' },
    { id: 'speakerR',  label: { es: 'parlante derecho', en: 'right speaker' }, description: { es: 'el parlante del lado derecho', en: 'the speaker on the right' } },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' }, description: { es: 'el escritorio de trabajo', en: 'the work desk' } },
  ] },

  { id: 'green', es: 'verde', en: 'green', items: [
    { id: 'ac',        label: { es: 'aire acondicionado', en: 'air conditioner' }, description: { es: 'el aire acondicionado', en: 'the air conditioner' } },
    { id: 'window',    label: { es: 'ventana', en: 'window' }, description: { es: 'la ventana con blackout', en: 'the blackout window' } },
    { id: 'desk',      label: { es: 'escritorio', en: 'desk' }, description: { es: 'el escritorio, visto desde este lado', en: 'the desk, seen from this side' } },
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' }, description: { es: 'el sillón, visto desde este lado', en: 'the sofa, seen from this side' } },
  ] },

  { id: 'blue', es: 'azul', en: 'blue', items: [
    { id: 'sofa',      label: { es: 'sillón', en: 'sofa' }, description: { es: 'el sillón del living', en: 'the living room sofa' } },
    { id: 'fan',       label: { es: 'ventilador', en: 'fan' }, description: { es: 'el ventilador de pie', en: 'the standing fan' } },
    { id: 'lamp',      label: { es: 'lámpara', en: 'lamp' }, description: { es: 'una lámpara de pie', en: 'a standing lamp' } },
    { id: 'coffee',    label: { es: 'mesa ratona', en: 'coffee table' }, description: { es: 'la mesa ratona frente al sillón', en: 'the coffee table by the sofa' } },
    { id: 'indoor',    label: { es: 'indoor', en: 'grow tent' }, description: { es: 'el indoor de cannabis', en: 'the cannabis grow tent' } },
    { id: 'console',   label: { es: 'mesa de arrimo', en: 'entry table' }, description: { es: 'donde van quedando las cosas sueltas', en: 'where loose things end up' } },
    { id: 'spike',     label: { es: 'pinchapapeles', en: 'paper spike' }, description: { es: 'el pinche donde van los papeles', en: 'the spike where notes go' } },
    { id: 'portraits', label: { es: 'retratos', en: 'portraits' }, description: { es: 'un juego de retratos', en: 'a set of portraits' } },
  ] },

]

export function slugOf(text) { return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, '-') }

export function itemNamed(wall, word) { return wall.items.find(item => !item.decor && (slugOf(item.label.es) === word || slugOf(item.label.en) === word)) }
