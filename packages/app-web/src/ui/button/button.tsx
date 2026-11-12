import { ButtonHTMLAttributes, FunctionComponent } from 'react';

import styles from './button.module.css';

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> & {
  variant?: 'primary' | 'quiet';
  size?: 'md' | 'sm';
};

const Button: FunctionComponent<ButtonProps> = ({
  type = 'button',
  variant = 'quiet',
  size = 'md',
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      type={type}
      data-variant={variant}
      data-size={size}
      className={styles.button}
    >
      {children}
    </button>
  );
};

export default Button;
