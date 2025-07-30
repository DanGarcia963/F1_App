import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'
import { PilotModel } from '../models/MySQL/pilot.js'

dotenv.config()

export const soloAdmin = async (req, res, next) => {
  const logueado = await validarCookie(req)
  if (logueado) return next()

  return res.redirect('/')
}

export const soloPublico = async (req, res, next) => {
  const logueado = await validarCookie(req)

  if (!logueado) return next()

  return res.redirect('/inicio')
}

const validarCookie = async (req) => {
  try {
    const cookieJWT = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('jwt=')).slice(4)
    const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET)

    const usuarioARevisar = await UsuarioTuristaModel.obtenerUsuarioTuristaPorCorreo(decodificada.Correo)

    if (usuarioARevisar.length === 0) return false

    return true
  } catch (error) {
    return false
  }
}
