import { useState, useMemo } from 'react'
import { useStore } from '../store/appStore'
import type { Plan, PlanStatus, PlanPeriod, Category, JournalRecord } from '../types'
import { PLAN_CATEGORIES, CATEGORY_ICON } from '../types'
import ConfirmModal from '../components/ConfirmModal'

function getPeriodLabel(p: PlanPeriod) {
  return { daily: '每日', weekly: '每周', monthly: '每月', yearly: '每年' }[p]
}

function getPeriodRecords(records: ReturnType<typeof useStore.getState>['records'], plan: Plan, now: Date): number {
  const start = new Date(plan.startDate)
  const end = plan.endDate ? new Date(plan.endDate) : now
  let count = 0
  for (const r of records) {
    if (r.category !== plan.category) continue
    const d = new Date(r.date)
    if (d >= start && d <= end) count++
  }
  return count
}

function computeProgress(records: ReturnType<typeof useStore.getState>['records'], plan: Plan): number {
  const now = new Date()
  const count = getPeriodRecords(records, plan, now)
  if (plan.targetCount <= 0) return 0
  return Math.min(100, Math.round((count / plan.targetCount) * 100))
}

export default function PlanPage() {
  const { plans, records, addPlan, updatePlan, deletePlan } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)

  const [formCat, setFormCat] = useState<Category>('阅读记录')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formUnit, setFormUnit] = useState('次')
  const [formPeriod, setFormPeriod] = useState<PlanPeriod>('weekly')
  const [formEndDate, setFormEndDate] = useState('')

  const activePlans = useMemo(() => plans.filter(p => p.status === 'active'), [plans])
  const completedPlans = useMemo(() => plans.filter(p => p.status === 'completed'), [plans])

  const openAddForm = () => {
    setEditingPlan(null)
    setFormCat('阅读记录')
    setFormTitle('')
    setFormDesc('')
    setFormTarget('')
    setFormUnit('次')
    setFormPeriod('weekly')
    setFormEndDate('')
    setShowForm(true)
  }

  const openEditForm = (plan: Plan) => {
    setEditingPlan(plan)
    setFormCat(plan.category)
    setFormTitle(plan.title)
    setFormDesc(plan.description || '')
    setFormTarget(String(plan.targetCount))
    setFormUnit(plan.targetUnit)
    setFormPeriod(plan.targetPeriod)
    setFormEndDate(plan.endDate || '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formTarget) return
    const data = {
      category: formCat,
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      targetCount: Number(formTarget),
      targetUnit: formUnit,
      targetPeriod: formPeriod,
      startDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
      endDate: formEndDate || undefined,
      status: 'active' as PlanStatus,
      createdAt: new Date().toISOString(),
    }
    if (editingPlan?.id) {
      await updatePlan(editingPlan.id, { ...data, startDate: editingPlan.startDate })
    } else {
      await addPlan(data)
    }
    setShowForm(false)
  }

  const handleToggleComplete = async (plan: Plan) => {
    if (plan.status === 'active') {
      await updatePlan(plan.id!, { status: 'completed', endDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` })
    } else {
      await updatePlan(plan.id!, { status: 'active', endDate: undefined })
    }
  }

  const handleDelete = async () => {
    if (deleteTarget?.id) {
      await deletePlan(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">📋 计划管理</div>
        <button className="btn btn-primary btn-sm" onClick={openAddForm}>＋ 新建计划</button>
      </div>

      {activePlans.length === 0 && completedPlans.length === 0 ? (
        <div className="log-empty">
          <div className="log-empty-text">暂无计划</div>
          <button className="btn btn-primary" onClick={openAddForm}>📋 创建第一个计划</button>
        </div>
      ) : (
        <>
          {activePlans.length > 0 && (
            <div className="card">
              <div className="card-title">🟢 进行中 ({activePlans.length})</div>
              {activePlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  records={records}
                  onEdit={() => openEditForm(plan)}
                  onToggle={() => handleToggleComplete(plan)}
                  onDelete={() => setDeleteTarget(plan)}
                />
              ))}
            </div>
          )}

          {completedPlans.length > 0 && (
            <div className="card">
              <div className="card-title">✅ 已完成 ({completedPlans.length})</div>
              {completedPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  records={records}
                  onEdit={() => openEditForm(plan)}
                  onToggle={() => handleToggleComplete(plan)}
                  onDelete={() => setDeleteTarget(plan)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPlan ? '编辑计划' : '新建计划'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📂 关联板块</label>
                <select value={formCat} onChange={e => setFormCat(e.target.value as Category)}>
                  {PLAN_CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.icon} {c.key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📝 计划标题</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="例如：本月阅读计划" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📄 描述（可选）</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="例如：每月阅读3本书" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🎯 目标数量</label>
                  <input type="number" min="1" value={formTarget} onChange={e => setFormTarget(e.target.value)} placeholder="例如：3" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>单位</label>
                  <select value={formUnit} onChange={e => setFormUnit(e.target.value)}>
                    <option value="次">次</option>
                    <option value="本">本</option>
                    <option value="小时">小时</option>
                    <option value="天">天</option>
                    <option value="分钟">分钟</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ 周期</label>
                <div className="chip-group">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as PlanPeriod[]).map(p => (
                    <button key={p} className={`chip ${formPeriod === p ? 'active' : ''}`} onClick={() => setFormPeriod(p)}>
                      {getPeriodLabel(p)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📅 截止日期（可选）</label>
                <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="删除计划"
          message={`确定要删除计划「${deleteTarget.title}」吗？`}
          confirmText="删除"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function PlanCard({ plan, records, onEdit, onToggle, onDelete }: {
  plan: Plan
  records: JournalRecord[]
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const icon = CATEGORY_ICON[plan.category] || '📋'
  const progress = computeProgress(records, plan)
  const completed = plan.status === 'completed'

  return (
    <div className="record-block" style={{ marginBottom: 8, opacity: completed ? 0.7 : 1 }}>
      <div className="block-header">
        <span className="block-title">{icon} {plan.title}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {getPeriodLabel(plan.targetPeriod)} {plan.targetCount}{plan.targetUnit}
        </span>
      </div>
      {plan.description && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{plan.description}</div>
      )}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span>进度</span>
          <span>{Math.min(100, Math.round((getPeriodRecords(records, plan, new Date()) / plan.targetCount) * 100))}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--chip-bg)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, progress)}%`,
            background: completed ? 'var(--good-color)' : progress >= 100 ? 'var(--good-color)' : 'var(--primary)',
            borderRadius: 4,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          已记录 {getPeriodRecords(records, plan, new Date())} / {plan.targetCount}{plan.targetUnit}
        </div>
      </div>
      <div className="block-actions">
        {completed ? (
          <button className="btn btn-sm" onClick={onToggle}>🔄 重新激活</button>
        ) : (
          <button className="btn btn-sm" onClick={onToggle}>✅ 标记完成</button>
        )}
        <button className="btn btn-sm" onClick={onEdit}>✏️ 编辑</button>
        <button className="btn btn-sm btn-danger" onClick={onDelete}>🗑</button>
      </div>
    </div>
  )
}
