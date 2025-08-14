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

    obtenerInfoPilotoPorId = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerInfoPilotoPorId(id)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'piloto no encontrado' })
    }

    obtenerVictoriasPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerVictoriasPilotoPorID(id)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'victorias del piloto no encontradas' })
    }

    obtenerPodiosPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerPodiosPilotoPorID(id)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'Podios del piloto no encontrados' })
    }

    obtenerTrayectoriaPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerTrayectoriaPilotoPorID(id)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'Trayectoria del piloto no encontrada' })
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