// Shared domain types for the SFC Plantation Management prototype.
// Shapes mirror the future Supabase table structure so the mock data layer
// can be swapped for real queries later without changing consumers.

export type HealthStatus = 'healthy' | 'attention' | 'moderate' | 'critical'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole =
  | 'Admin'
  | 'Director'
  | 'Assistant Factory Manager'
  | 'Field Officer'
  | 'Worker'

export interface AppUser {
  id: string
  name: string
  role: UserRole
  avatarInitials: string
}

export interface PlantationArea {
  id: string
  name: string
  sizeAcres: number
  gpsLocation?: string
  cropId: string
  variety: string
  plantCount: number
  plantingDate: string
  expectedHarvestDate: string
  growthStage: string
  healthStatus: HealthStatus
  aiHealthScore: number
  lastInspection: string
  assignedStaff: string[]
  irrigationMethod: string
  fertilizerSchedule: string
  diseaseStatus: string
  pestStatus: string
  mapX: number // percentage position on map image, 0-100
  mapY: number
  mapWidth: number
  mapHeight: number
}

export interface Crop {
  id: string
  name: string
  variety: string
  plantCount: number
  plantingDate: string
  expectedHarvestDate: string
  harvestCycleDays: number
  growthStage: string
  waterRequirement: string
  fertilizerSchedule: string
  pesticideSchedule: string
  expectedYieldKg: number
  actualYieldKg: number
  costOfCultivation: number
  revenue: number
}

export interface DailyUpdate {
  id: string
  date: string
  areaId: string | null // null for updates not tied to a plantation area (e.g. tunnel photo reviews)
  cropId: string | null
  activity: string
  staff: string[]
  weather: string
  wateringDetails: string
  fertilizerApplied: string
  pesticideApplied: string
  diseasesFound: string
  pestIssues: string
  notes: string
  photoCount: number
  photos?: string[] // data URLs - stored directly in the shared database, same pattern as TunnelPhotoEntry
}

export interface PlantationTask {
  id: string
  title: string
  category: 'Watering' | 'Fertilizer' | 'Weeding' | 'Spraying' | 'Harvesting' | 'Cleaning' | 'Maintenance' | 'Reporting' | 'Planting'
  assignedTo: string
  areaId?: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  progress: number
  notes?: string
}

export interface Harvest {
  id: string
  date: string
  areaId: string
  cropId: string
  quantityKg: number
  grade: 'A' | 'B' | 'C'
  wasteKg: number
  sellingPricePerKg: number
  revenue: number
  buyer: string
}

export interface ChickenBatch {
  id: string
  shed: string
  batchCode: string
  breed: string
  count: number
  arrivalDate: string
  ageWeeks: number
  mortality: number
  currentStock: number
}

export interface EggLog {
  id: string
  date: string
  batchId: string
  totalEggs: number
  damagedEggs: number
  saleableEggs: number
  soldQuantity: number
}

export interface FeedLog {
  id: string
  feedType: string
  dailyConsumptionKg: number
  remainingStockKg: number
  nextPurchaseDate: string
}

export interface VaccinationRecord {
  id: string
  batchId: string
  type: 'Vaccination' | 'Vitamin' | 'Medicine' | 'Deworming'
  name: string
  dueDate: string
  status: 'upcoming' | 'completed' | 'missed'
}

export interface ChickenHealthRecord {
  id: string
  batchId: string
  date: string
  sickBirds: number
  deadBirds: number
  symptoms: string
  treatment: string
  recovery: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'Fertilizer' | 'Pesticide' | 'Seed' | 'Tool' | 'Equipment' | 'Feed' | 'Medicine'
  stock: number
  unit: string
  reorderLevel: number
  expiryDate?: string
  lastStockIn: string
  lastStockOut: string
}

export interface AppNotification {
  id: string
  title: string
  message: string
  category: 'Fertilizer' | 'Irrigation' | 'Harvest' | 'Pest' | 'Disease' | 'Weather' | 'Medicine' | 'Vaccination' | 'Inventory' | 'Task'
  severity: Severity
  createdAt: string
  read: boolean
}

export interface AiCropAnalysis {
  areaId: string
  analyzedAt: string
  healthScore: number
  confidence: number
  severity: Severity
  detectedProblems: string[]
  recommendedActions: string[]
  estimatedYieldKg: number
  expectedGrade: 'A' | 'B' | 'C'
  estimatedRevenue: number
  daysRemaining: number
  expectedHarvestDate: string
  harvestReadinessPct: number
  nextFertilizer: { name: string; quantity: string; date: string }
  irrigationRecommendation: { amount: string; frequency: string }
  diseasePrevention: string[]
  historicalComparison: { improvementPct: number; trend: 'improving' | 'declining' | 'stable' }
}

export interface TunnelPhotoEntry {
  id: string
  tunnelId: string
  date: string
  photos: string[] // data URLs when uploaded client-side; needs real object storage for production
  healthAssessment?: string
  detectedIssues?: string[]
  recommendedActions?: string[]
  severity?: Severity
  analyzedBy?: string // e.g. "Claude vision - manual review" vs a real automated pipeline later
}

export interface FacilityPoint {
  id: string
  name: string
  category: 'facility' | 'structure'
  description: string
  mapX: number
  mapY: number
  mapWidth: number
  mapHeight: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
