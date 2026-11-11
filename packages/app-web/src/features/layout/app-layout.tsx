import { FunctionComponent, ReactNode } from 'react';

import AppFooter from './app-footer';
import AppHeader from './app-header';
import styles from './app-layout.module.css';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FunctionComponent<AppLayoutProps> = ({ children }) => {
  return (
    <div className={styles.wrap}>
      <AppHeader />
      <main className={styles.main}>{children}</main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
