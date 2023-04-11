import express from 'express'
import statusRoutes from './routes/status'

const app = express()

app.use('/', statusRoutes)
// app.get('/', (req, res) => console.log('test'))

const port: number = 3000

app.listen(port, () => {
  console.log(`Thermopyles listening at ${port} 🛡️`)
})