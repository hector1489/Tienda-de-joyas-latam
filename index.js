const express = require('express');
const router = require('./server/server');
const { logger } = require('./middleware/middleware');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger);

app.use('/joyas', router);

app.use((err, _req, res, _next) => {
  console.error('Error In App', err);
  const errorResponse = {
    error: 'something went wrong',
  };
  res.status(500).json(errorResponse);
});

app.get('*', (_req, res) => {
  res.status(404).send("Lo siento, esta ruta no existe!");
});

app.listen(PORT, () => console.log(`Servidor en ejecución en http://localhost:${PORT}`));
