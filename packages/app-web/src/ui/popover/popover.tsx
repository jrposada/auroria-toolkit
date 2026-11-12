import {
  CSSProperties,
  FunctionComponent,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { computeTooltipPosition } from '../tooltip/tooltip-position';
import styles from './popover.module.css';

type PopoverProps = {
  /** The element that opened the popover; null closes it. */
  anchor: HTMLElement | null;
  /** The dialog's accessible name. */
  label: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * An anchored panel on desktop and a bottom sheet under 640px. A modal
 * <dialog> gives the focus trap, Esc and the top layer natively.
 */
const Popover: FunctionComponent<PopoverProps> = ({
  anchor,
  label,
  onClose,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!anchor || !dialog) {
      return;
    }

    dialog.showModal();

    const panel = dialog.getBoundingClientRect();
    const { top, left } = computeTooltipPosition({
      anchor: anchor.getBoundingClientRect(),
      tooltip: { width: panel.width, height: panel.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    setPosition({ top, left });

    return () => {
      dialog.close();
      anchor.focus();
    };
  }, [anchor]);

  if (!anchor) {
    return null;
  }

  const style = {
    '--popover-top': `${position?.top ?? 0}px`,
    '--popover-left': `${position?.left ?? 0}px`,
  } as CSSProperties;

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={styles.popover}
      style={style}
      onCancel={(event) => {
        // The owner decides; closing it here would leave anchor and dialog out of step.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The content fills the dialog, so a click on the dialog itself is on the backdrop.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  );
};

export default Popover;
