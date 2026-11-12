import { cloneElement, FunctionComponent, ReactElement, useId } from 'react';

import styles from './field.module.css';

type ControlProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
};

type FieldProps = {
  label: string;
  hint?: string;
  /** Replaces the hint and marks the control invalid. */
  error?: string;
  children: ReactElement<ControlProps>;
};

// The label wraps the control, so the two are associated without ids.
const Field: FunctionComponent<FieldProps> = ({
  label,
  hint,
  error,
  children,
}) => {
  const descriptionId = useId();
  const description = error ?? hint;
  const control = description
    ? cloneElement(children, {
        'aria-describedby': descriptionId,
        ...(error ? { 'aria-invalid': true } : {}),
      })
    : children;

  return (
    <label className={styles.field}>
      <span>{label}</span>
      {control}
      {error ? (
        <span id={descriptionId} data-error className={styles.error}>
          {error}
        </span>
      ) : (
        hint && (
          <span id={descriptionId} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </label>
  );
};

export default Field;
