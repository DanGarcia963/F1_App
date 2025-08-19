export class TeamController {
    constructor (Modelos) {
        this.teamModel = Modelos.TeamModel
    }
 
    obtenerTodosLosEquipos = async (req, res) => {
        const Equipos = await this.teamModel.obtenerTodosLosEquipos()
        res.json(Equipos)
    }

    obtenerEquipoPorId = async (req, res) => {
        const { id } = req.params

        const equipo = await this.teamModel.obtenerEquipoPorId(id)

        if (equipo) return res.json(equipo)
            res.status(404).json({ message: 'equipo no encontrado' })
    }

    obtenerEquipoPorNombre = async (req, res) => {
        const { nombre } = req.params

        const equipo = await this.teamModel.obtenerEquipoPorNombre(nombre)

        if (equipo) return res.json(equipo)
            res.status(404).json({ message: 'equipo no encontrado' })
    }

    obtenerMonoplazaActualEquipo = async (req, res) => {

        const monoplaza = await this.teamModel.obtenerMonoplazaActualEquipo({ entrada: req.body })

        if (monoplaza) return res.json(monoplaza)
            res.status(404).json({ message: 'monoplaza no encontrado' })
    }

    obtenerInfoEquipoPorId = async (req, res) => {
        const { id } = req.params

        const equipo = await this.teamModel.obtenerInfoEquipoPorId(id)

        if (equipo) return res.json(equipo)
            res.status(404).json({ message: 'equipo no encontrado' })
    }

    obtenerDuplasPilotos = async (req, res) => {
        const { id } = req.params

        const dupla = await this.teamModel.obtenerDuplasPilotos(id)

        if (dupla) return res.json(dupla)
            res.status(404).json({ message: 'duplas no encontradas' })
    }

    obtenerVictoriasEquipoPorID = async (req, res) => {
        const { id } = req.params

        const equipo = await this.teamModel.obtenerVictoriasEquipoPorID(id)

        if (equipo) return res.json(equipo)
            res.status(404).json({ message: 'victorias del equipo no encontradas' })
    }

    registrarEquipo = async (req, res) => {
        const nuevoEquipo = await this.teamModel.registrarEquipo({ entrada: req.body })
        res.send(nuevoEquipo)
    } 

    cambiarNombre = async (req, res) => {
        const resultado = await this.teamModel.cambiarNombre({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
    
    cambiarMotor = async (req, res) => {
        const resultado = await this.teamModel.cambiarMotor({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}