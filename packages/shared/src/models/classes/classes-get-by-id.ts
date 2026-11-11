import z from 'zod';

import { Class } from './class.ts';

export const classesGetByIdParamsSchema = z.object({
  id: z.string().nonempty(),
});
export type ClassesGetByIdParams = z.infer<typeof classesGetByIdParamsSchema>;

export type ClassesGetByIdResponse = {
  class: Class;
};
