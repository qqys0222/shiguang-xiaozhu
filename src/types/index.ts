export type Category =
  | '工作记录' | '学习记录' | '阅读记录' | '运动记录'
  | '生活记录' | '今日睡眠' | '午休' | '今日饮食'
  | '今日感悟' | '今日感恩' | '新知记录' | '日记'

export type Mood = '开心' | '兴奋' | '平静' | '低落' | '生气' | '疲惫'
export type Weather = '晴' | '多云' | '雨' | '雷阵雨' | '雪' | '雾' | '热' | '冷'
export type MealType = '早餐' | '午餐' | '晚餐'
export type MealSource = '自己做' | '家人做' | '外卖' | '未吃'

export const CATEGORIES: { key: Category; icon: string }[] = [
  { key: '工作记录', icon: '💼' },
  { key: '学习记录', icon: '📚' },
  { key: '阅读记录', icon: '📖' },
  { key: '运动记录', icon: '🏃' },
  { key: '生活记录', icon: '🏠' },
  { key: '今日睡眠', icon: '😴' },
  { key: '午休', icon: '😌' },
  { key: '今日饮食', icon: '🍜' },
  { key: '今日感悟', icon: '💭' },
  { key: '今日感恩', icon: '🙏' },
  { key: '新知记录', icon: '💡' },
  { key: '日记', icon: '📋' },
]

export const CATEGORY_ICON: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.icon])
)

export const MOODS: { key: Mood; emoji: string }[] = [
  { key: '开心', emoji: '😊' },
  { key: '兴奋', emoji: '😄' },
  { key: '平静', emoji: '😐' },
  { key: '低落', emoji: '😔' },
  { key: '生气', emoji: '😠' },
  { key: '疲惫', emoji: '😴' },
]

export const WEATHERS: Weather[] = ['晴', '多云', '雨', '雷阵雨', '雪', '雾', '热', '冷']

export interface SpecialFields {
  bookName?: string
  readingDuration?: string
  exerciseContent?: string
  exerciseDuration?: string
  sleepTime?: string
  wakeTime?: string
  sleepQuality?: number
  sleepDuration?: string
  napStart?: string
  napEnd?: string
  napDuration?: string
  breakfastSource?: MealSource
  breakfastContent?: string
  breakfastTime?: string
  lunchSource?: MealSource
  lunchContent?: string
  lunchTime?: string
  dinnerSource?: MealSource
  dinnerContent?: string
  dinnerTime?: string
}

export interface JournalRecord {
  id?: number
  date: string
  category: Category
  content: string
  images: string[]
  specialFields: SpecialFields
  createdAt: string
}

export interface DailyEntry {
  id?: number
  date: string
  weather: string
  temperature: string
  mood: Mood[]
  createdAt: string
}

export interface Reminder {
  id?: number
  title: string
  note: string
  dateTime: string
  createdAt: string
}

export interface QuickItem {
  id?: number
  category: Category
  text: string
}

export type PlanStatus = 'active' | 'completed' | 'cancelled'
export type PlanPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Plan {
  id?: number
  category: Category
  title: string
  description?: string
  targetCount: number
  targetUnit: string
  targetPeriod: PlanPeriod
  startDate: string
  endDate?: string
  status: PlanStatus
  createdAt: string
}

export const PLAN_CATEGORIES: { key: Category; icon: string }[] = [
  { key: '阅读记录', icon: '📖' },
  { key: '运动记录', icon: '🏃' },
  { key: '学习记录', icon: '📚' },
  { key: '工作记录', icon: '💼' },
  { key: '生活记录', icon: '🏠' },
  { key: '今日睡眠', icon: '😴' },
  { key: '今日饮食', icon: '🍜' },
]

export type ThemeMode = 'light' | 'dark'

export const QUICK_ITEMS: Record<Category, string[]> = {
  '工作记录': ['完成了', '进行了', '参加了', '整理了', '分析了'],
  '学习记录': ['学习了', '阅读了', '练习了', '复习了', '背诵了'],
  '阅读记录': ['开始读', '读完', '读到第', '精读', '速读'],
  '运动记录': ['跑步', '游泳', '瑜伽', '健身', '散步', '骑行'],
  '生活记录': ['做饭', '打扫', '购物', '看电影', '听音乐'],
  '今日睡眠': ['正常入睡', '熬夜', '失眠', '早睡'],
  '午休': ['午睡了', '没有午休'],
  '今日饮食': ['早餐', '午餐', '晚餐', '加餐'],
  '今日感悟': ['明白了', '意识到', '感悟到', '体会到'],
  '今日感恩': ['感谢', '感恩', '谢谢'],
  '新知记录': ['学到了', '发现了', '了解到', '掌握了'],
  '日记': ['今天', '今天的心情', '今天的收获', '今天的反思'],
}

export const CATEGORY_SPECIAL_FIELDS: Record<Category, string[]> = {
  '工作记录': [],
  '学习记录': [],
  '阅读记录': ['bookName', 'readingDuration'],
  '运动记录': ['exerciseContent', 'exerciseDuration'],
  '生活记录': [],
  '今日睡眠': ['sleepTime', 'wakeTime', 'sleepQuality', 'sleepDuration'],
  '午休': ['napStart', 'napEnd', 'napDuration'],
  '今日饮食': ['breakfastSource', 'breakfastContent', 'breakfastTime', 'lunchSource', 'lunchContent', 'lunchTime', 'dinnerSource', 'dinnerContent', 'dinnerTime'],
  '今日感悟': [],
  '今日感恩': [],
  '新知记录': [],
  '日记': [],
}
