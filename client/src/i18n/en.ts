import type { Dict } from './es'

// Diccionario inglés — misma forma que es.ts (TypeScript la exige).
const en: Dict = {
  nav: {
    projects: 'Projects',
    about: 'About',
    services: 'Services',
    dev: 'Dev',
    contact: 'Contact',
    langLabel: 'Language',
    skip: 'Skip to content',
    home: 'Lestar — home',
    label: 'Main',
  },
  home: {
    role: 'Graphic design',
    statementFirst: 'between letters',
    statementLast: 'and images.',
    claim:
      "I'm Juan Guillermo, also known as Lestar. I'm studying graphic design, with a particular interest in vector illustration. I also hold a qualification in software development: creating a video game has always been one of my goals.",
    ctaProjects: 'See projects',
    ctaContact: "Let's talk",
    featuredTitle: 'Selected',
    disciplines: 'Branding — Editorial — Illustration — ',
  },
  projects: {
    title: 'Projects',
    all: 'All',
    count: (n: number) => `${n} project${n === 1 ? '' : 's'}`,
    categories: {
      branding: 'Branding',
      ilustracion: 'Illustration',
      editorial: 'Editorial',
      otros: 'Other',
      fotografia: 'Photography',
      retoque: 'Photo retouching',
      desarrollo: 'Web development',
    },
  },
  project: {
    back: '← All projects',
    meta: {
      category: 'Category',
      year: 'Year',
      type: 'Sheet type',
      tools: 'Tools',
    },
    kind: {
      result: 'Final result',
      process: 'Full process',
    },
    sections: {
      briefing: 'Brief',
      bocetos: 'Sketches',
      decisiones: 'Decisions',
      resultado: 'Result',
    },
    gallery: 'Gallery',
    files: 'Files',
  },
  about: {
    title: 'About',
    bio:
      "I'm Juan Guillermo Gómez, though online people know me as Lestar. Illustration is what I enjoy most about design: Illustrator is the tool I connect with most and want to keep exploring.\n\n" +
      'My introduction to graphic design began with vocational classes at school. After graduating, I chose to study software development to pursue a long-standing goal: creating a video game. Later, I returned to studying design, bringing those two interests together.\n\n' +
      "I'm currently studying to become a Graphic Design Assistant at CESDE. I've completed my second semester and will begin my third in early 2027.\n\n" +
      "I like my work to feel polished. This portfolio brings together the pieces I consider my strongest and shows what I've learned in illustration, composition, image editing and editorial design.",
    educationTitle: 'Education',
    education: [
      {
        title: 'Graphic Design Assistant · CESDE',
        detail: 'Second semester completed · Third semester expected in January or February 2027',
      },
      {
        title: 'Software Analysis and Development Technologist · SENA',
        detail: 'Graduated in 2023',
      },
    ],
    toolsTitle: 'Tools',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    devNote: 'My previous training in software development ↗',
  },
  services: {
    title: 'Illustration and design',
    intro: 'Vector illustration is my main interest. I am looking for employment in graphic design and am also open to freelance commissions.',
    items: [
      {
        title: 'Vector illustration',
        desc: 'My main focus: building images through shape, colour and composition in Illustrator. Illustrations and graphic pieces with a clear visual intent.',
      },
      {
        title: 'Posters and image editing',
        desc: 'Poster composition, digital collage and image treatment in Illustrator and Photoshop.',
      },
      {
        title: 'Editorial design',
        desc: 'Layouts for publications, brochures and informational pieces in InDesign, with attention to typographic hierarchy and the relationship between text and images.',
      },
      {
        title: 'Brand identity',
        desc: 'Visual proposals, monograms and brand boards developed from a brief that guides design decisions.',
      },
    ],
  },
  dev: {
    title: 'Technical background',
    intro:
      'I graduated from SENA in Software Analysis and Development in 2023. This training is part of my background; my current professional focus is graphic design and illustration.',
    stackTitle: 'Technologies from my previous experience',
    stack: ['React', 'Node.js', 'Express', 'NestJS', 'Vue', 'MySQL', 'MariaDB', 'MongoDB', 'Figma'],
    thisSite:
      'During my internships, I contributed to an intranet application for SENA and a migration from MongoDB to MariaDB at Divergente Soluciones Inteligente SAS.',
    reposTitle: 'My current focus',
    reposNote: 'I want to keep growing in vector illustration and graphic design. Software development is part of my previous training, but is not a service I currently offer.',
  },
  contact: {
    title: 'Contact',
    intro: 'A project, a job opening, or a kerning complaint? Write me.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    sending: 'Sending…',
    sent: "Message sent. I'll get back to you soon.",
    error: 'Your message could not be sent. Please try again later.',
    publicEmail: 'jggomez016@gmail.com',
    socialsTitle: 'Social',
    socials: [
      { name: 'Instagram', url: 'https://www.instagram.com/illestar_/' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/juangui-gomez/' },
    ],
  },
  notFound: {
    title: '404',
    text: "This page doesn't exist (or I haven't uploaded it yet).",
    back: '← Back home',
  },
  footer: {
    made: 'Portfolio of Juan Guillermo Gómez · Lestar',
    rights: 'Selected academic and personal projects.',
  },
}

export default en
