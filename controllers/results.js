 export class ResultsController {
    constructor (Modelos) {
        this.resultsModel = Modelos.ResultsModel
    }
 
    obtenerTodosLosResultadosOrdenadosPorGP = async (req, res) => {
        const resultados = await this.resultsModel.obtenerTodosLosResultadosOrdenadosPorGP()
        res.json(resultados)
    }

    obtenerResultadoPorGPPorId = async (req, res) => {
        const { id } = req.params

        const resultados = await this.resultsModel.obtenerResultadoPorGPPorId(id)

        if (resultados) return res.json(resultados)
            res.status(404).json({ message: 'resultados de GP no encontrados' })
    }

    registrarResultado = async (req, res) => {
        const nuevoResultado = await this.resultsModel.registrarResultado({ entrada: req.body })
        res.send(nuevoResultado)
    } 

    cambiarPiloto = async (req, res) => {
        const resultado = await this.resultsModel.cambiarPiloto({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarPosicionInicial = async (req, res) => {
        const resultado = await this.resultsModel.cambiarPosicionInicial({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarPosicionFinal = async (req, res) => {
        const resultado = await this.resultsModel.cambiarPosicionFinal({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarVueltasCompletadas = async (req, res) => {
        const resultado = await this.resultsModel.cambiarVueltasCompletadas({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarParadasPits = async (req, res) => {
        const resultado = await this.resultsModel.cambiarParadasPits({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
    
    cambiarPuntosObtenidos = async (req, res) => {
        const resultado = await this.resultsModel.cambiarPuntosObtenidos({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
}