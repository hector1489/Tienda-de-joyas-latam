require('dotenv').config()
const { Pool } = require('pg')
const format = require('pg-format')

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  allowExistOnIdle: true
}

const pool = new Pool(config)

const genericSqlQuery = (query, values) => pool
  .query(query, values)
  .then(({ rows }) => rows)
  .catch(({ code, message }) => ({ code, message }))

const jewelryId = async (id) => await genericSqlQuery('SELECT * FROM inventario WHERE id = $1;', [id])

const HATEOAS = (joyas, limits, order, page) => {
  const results = joyas.map((j) => ({
    name: j.nombre,
    href: `/joyas/joya/${j.id}`
  }))
  return {
    total: joyas.length,
    next: page < 2 ? `/joyas?limit=${limits}&order=${order}&page=${+page + 1}` : null,
    previous: page > 1 ? `/joyas?limit=${limits}&order=${order}&page=${page - 1}` : null,
    results
  }
}

const allJewels = async ({ limits = 6, page = 1, order_by = 'stock_ASC' }) => {
  const [campo, direccion] = order_by.split('_');
  const offSet = limits * (page - 1);
  const formatted = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offSet);
  const joyas = await genericSqlQuery(formatted);
  return HATEOAS(joyas, limits, order_by, page);
}

const JewelryByFilters = async ({ preciomax, preciomin, categoria, metal }) => {
  const filters = []
  const values = []
  let query = 'SELECT * FROM inventario '
  if (preciomax) filters.push(`precio <= $${values.push(preciomax)}`)
  if (preciomin) filters.push(`precio >= $${values.push(preciomin)}`)
  if (categoria) filters.push(`categoria = $${values.push(categoria)}`)
  if (metal) filters.push(`metal = $${values.push(metal)}`)
  if (filters.length > 0) query += `WHERE ${filters.join(' AND ')};`
  return await genericSqlQuery(query, values)
}

module.exports = {
  jewelryId,
  allJewels,
  JewelryByFilters
}