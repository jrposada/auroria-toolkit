import '@fontsource/spectral-sc/500.css';
import '@fontsource/spectral-sc/600.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './ui/theme/tokens.css';
import './ui/theme/base.css';
import './i18n';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import App from './app';
import {
  getLocalStorage,
  readStoredValue,
} from './core/hooks/use-local-storage/use-local-storage';
import {
  applyThemeChoice,
  parseThemeChoice,
  THEME_STORAGE_KEY,
} from './features/layout/theme';
import i18n from './i18n';

const queryClient = new QueryClient({
  // One retry: the unreachable-API message should not wait for three backoffs.
  defaultOptions: { queries: { retry: 1 } },
});

// Applied before the first render so a stored choice never flashes the system theme.
applyThemeChoice(
  document.documentElement,
  parseThemeChoice(readStoredValue(getLocalStorage(), THEME_STORAGE_KEY, null))
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </QueryClientProvider>
  </StrictMode>
);
