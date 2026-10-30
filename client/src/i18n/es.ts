// Diccionario español — la forma de este objeto es el contrato
// que debe cumplir cualquier idioma nuevo (ver en.ts).
const es = {
  nav: {
    projects: 'Proyectos',
    about: 'Sobre mí',
    services: 'Servicios',
    dev: 'Dev',
    contact: 'Contacto',
    langLabel: 'Idioma',
  },
  home: {
    claim:
      'Diseñador gráfico en formación con criterio de sobra: branding, editorial e ilustración. ' +
      'Aquí solo sube lo que pasó mi propio filtro.',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Hablemos',
    featuredTitle: 'Seleccionados',
    disciplines: 'Branding — Editorial — Ilustración — ',
  },
  projects: {
    title: 'Proyectos',
    all: 'Todos',
    count: (n: number) => `${n} proyecto${n === 1 ? '' : 's'}`,
    categories: {
      branding: 'Branding',
      ilustracion: 'Ilustración',
      editorial: 'Editorial',
      otros: 'Otros',
    },
  },
  project: {
    back: '← Todos los proyectos',
    meta: {
      category: 'Categoría',
      year: 'Año',
      type: 'Tipo de ficha',
      tools: 'Herramientas',
    },
    kind: {
      result: 'Resultado final',
      process: 'Proceso completo',
    },
    sections: {
      briefing: 'Briefing',
      bocetos: 'Bocetos',
      decisiones: 'Decisiones',
      resultado: 'Resultado',
    },
    gallery: 'Galería',
    files: 'Archivos',
  },
  about: {
    title: 'Sobre mí',
    // [PENDIENTE · LET] borrador — ajusta o reemplaza con tu bio real
    bio:
      'Soy Let — también Lestar. Diseñador gráfico en formación ' +
      '(Técnico Laboral como Asistente en Diseño Gráfico, 2.º semestre) y ' +
      'Tecnólogo en Desarrollo de Software. Diseño marcas, editoriales e ' +
      'ilustración con la misma obsesión con la que programo: estructura ' +
      'primero, detalle siempre.',
    educationTitle: 'Formación',
    education: [
      {
        title: 'Técnico Laboral — Asistente en Diseño Gráfico',
        detail: 'En curso · 2.º semestre de 3',
      },
      {
        title: 'Tecnólogo en Desarrollo de Software',
        detail: 'Completado · 6 meses de práctica full stack',
      },
    ],
    toolsTitle: 'Herramientas',
    tools: ['Illustrator', 'Photoshop', 'InDesign', 'Branding', 'Briefing'],
    devNote: 'También programo: React, NestJS, MySQL. → Ver sección Dev',
    photoAlt: 'Foto de Let',
  },
  services: {
    title: 'Servicios',
    intro: '[PENDIENTE · LET] Qué puedo hacer por ti:',
    items: [
      {
        title: 'Identidad & Branding',
        desc: 'Logo, sistema visual y manual de marca. Del briefing al archivo final.',
      },
      {
        title: 'Editorial',
        desc: 'Publicaciones, periódicos, diagramación y sistemas de páginas.',
      },
      {
        title: 'Ilustración & Cartel',
        desc: 'Piezas con carácter: carteles, portadas, gráfica para música y cultura.',
      },
      {
        title: 'Desarrollo web',
        desc: 'Sitios y aplicaciones donde el diseño se respeta píxel a píxel.',
      },
    ],
  },
  dev: {
    title: 'Desarrollo',
    intro:
      'Tecnólogo en Desarrollo de Software con 6 meses de práctica como ' +
      'full stack. Esta sección es mi perfil técnico: qué sé, cómo trabajo ' +
      'y qué hice en este mismo sitio.',
    stackTitle: 'Stack de este sitio',
    stack: ['React + TypeScript', 'NestJS', 'MySQL', 'Vite', 'CSS propio con tokens'],
    thisSite:
      'Este portafolio es mi caso de estudio: frontend en React, API en ' +
      'NestJS, base de datos MySQL y un panel de administración propio.',
    reposTitle: 'Repositorios',
    reposNote: '[PENDIENTE · LET] enlaces a GitHub',
  },
  contact: {
    title: 'Contacto',
    intro: '¿Un proyecto, una vacante o una corrección de estilo? Escríbeme.',
    name: 'Nombre',
    email: 'Email',
    message: 'Mensaje',
    send: 'Enviar',
    // Aviso honesto mientras el backend no está conectado
    pendingNote:
      '[PENDIENTE] El envío se activa con el backend (etapa 5). Por ahora, escríbeme directo a las redes.',
    socialsTitle: 'Redes',
    socials: [
      { name: 'Instagram', url: '#' },
      { name: 'Behance', url: '#' },
      { name: 'LinkedIn', url: '#' },
      { name: 'GitHub', url: '#' },
    ],
  },
  notFound: {
    title: '404',
    text: 'Esta página no existe (o aún no la subo).',
    back: '← Volver al inicio',
  },
  footer: {
    made: 'Diseñado y programado por Lestar',
    rights: 'Todos los trabajos son míos. Nada de stock.',
  },
}

export type Dict = typeof es
export default es
