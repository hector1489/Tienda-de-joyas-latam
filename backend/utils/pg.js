require('dotenv').config()
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')

const config = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    allowExitOnIdle: true
}

const pool = new Pool(config)

const genericSqlQuery = (query = '', values = []) => pool
    .query(query, values)
    .then(({ rows }) => rows)
    .catch(({ code, message }) => ({ code, message }))

const readInventory = async () => await genericSqlQuery('SELECT * FROM inventario;')

const createItem = async ({ nombre, categoria, metal, precio, stock }) => {
    const query = 'INSERT INTO inventario(id, nombre, categoria, metal, precio, stock) VALUES ($1, $2, $3, $4, $5, $6);'
    const values = [uuidv4(), nombre, categoria, metal, precio, stock]
    return await genericSqlQuery(query, values)
}

const updateItem = async (id, { nombre, categoria, metal, precio, stock }) => {
    const query = 'UPDATE inventario SET nombre = $2, categoria = $3, metal = $4, precio = $5, stock = $6 WHERE id = $1 RETURNING *;'
    const values = [id, nombre, categoria, metal, precio, stock]
    return await genericSqlQuery(query, values)
}

const deleteItem = async (id) => await genericSqlQuery('DELETE FROM inventario WHERE id = $1 RETURNING *;', [id])

module.exports = {
    readInventory,
    createItem,
    updateItem,
    deleteItem
}
