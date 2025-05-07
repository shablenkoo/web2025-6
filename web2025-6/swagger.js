const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Note Service API',
      version: '1.0.0',
      description: 'Документація сервісу для роботи з нотатками',
    },
  },
  apis: ['./index.js'], // шлях до файлів з коментарями Swagger
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
