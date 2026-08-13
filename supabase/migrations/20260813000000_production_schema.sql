-- ============================================================
-- PRODUCTION SCHEMA: SHEMAR CHAT
-- Database: PostgreSQL via Supabase
-- Purpose: Replace in-memory demo data with real persistent database
-- ============================================================

-- ============================================================
-- USERS TABLE (Core Authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'fan' CHECK (role IN ('super_admin', 'celebrity', 'fan')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  is_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role_status ON public.users(role, status);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- ============================================================
-- CELEBRITIES TABLE (Tenant Isolation Model)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.celebrities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  display_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  fan_count INTEGER DEFAULT 0,
  total_messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_celebrities_tenant_id ON public.celebrities(tenant_id);
CREATE INDEX idx_celebrities_user_id ON public.celebrities(user_id);
CREATE INDEX idx_celebrities_status ON public.celebrities(status);
CREATE INDEX idx_celebrities_username ON public.celebrities(username);
CREATE INDEX idx_celebrities_created_at ON public.celebrities(created_at);

-- ============================================================
-- FANS TABLE (Celebrity-assigned Profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  membership_status VARCHAR(50) DEFAULT 'none' CHECK (membership_status IN ('none', 'pending', 'active', 'expired', 'cancelled', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fans_celebrity_id ON public.fans(celebrity_id);
CREATE INDEX idx_fans_user_id ON public.fans(user_id);
CREATE INDEX idx_fans_status ON public.fans(status);
CREATE INDEX idx_fans_membership_status ON public.fans(membership_status);
CREATE INDEX idx_fans_created_at ON public.fans(created_at);

-- ============================================================
-- CONVERSATIONS TABLE (Multi-Tenant Safe)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  last_message_text TEXT,
  last_message_time TIMESTAMP,
  unread_count_celebrity INTEGER DEFAULT 0,
  unread_count_fan INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'muted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(celebrity_id, fan_id),
  FOREIGN KEY (tenant_id) REFERENCES public.celebrities(tenant_id)
);

CREATE INDEX idx_conversations_celebrity_id ON public.conversations(celebrity_id);
CREATE INDEX idx_conversations_fan_id ON public.conversations(fan_id);
CREATE INDEX idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);

-- ============================================================
-- MESSAGES TABLE (Real Chat History)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- ============================================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_type VARCHAR(50),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- ============================================================
-- MESSAGE READS TABLE (Read Receipts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  read_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, read_by_user_id)
);

CREATE INDEX idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON public.message_reads(read_by_user_id);

-- ============================================================
-- TYPING PRESENCE TABLE (Real-Time Indicator)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.typing_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_typing_presence_conversation_id ON public.typing_presence(conversation_id);
CREATE INDEX idx_typing_presence_started_at ON public.typing_presence(started_at);

-- ============================================================
-- USER PRESENCE TABLE (Online Status)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_presence_status ON public.user_presence(status);
CREATE INDEX idx_user_presence_last_seen_at ON public.user_presence(last_seen_at);

-- ============================================================
-- NOTIFICATIONS TABLE (Real-Time Push)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  celebrity_id UUID REFERENCES public.celebrities(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  new_messages BOOLEAN DEFAULT TRUE,
  mentions BOOLEAN DEFAULT TRUE,
  platform_updates BOOLEAN DEFAULT TRUE,
  security_alerts BOOLEAN DEFAULT TRUE,
  sound BOOLEAN DEFAULT TRUE,
  browser_push BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MEMBERSHIPS TABLE (Subscription/Access Control)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  tier_name VARCHAR(255),
  tier_amount_cents INTEGER,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'suspended')),
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_memberships_fan_id ON public.memberships(fan_id);
CREATE INDEX idx_memberships_celebrity_id ON public.memberships(celebrity_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_expires_at ON public.memberships(expires_at);

-- ============================================================
-- PAYMENTS TABLE (Transaction Records)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  provider VARCHAR(50) CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
  provider_transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_celebrity_id ON public.payments(celebrity_id);
CREATE INDEX idx_payments_provider_transaction_id ON public.payments(provider_transaction_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- ============================================================
-- IDENTITY VERIFICATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) CHECK (provider IN ('jumio', 'onfido', 'stripe_identity', 'sumsub')),
  verification_reference VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'requires_input')),
  document_type VARCHAR(50) CHECK (document_type IN ('passport', 'drivers_license', 'national_id')),
  country VARCHAR(2),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_identity_verifications_user_id ON public.identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON public.identity_verifications(status);

-- ============================================================
-- DEVICE SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_hash VARCHAR(255),
  location VARCHAR(255),
  is_current BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_sessions_user_id ON public.device_sessions(user_id);
CREATE INDEX idx_device_sessions_is_active ON public.device_sessions(is_active);

-- ============================================================
-- PASSKEYS / WEBAUTHN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  device_name VARCHAR(255),
  transports TEXT[],
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_passkey_credentials_user_id ON public.passkey_credentials(user_id);
CREATE INDEX idx_passkey_credentials_credential_id ON public.passkey_credentials(credential_id);

-- ============================================================
-- AI VOICE SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id),
  provider VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'failed', 'terminated_safety')),
  duration_seconds INTEGER DEFAULT 0,
  session_token TEXT,
  latency_metrics JSONB,
  safety_status VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_voice_sessions_fan_id ON public.ai_voice_sessions(fan_id);
CREATE INDEX idx_ai_voice_sessions_celebrity_id ON public.ai_voice_sessions(celebrity_id);
CREATE INDEX idx_ai_voice_sessions_status ON public.ai_voice_sessions(status);

-- ============================================================
-- AI MEMORY RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_memory_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  key VARCHAR(255),
  value TEXT,
  category VARCHAR(50) CHECK (category IN ('preference', 'topic', 'name', 'general')),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_memory_records_fan_celebrity ON public.ai_memory_records(fan_id, celebrity_id);
CREATE INDEX idx_ai_memory_records_category ON public.ai_memory_records(category);

-- ============================================================
-- BLOCKED USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocked_users_blocker_id ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON public.blocked_users(blocked_id);

-- ============================================================
-- REPORTS TABLE (Abuse/Moderation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);

-- ============================================================
-- AUDIT LOGS TABLE (Compliance & Security)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  status VARCHAR(50) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- ============================================================
-- INVITATIONS TABLE (Onboarding)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  invitation_type VARCHAR(50) DEFAULT 'celebrity' CHECK (invitation_type IN ('celebrity', 'fan')),
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP
);

CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Multi-Tenant Isolation
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own record
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Celebrities can only see conversations in their tenant
CREATE POLICY "celebrities_see_own_conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.celebrities
      WHERE celebrities.id = conversations.celebrity_id
      AND celebrities.user_id = auth.uid()
    )
  );

-- Fans can only see their own conversations
CREATE POLICY "fans_see_own_conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fans
      WHERE fans.id = conversations.fan_id
      AND fans.user_id = auth.uid()
    )
  );

-- Messages visible only to conversation participants
CREATE POLICY "messages_visible_to_participants" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.celebrities celeb ON c.celebrity_id = celeb.id
      JOIN public.fans f ON c.fan_id = f.id
      WHERE c.id = messages.conversation_id
      AND (celeb.user_id = auth.uid() OR f.user_id = auth.uid())
    )
  );

-- Users see only their notifications
CREATE POLICY "notifications_own_only" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- Device sessions visible to owner only
CREATE POLICY "device_sessions_own_only" ON public.device_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Audit logs: super admins can see all, users see only their own actions
CREATE POLICY "audit_logs_view" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

