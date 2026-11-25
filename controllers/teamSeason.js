export class TeamSeasonController {
    constructor (Modelos) {
        this.teamSeasonModel = Modelos.TeamSeasonModel
    }
 
    obtenerTodosLosEquiposPorTemporadas = async (req, res) => {
        const equiposTemporadas = await this.teamSeasonModel.obtenerTodosLosEquiposPorTemporadas()
        res.json(equiposTemporadas)
    }

    obtenerEquiposPorTemporadaPorId = async (req, res) => {
        const {categoria, id } = req.params

        const equiposTemporada = await this.teamSeasonModel.obtenerEquiposPorTemporadaPorId(categoria, id)

        return res.json((Array.isArray(equiposTemporada) ? equiposTemporada : []));
    }

    obtenerEquiposPorIDYPorTemporadaPorId = async (req, res) => {
        const equiposTemporada = await this.teamSeasonModel.obtenerEquiposPorIDYPorTemporadaPorId({entrada: req.body})

        return res.json((Array.isArray(equiposTemporada) ? equiposTemporada : []));
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