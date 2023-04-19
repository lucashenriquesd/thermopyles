import * as dotenv from 'dotenv'
import pino from 'pino'

dotenv.config()

const stdoutTransport = pino.transport({
  target: 'pino-pretty'
})

const mongoTransport = pino.transport({
  target: 'pino-mongodb',
  options: {
    uri: `mongodb://${process.env.REQUEST_LOGS_MONGODB_HOST}:${process.env.REQUEST_LOGS_MONGODB_PORT}/`,
    database: 'thermopyles',
    collection: 'request_logs',
    autoCreateCollection: true,
    mongoOptions: {
      auth: {
        username: process.env.REQUEST_LOGS_MONGODB_USERNAME,
        password: process.env.REQUEST_LOGS_MONGODB_PASSWORD
      }
    }
  }
})

const stdoutLogger = { logger: pino(stdoutTransport) }
const mongoLogger = { logger: pino(mongoTransport) }

export { stdoutLogger, mongoLogger }