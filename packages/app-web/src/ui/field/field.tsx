import { FunctionComponent, ReactNode } from 'react';

import styles from './field.module.css';

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

// The label wraps the control, so the two are associated without ids.
const Field: FunctionComponent<FieldProps> = ({ label, hint, children }) => {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
};

export default Field;
