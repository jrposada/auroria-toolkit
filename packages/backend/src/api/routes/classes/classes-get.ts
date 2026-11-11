import type { ClassesGetResponse } from '@jrposada/auroria-toolkit-shared/models/classes/classes-get';

import { getClasses } from '../../../services/class.ts';
import { toRequestHandler } from '../../infrastructure/to-request-handler.ts';
import { toApiClass } from '../../mappers/classes.ts';

const handler = toRequestHandler<ClassesGetResponse>(async () => {
  const classes = await getClasses();

  return {
    statusCode: 200,
    body: {
      success: true,
      data: {
        classes: classes.map(toApiClass),
      },
    },
  };
});

export { handler };
