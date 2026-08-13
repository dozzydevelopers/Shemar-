import { User, Celebrity, Fan, Conversation, Message, Invitation, Report, AuditLog, SystemSettings, AppNotification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_shemar',
    name: 'Shemar Moore',
    username: 'shemarmoore',
    email: 'shemar@shemarchat.com',
    role: 'super_admin',
    avatar: '/src/assets/images/shemar_avatar_1786631411088.jpg',
    bio: 'Actor, Producer & Super Admin of Shemar Private Chat.',
    isVerified: true,
    status: 'active',
    celebrityId: 'celeb_shemar',
    onlineStatus: 'online',
    lastSeen: 'Just now',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'usr_sofia',
    name: 'Sofia Vergara',
    username: 'sofiavergara',
    email: 'sofia@shemarchat.com',
    role: 'celebrity',
    avatar: '/src/assets/images/celebrity_female_avatar_1786631425594.jpg',
    bio: 'Actress, Entrepreneur & Model.',
    isVerified: true,
    status: 'active',
    celebrityId: 'celeb_sofia',
    onlineStatus: 'online',
    lastSeen: '5m ago',
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'usr_marcus',
    name: 'Marcus Vance',
    username: 'marcusvance',
    email: 'marcus@shemarchat.com',
    role: 'celebrity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Platinum Recording Artist & Songwriter.',
    isVerified: true,
    status: 'active',
    celebrityId: 'celeb_marcus',
    onlineStatus: 'away',
    lastSeen: '1h ago',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr_fan_1',
    name: 'Jessica Reynolds',
    username: 'jess_r',
    email: 'jessica@gmail.com',
    role: 'fan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    celebrityId: 'celeb_shemar',
    onlineStatus: 'online',
    lastSeen: 'Just now',
    createdAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'usr_fan_2',
    name: 'David Miller',
    username: 'dave_m',
    email: 'david.m@yahoo.com',
    role: 'fan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    celebrityId: 'celeb_shemar',
    onlineStatus: 'offline',
    lastSeen: '23m ago',
    createdAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'usr_fan_3',
    name: 'Elena Rostova',
    username: 'elena_r',
    email: 'elena@gmail.com',
    role: 'fan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    celebrityId: 'celeb_sofia',
    onlineStatus: 'online',
    lastSeen: 'Just now',
    createdAt: '2026-02-14T16:45:00Z',
  }
];

export const INITIAL_CELEBRITIES: Celebrity[] = [
  {
    id: 'celeb_shemar',
    userId: 'usr_shemar',
    displayName: 'Shemar Moore',
    username: 'shemarmoore',
    email: 'shemar@shemarchat.com',
    bio: 'Actor, Producer & Super Admin. Welcome to my official private fan chat room!',
    avatar: '/src/assets/images/shemar_avatar_1786631411088.jpg',
    isVerified: true,
    status: 'active',
    fanCount: 3,
    totalMessagesSent: 142,
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'celeb_sofia',
    userId: 'usr_sofia',
    displayName: 'Sofia Vergara',
    username: 'sofiavergara',
    email: 'sofia@shemarchat.com',
    bio: 'Official private messaging portal for my VIP supporters.',
    avatar: '/src/assets/images/celebrity_female_avatar_1786631425594.jpg',
    isVerified: true,
    status: 'active',
    fanCount: 1,
    totalMessagesSent: 89,
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'celeb_marcus',
    userId: 'usr_marcus',
    displayName: 'Marcus Vance',
    username: 'marcusvance',
    email: 'marcus@shemarchat.com',
    bio: 'Music studio updates, backstage chatter, and exclusive track previews.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'active',
    fanCount: 0,
    totalMessagesSent: 12,
    createdAt: '2026-02-01T09:30:00Z',
  }
];

export const INITIAL_FANS: Fan[] = [
  {
    id: 'fan_1',
    userId: 'usr_fan_1',
    name: 'Jessica Reynolds',
    email: 'jessica@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    assignedCelebrityId: 'celeb_shemar',
    notes: 'VIP Supporter since 2024. Attended LA premiere.',
    status: 'active',
    createdAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'fan_2',
    userId: 'usr_fan_2',
    name: 'David Miller',
    email: 'david.m@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    assignedCelebrityId: 'celeb_shemar',
    notes: 'Inquired about upcoming S.W.A.T. season filming dates.',
    status: 'active',
    createdAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'fan_3',
    userId: 'usr_fan_3',
    name: 'Elena Rostova',
    email: 'elena@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    assignedCelebrityId: 'celeb_sofia',
    notes: 'Fashion designer based in Miami.',
    status: 'active',
    createdAt: '2026-02-14T16:45:00Z',
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_101',
    celebrityDisplayName: 'Michael B. Jordan',
    username: 'michaelbjordan',
    email: 'mbjordan@celeb.com',
    token: 'CELEB_INV_MBJ_8892A',
    bio: 'Official fan club and private message space.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    status: 'pending',
    expiresAt: '2026-08-30T00:00:00Z',
    createdAt: '2026-08-10T12:00:00Z',
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'usr_fan_2',
    reporterName: 'David Miller',
    reportedUserId: 'usr_spammer',
    reportedUserName: 'Fake Account Spammer',
    messageText: 'Please send $500 gift card to unlock video chat',
    reason: 'Spam / Scam attempt detected',
    status: 'pending',
    createdAt: '2026-08-11T14:10:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    userId: 'usr_shemar',
    userName: 'Shemar Moore (Super Admin)',
    action: 'CREATE_CELEBRITY_INVITE',
    details: 'Generated invitation token CELEB_INV_MBJ_8892A for Michael B. Jordan',
    ipAddress: '192.168.1.45',
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'log_2',
    userId: 'usr_shemar',
    userName: 'Shemar Moore (Super Admin)',
    action: 'UPDATE_SYSTEM_SETTINGS',
    details: 'Enforced CSRF and rate limiting on authentication routes',
    ipAddress: '192.168.1.45',
    createdAt: '2026-08-09T18:30:00Z',
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'SHEMAR',
  tagline: 'Private Celebrity Chat Platform',
  maintenanceMode: false,
  allowPublicRegistration: true,
  requireEmailVerification: true,
  maxUploadSizeBytes: 10485760, // 10MB
  pollingIntervalMs: 2000,
  smtpHost: 'smtp.shemarchat.com',
  smtpPort: 587,
  smtpUser: 'noreply@shemarchat.com',
  smtpFromEmail: 'noreply@shemarchat.com',
  dbHost: '127.0.0.1',
  dbName: 'shemar_private_chat',
  dbUser: 'shemar_db_user'
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    recipientId: 'usr_shemar',
    celebrityId: 'celeb_shemar',
    conversationId: 'conv_1',
    type: 'message',
    title: 'New Message from Jessica Reynolds',
    body: 'Thank you so much Shemar! The behind-the-scenes video was incredible! 🔥',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: 'notif_2',
    recipientId: 'usr_shemar',
    type: 'admin_alert',
    title: 'New User Report Filed',
    body: 'David Miller reported user Fake Account Spammer for suspicious activity.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'notif_3',
    recipientId: 'usr_sofia',
    celebrityId: 'celeb_sofia',
    conversationId: 'conv_3',
    type: 'celebrity_reply',
    title: 'Sofia Vergara replied',
    body: 'Gracias Elena! Sending you huge kisses from Miami! 😘',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif_4',
    recipientId: 'usr_fan_1',
    celebrityId: 'celeb_shemar',
    conversationId: 'conv_1',
    type: 'celebrity_reply',
    title: 'Shemar Moore sent a sneak peek photo!',
    body: 'Here is a sneak peek from the set today! 🎥',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
  },
  {
    id: 'notif_5',
    recipientId: 'usr_shemar',
    type: 'security',
    title: 'Security Alert: New Session Initiated',
    body: 'Authenticated session started from IP 192.168.1.45 (Super Admin access)',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 3600 * 12).toISOString(),
  }
];

