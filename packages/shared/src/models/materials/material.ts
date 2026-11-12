import z from 'zod';

import { slugSchema } from '../classes/class.ts';

export const materialSchema = z.object({
  id: slugSchema,
  name: z.string(),
});
export type Material = z.infer<typeof materialSchema>;
