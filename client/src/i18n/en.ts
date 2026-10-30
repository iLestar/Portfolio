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
  },
  home: {
    claim:
      'Graphic designer in training with a strong filter: branding, editorial and illustration. ' +
      'Only work that passed my own bar makes it here.',
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
  },
  about: {
    title: 'About',
    bio:
      "I'm Let — also Lestar. Graphic designer in training " +
      '(Technical degree as Graphic Design Assistant, 2nd semester) and a ' +
      'Software Development technologist. I design brands, editorial pieces ' +
      'and illustration with the same obsession I code with: ' +
      'structure first, detail always.',
    educationTitle: 'Education',
    education: [
      {
        title: 'Technical degree — Graphic Design Assistant',
        detail: 'In progress · 2nd semester of 3',
      },
      {
        title: 'Software Development Technologist',
        detail: 'Completed · 6 months of full-stack internship',
      },
    ],
    toolsTitle: 'Tools',
    tools: ['Illustrator', 'Photoshop', 'InDesign', 'Branding', 'Briefing'],
    devNote: 'I also code: React, NestJS, MySQL. → See Dev section',
    photoAlt: 'Photo of Let',
  },
  services: {
    title: 'Services',
    intro: '[TBD · LET] What I can do for you:',
    items: [
      {
        title: 'Identity & Branding',
        desc: 'Logo, visual system and brand manual. From brief to final files.',
      },
      {
        title: 'Editorial',
        desc: 'Publications, newspapers, layout and page systems.',
      },
      {
        title: 'Illustration & Posters',
        desc: 'Pieces with character: posters, covers, graphics for music and culture.',
      },
      {
        title: 'Web development',
        desc: 'Sites and apps where the design survives pixel by pixel.',
      },
    ],
  },
  dev: {
    title: 'Development',
    intro:
      'Software Development technologist with 6 months of full-stack ' +
      'internship. This section is my technical profile: what I know, ' +
      'how I work, and what I built for this very site.',
    stackTitle: 'This site runs on',
    stack: ['React + TypeScript', 'NestJS', 'MySQL', 'Vite', 'Custom token-based CSS'],
    thisSite:
      'This portfolio is my case study: React frontend, NestJS API, ' +
      'MySQL database and a custom admin panel.',
    reposTitle: 'Repositories',
    reposNote: '[TBD · LET] GitHub links',
  },
  contact: {
    title: 'Contact',
    intro: 'A project, a job opening, or a kerning complaint? Write me.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    pendingNote:
      '[PENDING] Sending goes live with the backend (stage 5). For now, reach me on social.',
    socialsTitle: 'Social',
    socials: [
      { name: 'Instagram', url: '#' },
      { name: 'Behance', url: '#' },
      { name: 'LinkedIn', url: '#' },
      { name: 'GitHub', url: '#' },
    ],
  },
  notFound: {
    title: '404',
    text: "This page doesn't exist (or I haven't uploaded it yet).",
    back: '← Back home',
  },
  footer: {
    made: 'Designed and coded by Lestar',
    rights: 'All work is mine. No stock.',
  },
}

export default en
