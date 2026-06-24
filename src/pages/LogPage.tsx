import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/appStore'
import type { JournalRecord, DailyEntry } from '../types'
import { CATEGORIES, CATEGORY_ICON } from '../types'

function getDateStr(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
}

function getLast14Days() {
  const days: string[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(getDateStr(d))
  }
  return days
}

function getDatesWithRecords(records: JournalRecord[]): Set<string> {
  return new Set(records.map(r => r.date))
}

export default function LogPage() {
  const navigate = useNavigate()
  const today = new Date()
  const todayStr = getDateStr(today)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [records, setRecords] = useState<JournalRecord[]>([])
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null)
  const { getRecordsByDate, getDailyEntry, records: allRecords } = useStore()

  const last14Days = useMemo(() => getLast14Days(), [])
  const datesWithRecords = useMemo(() => getDatesWithRecords(allRecords), [allRecords])

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    const rs = await getRecordsByDate(selectedDate)
    setRecords(rs)
    const entry = await getDailyEntry(selectedDate)
    setDailyEntry(entry || null)
  }

  const recordsByCategory = useMemo(() => {
    const map: { [key: string]: JournalRecord[] } = {}
    CATEGORIES.forEach(c => { map[c.key] = [] })
    records.forEach(r => {
      if (map[r.category]) map[r.category].push(r)
    })
    return map
  }, [records])

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    setSelectedDate(getDateStr(d))
  }

  const goToday = () => setSelectedDate(todayStr)

  const formatSpecialFields = (r: JournalRecord) => {
    const s = r.specialFields
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
    if (s.breakfastContent) parts.push(`🥣 ${s.breakfastContent}`)
    if (s.lunchContent) parts.push(`🥗 ${s.lunchContent}`)
    if (s.dinnerContent) parts.push(`🍝 ${s.dinnerContent}`)
    return parts.join(' | ')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">📖 历史记录</div>
      </div>

      <div className="card">
        <div className="log-date-chips">
          {last14Days.map(d => {
            const dayNum = new Date(d).getDate()
            const weekdays = ['日', '一', '二', '三', '四', '五', '六']
            const weekday = weekdays[new Date(d).getDay()]
            return (
              <button
                key={d}
                className={`date-chip ${selectedDate === d ? 'active' : ''} ${datesWithRecords.has(d) ? 'has-record' : ''}`}
                onClick={() => setSelectedDate(d)}
              >
                <span className="day-num">{dayNum}</span>
                <span>{weekday}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="log-date-nav">
          <button className="btn btn-sm" onClick={() => changeDate(-1)}>◀ 前一天</button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{formatDateDisplay(selectedDate)}</span>
          <button className="btn btn-sm" onClick={() => changeDate(1)}>后一天 ▶</button>
          <button className="btn btn-sm btn-primary" onClick={goToday}>📍 今天</button>
          <button className="btn btn-sm" onClick={() => navigate('/summary')}>📊 查看总结</button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="log-empty">
          <div className="log-empty-text">暂无日志</div>
          <button className="btn btn-primary" onClick={() => navigate('/record')}>✏️ 去记录</button>
        </div>
      ) : (
        <div className="card">
          {dailyEntry && (
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              {dailyEntry.weather && <span>☀️ {dailyEntry.weather} </span>}
              {dailyEntry.temperature && <span>🌡️ {dailyEntry.temperature}°C </span>}
              {dailyEntry.mood && dailyEntry.mood.length > 0 && <span>💭 {dailyEntry.mood.join(' ')}</span>}
            </div>
          )}
          <div className="log-records">
            {CATEGORIES.map(c => {
              const catRecords = recordsByCategory[c.key]
              if (catRecords.length === 0) return null
              return (
                <div key={c.key} className="log-category-group">
                  <div className="log-category-title">{CATEGORY_ICON[c.key]} {c.key}</div>
                  {catRecords.map(r => (
                    <div key={r.id} className="log-record-item">
                      <div>{r.content}</div>
                      {formatSpecialFields(r) && <div className="record-special">{formatSpecialFields(r)}</div>}
                      {r.images.length > 0 && (
                        <div className="record-images">
                          {r.images.map((img, i) => (
                            <img key={i} src={img} alt={`img${i}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
