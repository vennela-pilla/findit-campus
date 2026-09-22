import { Response } from "express";

// Small helpers to keep every API response in the same shape:
// { success, message, data? }
export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
