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

    obtenerDuplaPilotos = async (req, res) => {
        const { idTemporada, idEquipo } = req.body;
        const PilotosDuplaTemporada = await this.pilotSeasonModel.obtenerDuplaPilotos(idTemporada, idEquipo)

        if (PilotosDuplaTemporada) return res.json(PilotosDuplaTemporada)
            res.status(404).json({ message: 'Dupla de Pilotos por temporada no encontrados' })
    }

    obtenerPilotosPorTemporadaYEquipoPorId = async (req, res) => {
        const { idTemporada, idPiloto } = req.body;
        const PilotosTemporada = await this.pilotSeasonModel.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto)

        if (PilotosTemporada) return res.json(PilotosTemporada)
            res.status(404).json({ message: 'Piloto por temporada no encontrados' })
    }

    crearPilotoTemporada = async (req, res) => {
        const nuevoPilotoTemporada = await this.pilotSeasonModel.crearPilotoTemporada({ entrada: req.body })
        res.send(nuevoPilotoTemporada)
    } 


    editarPiloto = async (req, res) => {
        const resultado = await this.pilotSeasonModel.editarPiloto({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

}