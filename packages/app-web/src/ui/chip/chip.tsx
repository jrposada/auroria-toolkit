import { FunctionComponent, ReactNode } from 'react';

import styles from './chip.module.css';

type ChipVariant = 'strength' | 'constitution' | 'talent' | 'neutral';

type ChipProps = {
  variant?: ChipVariant;
  children: ReactNode;
};

const Chip: FunctionComponent<ChipProps> = ({
  variant = 'neutral',
  children,
}) => {
  return (
    <span className={styles.chip} data-variant={variant}>
      {children}
    </span>
  );
};

export default Chip;
