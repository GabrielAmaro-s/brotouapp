import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Home from './pages/Home'
import Plantas from './pages/Plantas'
import DetalhePlanta from './pages/DetalhePlanta'
import Diario from './pages/Diario'
import Adocoes from './pages/Adocoes'
import Amigos from './pages/Amigos'
import Especies from './pages/Especies'
import Perfil from './pages/Perfil'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

function PrivateRoute({ children }) {
  const { usuario } = useApp()
  const location = useLocation()
  return usuario ? children : <Navigate to="/login" replace state={{ from: location }} />
}

function AdminRoute({ children }) {
  const { admin } = useApp()
  return admin ? children : <Navigate to="/admin-login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/plantas" element={<PrivateRoute><Plantas /></PrivateRoute>} />
      <Route path="/plantas/:id" element={<DetalhePlanta />} />
      <Route path="/diario" element={<PrivateRoute><Diario /></PrivateRoute>} />
      <Route path="/adocoes" element={<PrivateRoute><Adocoes /></PrivateRoute>} />
      <Route path="/amigos" element={<PrivateRoute><Amigos /></PrivateRoute>} />
      <Route path="/especies" element={<PrivateRoute><Especies /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
