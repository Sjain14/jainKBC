import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminApp from './admin/AdminApp.jsx'
import PlayerApp from './player/PlayerApp.jsx'

export default function App() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin"       element={<AdminApp />} />

      {/* Player / audience view */}
      <Route path="/play"  element={<PlayerApp />} />
      <Route path="/view"  element={<PlayerApp />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/play" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/play" replace />} />
    </Routes>
  )
}
