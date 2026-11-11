import { FunctionComponent, ReactNode } from 'react';

import styles from './app-layout.module.css';

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FunctionComponent<AppLayoutProps> = ({ children }) => {
  return (
    <div className={styles.wrap}>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default AppLayout;
