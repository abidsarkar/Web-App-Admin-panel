import { Response } from "express";

export interface ErrorData {
  statusCode: number;
  message: string;
  success?: boolean;
  errors?: any; // Optional: if you want to include validation or detailed errors
}
const sendErrorResponse = (
  res: Response,
  { success = false, statusCode, message, errors }: ErrorData
): void => {
  const response: any = {
    success,
    statusCode,
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
};

