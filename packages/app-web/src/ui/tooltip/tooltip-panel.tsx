import { CSSProperties, FunctionComponent, ReactNode, Ref } from 'react';

import styles from './tooltip.module.css';
import { TooltipPosition } from './tooltip-position';

type TooltipPanelProps = {
  id: string;
  /** Any CSS colour; draws the top edge. */
  accent?: string;
  /** Omitted while the panel is being measured. */
  position?: TooltipPosition;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

const TooltipPanel: FunctionComponent<TooltipPanelProps> = ({
  id,
  accent,
  position,
  children,
  ref,
}) => {
  const style: CSSProperties & { '--tooltip-accent'?: string } = {
    '--tooltip-accent': accent,
    ...(position
      ? { top: position.top, left: position.left }
      : { visibility: 'hidden' }),
  };

  return (
    <div
      ref={ref}
      role="tooltip"
      id={id}
      className={styles.panel}
      data-placement={position?.placement}
      style={style}
    >
      {children}
    </div>
  );
};

export default TooltipPanel;
