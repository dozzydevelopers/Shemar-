export type UserRole = 'super_admin' | 'celebrity' | 'fan';

export type NavigationTab =
  | 'chats'
  | 'discover'
  | 'calls'
  | 'search'
  | 'web_intelligence'
  | 'notifications'
  | 'profile'
  | 'dashboard'
  | 'fans'
  | 'celebrities'
  | 'conversations'
  | 'messages'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'audit_logs'
  | 'privacy_center'
  | 'app_store_compliance'
  | 'system_health';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  status: 'active' | 'suspended' | 'pending';
  celebrityId?: string; // For celebrities and fans assigned to a celeb
  onlineStatus?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  createdAt: string;
}

export interface Celebrity {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
  inviteToken?: string;
  inviteExpiresAt?: string;
  fanCount: number;
  totalMessagesSent: number;
  createdAt: string;
}

export interface Fan {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  assignedCelebrityId: string;
  notes?: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  attachment?: Attachment;
  isRead: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  celebrityId: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  fanEmail: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCountCelebrity: number;
  unreadCountFan: number;
  status: 'active' | 'archived';
  isTyping?: boolean;
  createdAt: string;
}

export interface Invitation {
  id: string;
  celebrityDisplayName: string;
  username: string;
  email: string;
  token: string;
  bio: string;
  avatar: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  messageId?: string;
  messageText?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemSettings {
  appName: string;
  tagline: string;
  maintenanceMode: boolean;
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  maxUploadSizeBytes: number;
  pollingIntervalMs: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFromEmail: string;
  dbHost: string;
  dbName: string;
  dbUser: string;
}

// NOTIFICATIONS REALTIME SCHEMAS
export type NotificationType =
  | 'message'
  | 'conversation_request'
  | 'celebrity_reply'
  | 'fan_activity'
  | 'platform_announcement'
  | 'admin_alert'
  | 'invitation'
  | 'moderation'
  | 'security';

export interface AppNotification {
  id: string;
  recipientId: string;
  celebrityId?: string;
  conversationId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  newMessages: boolean;
  mentions: boolean;
  platformUpdates: boolean;
  securityAlerts: boolean; // Policy locked to true
  sound: boolean;
  browserPush: boolean;
}

// ADVANCED SEARCH SCHEMAS
export type SearchCategoryFilter = 'all' | 'messages' | 'people' | 'celebrities' | 'conversations';

export interface SearchQueryOptions {
  query: string;
  category?: SearchCategoryFilter;
  startDate?: string;
  endDate?: string;
  celebrityId?: string;
  senderId?: string;
  unreadOnly?: boolean;
  hasAttachments?: boolean;
  conversationId?: string;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: 'message' | 'person' | 'celebrity' | 'conversation';
  title: string;
  subtitle: string;
  snippet?: string;
  avatar?: string;
  badge?: string;
  timestamp?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  page: number;
  totalPages: number;
  results: SearchResultItem[];
  suggestions: string[];
}

// WEB INTELLIGENCE AI SCHEMAS
export type WebAgentMode = 'research' | 'fact_check' | 'news';

export interface WebSourceCitation {
  title: string;
  url: string;
  snippet?: string;
  publishedDate?: string;
}

export interface FactCheckResult {
  mode: 'fact_check';
  verdict: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIED';
  claim: string;
  evidence: string;
  explanation: string;
  sources: WebSourceCitation[];
  timestamp: string;
}

export interface NewsIntelligenceResult {
  mode: 'news' | 'research';
  query: string;
  latestInformation: string;
  keyUpdates: string[];
  whatWeKnow: string;
  sources: WebSourceCitation[];
  timestamp: string;
}

export type WebIntelligenceResult = FactCheckResult | NewsIntelligenceResult;

export interface PHPFileExport {
  path: string;
  category: 'config' | 'database' | 'auth' | 'chat' | 'admin' | 'celebrity' | 'fan' | 'api' | 'setup';
  filename: string;
  content: string;
  description: string;
}

// ENTERPRISE FINANCIAL & TRANSACTION SCHEMAS
export interface PaymentRecord {
  paymentId: string;
  userId: string;
  celebrityId: string;
  amount: number;
  currency: string; // USD
  provider: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  providerTransactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  membershipTier: string;
  metadata: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

// IDENTITY VERIFICATION SCHEMAS
export interface IdentityVerificationRecord {
  id: string;
  userId: string;
  verificationProvider: 'jumio' | 'onfido' | 'stripe_identity' | 'sumsub';
  verificationReference: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'requires_input';
  country: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  verifiedAt?: string;
  createdAt: string;
}

// DEVICE SESSIONS & WEBAUTHN / PASSKEYS SCHEMAS
export interface DeviceSessionRecord {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ipHash: string;
  location?: string;
  isCurrent: boolean;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface PasskeyCredential {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  deviceName: string;
  transports: string[];
  createdAt: string;
  lastUsedAt?: string;
}

// WEBRTC CALL & SIGNALING SCHEMAS
export interface CallRecord {
  id: string;
  conversationId: string;
  tenantId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  callType: 'audio' | 'ai_voice';
  status: 'initiating' | 'ringing' | 'connected' | 'ended' | 'declined' | 'missed';
  durationSeconds: number;
  qualityRating?: number;
  createdAt: string;
  endedAt?: string;
}

export interface WebRtcSignal {
  callId: string;
  senderId: string;
  receiverId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'decline' | 'end';
  payload: any;
  timestamp: number;
}

// OBSERVABILITY & SYSTEM HEALTH METRICS
export interface SystemHealthMetrics {
  status: 'healthy' | 'degraded' | 'critical';
  uptimeSeconds: number;
  database: {
    status: 'connected' | 'reconnecting' | 'error';
    activeConnections: number;
    maxConnections: number;
    avgLatencyMs: number;
    replicationLagMs: number;
  };
  realtime: {
    status: 'operational';
    activeWebsockets: number;
    messagesPerSec: number;
  };
  payments: {
    webhookSuccessRatePercent: number;
    avgProcessingTimeMs: number;
    lastTransactionAt: string;
  };
  api: {
    requestsPerMin: number;
    errorRatePercent: number;
    p95LatencyMs: number;
  };
  storage: {
    usedMb: number;
    capacityMb: number;
  };
  activeUsers24h: number;
  timestamp: string;
}

// PRIVACY CENTER & DATA PORTABILITY
export interface PrivacyPreferences {
  marketingConsent: boolean;
  analyticsConsent: boolean;
  thirdPartySharing: boolean;
  dataRetentionMonths: number;
}

export interface UserDataExport {
  user: User;
  profile?: Fan | Celebrity;
  verifications: IdentityVerificationRecord[];
  deviceSessions: DeviceSessionRecord[];
  payments: PaymentRecord[];
  callLogs: CallRecord[];
  auditLogs: AuditLog[];
  exportedAt: string;
}

// FEATURE FLAGS SCHEMAS
export interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles: UserRole[];
  createdAt: string;
}

// AI VOICE & PERSONALITY PROFILE ENGINE
export interface CelebrityPersonalityProfile {
  celebrityId: string;
  communication_style: string;
  preferred_greetings: string[];
  tone: string;
  topics: string[];
  interests: string[];
  response_length: 'short' | 'medium' | 'detailed';
  humor_level: 'subtle' | 'moderate' | 'playful' | 'none';
  conversation_rules: string[];
  restricted_topics: string[];
}

export interface AIVoiceSession {
  id: string;
  fan_id: string;
  celebrity_id: string;
  membership_id: string;
  provider: string;
  status: 'active' | 'ended' | 'failed' | 'terminated_safety';
  duration: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
  sessionToken?: string;
  fanName?: string;
  celebrityName?: string;
  latencyMetrics?: {
    avgResponseMs: number;
    sttMs: number;
    ttsMs: number;
  };
  safetyStatus?: 'clean' | 'flagged' | 'blocked';
}

export interface AIMemoryRecord {
  id: string;
  fanId: string;
  celebrityId: string;
  key: string;
  value: string;
  category: 'preference' | 'topic' | 'name' | 'general';
  updatedAt: string;
}

export interface AISafetyReport {
  id: string;
  sessionId: string;
  fanId: string;
  celebrityId: string;
  reason: 'harassment' | 'sexual' | 'threat' | 'impersonation_claim' | 'private_info' | 'other';
  details: string;
  transcriptSnippet: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface AIVoiceMetrics {
  activeSessions: number;
  totalVoiceSessions: number;
  avgResponseMs: number;
  aiErrors: number;
  safetyEvents: number;
}

export interface AIVoiceProviderConfig {
  providerId: string;
  voiceId: string;
  speechRate: number;
  pitch: number;
  clarityBoost: boolean;
}

