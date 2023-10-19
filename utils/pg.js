const { Pool } = require('pg');
const { format } = require('sql-template-strings');

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  allowExitOnIdle: true
}

const pool = new Pool(config)

const createHATEOASLinks = (inventario) => {
  const results = inventario.map((item) => ({
    name: item.nombre,
    href: `/joyas/joya/${item.id}`,
  })).slice(0, 6);
  const total = inventario.length;
  return {
    total,
    results,
  };
};

const getJewels = async ({ limits = 10, order_by = 'id_ASC', page = 1 }) => {
  try {
    const [field, direction] = order_by.split('_');
    const offset = (page - 1) * limits;
    const formattedQuery = (
      'SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s;',
      field, direction, limits, offset
    );
    const { rows: inventario } = await pool.query(formattedQuery);
    return inventario;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getFilteredJewels = async ({ precio_max, precio_min, categoria, metal }) => {
  const filters = [];
  const values = [];

  const addFilter = (field, comparator, value) => {
    values.push(value);
    const filterIndex = values.length;
    filters.push(`${field} ${comparator} $${filterIndex}`);
  };

  if (precio_max) addFilter('precio', '<=', precio_max);
  if (precio_min) addFilter('precio', '>=', precio_min);
  if (categoria) addFilter('categoria', '=', categoria);
  if (metal) addFilter('metal', '=', metal);

  let query = 'SELECT * FROM inventario';

  if (filters.length > 0) {
    const filterClause = filters.join(' AND ');
    query += ` WHERE ${filterClause};`;
  }

  const { rows: inventario } = await pool.query(query, values);
  return inventario;
};

module.exports = {
  getJewels,
  getFilteredJewels,
  createHATEOASLinks,
};
