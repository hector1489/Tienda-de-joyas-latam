const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const { format } = require('pg');

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  allowExitOnIdle: true,
};

const pool = new Pool(config);

const genericSqlQuery = (query = '', values = []) =>
  pool
    .query(query, values)
    .then(({ rows }) => rows)
    .catch(({ code, message }) => ({ code, message }));

const readInventory = async ({ limits = 10 }) => await genericSqlQuery('SELECT * FROM inventario;', [limits]);

const createItem = async ({ nombre, categoria, metal, precio, stock }) => {
  const query =
    'INSERT INTO inventario(id, nombre, categoria, metal, precio, stock) VALUES ($1, $2, $3, $4, $5, $6);';
  const values = [uuidv4(), nombre, categoria, metal, precio, stock];
  const result = await genericSqlQuery(query, values);
  return addHateoasLinks(result[0]);
};

const updateItem = async (id, { nombre, categoria, metal, precio, stock }) => {
  const query =
    'UPDATE inventario SET nombre = $2, categoria = $3, metal = $4, precio = $5, stock = $6 WHERE id = $1 RETURNING *;';
  const values = [id, nombre, categoria, metal, precio, stock];
  const result = await genericSqlQuery(query, values);
  return addHateoasLinks(result[0]);
};

const deleteItem = async (id) => {
  const result = await genericSqlQuery('DELETE FROM inventario WHERE id = $1 RETURNING *;', [id]);
  return addHateoasLinks(result[0]);
};

const getItems = async ({ limits = 10, order_by = 'id_ASC', page = 1 }) => {
  const [campo, direccion] = order_by.split('_');
  const offset = (page - 1) * limits;
  const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);

  try {
    const { rows: inventario } = await pool.query(formattedQuery);
    return inventario;
  } catch (error) {
    console.error('Error en getItems:', error);
    throw error;
  }
};

const getFilterItems = async ({ precio_max, precio_min, categoria, metal }) => {
  let filtros = [];
  const values = [];
  const addFilter = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_max) addFilter('precio', '<=', precio_max);
  if (precio_min) addFilter('precio', '>=', precio_min);
  if (categoria) addFilter('categoria', '=', categoria);
  if (metal) addFilter('metal', '=', metal);

  let consulta = 'SELECT * FROM inventario';

  if (filtros.length > 0) {
    filtros = filtros.join(' AND ');
    consulta += ` WHERE ${filtros}`;
  }

  try {
    const { rows: inventario } = await pool.query(consulta, values);
    return inventario;
  } catch (error) {
    console.error('Error en getFilterItems:', error);
    throw error;
  }
};

module.exports = {
  readInventory,
  createItem,
  updateItem,
  deleteItem,
  getItems,
  getFilterItems,
};
