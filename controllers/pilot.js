export class PilotoController {
    constructor (Modelos) {
        this.pilotModel = Modelos.PilotModel
    }
 
    obtenerTodosLosPilotos = async (req, res) => {
        const pilotos = await this.pilotModel.obtenerTodosLosPilotos()
        res.json(pilotos)
    }

    obtenerPilotoPorId = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerPilotoPorId(id)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'piloto no encontrado' })
    }

    registrarPiloto = async (req, res) => {
        const nuevoPiloto = await this.pilotModel.registrarPiloto({ entrada: req.body })
        res.send(nuevoPiloto)
    } 

    cambiarNumero = async (req, res) => {
        const resultado = await this.pilotModel.cambiarNumero({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}