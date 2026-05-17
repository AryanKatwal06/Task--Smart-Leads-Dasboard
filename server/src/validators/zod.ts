import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';

export const validateBody =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }
    req.body = result.data;
    next();
  };

export const idParamSchema = z.object({ id: z.string().min(1) });

export default { validateBody, idParamSchema };
