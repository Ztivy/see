import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    // Hooks: traemos lo que necesitamos del contexto y del router
    const { login, loading, isAuth } = useAuth()
    const navigate = useNavigate()

    // Estado local del formulario
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    // Si el usuario ya está autenticado, lo mandamos al dashboard
    // (evita que vuelva al login estando logueado)
    if (isAuth) {
        return <Navigate to="/dashboard" replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!email.trim() || !password.trim()) {
            setError('Por favor llena todos los campos.')
            return
        }

        const result = await login(email.trim(), password)

        if (result.ok) {
            navigate('/dashboard')
        } else {
            setError(result.message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
                        ITC
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">SII ITC</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Inicia sesión con tu cuenta institucional
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Correo institucional
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="numerodecontrol@celaya.tecnm.mx"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>


                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verificando...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>

                <p className="text-xs text-slate-400 text-center mt-6">
                    Tecnológico Nacional de México · Campus Celaya
                </p>
            </div>
        </div>
    )
}