import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/appStore'
import RecordBlock from '../components/RecordBlock'
import AddEditModal from '../components/AddEditModal'
import type { JournalRecord, Category, Mood, DailyEntry, SpecialFields } from '../types'
import { CATEGORIES, MOODS, WEATHERS } from '../types'

function formatDate(date: Date) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekdays[date.getDay()]}`
}

function getDateStr(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function RecordPage() {
  const navigate = useNavigate()
  const today = new Date()
  const todayStr = getDateStr(today)

  const [weather, setWeather] = useState('晴')
  const [temperature, setTemperature] = useState('')
  const [moods, setMoods] = useState<Mood[]>([])
  const [currentDate, setCurrentDate] = useState(todayStr)
  const [records, setRecords] = useState<JournalRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<{ category: Category; record?: JournalRecord | null } | null>(null)

  const { addRecord, updateRecord, getRecordsByDate, saveDailyEntry, getDailyEntry } = useStore()

  useEffect(() => {
    loadData()
  }, [currentDate])

  useEffect(() => {
    loadDailyEntry()
  }, [currentDate])

  const loadData = async () => {
    const rs = await getRecordsByDate(currentDate)
    setRecords(rs)
  }

  const loadDailyEntry = async () => {
    const entry = await getDailyEntry(currentDate)
    if (entry) {
      setWeather(entry.weather)
      setTemperature(entry.temperature)
      setMoods(entry.mood as Mood[])
    } else {
      setWeather('晴')
      setTemperature('')
      setMoods([])
    }
  }

  const saveDaily = async () => {
    const entry: DailyEntry = {
      date: currentDate,
      weather,
      temperature,
      mood: moods,
      createdAt: new Date().toISOString(),
    }
    await saveDailyEntry(entry)
  }

  useEffect(() => {
    if (currentDate) { saveDaily() }
  }, [weather, temperature, moods, currentDate])

  const toggleMood = (mood: Mood) => {
    setMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood])
  }

  const recordsByCategory = useMemo(() => {
    const map: { [key: string]: JournalRecord[] } = {}
    CATEGORIES.forEach(c => { map[c.key] = [] })
    records.forEach(r => {
      if (map[r.category]) map[r.category].push(r)
    })
    return map as Record<string, JournalRecord[]>
  }, [records])

  const handleAddRecord = (category: Category) => {
    setEditingRecord({ category, record: null })
  }

  const handleEditRecord = (record: JournalRecord) => {
    setEditingRecord({ category: record.category, record })
  }

  const handleSaveRecord = async (data: { content: string; images: string[]; specialFields: SpecialFields }) => {
    if (!editingRecord) return
    const { category, record } = editingRecord
    if (record?.id) {
      await updateRecord(record.id, {
        content: data.content,
        images: data.images,
        specialFields: data.specialFields,
      })
    } else {
      const newRecord: JournalRecord = {
        date: currentDate,
        category,
        content: data.content,
        images: data.images,
        specialFields: data.specialFields,
        createdAt: new Date().toISOString(),
      }
      await addRecord(newRecord)
    }
    setEditingRecord(null)
    await loadData()
  }

  const navigateToDate = (daysOffset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() + daysOffset)
    setCurrentDate(getDateStr(d))
  }

  return (
    <div className="page">
      <div className="banner-card">
        <div className="banner-text">📋 记录了一天？一键生成精美当日日志</div>
        <div className="banner-actions">
          <button className="btn btn-sm" onClick={() => navigateToDate(-1)}>查看昨天</button>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/log')}>查看日志</button>
        </div>
      </div>

      <div className="quick-nav">
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0, lineHeight: '32px' }}>📖 快速查看：</span>
        <button className="chip" onClick={() => navigateToDate(-1)}>昨天</button>
        <button className="chip" onClick={() => navigateToDate(-2)}>前天</button>
        <button className="chip" onClick={() => navigateToDate(-7)}>一周前</button>
        <button className="chip" onClick={() => navigateToDate(-30)}>一个月前</button>
        <button className="chip" onClick={() => navigate('/plan')}>📋 查看计划</button>
        <button className="chip" onClick={() => navigate('/summary')}>📊 查看总结</button>
      </div>

      <div className="card">
        <div className="card-title">📅 {formatDate(new Date(currentDate))}</div>
        <div className="info-card">
          <div className="info-item">
            <label>☀️ 天气</label>
            <select value={weather} onChange={e => setWeather(e.target.value)}>
              {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="info-item">
            <label>🌡️ 温度</label>
            <input value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="例如：25°C" style={{ maxWidth: 100 }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">💭 今日心情</div>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button
              key={m.key}
              className={`mood-btn ${moods.includes(m.key) ? 'active' : ''}`}
              onClick={() => toggleMood(m.key)}
              title={m.key}
            >{m.emoji}</button>
          ))}
        </div>
      </div>

      <div className="record-blocks">
        {CATEGORIES.map(c => (
          <RecordBlock
            key={c.key}
            category={c.key}
            records={recordsByCategory[c.key]}
            onAdd={() => handleAddRecord(c.key)}
            onEdit={handleEditRecord}
          />
        ))}
      </div>

      {editingRecord && (
        <AddEditModal
          category={editingRecord.category}
          record={editingRecord.record}
          onSave={handleSaveRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  )
}
