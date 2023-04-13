import express from 'express'
import pinoHttp from 'pino-http'
import authRouter from './modules/auth/routes'
import bodyParser from 'body-parser'

const app = express()

app.use(pinoHttp())
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Thermopyles'))

app.use('/auth', authRouter)

const port: number = 3000

app.listen(port, () => console.log(`Thermopyles listening at ${port} 🛡️`))
