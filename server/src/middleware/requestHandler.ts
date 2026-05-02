import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const requestHandler = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Capture response body by overriding res.send
  const oldSend = res.send;
  let responseBody: any;
  res.send = function (body) {
    responseBody = body;
    return oldSend.apply(res, arguments as any);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      agent: req.headers['user-agent'],
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      // body: req.body, // Be careful with sensitive data in production
    });
  });

  next();
};

export default requestHandler;
