// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Popover from './popover';

// jsdom has no modal dialogs, so they are stubbed to toggle `open`.
const { showModal, close } = HTMLDialogElement.prototype;
const showModalSpy = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
});

beforeEach(() => {
  showModalSpy.mockClear();
  HTMLDialogElement.prototype.showModal = showModalSpy;
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

afterEach(() => {
  cleanup();
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;
});

const setup = () => {
  const anchor = document.createElement('button');
  anchor.textContent = 'Helmet';
  document.body.append(anchor);
  const onClose = vi.fn();
  const view = render(
    <Popover anchor={anchor} label="Pick a helmet" onClose={onClose}>
      <button type="button">Frost helm</button>
    </Popover>
  );

  return { anchor, onClose, ...view };
};

describe('Given <Popover/> in a DOM', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('when given an anchor then it opens as a modal dialog named by its label', () => {
    setup();

    expect(screen.getByRole('dialog', { name: 'Pick a helmet' })).toBeTruthy();
    expect(showModalSpy).toHaveBeenCalledOnce();
  });

  it('when Esc is pressed then it asks to close', () => {
    const { onClose } = setup();
    const cancel = new Event('cancel', { cancelable: true });

    fireEvent(screen.getByRole('dialog'), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('when the backdrop is clicked then it asks to close, and a click inside does not', () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Frost helm' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('when closed then focus returns to the anchor', () => {
    const { anchor, onClose, rerender } = setup();

    rerender(
      <Popover anchor={null} label="Pick a helmet" onClose={onClose}>
        <button type="button">Frost helm</button>
      </Popover>
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(anchor);
  });

  it('then it is placed beside the anchor', () => {
    setup();

    const style = screen.getByRole('dialog').getAttribute('style') ?? '';
    expect(style).toContain('--popover-top:');
    expect(style).toContain('--popover-left:');
  });
});
