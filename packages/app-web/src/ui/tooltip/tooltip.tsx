import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import TooltipPanel from './tooltip-panel';
import { computeTooltipPosition, TooltipPosition } from './tooltip-position';

type TooltipProps = {
  id: string;
  /** The element the tooltip describes; null closes it. */
  anchor: HTMLElement | null;
  onClose: () => void;
  /** Any CSS colour; draws the top edge. */
  accent?: string;
  children: ReactNode;
};

const Tooltip: FunctionComponent<TooltipProps> = ({
  id,
  anchor,
  onClose,
  accent,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition>();

  useLayoutEffect(() => {
    if (!anchor || !panelRef.current) {
      return;
    }

    const panel = panelRef.current.getBoundingClientRect();

    setPosition(
      computeTooltipPosition({
        anchor: anchor.getBoundingClientRect(),
        tooltip: { width: panel.width, height: panel.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      })
    );
  }, [anchor, children]);

  useEffect(() => {
    if (!anchor) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    anchor.setAttribute('aria-describedby', id);
    anchor.addEventListener('blur', onClose);
    document.addEventListener('keydown', closeOnEscape);
    // The panel is fixed to the viewport, so it must not outlive a scroll.
    window.addEventListener('scroll', onClose, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', onClose);

    return () => {
      anchor.removeAttribute('aria-describedby');
      anchor.removeEventListener('blur', onClose);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', onClose, { capture: true });
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, id, onClose]);

  if (!anchor) {
    return null;
  }

  return createPortal(
    <TooltipPanel ref={panelRef} id={id} accent={accent} position={position}>
      {children}
    </TooltipPanel>,
    document.body
  );
};

export default Tooltip;
