import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        // Tests read shared's sources, so they don't depend on a built dist.
        find: /^@jrposada\/auroria-toolkit-shared\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, '../shared/src/$1.ts'),
      },
    ],
  },
});
