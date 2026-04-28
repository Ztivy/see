import api from './client'

export const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password })

    const token = data?.message?.login?.token

    if (!token) {
        throw new Error('La respuesta del servidor no contiene un token válido')
    }

    return { token, raw: data }
}

export const getEstudiante = async () => {
    const { data } = await api.get('/movil/estudiante')
    return data
}

export const getCalificaciones = async () => {
    const { data } = await api.get('/movil/estudiante/calificaciones')
    return data
}

export const getKardex = async () => {
    const { data } = await api.get('/movil/estudiante/kardex')
    return data
}

export const getHorarios = async () => {
    const { data } = await api.get('/movil/estudiante/horarios')
    return data
}