const express = require('express');
const cors = require('cors');
const { readInventory, createItem, updateItem, deleteItem } = require('../utils/pg');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Función HATEOAS

function createHateoasLinks(id) {
  return [
    { rel: 'self', href: `/inventory/${id}` },
    { rel: 'update', href: `/inventory/${id}`, method: 'PUT', title: 'Update Item' },
    { rel: 'delete', href: `/inventory/${id}`, method: 'DELETE', title: 'Delete Item' }
  ];
}

app.get('/inventory', (_, res, next) => {
  readInventory()
    .then((items) => {
      // aqui rey HATEOAS a cada elemento
      const itemsWithHateoas = items.map((item) => ({
        ...item,
        links: createHateoasLinks(item.id)
      }));
      res.status(200).json(itemsWithHateoas);
    })
    .catch((error) => next(error));
});

app.post('/inventory', (req, res, next) => {
  const { nombre, categoria, metal, precio, stock } = req.body;
  createItem({ nombre, categoria, metal, precio, stock })
    .then((result) => {
      const item = {
        ...result,
        links: createHateoasLinks(result.id)
      };
      res.status(result.code ? 500 : 201).json(item);
    })
    .catch((error) => next(error));
});

app.put('/inventory/:id', (req, res, next) => {
  updateItem(req.params.id, req.body)
    .then((result) => {
      const item = {
        ...result,
        links: createHateoasLinks(req.params.id)
      };
      res.status(result.code ? 500 : 200).json(item);
    })
    .catch((error) => next(error));
});

app.delete('/inventory/:id', (req, res, next) => {
  deleteItem(req.params.id)
    .then((result) => {
      res.status(result.code ? 500 : 204).end();
    })
    .catch((error) => next(error));
});

app.all('*', (_, res) => res.status(404).json({ code: 404, message: 'La ruta no existe' }));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
