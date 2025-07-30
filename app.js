import express, { json } from 'express' // require -> commonJS
import cors from "cors";
import 'dotenv/config'

import { corsMiddleware } from './middlewares/cors.js'
import { soloAdmin, soloPublico } from './middlewares/authorization.js'
import cookieParser from 'cookie-parser'

import { PilotoRouter } from './routes/pilot.js'
import { SeasonRouter } from './routes/season.js'
import { TeamRouter } from './routes/team.js'
import { CircuitRouter } from './routes/circuit.js'
import { TeamSeasonRouter } from './routes/teamSeason.js'
import { GPRouter } from './routes/grandPrix.js'
import { PilotSeasonRouter } from './routes/pilotSeason.js'
import { ResultsRouter } from './routes/results.js'

// Imports para __dirname
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const crearApp = (Modelos) => {
  const app = express()
  app.use(json())
  app.use(cors())
  app.use(cookieParser())

  app.disable('x-powered-by')

  app.use('/api/piloto', PilotoRouter(Modelos))
  app.use('/api/temporada', SeasonRouter(Modelos))
  app.use('/api/equipo', TeamRouter(Modelos))
  app.use('/api/circuito', CircuitRouter(Modelos))
  app.use('/api/equipoTemporada', TeamSeasonRouter(Modelos))
    app.use('/api/granPremio', GPRouter(Modelos))
  app.use('/api/pilotoTemporada', PilotSeasonRouter(Modelos))
  app.use('/api/resultados', ResultsRouter(Modelos))

  // Rutas del sitio web estático
  app.use(express.static(__dirname + '/public'))
  // Pruebas de backend
  app.get('/recuperarContrasena', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/cambiar_contraseña.html'))
  app.get('/', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/login_ES.html'))
  app.get('/LogInAdmin', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/Admin/login_Admin.html'))
  app.get('/registrar', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/registro_turista_ES.html'))
  app.get('/registrarAdmin', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/Admin/registro_Admin.html'))
  app.get('/admin', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/admin/admin.html'))
  app.get('/inicio', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/inicio.html'))
  app.get('/experience', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/Experience.html'))
  app.get('/inicioAdmin', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/inicioAdmin.html'))
  app.get('/museums', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/Museums.html'))
  app.get('/MisFavoritos', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/MisFavoritos.html'))
  app.get('/MisVisitados', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/MisVisitados.html'))
  app.get('/cuenta_verificada', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/Cuenta_verificada.html'))
  app.get('/perfilTurista', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/perfilTurista.html'))
  app.get('/recuperacion', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/recuperacion_de_cuenta_ES.html'))
  app.get('/recuperacionAdmin', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/recuperacion_Admin.html'))
  app.get('/cuenta_creada', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/cuenta_creada.html'))
  app.get('/aventuras_proximas', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/Aventuras_proximas.html'))
  app.get('/aventuras_pasadas', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/aventuras_pasadas.html'))

  app.get('/cuentas', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/cuentas.html'))
  app.get('/crear_usuario', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/crearUsuario.html'))
  app.get('/crear_empresa', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/crearEmpresa.html'))
  app.get('/actualizar', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/updateAdministrador.html'))

  app.get('/editar_aventura', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/editarAventura.html'))
  app.get('/FormularioQuejas', soloPublico, (req, res) => res.sendFile(__dirname + '/pages/FormularioQuejas.html'))
  app.get('/EnCurso', soloAdmin, (req, res) => res.sendFile(__dirname + '/pages/AventuraEnCurso.html'))
  const PORT = process.env.PORT ?? 1234

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}