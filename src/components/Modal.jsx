import { useEffect } from 'react';
import Icon from './Icon';

export default function Modal({ title, onClose, children, width = 640 }) {
  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmText = 'Delete', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} width={420}>
      <div className="modal-body confirm">
        <div className="confirm-icon"><Icon name="trash" size={22} /></div>
        <p>{message}</p>
      </div>
      <div className="modal-foot">
        <button className="secondary" onClick={onClose}>Cancel</button>
        <button className="danger" onClick={onConfirm} autoFocus>{confirmText}</button>
      </div>
    </Modal>
  );
}
