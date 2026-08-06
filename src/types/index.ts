export type UserRole = 'super_admin' | 'admin' | 'user';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  securityQuestion: string;
  securityAnswer?: string; // Hashed/hidden on client
  createdAt: string;
  lastLoginAt?: string;
  stats?: {
    filesProcessed: number;
    aiQueries: number;
    storageUsedMb: number;
  };
  usage?: {
    queriesCount: number;
    filesProcessed: number;
    storageUsed: string;
  };
}

export interface AuthSession {
  token: string;
  user: User;
}

export type LanguageCode = string;

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region?: string;
  isIndian?: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  persona?: string;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  personaId?: string;
  pinned?: boolean;
  folderId?: string;
  tags?: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  speed: string;
  intelligence: string;
}

export interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  createdAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'coding' | 'writing' | 'translation' | 'document' | 'creative' | 'business' | 'legal';
  icon?: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  color?: string;
}

export type DocumentAnalysisTask = 'summary' | 'explain' | 'translate' | 'qa';

export interface ImageGenerationParams {
  prompt: string;
  style: 'photorealistic' | 'anime' | 'cyberpunk' | '3d-render' | 'oil' | 'watercolor' | 'sketch';
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export interface AIPersona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  systemPrompt: string;
  starterPrompts: string[];
}

export type PDFToolType = 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'lock' 
  | 'unlock' 
  | 'sign' 
  | 'image-to-pdf' 
  | 'pdf-to-image';

export type ImageToolType = 
  | 'resize' 
  | 'compress' 
  | 'convert' 
  | 'bg-remove' 
  | 'enhance';

export type VideoToolType = 
  | 'trim' 
  | 'merge' 
  | 'compress' 
  | 'convert';

export interface ActivityItem {
  id: string;
  userId?: string;
  toolType: string;
  actionName: string;
  details?: string;
  status: 'success' | 'failed' | 'processing';
  fileSize?: number;
  fileName?: string;
  timestamp: string;
}

export type ActivityLog = ActivityItem;

export interface SystemLogItem {
  id: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  details?: string;
  userId?: string;
  timestamp: string;
}

export type SystemLog = SystemLogItem;

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalChats: number;
  totalFilesProcessed: number;
  totalAiQueries: number;
  storageUsedMb: number;
  errorCountToday: number;
  serverUptime: string;
  toolBreakdown: {
    name: string;
    count: number;
    color: string;
  }[];
  dailyActivity: {
    date: string;
    aiQueries: number;
    fileOperations: number;
    newUsers: number;
  }[];
  languageDistribution: {
    language: string;
    users: number;
    percent: number;
  }[];
}

export interface DeveloperInfo {
  name: string;
  nameEnglish?: string;
  role: string;
  roleHindi?: string;
  roleEnglish?: string;
  education?: string;
  educationHindi?: string;
  instagram: string;
  instagramUrl: string;
  attributionStatement: string;
  attributionStatementEn?: string;
  bio?: string;
  activeModelName?: string;
  email?: string;
  website?: string;
}

export interface SystemSettings {
  geminiModel: string;
  aiModel?: string;
  maxUploadLimitMB: number;
  maxUploadSizeMb?: number;
  maintenanceMode: boolean;
  announcement: {
    active: boolean;
    message: string;
    type: 'info' | 'warning' | 'alert';
  };
  developerInfo?: DeveloperInfo;
  rateLimitPerMin?: number;
  allowPublicSignups?: boolean;
}

export type PlatformSettings = SystemSettings;

export type FeatureCategory = 'ai-chat' | 'pdf' | 'image' | 'video' | 'auth' | 'settings';

export interface FeatureUtilizationStats {
  summary: {
    totalEvents: number;
    aiChatCount: number;
    pdfToolsCount: number;
    imageToolsCount: number;
    videoToolsCount: number;
    aiVsToolsRatio: string;
  };
  byCategory: {
    category: string;
    name: string;
    count: number;
    percent: number;
    color: string;
  }[];
  pdfSubFeatures: {
    name: string;
    count: number;
    color: string;
  }[];
  aiSubFeatures: {
    name: string;
    count: number;
    color: string;
  }[];
  imageSubFeatures: {
    name: string;
    count: number;
    color: string;
  }[];
  videoSubFeatures: {
    name: string;
    count: number;
    color: string;
  }[];
  timeline: {
    date: string;
    aiChat: number;
    pdfTools: number;
    imageTools: number;
    videoTools: number;
    total: number;
  }[];
  recentEvents: ActivityItem[];
}

export type FeedbackType = 'bug' | 'feature' | 'feedback';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackCategory =
  | 'ai-chat'
  | 'pdf'
  | 'image'
  | 'video'
  | 'auth'
  | 'ui'
  | 'performance'
  | 'general'
  | 'other';

export interface FeedbackPayload {
  type: FeedbackType;
  title: string;
  description: string;
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  userName?: string;
  userEmail?: string;
  systemInfo?: {
    browser?: string;
    os?: string;
    screenResolution?: string;
    currentTab?: string;
    language?: string;
    userAgent?: string;
  };
}

export interface FeedbackItem extends FeedbackPayload {
  id: string;
  userId?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

