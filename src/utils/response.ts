import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  statusCode = 200,
  message?: string
) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
};

export const sendPaginated = (
  res: Response,
  data: any[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
};

export default { sendSuccess, sendError, sendPaginated };
