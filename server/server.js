require('dotenv')
const express = require('express')
const cors = require('cors')
const { logger } = require('../middleware/middleware')

const {
  jewelryId,
  allJewels,
  JewelryByFilters
 } = require('../utils/pg')

const PORT = process.env.PORT ?? 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/joyas', (req, res) => {
  const { limits, page, order_by } = req.query;
  const order = order_by ? order_by.toLowerCase().replace('_', '_') : 'nombre_asc';
  allJewels({ limits, page, order_by: order })
    .then((result) => res.status(result?.code ? 500 : 200).json(result))
    .catch((error) => res.status(500).json(error))
})

app.get('/joyas/filtros', (req, res) => {
  JewelryByFilters(req.query)
    .then((result) => res.status(result?.code ? 500 : 200).json(result))
    .catch((error) => res.status(500).json(error))
})

app.get('/joyas/joya/:id', (req, res) => {
  jewelryId(req.params.id)
    .then((result) => res.status(result?.code ? 500 : 200).json(result))
    .catch((error) => res.status(500).json(error))
})

app.all('*', (_, res) => res.status(404).json({ code: 404, message: 'La ruta no se encuentra en este sistema solar' }))

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))