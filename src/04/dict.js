import { TAGLINE } from './site-config.js'

export const DICT = {
  es: {
    notFound: {
      back: 'volver al inicio',
      byCode: {
        '404': 'esta p\u00e1gina no existe',
        '500': 'algo se rompi\u00f3 de este lado',
        default: 'algo sali\u00f3 mal',
      },
    },

    portada: {
      welcome: 'bienvenido a octantes!',
      desc: 'tocá un posteo de la tabla para cargarlo; también podés filtrar según el tipo de contenido que querés encontrar en la página',
      viewProfile: 'ver perfil de',
      openProfile: 'ver el perfil de autor @',
      closeDesc: 'cerrar descripción',
      openDesc: 'ver descripción',
      langTitle: 'cambiar a inglés',
      profilePicAlt: 'foto de perfil de @',
      openProfileNewTab: ' en una pesta\u00f1a nueva',
      closePopup: 'cerrar notificación',
      closePopupAria: 'cerrar la notificación popup',
      popupLink: 'ir al enlace',
      popupLinkAria: 'abrir enlace de la notificación',
      popupText: "p\u00e1sate a escuchar<br>mi \u00faltimo disco",
      sigilAlt: 'sigilo'
    },
    nav: { search: 'buscar...', home: 'volver al inicio', prev: 'ver el filtro anterior', next: 'ver el filtro siguiente', filterBy: 'filtrar por ', filterByContent: 'filtrar contenidos por ' },
    status: { contact: 'contactame!', archive: 'ARCHIVO', archiveLink: '/archivo.html', openLatest: 'abrir la \u00faltima nota publicada', portfolioTitle: 'ver portfolio din\u00e1mico', portfolioLabel: 'portfolio', rssTitle: 'suscribirse al feed RSS', rssAria: 'suscribirse a las \u00faltimas publicaciones por feed RSS', rssLabel: 'RSS', btcLabel: 'BTC:' },
    gallery: { loading: 'cargando...', empty: 'no hay notas que coincidan', open: 'abrir nota', noteCover: 'portada de la nota: ' },
    portfolio: {
      subtitle: 'Desarrollador Frontend & Diseñador',
      desc: 'desarrollando interfaces y experiencias digitales <br> con un enfoque en el diseño multimedia <br> y la simplicidad técnica',
      welcomeTitle: 'qu\u00e9 es esto',
      welcomeDesc: 'cada rayo, un proyecto\ntoc\u00e1 una vez para mirar, dos para entrar',
      close: 'volver al inicio', select: 'seleccionar proyecto ', open: 'abrir nota de ', noDesc: 'sin descripción', githubProfile: 'Ver perfil de GitHub', openGithub: 'Abrir GitHub de octantes', openRepo: 'Ver el repositorio de '
    },
    subscribe: {
      cta: 'querés enterarte cuando subo algo nuevo? sumate a la lista de mails!',
      placeholder: 'dejá tu mail acá...',
      done: 'ya estás en la lista, gracias por sumarte!',
      button: 'suscribirme',
      emailTitle: 'ingresar tu correo para suscribirte',
      emailAria: 'campo para ingresar correo electrónico',
      submitTitle: 'hacer click para suscribirte',
      submitAria: 'botón para enviar la suscripción',
      successMsg: 'mail registrado!',
      errorMsg: 'ese mail no es válido!',
      thanksMsg: 'gracias por sumarte!',
      adblockMsg: 'prevenido por adblocker'
    },
    about: {
      taglines: [TAGLINE.es, 'abriendo ventanas a universos alternativos', 'desplegando portales', 'investigando dualidades'],
      profilePic: 'foto de perfil',
      sections: {
        portal: 'buenas! soy <i>kaste</i> y lo que estás viendo es mi base de operaciones     <br><br>armé <b>octantes</b> para centralizar toda mi producción fuera de las redes  <br>recuperando los fundamentos, sin algoritmos, reglas o intermediarios         <br>vas a encontrar proyectos de todo tipo, vos elegís lo que querés ver         <br>desde música, textos y diseño hasta videojuegos y software propio            <br><br>la página me permite adaptar el formato al contenido que voy creando         <br>y pensar mis proyectos se vuelve más fácil con outputs definidos             <br><br>usá las pestañas superiores de la tabla para filtrar por sección             <br>cuando un posteo te llame la atención, clickealo para cargarlo acá           <br>',
        diseño: 'estás viendo la sección de <i>diseño</i>, acá viven mis proyectos multimedia <br><br>disfruto mucho armar <b>identidades</b> y pensar assets que las acompañen    <br>algunos de estos trabajos son solo de práctica, excusas para aprender        <br>otros son encargos reales, puestos a prueba en distintos entornos            <br>mi foco es la multimedialidad, lograr una fusión interesante de medios       <br><br>vas a encontrar trabajos de branding, diseño web y piezas editoriales        <br>desde interfaces hasta logotipos, fanzines, stickers y otros objetos         <br><br>si te interesa algún proyecto, clickealo para ver el desglose completo       <br>vas a encontrar la galería, el proceso, las herramientas e influencias       <br>',
        desarrollo: 'estás viendo la sección de <i>desarrollo</i>, acá armo mis herramientas    <br><br>desde que aprendí a <b>programar</b>, se me abrieron muchas posibilidades  <br>ahora cuando no encuentro algo que necesito, puedo armarlo de cero         <br>también me permite implementar diseños propios en entornos reales          <br>esta sección muestra la parte que ya es pública de esos desarrollos        <br><br>vas a encontrar software, experimentos gráficos y otras utilidades         <br>desde herramientas de producción y productividad hasta shaders             <br><br>si te interesa algún proyecto, clickealo para ver el desglose completo     <br>vas a encontrar el repositorio, el proceso, las herramientas e imágenes    <br>',
        musica: 'estás viendo la sección de <i>música</i>, acá es donde tejo hechizos          <br><br>desde el primer tema que hice, <b>producir</b> se volvió una necesidad total  <br>cuando no entro seguido en ese estado de trance, pierdo la templanza          <br>armar canciones en el sentido tradicional no es mi principal interés          <br>me llama mucho más crear paisajes que transmitan una emoción                  <br><br>vas a ver álbumes, acompañados por experimentos audiovisuales                 <br>desde proyectos terminados hasta descartes y demos sin mezclar                <br><br>si te interesa escuchar algo, clickealo para ver el video en youtube          <br>también vas a encontrar el disco en spotify y otras plataformas               <br>',
        textos: 'estás viendo la sección de <i>textos</i>, acá desarrollo mis intereses        <br><br>para mí, <b>escribir</b> siempre fue la mejor forma de ordenar las ideas      <br>en ese proceso aparecen borradores que acá traduzco a artículos               <br>la idea es conectar los puntos entre distintos desarrollos de la página       <br>para aportar un marco teórico a la práctica y disparar nuevos procesos        <br><br>vas a encontrar bitácoras, reflexiones y análisis de cosas variadas           <br>escritas en formato de blog personal, sin demasiada formalidad                <br><br>si querés leer algunos de mis pensamientos, clickeá un posteo                 <br>a lo largo de distintas notas se van desarrollando las temáticas              <br>',
        juegos: 'estás viendo la sección de <i>videojuegos</i>, mi principal laboratorio       <br><br>diseñar <b>fichines</b> siempre ha sido mi endgame, el objetivo final         <br>participé en gamejams y armé prototipos para practicar un poco                <br>pero siempre quise desarrollar cosas jugables desde el navegador              <br>porque la web es de los pocos lugares donde aún hay límites técnicos          <br><br>vas a encontrar juegos centrados en lo mecánico y otros en lo narrativo       <br>lo que más me interesa es pensar el juego como sistema y ver qué sale         <br><br>si querés probar algún prototipo, simplemente cargalo desde la tabla          <br>la mayoría corren en el navegador y otros pueden ser descargables             <br>'
      },
      footers: {
        portal: 'si querés saber más <i>sobre el proyecto</i> podes leer estos posteos',
        diseño: 'si querés saber más <i>sobre mis diseños</i> podes leer estos posteos',
        desarrollo: 'si querés saber más <i>sobre mi desarrollo</i> podes leer estos posteos',
        musica: 'si querés saber más <i>sobre mi música</i> podes leer estos posteos',
        textos: 'si querés saber más <i>sobre lo que escribo</i> podes leer estos posteos',
        juegos: 'si querés saber más <i>sobre los juegos</i> podes leer estos posteos'
      }
    }
  },
  en: {
    notFound: {
      back: 'back to the start',
      byCode: {
        '404': 'this page does not exist',
        '500': 'something broke on this side',
        default: 'something went wrong',
      },
    },

    portada: {
      welcome: 'welcome to octantes!',
      desc: 'click a post on the table to load it; you can also filter by the type of content you want to find on the page',
      viewProfile: 'view profile of',
      openProfile: 'view author profile @',
      closeDesc: 'close description',
      openDesc: 'view description',
      langTitle: 'switch to spanish',
      profilePicAlt: 'profile pic of @',
      openProfileNewTab: ' in a new tab',
      closePopup: 'close notification',
      closePopupAria: 'close popup notification',
      popupLink: 'go to link',
      popupLinkAria: 'open notification link',
      popupText: "come listen to<br>my latest album",
      sigilAlt: 'sigil'
    },
    nav: { search: 'search...', home: 'back to home', prev: 'view previous filter', next: 'view next filter', filterBy: 'filter by ', filterByContent: 'filter posts by ' },
    status: { contact: 'get in touch!', archive: 'ARCHIVE', archiveLink: '/archive.html', openLatest: 'open latest published note', portfolioTitle: 'view dynamic portfolio', portfolioLabel: 'portfolio', rssTitle: 'subscribe to RSS feed', rssAria: 'subscribe to latest posts via RSS feed', rssLabel: 'RSS', btcLabel: 'BTC:' },
    gallery: { loading: 'loading...', empty: 'no matching notes', open: 'open note', noteCover: 'cover for note: ' },
    portfolio: {
      subtitle: 'Frontend Engineer & Designer',
      desc: 'developing interfaces and digital experiences <br> with a focus on multimedia design <br> and technical simplicity',
      welcomeTitle: 'what is this',
      welcomeDesc: 'every ray, a project\ntap once to look, twice to go in',
      close: 'back to home', select: 'select project ', open: 'open note for ', noDesc: 'no description', githubProfile: 'View GitHub profile', openGithub: 'Open octantes GitHub', openRepo: 'View the repository for '
    },
    subscribe: {
      cta: 'want to know when i upload something new? join the mailing list!',
      placeholder: 'leave your email here...',
      done: "you're already on the list, thanks for joining!",
      button: 'subscribe',
      emailTitle: 'enter your email to subscribe',
      emailAria: 'field to enter email address',
      submitTitle: 'click to subscribe',
      submitAria: 'button to send subscription',
      successMsg: 'email registered!',
      errorMsg: 'that email is not valid!',
      thanksMsg: 'thanks for joining!',
      adblockMsg: 'blocked by adblocker'
    },
    about: {
      taglines: [TAGLINE.en, 'opening windows to alternate universes', 'unfolding portals', 'researching dualities'],
      profilePic: 'profile picture',
      sections: {
        portal: 'hey! i\'m <i>kaste</i> and what you\'re seeing is my operations base     <br><br>i built <b>octantes</b> to centralize all my production outside social media  <br>getting back to fundamentals, no algorithms, rules or middlemen               <br>you\'ll find projects of all kinds, you choose what you want to see            <br>from music, writing and design to video games and custom software             <br><br>the page lets me adapt the format to whatever content i\'m creating            <br>and thinking about my projects gets easier with defined outputs               <br><br>use the top tabs of the table to filter by section                            <br>when a post catches your attention, click it to load it here                  <br>',
        diseño: 'you\'re viewing the <i>design</i> section, where my multimedia projects live <br><br>i really enjoy building <b>identities</b> and designing assets to go with them<br>some of these works are just practice, excuses to learn                       <br>others are real commissions, tested in different environments                 <br>my focus is multimediality, achieving an interesting fusion of media          <br><br>you\'ll find branding work, web design and editorial pieces                    <br>from interfaces to logos, fanzines, stickers and other objects                <br><br>if you\'re interested in a project, click it to see the full breakdown         <br>you\'ll find the gallery, the process, tools and influences                    <br>',
        desarrollo: 'you\'re viewing the <i>dev</i> section, where i build my tools              <br><br>ever since i learned to <b>code</b>, a lot of possibilities opened up       <br>now when i can\'t find something i need, i can build it from scratch         <br>it also lets me implement my own designs in real environments                <br>this section shows the part that\'s already public from those developments   <br><br>you\'ll find software, graphical experiments and other utilities             <br>from production and productivity tools to shaders                           <br><br>if you\'re interested in a project, click it to see the full breakdown       <br>you\'ll find the repo, the process, tools and images                         <br>',
        musica: 'you\'re viewing the <i>music</i> section, this is where i weave spells          <br><br>since the first track i made, <b>producing</b> became a total necessity        <br>when i don\'t enter that trance state often enough, i lose my composure         <br>making songs in the traditional sense isn\'t my main interest                    <br>i\'m much more drawn to creating soundscapes that convey an emotion              <br><br>you\'ll see albums, accompanied by audiovisual experiments                       <br>from finished projects to scraps and unmixed demos                             <br><br>if you want to listen to something, click it to see the video on youtube        <br>you\'ll also find the album on spotify and other platforms                       <br>',
        textos: 'you\'re viewing the <i>writing</i> section, where i develop my interests        <br><br>for me, <b>writing</b> has always been the best way to organize my thoughts    <br>in that process drafts appear that i translate into articles here               <br>the idea is to connect the dots between different developments on the page      <br>to provide a theoretical framework for the practice and spark new processes     <br><br>you\'ll find logs, reflections and analysis of various things                    <br>written in a personal blog format, without too much formality                   <br><br>if you want to read some of my thoughts, click on a post                        <br>across different notes the themes keep developing                               <br>',
        juegos: 'you\'re viewing the <i>games</i> section, my main laboratory                  <br><br>designing <b>games</b> has always been my endgame, the final goal            <br>i\'ve participated in game jams and built prototypes to practice a bit        <br>but i\'ve always wanted to develop playable things from the browser           <br>because the web is one of the few places where there are still technical limits<br><br>you\'ll find games focused on mechanics and others on narrative               <br>what interests me most is thinking about the game as a system and seeing what comes out<br><br>if you want to try a prototype, just load it from the table                  <br>most run in the browser and others can be downloaded                         <br>'
      },
      footers: {
        portal: 'if you want to know more <i>about the project</i> you can read these posts',
        diseño: 'if you want to know more <i>about my designs</i> you can read these posts',
        desarrollo: 'if you want to know more <i>about my development</i> you can read these posts',
        musica: 'if you want to know more <i>about my music</i> you can read these posts',
        textos: 'if you want to know more <i>about what i write</i> you can read these posts',
        juegos: 'if you want to know more <i>about the games</i> you can read these posts'
      }
    }
  }
}
