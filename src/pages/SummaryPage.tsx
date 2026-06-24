import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/appStore'
import type { JournalRecord, Category, DailyEntry, Plan } from '../types'
import { CATEGORIES, CATEGORY_ICON, MOODS } from '../types'

type Period = 'week' | 'month' | 'season' | 'year'

function getPeriodRange(period: Period): { start: string; end: string } {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)
  let start: Date
  switch (period) {
    case 'week': {
      const day = now.getDay()
      start = new Date(now)
      start.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
      break
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'season': {
      const q = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), q * 3, 1)
      break
    }
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      break
  }
  return { start: start.toISOString().slice(0, 10), end }
}

function generateAnalysis(records: JournalRecord[], _dailyEntries: DailyEntry[], period: Period): string[] {
  const items: string[] = []
  const totalDays = new Set(records.map(r => r.date)).size
  const totalRecords = records.length

  if (totalDays === 0) {
    items.push('📝 整体评价：该周期内暂无记录，开始记录生活的点滴吧！')
    return items
  }

  const density = (totalRecords / totalDays).toFixed(1)
  items.push(`📝 整体评价：${period === 'week' ? '本周' : period === 'month' ? '本月' : period === 'season' ? '本季' : '本年'}共记录 ${totalDays} 天，${totalRecords} 条记录，日均 ${density} 条，${+density >= 2 ? '记录习惯保持得不错！' : '可以增加记录频率哦～'}`)

  const sleepRecords = records.filter(r => r.category === '今日睡眠')
  if (sleepRecords.length > 0) {
    const qualities = sleepRecords.map(r => r.specialFields.sleepQuality || 0).filter(q => q > 0)
    if (qualities.length > 0) {
      const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length
      items.push(avgQuality >= 3.5
        ? '😴 睡眠分析：睡眠质量整体不错，继续保持良好的作息习惯！'
        : '😴 睡眠分析：睡眠质量有待提升，建议保持规律作息，避免熬夜。')
    }
    const hasSleepTime = sleepRecords.some(r => r.specialFields.sleepTime)
    const hasWakeTime = sleepRecords.some(r => r.specialFields.wakeTime)
    if (hasSleepTime && hasWakeTime) {
      items.push('⏰ 作息分析：部分日期记录了作息时间，建议保持每天相近的作息节奏。')
    }
  }

  const mealRecords = records.filter(r => r.category === '今日饮食')
  if (mealRecords.length > 0) {
    const breakfastCount = mealRecords.filter(r => r.specialFields.breakfastContent || r.specialFields.breakfastSource).length
    const takeoutCount = mealRecords.filter(r =>
      r.specialFields.breakfastSource === '外卖' || r.specialFields.lunchSource === '外卖' || r.specialFields.dinnerSource === '外卖'
    ).length

    if (breakfastCount > 0) {
      items.push(`🥣 饮食分析：记录了 ${breakfastCount} 次早餐，${breakfastCount / totalDays >= 0.5 ? '有较好的早餐习惯！' : '建议坚持吃早餐，为一天注入能量。'}`)
    }
    if (takeoutCount > totalDays * 0.3) {
      items.push('🍔 饮食提醒：外卖频率较高，建议适当增加自己做饭的次数，更健康哦！')
    }
  }

  const exerciseRecords = records.filter(r => r.category === '运动记录')
  if (exerciseRecords.length > 0) {
    items.push(`🏃 运动分析：记录了 ${exerciseRecords.length} 次运动，${exerciseRecords.length >= totalDays * 0.3 ? '保持了不错的运动频率！' : '建议增加运动次数，保持身体健康。'}`)
  }

  const workRecords = records.filter(r => r.category === '工作记录')
  const studyRecords = records.filter(r => r.category === '学习记录')
  if (workRecords.length > 0 || studyRecords.length > 0) {
    const totalWs = workRecords.length + studyRecords.length
    items.push(`💼 工作学习：共 ${totalWs} 条记录，${totalWs >= totalRecords * 0.3 ? '投入了较多时间在工作学习上，很棒！' : '工作学习方面可以多记录一些心得。'}`)
  }

  const readingRecords = records.filter(r => r.category === '阅读记录')
  if (readingRecords.length > 0) {
    items.push(`📖 阅读分析：记录了 ${readingRecords.length} 次阅读，继续保持阅读的好习惯！`)
  }

  const feelingRecords = records.filter(r => ['今日感悟', '今日感恩'].includes(r.category))
  if (feelingRecords.length > 0) {
    items.push(`💭 心情感悟：记录了 ${feelingRecords.length} 条感悟与感恩，善于反思和感恩是很好的品质！`)
  }

  items.push('💪 综合建议：记录是生活的最好见证，坚持下去，你会发现自己越来越了解自己！')
  items.push('🌻 每一天都是新的开始，继续加油，用心记录生活的美好！')

  return items
}

export default function SummaryPage() {
  const navigate = useNavigate()
  const { records: allRecords, dailyEntries: allDailyEntries } = useStore()
  const [period, setPeriod] = useState<Period>('week')
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set(CATEGORIES.map(c => c.key)))
  const [showGenModal, setShowGenModal] = useState(false)
  const [genContent, setGenContent] = useState('')

  const range = useMemo(() => getPeriodRange(period), [period])

  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => r.date >= range.start && r.date <= range.end && selectedCats.has(r.category))
  }, [allRecords, range, selectedCats])

  const filteredEntries = useMemo(() => {
    return allDailyEntries.filter(e => e.date >= range.start && e.date <= range.end)
  }, [allDailyEntries, range])

  const plans = useStore(s => s.plans)

  const planVsRecord = useMemo(() => {
    const result: { plan: Plan; actual: number }[] = []
    const { start, end } = range
    for (const plan of plans.filter(p => p.status === 'active')) {
      const count = allRecords.filter(r => r.category === plan.category && r.date >= start && r.date <= end).length
      result.push({ plan, actual: count })
    }
    return result
  }, [plans, allRecords, range])

  const analysisItems = useMemo(() => generateAnalysis(filteredRecords, filteredEntries, period), [filteredRecords, filteredEntries, period])

  const daysWithRecords = new Set(filteredRecords.map(r => r.date))
  const totalDays = daysWithRecords.size
  const totalEntries = filteredRecords.length

  const moodCount: Record<string, number> = {}
  filteredEntries.forEach(e => {
    e.mood?.forEach(m => { moodCount[m] = (moodCount[m] || 0) + 1 })
  })

  const imageCount = filteredRecords.reduce((sum, r) => sum + (r.images?.length || 0), 0)

  const recordsByDate = useMemo(() => {
    const map: { [key: string]: JournalRecord[] } = {}
    filteredRecords.forEach(r => {
      if (!map[r.date]) map[r.date] = []
      map[r.date].push(r)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredRecords])

  const toggleCategory = (cat: Category) => {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleGenerateSummary = () => {
    const content = analysisItems.map(item => `- ${item}`).join('\n')
    setGenContent(content)
    setShowGenModal(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(genContent)
  }

  const formatSpecial = (r: JournalRecord) => {
    const s = r.specialFields
    const parts: string[] = []
    if (s.bookName) parts.push(s.bookName)
    if (s.exerciseContent) parts.push(s.exerciseContent)
    if (s.sleepQuality) parts.push(`质量${'★'.repeat(s.sleepQuality)}`)
    if (s.readingDuration || s.exerciseDuration || s.sleepDuration) parts.push(s.readingDuration || s.exerciseDuration || s.sleepDuration || '')
    if (s.breakfastContent) parts.push(s.breakfastContent)
    if (s.lunchContent) parts.push(s.lunchContent)
    if (s.dinnerContent) parts.push(s.dinnerContent)
    return parts.join(' | ')
  }

  const datePairs = useMemo(() => {
    const result: { date: string; count: number }[] = []
    daysWithRecords.forEach(d => {
      result.push({ date: d, count: filteredRecords.filter(r => r.date === d).length })
    })
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [filteredRecords, daysWithRecords])

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">周期选择</div>
        <div className="chip-group">
          {(['week', 'month', 'season', 'year'] as Period[]).map(p => (
            <button key={p} className={`chip ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'week' ? '本周' : p === 'month' ? '本月' : p === 'season' ? '本季' : '本年'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">维度筛选</div>
        <div className="filter-group">
          {CATEGORIES.map(c => (
            <label key={c.key} className="filter-check">
              <input type="checkbox" checked={selectedCats.has(c.key)} onChange={() => toggleCategory(c.key)} />
              {c.icon} {c.key}
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔍 快速导航</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => navigate('/log')}>📖 查看今日日志</button>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/record')}>✏️ 去记录</button>
          <button className="btn btn-sm btn-primary" onClick={handleGenerateSummary}>📝 生成总结</button>
        </div>
        {datePairs.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {datePairs.slice(0, 10).map(({ date, count }) => (
              <button key={date} className="chip has-record" onClick={() => navigate('/log')}>
                {date.slice(5)} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">📈 周期概览</div>
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-value">{totalDays}</div>
            <div className="stat-label">记录天数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalEntries}</div>
            <div className="stat-label">记录条目</div>
          </div>
          {Object.keys(moodCount).length > 0 && (
            <div className="stat-item">
              <div className="stat-value">{Object.values(moodCount).reduce((a, b) => a + b, 0)}</div>
              <div className="stat-label">心情记录</div>
            </div>
          )}
          {imageCount > 0 && (
            <div className="stat-item">
              <div className="stat-value">{imageCount}</div>
              <div className="stat-label">图片数量</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">💡 智能分析建议</div>
        {analysisItems.map((item, i) => {
          let colorClass = 'good'
          if (item.includes('提醒') || item.includes('建议') || item.includes('有待')) colorClass = 'warn'
          if (item.includes('较低') || item.includes('较差') || item.includes('偏高') || item.includes('频率较高')) colorClass = 'bad'
          return (
            <div key={i} className={`analysis-item ${colorClass}`}>{item}</div>
          )
        })}
      </div>

      {planVsRecord.length > 0 && (
        <div className="card">
          <div className="card-title">🎯 计划完成对比</div>
          {planVsRecord.map(({ plan, actual }) => {
            const target = plan.targetCount
            const pct = Math.min(100, Math.round((actual / target) * 100))
            const icon = CATEGORY_ICON[plan.category] || '📋'
            return (
              <div key={plan.id} className="record-block" style={{ marginBottom: 8 }}>
                <div className="block-header">
                  <span className="block-title">{icon} {plan.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {{ daily: '每日', weekly: '每周', monthly: '每月', yearly: '每年' }[plan.targetPeriod]} {target}{plan.targetUnit}
                  </span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>完成进度</span>
                    <span>{actual}/{target} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--chip-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, pct)}%`,
                      background: pct >= 100 ? 'var(--good-color)' : pct >= 50 ? 'var(--primary)' : 'var(--warn-color)',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {pct >= 100
                    ? <span style={{ color: 'var(--good-color)' }}>✅ 已完成目标！</span>
                    : <span style={{ color: 'var(--warn-color)' }}>⏳ 还差 {target - actual}{plan.targetUnit} 达到目标</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}

      {Object.keys(moodCount).length > 0 && (
        <div className="card">
          <div className="card-title">💭 心情统计</div>
          <div className="mood-stat-list">
            {MOODS.map(m => (
              <div key={m.key} className="mood-stat-item">
                <span>{m.emoji}</span>
                <span>{m.key}</span>
                <span className="mood-stat-count">{moodCount[m.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recordsByDate.map(([date, recs]) => (
        <div key={date} className="card">
          <div className="card-title">{date}</div>
          <div className="log-records">
            {CATEGORIES.map(c => {
              const catRecs = recs.filter(r => r.category === c.key)
              if (catRecs.length === 0) return null
              return (
                <div key={c.key} className="log-category-group">
                  <div className="log-category-title">{CATEGORY_ICON[c.key]} {c.key}</div>
                  {catRecs.map(r => (
                    <div key={r.id} className="log-record-item">
                      <div>{r.content}</div>
                      {formatSpecial(r) && <div className="record-special">{formatSpecial(r)}</div>}
                      {r.images && r.images.length > 0 && (
                        <div className="record-images">
                          {r.images.map((img, i) => <img key={i} src={img} alt="" />)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 周期总结</h3>
              <button className="modal-close" onClick={() => setShowGenModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button className="btn btn-sm" onClick={handleGenerateSummary}>🔄 重新生成</button>
                <button className="btn btn-sm" onClick={handleCopy}>📋 复制</button>
                <button className="btn btn-sm btn-primary" onClick={async () => {
                  const { addRecord } = useStore.getState()
                  await addRecord({
                    date: new Date().toISOString().slice(0, 10),
                    category: '日记',
                    content: genContent,
                    images: [],
                    specialFields: {},
                    createdAt: new Date().toISOString(),
                  })
                  setShowGenModal(false)
                }}>保存为记录</button>
              </div>
              <textarea
                value={genContent}
                onChange={e => setGenContent(e.target.value)}
                rows={15}
                style={{ width: '100%', fontSize: 13, lineHeight: 1.6 }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowGenModal(false)}>关闭</button>
              <button className="btn btn-primary" onClick={() => setShowGenModal(false)}>✅ 确认生成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
