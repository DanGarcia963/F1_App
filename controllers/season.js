export class SeasonController {
    constructor (Modelos) {
        this.seasonModel = Modelos.SeasonModel
    }
 
    obtenerTodasLasTemporadas = async (req, res) => {
        const temporadas = await this.seasonModel.obtenerTodasLasTemporadas()
        res.json(temporadas)
    }

    obtenerTemporadaPorId = async (req, res) => {
        const { id } = req.params

        const temporada = await this.seasonModel.obtenerTemporadaPorId(id)

        if (temporada) return res.json(piloto)
            res.status(404).json({ message: 'temporada no encontrada' })
    }

    registrarTemporada = async (req, res) => {
        const nuevoPiloto = await this.seasonModel.registrarTemporada({ entrada: req.body })
        res.send(nuevoPiloto)
    } 

    cambiarAnio = async (req, res) => {
        const resultado = await this.seasonModel.cambiarAnio({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}