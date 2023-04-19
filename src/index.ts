import express from 'express'
import { stdoutLogger, mongoLogger } from './pino-config'
import pinoHttp from 'pino-http'
import bodyParser from 'body-parser'
import authRouter from './modules/auth/routes'

const app = express()

app.use(pinoHttp(stdoutLogger))
app.use(pinoHttp(mongoLogger))
app.use(bodyParser.json())
app.get('/', (req, res) => res.send('Thermopyles'))

app.use('/auth', authRouter)

const port: number = 3000

app.listen(port, () => console.log(`Thermopyles listening at ${port} 🛡️`))
