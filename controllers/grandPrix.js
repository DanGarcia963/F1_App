export class GPController {
    constructor (Modelos) {
        this.gpModel = Modelos.GPModel
    }
 
    obtenerTodosLosGP = async (req, res) => {
        const GPs = await this.gpModel.obtenerTodosLosGP()
        res.json(GPs)
    }

    obtenerGPPorId = async (req, res) => {
        const { id } = req.params

        const GP = await this.gpModel.obtenerGPPorId(id)

        if (GP) return res.json(GP)
            res.status(404).json({ message: 'gran premio no encontrado' })
    }

    obtenerGPTemporadaPorId = async (req, res) => {
        const { Anio} = req.params;
        const GPsSeason = await this.gpModel.obtenerGPTemporadaPorId(Anio)

        if (GPsSeason) return res.json(GPsSeason)
            res.status(404).json({ message: 'gran premio de esta temporada no encontrado' })
    }

    obtenerCampeonatoPilotosPorAnio = async (req, res) => {
        const { Anio } = req.params

        const WDC = await this.gpModel.obtenerCampeonatoPilotosPorAnio(Anio)

        if (WDC) return res.json(WDC)
            res.status(404).json({ message: 'Campeonato de pilotos encontrado' })
    }

    obtenerCampeonatoConstructoresPorAnio = async (req, res) => {
        const { Anio } = req.params

        const WCC = await this.gpModel.obtenerCampeonatoConstructoresPorAnio(Anio)

        if (WCC) return res.json(WCC)
            res.status(404).json({ message: 'Campeonato de constructores no encontrado' })
    }

    registrarGP = async (req, res) => {
        const nuevoGP = await this.gpModel.registrarGP({ entrada: req.body })
        res.send(nuevoGP)
    } 
/*
    cambiarNombre = async (req, res) => {
        const resultado = await this.gpModel.cambiarNombre({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarFecha = async (req, res) => {
        const resultado = await this.gpModel.cambiarFecha({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarVueltas = async (req, res) => {
        const resultado = await this.gpModel.cambiarVueltas({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarCircuito = async (req, res) => {
        const resultado = await this.gpModel.cambiarCircuito({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    cambiarTemporada = async (req, res) => {
        const resultado = await this.gpModel.cambiarTemporada({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }
    
    registroVueltaRapida = async (req, res) => {
        const resultado = await this.gpModel.registroVueltaRapida({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }

    registroPolePosition = async (req, res) => {
        const resultado = await this.gpModel.registroPolePosition({ entrada: req.body })
        res.status(200).json({ message: `${resultado}` })
    }*/
}