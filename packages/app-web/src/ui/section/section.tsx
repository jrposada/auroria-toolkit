import { FunctionComponent, HTMLAttributes, ReactNode, useId } from 'react';

import styles from './section.module.css';

type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** A titled page region: ruled at the top, not boxed like a card. */
const Section: FunctionComponent<SectionProps> = ({
  title,
  actions,
  children,
  ...rest
}) => {
  const headingId = useId();

  return (
    <section
      {...rest}
      aria-labelledby={title ? headingId : rest['aria-labelledby']}
      className={styles.section}
    >
      {(title || actions) && (
        <div className={styles.head}>
          {title && <h2 id={headingId}>{title}</h2>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;
