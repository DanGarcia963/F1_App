 export class CircuitController {
    constructor (Modelos) {
        this.circuitModel = Modelos.CircuitModel
    }
 
    obtenerTodosLosCircuitos = async (req, res) => {
        const circuitos = await this.circuitModel.obtenerTodosLosCircuitos()
        res.json(circuitos)
    }

    obtenerCircuitoPorId = async (req, res) => {
        const { id } = req.params

        const circuito = await this.circuitModel.obtenerCircuitoPorId(id)

        if (circuito) return res.json(circuito)
            res.status(404).json({ message: 'circuito no encontrado' })
    }

    registrarCircuito = async (req, res) => {
        const nuevoCircuito = await this.circuitModel.registrarCircuito({ entrada: req.body })
        res.send(nuevoCircuito)
    } 

    cambiarNombre = async (req, res) => {
        const resultado = await this.circuitModel.cambiarNombre({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarCurvas = async (req, res) => {
        const resultado = await this.circuitModel.cambiarCurvas({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarCiudad = async (req, res) => {
        const resultado = await this.circuitModel.cambiarCiudad({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarLongitud = async (req, res) => {
        const resultado = await this.circuitModel.cambiarLongitud({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}