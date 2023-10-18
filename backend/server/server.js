const express = require('express');
const cors = require('cors');
const {
  readInventory,
  createItem,
  updateItem,
  deleteItem
} = require('../utils/pg');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Función HATEOAS

function createHateoasLinks(id) {
  return [
    { rel: 'self', href: `/inventario/${id}` },
    { rel: 'update', href: `/inventario/${id}`, method: 'PUT', title: 'Update Item' },
    { rel: 'delete', href: `/inventario/${id}`, method: 'DELETE', title: 'Delete Item' }
  ];
}

// Middleware para manejar errores de manera centralizada
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: 'Error interno del servidor' });
});

app.get('/inventario', (_, res, next) => {
  readInventory()
    .then((items) => {
      const itemsWithHateoas = items.map((item) => ({
        ...item,
        links: createHateoasLinks(item.id)
      }));
      res.status(200).json(itemsWithHateoas);
    })
    .catch(next);
});

app.post('/inventario', (req, res, next) => {
  const { nombre, categoria, metal, precio, stock } = req.body;
  createItem({ nombre, categoria, metal, precio, stock })
    .then((result) => {
      const item = {
        ...result,
        links: createHateoasLinks(result.id)
      };
      res.status(result.code ? 500 : 201).json(item);
    })
    .catch(next);
});

app.put('/inventario/:id', (req, res, next) => {
  updateItem(req.params.id, req.body)
    .then((result) => {
      const item = {
        ...result,
        links: createHateoasLinks(req.params.id)
      };
      res.status(result.code ? 500 : 200).json(item);
    })
    .catch(next);
});

app.delete('/inventario/:id', (req, res, next) => {
  deleteItem(req.params.id)
    .then((result) => {
      res.status(result.code ? 500 : 204).end();
    })
    .catch(next);
});

app.all('*', (_, res) => res.status(404).json({ code: 404, message: 'La ruta no existe' }));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
