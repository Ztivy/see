import { createContext, useContext, useState } from 'react'
import { login as loginRequest } from '../api/endpoints'
import { getToken, setToken, removeToken } from '../api/storage'

// Creamos el contexto. Es como un "canal" de comunicación entre componentes.
const AuthContext = createContext(null)

// El Provider envuelve la app y "transmite" los valores por ese canal.
export function AuthProvider({ children }) {
    // Estado: el token actual. Se inicializa leyendo del storage,
    // así si el usuario refresca la página NO pierde la sesión.
    const [token, setTokenState] = useState(() => getToken())

    // Estado: si estamos en medio de una petición de login (para mostrar spinner).
    const [loading, setLoading] = useState(false)

    // Función: iniciar sesión.
    const login = async (email, password) => {
        setLoading(true)
        try {
            const { token: newToken } = await loginRequest(email, password)
            setToken(newToken)         // Guarda en localStorage
            setTokenState(newToken)    // Actualiza el estado de React
            return { ok: true }
        } catch (err) {
            // Construimos un mensaje de error amigable según el tipo de fallo
            let message
            if (err.response?.status === 401) {
                message = 'Correo o contraseña incorrectos.'
            } else if (err.response) {
                message = `Error del servidor (${err.response.status}). Intenta de nuevo.`
            } else if (err.request) {
                message = 'No se pudo conectar con el servidor. Revisa tu conexión.'
            } else {
                message = 'Ocurrió un error inesperado.'
            }
            return { ok: false, message }
        } finally {
            setLoading(false)
        }
    }

    // Función: cerrar sesión.
    const logout = () => {
        removeToken()
        setTokenState(null)
    }

    // Valor que se transmite por el contexto.
    // Cualquier componente hijo puede leer/llamar estas cosas.
    const value = {
        token,
        isAuth: !!token,    // !!token convierte string|null en true|false
        loading,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook personalizado para consumir el contexto fácilmente.
// En vez de importar useContext y AuthContext en cada componente,
// solo importan useAuth().
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
    }
    return ctx
}