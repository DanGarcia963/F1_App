 export class PilotSeasonController {
    constructor (Modelos) {
        this.pilotSeasonModel = Modelos.PilotSeasonModel
    }
 
    obtenerTodosLosPilotosPorTemporadas = async (req, res) => {
        const PilotosTemporadas = await this.pilotSeasonModel.obtenerTodosLosPilotosPorTemporadas()
        res.json(PilotosTemporadas)
    }

    obtenerPilotosPorTemporadaPorId = async (req, res) => {
        const { id } = req.params

        const PilotosTemporada = await this.pilotSeasonModel.obtenerPilotosPorTemporadaPorId(id)

        if (PilotosTemporada) return res.json(PilotosTemporada)
            res.status(404).json({ message: 'Pilotos por temporada no encontrados' })
    }

    crearPilotoTemporada = async (req, res) => {
        const nuevoPilotoTemporada = await this.pilotSeasonModel.crearPilotoTemporada({ entrada: req.body })
        res.send(nuevoPilotoTemporada)
    } 

    editarTemporada = async (req, res) => {
        const resultado = await this.pilotSeasonModel.editarTemporada({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    editarPiloto = async (req, res) => {
        const resultado = await this.pilotSeasonModel.editarPiloto({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    editarEquipo = async (req, res) => {
        const resultado = await this.pilotSeasonModel.editarEquipo({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarNumero = async (req, res) => {
        const resultado = await this.pilotSeasonModel.cambiarNumero({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}