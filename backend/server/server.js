require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { readInventory, createItem, updateItem, deleteItem } = require('../utils/pg');

const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/inventory', (_, res, next) => {
    readInventory()
        .then((items) => res.status(200).json(items))
        .catch((error) => next(error));
});

app.post('/inventory', (req, res, next) => {
    const { nombre, categoria, metal, precio, stock } = req.body;
    createItem({ nombre, categoria, metal, precio, stock })
        .then((result) => res.status(result?.code ? 500 : 200).json(result))
        .catch((error) => next(error));
});

app.put('/inventory/:id', (req, res, next) => {
    updateItem(req.params.id, req.body)
        .then((result) => res.status(result?.code ? 500 : 200).json(result))
        .catch((error) => next(error));
});

app.delete('/inventory/:id', (req, res, next) => {
    deleteItem(req.params.id)
        .then((result) => res.status(result?.code ? 500 : 200).json(result))
        .catch((error) => next(error));
});

app.all('*', (_, res) => res.status(404).json({ code: 404, message: 'La ruta no existe' }));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
