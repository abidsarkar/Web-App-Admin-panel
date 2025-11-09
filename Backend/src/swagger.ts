import  swaggerUi  from 'swagger-ui-express';
import  swaggerJsdoc  from 'swagger-jsdoc';
// swagger.ts

import { Application } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "Admin backend API"
    },
    servers: [{ url: "http://localhost:5001", description: "Local" }],
  },
  apis: ["./src/routes/*.ts", "./src/modules/**/*.ts"], // JSDoc paths
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}
