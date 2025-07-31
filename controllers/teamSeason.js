export class TeamSeasonController {
    constructor (Modelos) {
        this.teamSeasonModel = Modelos.TeamSeasonModel
    }
 
    obtenerTodosLosEquiposPorTemporadas = async (req, res) => {
        const equiposTemporadas = await this.teamSeasonModel.obtenerTodosLosEquiposPorTemporadas()
        res.json(equiposTemporadas)
    }

    obtenerEquiposPorTemporadaPorId = async (req, res) => {
        const { id } = req.params

        const equiposTemporada = await this.teamSeasonModel.obtenerEquiposPorTemporadaPorId(id)

        if (equiposTemporada) return res.json(equiposTemporada)
            res.status(404).json({ message: 'equipos por temporada no encontrados' })
    }

    obtenerEquiposPorIDYPorTemporadaPorId = async (req, res) => {
        const equiposTemporada = await this.teamSeasonModel.obtenerEquiposPorIDYPorTemporadaPorId({entrada: req.body})

        if (equiposTemporada) return res.json(equiposTemporada)
            res.status(404).json({ message: 'equipos por temporada no encontrados' })
    }

    crearEquipoTemporada = async (req, res) => {
        const nuevoEquipoTemporada = await this.teamSeasonModel.crearEquipoTemporada({ entrada: req.body })
        res.send(nuevoEquipoTemporada)
    } 

    editarTemporada = async (req, res) => {
        const resultado = await this.teamSeasonModel.editarTemporada({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
       
    editarEquipo = async (req, res) => {
        const resultado = await this.teamSeasonModel.editarEquipo({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}