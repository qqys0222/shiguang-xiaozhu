import { useState, useRef } from 'react'
import type { Category, JournalRecord, SpecialFields, MealSource, QuickItem } from '../types'
import { QUICK_ITEMS } from '../types'
import { useStore } from '../store/appStore'

interface Props {
  category: Category
  record?: JournalRecord | null
  onSave: (data: { content: string; images: string[]; specialFields: SpecialFields }) => void
  onClose: () => void
}

export default function AddEditModal({ category, record, onSave, onClose }: Props) {
  const [content, setContent] = useState(record?.content || '')
  const [images, setImages] = useState<string[]>(record?.images || [])
  const [specialFields, setSpecialFields] = useState<SpecialFields>(record?.specialFields || {})
  const fileRef = useRef<HTMLInputElement>(null)
  const quickItems = useStore(s => s.getQuickItemsByCategory(category))
  const presetQuickItems = QUICK_ITEMS[category] || []

  const isEdit = !!record

  const handleAddImage = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleQuickItem = (text: string) => {
    setContent(prev => prev ? `${prev}\n${text}` : text)
  }

  const handleSave = () => {
    onSave({ content, images, specialFields })
  }

  const renderSpecialField = (field: string) => {
    switch (field) {
      case 'bookName':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📖 书籍名称</label>
            <input value={specialFields.bookName || ''} onChange={e => setSpecialFields(p => ({ ...p, bookName: e.target.value }))} placeholder="输入书籍名称" />
          </div>
        )
      case 'readingDuration':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ 阅读时长</label>
            <input value={specialFields.readingDuration || ''} onChange={e => setSpecialFields(p => ({ ...p, readingDuration: e.target.value }))} placeholder="例如：30分钟" />
          </div>
        )
      case 'exerciseContent':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🏃 运动内容</label>
            <input value={specialFields.exerciseContent || ''} onChange={e => setSpecialFields(p => ({ ...p, exerciseContent: e.target.value }))} placeholder="例如：跑步" />
          </div>
        )
      case 'exerciseDuration':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ 运动时长</label>
            <input value={specialFields.exerciseDuration || ''} onChange={e => setSpecialFields(p => ({ ...p, exerciseDuration: e.target.value }))} placeholder="例如：30分钟" />
          </div>
        )
      case 'sleepTime':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🌙 睡觉时间</label>
            <input type="time" value={specialFields.sleepTime || ''} onChange={e => setSpecialFields(p => ({ ...p, sleepTime: e.target.value }))} />
          </div>
        )
      case 'wakeTime':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>☀️ 起床时间</label>
            <input type="time" value={specialFields.wakeTime || ''} onChange={e => setSpecialFields(p => ({ ...p, wakeTime: e.target.value }))} />
          </div>
        )
      case 'sleepQuality':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⭐ 睡眠质量</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`btn btn-sm ${(specialFields.sleepQuality || 0) >= n ? 'btn-primary' : ''}`}
                  onClick={() => setSpecialFields(p => ({ ...p, sleepQuality: n }))}
                  style={{ minWidth: 36 }}
                >{'★'.repeat(n)}{'☆'.repeat(5 - n)}</button>
              ))}
            </div>
          </div>
        )
      case 'sleepDuration':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ 睡眠时长</label>
            <input value={specialFields.sleepDuration || ''} onChange={e => setSpecialFields(p => ({ ...p, sleepDuration: e.target.value }))} placeholder="例如：8小时" />
          </div>
        )
      case 'napStart':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 开始时间</label>
            <input type="time" value={specialFields.napStart || ''} onChange={e => setSpecialFields(p => ({ ...p, napStart: e.target.value }))} />
          </div>
        )
      case 'napEnd':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 结束时间</label>
            <input type="time" value={specialFields.napEnd || ''} onChange={e => setSpecialFields(p => ({ ...p, napEnd: e.target.value }))} />
          </div>
        )
      case 'napDuration':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ 午休时长</label>
            <input value={specialFields.napDuration || ''} onChange={e => setSpecialFields(p => ({ ...p, napDuration: e.target.value }))} placeholder="例如：30分钟" />
          </div>
        )
      case 'breakfastSource': case 'lunchSource': case 'dinnerSource': {
        const mealLabel = field === 'breakfastSource' ? '早餐' : field === 'lunchSource' ? '午餐' : '晚餐'
        const sourceKey = field as 'breakfastSource' | 'lunchSource' | 'dinnerSource'
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🍽 {mealLabel}来源</label>
            <div className="chip-group" style={{ marginTop: 4 }}>
              {(['自己做', '家人做', '外卖', '未吃'] as MealSource[]).map(s => (
                <button
                  key={s}
                  className={`chip ${specialFields[sourceKey] === s ? 'active' : ''}`}
                  onClick={() => setSpecialFields(p => ({ ...p, [sourceKey]: s }))}
                >{s}</button>
              ))}
            </div>
          </div>
        )
      }
      case 'breakfastContent':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🥣 早餐内容</label>
            <input value={specialFields.breakfastContent || ''} onChange={e => setSpecialFields(p => ({ ...p, breakfastContent: e.target.value }))} placeholder="吃了什么？" />
          </div>
        )
      case 'breakfastTime':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 早餐时间</label>
            <input type="time" value={specialFields.breakfastTime || ''} onChange={e => setSpecialFields(p => ({ ...p, breakfastTime: e.target.value }))} />
          </div>
        )
      case 'lunchContent':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🥗 午餐内容</label>
            <input value={specialFields.lunchContent || ''} onChange={e => setSpecialFields(p => ({ ...p, lunchContent: e.target.value }))} placeholder="吃了什么？" />
          </div>
        )
      case 'lunchTime':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 午餐时间</label>
            <input type="time" value={specialFields.lunchTime || ''} onChange={e => setSpecialFields(p => ({ ...p, lunchTime: e.target.value }))} />
          </div>
        )
      case 'dinnerContent':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🍝 晚餐内容</label>
            <input value={specialFields.dinnerContent || ''} onChange={e => setSpecialFields(p => ({ ...p, dinnerContent: e.target.value }))} placeholder="吃了什么？" />
          </div>
        )
      case 'dinnerTime':
        return (
          <div key={field}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 晚餐时间</label>
            <input type="time" value={specialFields.dinnerTime || ''} onChange={e => setSpecialFields(p => ({ ...p, dinnerTime: e.target.value }))} />
          </div>
        )
      default:
        return null
    }
  }

  const renderSpecialFieldsForMeal = () => {
    return <>
      {renderSpecialField('breakfastSource')}
      {renderSpecialField('breakfastContent')}
      {renderSpecialField('breakfastTime')}
      {renderSpecialField('lunchSource')}
      {renderSpecialField('lunchContent')}
      {renderSpecialField('lunchTime')}
      {renderSpecialField('dinnerSource')}
      {renderSpecialField('dinnerContent')}
      {renderSpecialField('dinnerTime')}
    </>
  }

  const renderSpecialFieldsForSleep = () => {
    return <>
      {renderSpecialField('sleepTime')}
      {renderSpecialField('wakeTime')}
      {renderSpecialField('sleepQuality')}
      {renderSpecialField('sleepDuration')}
    </>
  }

  const renderSpecialFieldsForNap = () => {
    return <>
      {renderSpecialField('napStart')}
      {renderSpecialField('napEnd')}
      {renderSpecialField('napDuration')}
    </>
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? '编辑记录' : '添加记录'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {(quickItems.length > 0 || presetQuickItems.length > 0) && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>⚡ 快捷项目</label>
              <div className="quick-items">
                {presetQuickItems.map(item => (
                  <button key={item} className="quick-item-chip" onClick={() => handleQuickItem(item)}>{item}</button>
                ))}
                {quickItems.filter((q: QuickItem) => !presetQuickItems.includes(q.text)).map((item: QuickItem) => (
                  <button key={item.id} className="quick-item-chip" onClick={() => handleQuickItem(item.text)}>{item.text}</button>
                ))}
              </div>
            </div>
          )}

          {category === '今日睡眠' && renderSpecialFieldsForSleep()}
          {category === '午休' && renderSpecialFieldsForNap()}
          {category === '今日饮食' && renderSpecialFieldsForMeal()}
          {category === '阅读记录' && <>
            {renderSpecialField('bookName')}
            {renderSpecialField('readingDuration')}
          </>}
          {category === '运动记录' && <>
            {renderSpecialField('exerciseContent')}
            {renderSpecialField('exerciseDuration')}
          </>}

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>📝 记录内容</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="写下此刻的想法..."
              rows={5}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>🖼 图片</label>
            <div className="image-preview-area">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`图片${i + 1}`} className="image-preview" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ cursor: 'pointer' }} />
              ))}
              <button className="image-add-btn" onClick={handleAddImage}>＋</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="file-input-hidden" onChange={handleFileChange} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
