import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages
        });
      }

      req.body = dto;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Validation error occurred' });
    }
  };
};

export const validateParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingParams = requiredParams.filter(param => !req.params[param]);

    if (missingParams.length > 0) {
      res.status(400).json({
        error: 'Missing required parameters',
        missing: missingParams
      });
      return;
    }

    next();
  };
};

export const validateQuery = (requiredQuery: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingQuery = requiredQuery.filter(query => !req.query[query]);

    if (missingQuery.length > 0) {
      res.status(400).json({
        error: 'Missing required query parameters',
        missing: missingQuery
      });
      return;
    }

    next();
  };
};