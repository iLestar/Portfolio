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
import AdminGuard from './pages/admin/AdminGuard'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProjectForm from './pages/admin/ProjectForm'
import Messages from './pages/admin/Messages'

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

          {/* Panel de administración */}
          <Route path="admin" element={<AdminLogin />} />
          <Route element={<AdminGuard />}>
            <Route path="admin/panel" element={<Dashboard />} />
            <Route path="admin/panel/nuevo" element={<ProjectForm />} />
            <Route path="admin/panel/editar/:id" element={<ProjectForm />} />
            <Route path="admin/panel/mensajes" element={<Messages />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
