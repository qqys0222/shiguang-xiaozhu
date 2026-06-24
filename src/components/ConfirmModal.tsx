interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, message, confirmText = '确认', cancelText = '取消', danger, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" style={{ maxHeight: 'auto', paddingBottom: 20 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>{cancelText}</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
