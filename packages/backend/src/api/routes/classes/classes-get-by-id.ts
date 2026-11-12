import type {
  ClassesGetByIdParams,
  ClassesGetByIdResponse,
} from '@jrposada/auroria-toolkit-shared/models/classes/classes-get-by-id';

import { getClassById } from '../../../services/class.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiClass } from '../../mappers/classes.ts';

const handler = toRequestHandler<ClassesGetByIdResponse, ClassesGetByIdParams>(
  async (request) => {
    const { id } = request.params;

    const row = await getClassById(id);

    return {
      statusCode: 200,
      body: {
        success: true,
        data: {
          class: toApiClass(row),
        },
      },
    };
  }
);

export { handler };
