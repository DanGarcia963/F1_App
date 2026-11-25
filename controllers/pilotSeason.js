 export class PilotSeasonController {
    constructor (Modelos) {
        this.pilotSeasonModel = Modelos.PilotSeasonModel
    }
 
    obtenerTodosLosPilotosPorTemporadas = async (req, res) => {
        const PilotosTemporadas = await this.pilotSeasonModel.obtenerTodosLosPilotosPorTemporadas()
        res.json(PilotosTemporadas)
    }

    obtenerPilotosPorTemporadaPorId = async (req, res) => {
        const {categoria, id } = req.params

        const PilotosTemporada = await this.pilotSeasonModel.obtenerPilotosPorTemporadaPorId(categoria, id)

        return res.json((Array.isArray(PilotosTemporada) ? PilotosTemporada : []));
    }

    obtenerDuplaPilotos = async (req, res) => {
        const { idTemporada, idEquipo } = req.method === 'GET' ? req.params : req.body;
        const PilotosDuplaTemporada = await this.pilotSeasonModel.obtenerDuplaPilotos(idTemporada, idEquipo)

        return res.json((Array.isArray(PilotosDuplaTemporada) ? PilotosDuplaTemporada : []));
    }

    obtenerPilotosPorTemporadaYEquipoPorId = async (req, res) => {
        const { idTemporada, idPiloto } = req.body;
        const PilotosTemporada = await this.pilotSeasonModel.obtenerPilotosPorTemporadaYEquipoPorId(idTemporada, idPiloto)

        return res.json((Array.isArray(PilotosTemporada) ? PilotosTemporada : []));
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