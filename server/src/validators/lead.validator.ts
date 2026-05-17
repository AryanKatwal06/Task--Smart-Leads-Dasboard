import { z } from 'zod';

export const leadStatusSchema = z.enum(['New', 'Contacted', 'Qualified', 'Lost']);
export const leadSourceSchema = z.enum(['Website', 'Instagram', 'Referral']);

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional()
});

export const updateLeadSchema = createLeadSchema.partial();
