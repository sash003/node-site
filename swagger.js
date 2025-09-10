const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API документация",
      version: "1.0.0",
      description: "Swagger документация для Node.js MVC проекта",
    },
    servers: [
      {
        url: "http://localhost:4320",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger доступен на: http://localhost:4320/api-docs");
}

module.exports = swaggerDocs;
