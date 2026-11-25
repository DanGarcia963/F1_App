export class PilotoController {
    constructor (Modelos) {
        this.pilotModel = Modelos.PilotModel
    }
 
    obtenerTodosLosPilotos = async (req, res) => {
        const {id}=req.params
        const pilotos = await this.pilotModel.obtenerTodosLosPilotos(id)
        res.json(pilotos)
    }

    obtenerPilotoPorId = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerPilotoPorId(id,Number(req.query?.categoria)||1)

        if (piloto) return res.json(piloto)
            res.status(404).json({ message: 'piloto no encontrado' })
    }

    obtenerInfoPilotoPorId = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerInfoPilotoPorId(id,Number(req.query?.categoria)||1)

        return res.json((Array.isArray(piloto) ? piloto : []));
    }

    obtenerVictoriasPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerVictoriasPilotoPorID(id,Number(req.query?.categoria)||1)

        return res.json((Array.isArray(piloto) ? piloto : []));
    }

    obtenerPodiosPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerPodiosPilotoPorID(id,Number(req.query?.categoria)||1)

        return res.json((Array.isArray(piloto) ? piloto : []));
    }

    obtenerTrayectoriaPilotoPorID = async (req, res) => {
        const { id } = req.params

        const piloto = await this.pilotModel.obtenerTrayectoriaPilotoPorID(id,Number(req.query?.categoria)||1)

        return res.json((Array.isArray(piloto) ? piloto : []));
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