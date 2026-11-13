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
    skip: 'Saltar al contenido',
    home: 'Lestar — inicio',
    label: 'Principal',
  },
  home: {
    role: 'Diseño gráfico',
    statementFirst: 'entre letras',
    statementLast: 'e imágenes.',
    claim:
      'Soy Juan Guillermo, también conocido como Lestar. Me estoy formando en diseño gráfico, con especial interés en la ilustración vectorial. También soy tecnólogo en desarrollo de software: crear un videojuego siempre ha sido una de mis metas.',
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
      fotografia: 'Fotografía',
      retoque: 'Retoque fotográfico',
      desarrollo: 'Desarrollo web',
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
    bio:
      'Soy Juan Guillermo Gómez, aunque en internet me conocen como Lestar. Lo que más disfruto del diseño es ilustrar: Illustrator es la herramienta con la que más conecto y en la que quiero seguir desarrollándome.\n\n' +
      'Mi acercamiento al diseño gráfico comenzó en la media técnica del colegio. Al graduarme decidí estudiar desarrollo de software para acercarme a una meta que siempre he tenido: crear un videojuego. Más adelante retomé mi formación en diseño, reuniendo esos dos intereses.\n\n' +
      'Actualmente estudio el Técnico Laboral como Asistente en Diseño Gráfico en CESDE. Ya completé el segundo semestre y comenzaré el tercero a principios de 2027.\n\n' +
      'Me gusta que los trabajos estén pulidos. Este portafolio reúne las piezas que considero mejor logradas y muestra lo que he aprendido en ilustración, composición, edición de imágenes y diseño editorial.',
    educationTitle: 'Formación',
    education: [
      {
        title: 'Asistente en Diseño Gráfico · CESDE',
        detail: 'Segundo semestre completado · Tercer semestre previsto para enero o febrero de 2027',
      },
      {
        title: 'Tecnólogo en Análisis y Desarrollo de Software · SENA',
        detail: 'Graduado en 2023',
      },
    ],
    toolsTitle: 'Herramientas',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    devNote: 'Mi formación previa en desarrollo de software ↗',
  },
  services: {
    title: 'Ilustración y diseño',
    intro: 'Mi principal interés es la ilustración vectorial. Busco oportunidades laborales en diseño gráfico y también estoy abierto a encargos independientes.',
    items: [
      {
        title: 'Ilustración vectorial',
        desc: 'Mi enfoque principal: construir imágenes con formas, color y composición en Illustrator. Ilustraciones y piezas gráficas con una intención visual clara.',
      },
      {
        title: 'Carteles y edición de imágenes',
        desc: 'Composición de carteles, collage digital y tratamiento de imágenes en Illustrator y Photoshop.',
      },
      {
        title: 'Diseño editorial',
        desc: 'Maquetación de publicaciones, brochures y piezas informativas en InDesign, cuidando la jerarquía tipográfica y la relación entre texto e imagen.',
      },
      {
        title: 'Identidad de marca',
        desc: 'Desarrollo de propuestas visuales, monogramas y brand boards, a partir de un brief que oriente las decisiones de diseño.',
      },
    ],
  },
  dev: {
    title: 'Formación técnica',
    intro:
      'Soy tecnólogo en Análisis y Desarrollo de Software del SENA, graduado en 2023. Esta formación es parte de mi recorrido; actualmente mi búsqueda profesional está centrada en el diseño gráfico y la ilustración.',
    stackTitle: 'Tecnologías de mi experiencia previa',
    stack: ['React', 'Node.js', 'Express', 'NestJS', 'Vue', 'MySQL', 'MariaDB', 'MongoDB', 'Figma'],
    thisSite:
      'Durante mis prácticas participé en el desarrollo de una aplicación intranet para el SENA y en una migración de MongoDB a MariaDB en Divergente Soluciones Inteligente SAS.',
    reposTitle: 'Mi enfoque actual',
    reposNote: 'Hoy quiero seguir creciendo en ilustración vectorial y diseño gráfico. El desarrollo forma parte de mi formación previa, pero no es un servicio que ofrezca actualmente.',
  },
  contact: {
    title: 'Contacto',
    intro: '¿Un proyecto, una vacante o una corrección de estilo? Escríbeme.',
    name: 'Nombre',
    email: 'Email',
    message: 'Mensaje',
    send: 'Enviar',
    sending: 'Enviando…',
    sent: 'Mensaje enviado. Te respondo pronto.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.',
    publicEmail: 'jggomez016@gmail.com',
    socialsTitle: 'Redes',
    socials: [
      { name: 'Instagram', url: 'https://www.instagram.com/illestar_/' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/juangui-gomez/' },
    ],
  },
  notFound: {
    title: '404',
    text: 'Esta página no existe (o aún no la subo).',
    back: '← Volver al inicio',
  },
  footer: {
    made: 'Portafolio de Juan Guillermo Gómez · Lestar',
    rights: 'Selección de proyectos académicos y personales.',
  },
}

export type Dict = typeof es
export default es
