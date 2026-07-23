import { create } from 'zustand'
import { db } from '../db'
import type { JournalRecord, DailyEntry, Reminder, QuickItem, Plan, Category, Mood, ThemeMode } from '../types'

interface AppState {
  records: JournalRecord[]
  dailyEntries: DailyEntry[]
  reminders: Reminder[]
  quickItems: QuickItem[]
  plans: Plan[]
  theme: ThemeMode
  loading: boolean

  loadAll: () => Promise<void>
  addRecord: (record: JournalRecord) => Promise<void>
  updateRecord: (id: number, record: Partial<JournalRecord>) => Promise<void>
  deleteRecord: (id: number) => Promise<void>
  getRecordsByDate: (date: string) => Promise<JournalRecord[]>
  getRecordsByDateRange: (start: string, end: string) => Promise<JournalRecord[]>

  getDailyEntry: (date: string) => Promise<DailyEntry | undefined>
  saveDailyEntry: (entry: DailyEntry) => Promise<void>

  addReminder: (reminder: Reminder) => Promise<void>
  deleteReminder: (id: number) => Promise<void>

  addQuickItem: (item: QuickItem) => Promise<void>
  deleteQuickItem: (id: number) => Promise<void>
  getQuickItemsByCategory: (category: Category) => QuickItem[]

  addPlan: (plan: Plan) => Promise<void>
  updatePlan: (id: number, partial: Partial<Plan>) => Promise<void>
  deletePlan: (id: number) => Promise<void>
  getPlansByCategory: (category: Category) => Plan[]
  getActivePlans: () => Plan[]

  setTheme: (theme: ThemeMode) => void

  generateMockData: () => Promise<void>
  clearAllData: () => Promise<void>
  exportAllData: () => Promise<string>
  importData: (json: string) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  records: [],
  dailyEntries: [],
  reminders: [],
  quickItems: [],
  plans: [],
  theme: (localStorage.getItem('shiguang-theme') as ThemeMode) || 'light',
  loading: false,

  loadAll: async () => {
    set({ loading: true })
    const records = await db.records.toArray()
    const dailyEntries = await db.dailyEntries.toArray()
    const reminders = await db.reminders.toArray()
    const quickItems = await db.quickItems.toArray()
    const plans = await db.plans.toArray()
    set({ records, dailyEntries, reminders, quickItems, plans, loading: false })
  },

  addRecord: async (record: JournalRecord) => {
    const id = await db.records.add(record)
    set({ records: [...get().records, { ...record, id }] })
  },

  updateRecord: async (id: number, partial: Partial<JournalRecord>) => {
    await db.records.update(id, partial)
    const records = get().records.map(r => r.id === id ? { ...r, ...partial } : r)
    set({ records })
  },

  deleteRecord: async (id) => {
    await db.records.delete(id)
    set({ records: get().records.filter(r => r.id !== id) })
  },

  getRecordsByDate: async (date: string) => {
    return db.records.where('date').equals(date).toArray()
  },

  getRecordsByDateRange: async (start: string, end: string) => {
    return db.records.where('date').between(start, end).toArray()
  },

  getDailyEntry: async (date) => {
    return db.dailyEntries.where('date').equals(date).first()
  },

  saveDailyEntry: async (entry: DailyEntry) => {
    const existing = await db.dailyEntries.where('date').equals(entry.date).first()
    if (existing) {
      await db.dailyEntries.update(existing.id!, { ...entry })
      const dailyEntries = get().dailyEntries.map(e => e.id === existing.id ? { ...entry, id: existing.id } : e)
      set({ dailyEntries })
    } else {
      const id = await db.dailyEntries.add(entry)
      set({ dailyEntries: [...get().dailyEntries, { ...entry, id }] })
    }
  },

  addReminder: async (reminder: Reminder) => {
    const id = await db.reminders.add(reminder)
    set({ reminders: [...get().reminders, { ...reminder, id }] })
  },

  deleteReminder: async (id: number) => {
    await db.reminders.delete(id)
    set({ reminders: get().reminders.filter(r => r.id !== id) })
  },

  addQuickItem: async (item: QuickItem) => {
    const id = await db.quickItems.add(item)
    set({ quickItems: [...get().quickItems, { ...item, id }] })
  },

  deleteQuickItem: async (id: number) => {
    await db.quickItems.delete(id)
    set({ quickItems: get().quickItems.filter(q => q.id !== id) })
  },

  getQuickItemsByCategory: (category: Category) => {
    return get().quickItems.filter(q => q.category === category)
  },

  addPlan: async (plan: Plan) => {
    const id = await db.plans.add(plan)
    set({ plans: [...get().plans, { ...plan, id }] })
  },

  updatePlan: async (id: number, partial: Partial<Plan>) => {
    await db.plans.update(id, partial)
    const plans = get().plans.map(p => p.id === id ? { ...p, ...partial } : p)
    set({ plans })
  },

  deletePlan: async (id: number) => {
    await db.plans.delete(id)
    set({ plans: get().plans.filter(p => p.id !== id) })
  },

  getPlansByCategory: (category: Category) => {
    return get().plans.filter(p => p.category === category)
  },

  getActivePlans: () => {
    return get().plans.filter(p => p.status === 'active')
  },

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('shiguang-theme', theme)
    set({ theme })
  },

  generateMockData: async () => {
    const today = new Date()
    const mockRecords: JournalRecord[] = []
    const toDateStr = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = toDateStr(d)
      const cats: Category[] = ['工作记录', '学习记录', '阅读记录', '运动记录', '生活记录', '今日睡眠', '今日感悟', '今日感恩', '日记']
      const numRecords = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numRecords; j++) {
        const cat = cats[Math.floor(Math.random() * cats.length)]
        mockRecords.push({
          date: dateStr,
          category: cat,
          content: `模拟${cat}记录 - 第${j + 1}条`,
          images: [],
          specialFields: {},
          createdAt: new Date(d.getTime() + j * 3600000).toISOString(),
        })
      }
    }
    await db.records.bulkAdd(mockRecords)

    const moods: Mood[] = ['开心', '兴奋', '平静', '低落', '生气', '疲惫']
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = toDateStr(d)
      const entry: DailyEntry = {
        date: dateStr,
        weather: ['晴', '多云', '雨', '晴', '晴'][Math.floor(Math.random() * 5)],
        temperature: String(Math.floor(Math.random() * 15) + 15),
        mood: [moods[Math.floor(Math.random() * moods.length)]],
        createdAt: d.toISOString(),
      }
      await db.dailyEntries.add(entry)
    }

    // Create mock plans
    const mockPlans: Plan[] = [
      { category: '阅读记录', title: '本月阅读计划', description: '每月阅读3本书', targetCount: 3, targetUnit: '本', targetPeriod: 'monthly', startDate: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), status: 'active', createdAt: today.toISOString() },
      { category: '运动记录', title: '每周运动计划', description: '每周运动3次', targetCount: 3, targetUnit: '次', targetPeriod: 'weekly', startDate: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), status: 'active', createdAt: today.toISOString() },
      { category: '学习记录', title: '每日学习计划', description: '每天学习1小时', targetCount: 1, targetUnit: '小时', targetPeriod: 'daily', startDate: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), status: 'active', createdAt: today.toISOString() },
    ]
    await db.plans.bulkAdd(mockPlans)
    await get().loadAll()
  },

  clearAllData: async () => {
    await db.records.clear()
    await db.dailyEntries.clear()
    await db.reminders.clear()
    await db.quickItems.clear()
    await db.plans.clear()
    set({ records: [], dailyEntries: [], reminders: [], quickItems: [], plans: [] })
  },

  exportAllData: async () => {
    const data = {
      records: await db.records.toArray(),
      dailyEntries: await db.dailyEntries.toArray(),
      reminders: await db.reminders.toArray(),
      quickItems: await db.quickItems.toArray(),
      plans: await db.plans.toArray(),
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  },

  importData: async (json) => {
    const data = JSON.parse(json)
    if (data.records) await db.records.bulkAdd(data.records)
    if (data.dailyEntries) await db.dailyEntries.bulkAdd(data.dailyEntries)
    if (data.reminders) await db.reminders.bulkAdd(data.reminders)
    if (data.quickItems) await db.quickItems.bulkAdd(data.quickItems)
    if (data.plans) await db.plans.bulkAdd(data.plans)
    await get().loadAll()
  },
}))
