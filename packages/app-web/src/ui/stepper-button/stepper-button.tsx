import { ButtonHTMLAttributes, FunctionComponent } from 'react';

import styles from './stepper-button.module.css';

type StepperButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
> & {
  label: string;
};

const StepperButton: FunctionComponent<StepperButtonProps> = ({
  label,
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      className={styles.stepper}
    >
      {children}
    </button>
  );
};

export default StepperButton;
