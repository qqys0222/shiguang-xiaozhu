import type { Category, JournalRecord } from '../types'
import { CATEGORY_ICON } from '../types'

interface Props {
  category: Category
  records: JournalRecord[]
  onAdd: () => void
  onEdit: (record: JournalRecord) => void
}

function formatSpecialFields(record: JournalRecord): string {
  const s = record.specialFields
  const parts: string[] = []
  if (s.bookName) parts.push(`📖 ${s.bookName}`)
  if (s.readingDuration) parts.push(`⏱ ${s.readingDuration}`)
  if (s.exerciseContent) parts.push(`🏃 ${s.exerciseContent}`)
  if (s.exerciseDuration) parts.push(`⏱ ${s.exerciseDuration}`)
  if (s.sleepTime) parts.push(`🌙 ${s.sleepTime}`)
  if (s.wakeTime) parts.push(`☀️ ${s.wakeTime}`)
  if (s.sleepQuality) parts.push(`⭐ ${'★'.repeat(s.sleepQuality)}`)
  if (s.sleepDuration) parts.push(`⏱ ${s.sleepDuration}`)
  if (s.napStart) parts.push(`🕐 ${s.napStart}`)
  if (s.napEnd) parts.push(`- ${s.napEnd}`)
  if (s.napDuration) parts.push(`⏱ ${s.napDuration}`)
  if (s.breakfastSource) parts.push(`🥣 ${s.breakfastSource}`)
  if (s.breakfastContent) parts.push(s.breakfastContent)
  if (s.breakfastTime) parts.push(s.breakfastTime)
  if (s.lunchSource) parts.push(`🥗 ${s.lunchSource}`)
  if (s.lunchContent) parts.push(s.lunchContent)
  if (s.lunchTime) parts.push(s.lunchTime)
  if (s.dinnerSource) parts.push(`🍝 ${s.dinnerSource}`)
  if (s.dinnerContent) parts.push(s.dinnerContent)
  if (s.dinnerTime) parts.push(s.dinnerTime)
  return parts.join(' | ')
}

export default function RecordBlock({ category, records, onAdd, onEdit }: Props) {
  const icon = CATEGORY_ICON[category] || '📝'

  return (
    <div className="record-block">
      <div className="block-header">
        <span className="block-title">{icon} {category}</span>
        {records.length > 0 && <span className="block-count">{records.length}条</span>}
      </div>

      <div className="block-records">
        {records.length === 0 ? (
          <div className="block-empty">还没有记录，点击下方按钮添加</div>
        ) : (
          records.map(r => (
            <div key={r.id} className="block-record-item" onClick={() => onEdit(r)} style={{ cursor: 'pointer' }}>
              <div>{r.content}</div>
              {formatSpecialFields(r) && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{formatSpecialFields(r)}</div>}
              {r.images.length > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>🖼 {r.images.length}张图片</div>}
            </div>
          ))
        )}
      </div>

      <div className="block-actions">
        <button className="btn btn-sm" onClick={onAdd}>＋ 添加记录</button>
      </div>
    </div>
  )
}
