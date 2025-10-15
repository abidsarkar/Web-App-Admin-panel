import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, `API endpoint not found: ${req.originalUrl}`));
};

export default notFound;
