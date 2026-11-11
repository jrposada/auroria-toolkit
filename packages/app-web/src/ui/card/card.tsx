import { FunctionComponent, HTMLAttributes, ReactNode } from 'react';

import styles from './card.module.css';

type CardProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
};

const Card: FunctionComponent<CardProps> = ({
  title,
  aside,
  children,
  ...rest
}) => {
  return (
    <section {...rest} className={styles.card}>
      {(title || aside) && (
        <div className={styles.head}>
          {title && <h2>{title}</h2>}
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default Card;
