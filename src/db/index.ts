import Dexie, { type Table } from 'dexie'
import type { JournalRecord, DailyEntry, Reminder, QuickItem, Plan } from '../types'

export class AppDatabase extends Dexie {
  records!: Table<JournalRecord, number>
  dailyEntries!: Table<DailyEntry, number>
  reminders!: Table<Reminder, number>
  quickItems!: Table<QuickItem, number>
  plans!: Table<Plan, number>

  constructor() {
    super('ShiGuangXiaoZhu')
    this.version(1).stores({
      records: '++id, date, category, createdAt',
      dailyEntries: '++id, date',
      reminders: '++id, dateTime, createdAt',
      quickItems: '++id, category',
    })
    this.version(2).stores({
      plans: '++id, category, status, startDate',
    })
  }
}

export const db = new AppDatabase()
