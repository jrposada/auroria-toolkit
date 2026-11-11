import { createRootRoute, Outlet } from '@tanstack/react-router';

import AppLayout from '../features/layout/app-layout';
import NotFound from '../features/layout/not-found';

export const Route = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  // Rendered in place of the outlet, so it is already inside the layout.
  notFoundComponent: NotFound,
});
