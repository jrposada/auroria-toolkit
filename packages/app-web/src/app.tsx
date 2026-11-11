import { RouterProvider } from '@tanstack/react-router';
import { FunctionComponent } from 'react';

import { router } from './router';

const App: FunctionComponent = () => {
  return <RouterProvider router={router} basepath={import.meta.env.BASE_URL} />;
};

export default App;
