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