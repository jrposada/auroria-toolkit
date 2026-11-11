import { FunctionComponent } from 'react';

import styles from './data-state.module.css';

type PlaceholderProps = {
  /** Height in px of the panel this stands in for, so loading does not shift the layout. */
  height: number;
};

const Placeholder: FunctionComponent<PlaceholderProps> = ({ height }) => {
  return (
    <div aria-hidden="true" className={styles.placeholder} style={{ height }} />
  );
};

export default Placeholder;
