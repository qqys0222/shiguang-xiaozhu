import { useState, useRef } from 'react'
import type { Category, JournalRecord, SpecialFields } from '../types'

interface Props {
  category: Category
  record?: JournalRecord | null
  onSave: (data: { content: string; images: string[]; specialFields: SpecialFields }) => void
  onClose: () => void
}

export default function AddEditModal({ category: _category, record, onSave, onClose }: Props) {
  const [content, setContent] = useState(record?.content || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onSave({ content, images: [], specialFields: {} })
  }

  const handleAddImage = () => {
    fileRef.current?.click()
  }

  const handleFileChange = () => {
    // Image handling simplified for now
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{record ? '编辑记录' : '添加记录'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>📝 记录内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="写下此刻的想法..."
              rows={5}
              autoComplete="off"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--input-border)', borderRadius: 'var(--radius-sm)', fontSize: 16, background: 'var(--input-bg)', color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: 100, boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>🖼 图片</label>
            <button className="btn btn-sm" onClick={handleAddImage}>＋ 添加图片</button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} style={{ flex: 1, padding: 12, fontSize: 15 }}>取消</button>
          <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, padding: 12, fontSize: 15 }}>保存</button>
        </div>
      </div>
    </div>
  )
}
