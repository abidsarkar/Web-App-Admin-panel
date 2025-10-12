import express from "express";
import { routesConfig } from "./routesConfig";

const router = express.Router();

routesConfig
  .filter(({ handler }) => typeof handler === "function")
  .forEach(({ path, handler }) => router.use(path, handler as express.RequestHandler));

export default router;
