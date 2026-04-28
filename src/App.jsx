import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h1 className="text-3xl font-bold text-green-600">
                Login exitoso
              </h1>
              <p className="text-slate-600 mt-2">
                Aquí va el dashboard (compañero/a).
              </p>
            </div>
          </div>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App