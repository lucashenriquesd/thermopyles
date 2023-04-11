import express from 'express'
import pinoHttp from 'pino-http'
import statusRoutes from './routes/status'

const app = express()

app.use(pinoHttp())
app.get('/', (req, res) => res.send('Thermopyles'))

app.use('/status', statusRoutes)

const port: number = 3000

app.listen(port, () => console.log(`Thermopyles listening at ${port} 🛡️`))
