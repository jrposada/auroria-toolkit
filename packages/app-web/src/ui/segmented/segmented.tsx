import { ReactElement, useId } from 'react';

import styles from './segmented.module.css';

type SegmentedProps<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// Native radios give the arrow keys and the checked state for free.
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>): ReactElement {
  const name = useId();

  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="visually-hidden"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export default Segmented;
