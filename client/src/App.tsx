import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Services from './pages/Services'
import Dev from './pages/Dev'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="proyectos" element={<Projects />} />
          <Route path="proyectos/:slug" element={<ProjectDetail />} />
          <Route path="sobre-mi" element={<About />} />
          <Route path="servicios" element={<Services />} />
          <Route path="desarrollo" element={<Dev />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
