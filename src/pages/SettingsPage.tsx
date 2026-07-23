import { useState, useRef } from 'react'
import { useStore } from '../store/appStore'
import ConfirmModal from '../components/ConfirmModal'
import type { Category } from '../types'
import { CATEGORIES } from '../types'

export default function SettingsPage() {
  const {
    theme, setTheme,
    reminders, addReminder, deleteReminder,
    records, quickItems, addQuickItem, deleteQuickItem,
    generateMockData, clearAllData, exportAllData, importData,
  } = useStore()

  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderNote, setReminderNote] = useState('')
  const [reminderDateTime, setReminderDateTime] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [importText, setImportText] = useState('')
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  const [quickCat, setQuickCat] = useState<Category>('工作记录')
  const [quickText, setQuickText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isDark = theme === 'dark'

  const handleAddReminder = () => {
    if (!reminderTitle.trim() || !reminderDateTime) return
    addReminder({
      title: reminderTitle,
      note: reminderNote,
      dateTime: reminderDateTime,
      createdAt: new Date().toISOString(),
    })
    setReminderTitle('')
    setReminderNote('')
    setReminderDateTime('')
  }

  const handleExportJSON = async () => {
    const data = await exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `时光小筑备份_${todayStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportText = async () => {
    const { records: allRecords } = useStore.getState()
    let text = `时光小筑数据导出 - ${todayStr}\n${'='.repeat(40)}\n\n`
    const byDate: Record<string, any[]> = {}
    allRecords.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = []
      byDate[r.date].push(r)
    })
    Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a)).forEach(([date, recs]) => {
      text += `【${date}】\n`
      recs.forEach(r => {
        text += `  [${r.category}] ${r.content}\n`
      })
      text += '\n'
    })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `时光小筑_${todayStr}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = ev.target?.result as string
      setImportText(text)
      setShowImportConfirm(true)
    }
    reader.readAsText(file)
  }

  const confirmImport = async () => {
    try {
      await importData(importText)
      setShowImportConfirm(false)
      setImportText('')
    } catch (err) {
      alert('导入失败，请检查文件格式')
    }
  }

  const handleClearAll = async () => {
    await clearAllData()
    setShowClearConfirm(false)
  }

  const handleAddQuickItem = () => {
    if (!quickText.trim()) return
    addQuickItem({ category: quickCat, text: quickText.trim() })
    setQuickText('')
  }

  const categoryQuickItems = quickItems.filter(q => q.category === quickCat)

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">外观</div>
        <div className="setting-item">
          <span>{isDark ? '🌙 夜间护眼模式' : '☀️ 日间温馨模式'}</span>
          <button
            className={`toggle-switch ${isDark ? 'on' : ''}`}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">备忘提醒 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({reminders.length})</span></div>
        <div className="reminder-form">
          <input value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} placeholder="提醒标题" />
          <input value={reminderNote} onChange={e => setReminderNote(e.target.value)} placeholder="备注（可选）" />
          <input type="datetime-local" value={reminderDateTime} onChange={e => setReminderDateTime(e.target.value)} />
          <button className="btn btn-primary" onClick={handleAddReminder}>＋ 添加提醒</button>
        </div>
        {reminders.map(r => (
          <div key={r.id} className="reminder-item">
            <div className="reminder-info">
              <div className="reminder-title">{r.title}</div>
              {r.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.note}</div>}
              <div className="reminder-time">🕐 {r.dateTime.replace('T', ' ')}</div>
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => deleteReminder(r.id!)}>删除</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">数据管理</div>
        <div className="setting-item">
          <span>记录数量</span>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{records.length} 条</span>
        </div>
        <div className="data-btn-group">
          <button className="btn" onClick={generateMockData}>✨ 生成模拟数据</button>
          <button className="btn" onClick={handleExportJSON}>📤 导出全部 (JSON)</button>
          <button className="btn" onClick={handleExportText}>📄 导出 (纯文本)</button>
          <input ref={fileRef} type="file" accept=".json" className="file-input-hidden" onChange={handleImportFile} />
          <button className="btn" onClick={() => fileRef.current?.click()}>📥 导入数据</button>
          <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>🗑 清空全部数据</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">快捷项目管理</div>
        <div className="quick-mgr">
          <select value={quickCat} onChange={e => setQuickCat(e.target.value as Category)}>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.icon} {c.key}</option>
            ))}
          </select>
          <div className="quick-mgr-row">
            <input value={quickText} onChange={e => setQuickText(e.target.value)} placeholder="输入快捷项目" className="flex-1" />
            <button className="btn btn-primary" onClick={handleAddQuickItem}>添加</button>
          </div>
          <div className="quick-mgr-list">
            {categoryQuickItems.length === 0 ? (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>暂无快捷项目</span>
            ) : (
              categoryQuickItems.map(q => (
                <span key={q.id} className="quick-mgr-item">
                  {q.text}
                  <button className="del-btn" onClick={() => deleteQuickItem(q.id!)}>✕</button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">关于</div>
        <div className="about-text">
          时光小筑是一款温馨的个人生活记录工具，帮助你记录每一天的点滴。
          支持工作、学习、阅读、运动等多维度记录，配合心情天气标注，
          自动生成周期总结分析，让生活有迹可循。
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="清空全部数据"
          message="确定要清空所有数据吗？此操作不可恢复！"
          confirmText="确认清空"
          danger
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {showImportConfirm && (
        <ConfirmModal
          title="导入数据"
          message="确定要导入数据吗？导入的数据会追加到现有数据中。"
          confirmText="确认导入"
          onConfirm={confirmImport}
          onCancel={() => setShowImportConfirm(false)}
        />
      )}
    </div>
  )
}
