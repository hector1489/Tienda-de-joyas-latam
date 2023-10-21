const express = require('express');
const { Router } = express;
const { getJewels, getFilteredJewels } = require('../utils/pg');

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    const { limits = 10, order_by = 'id_ASC', page = 1 } = req.query;
    const joyas = await getJewels({ limits, order_by, page });
    res.json(joyas);
  } catch (err) {
    next(err);
  }
});

router.get('/filtros', async (req, res, next) => {
  try {
    const { precio_max, precio_min, categoria, metal } = req.query;
    const joyas = await getFilteredJewels({ precio_max, precio_min, categoria, metal });
    res.json(joyas);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
