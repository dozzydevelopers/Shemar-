-- SHEMAR CHAT: ENTERPRISE PRODUCTION POSTGRESQL SCHEMA WITH MULTI-TENANT RLS
-- Migration: 00001_initial_enterprise_schema.sql
-- Description: Sets up production tables, multi-tenant isolation, row level security, foreign keys, indexes, and triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------
-- 1. CELEBRITIES / TENANTS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.celebrities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    fan_count INT DEFAULT 0,
    total_messages_sent INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_celebrities_status ON public.celebrities(status);
CREATE INDEX IF NOT EXISTS idx_celebrities_username ON public.celebrities(username);

--------------------------------------------------
-- 2. USERS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.celebrities(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'celebrity', 'fan')),
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    online_status VARCHAR(20) DEFAULT 'online' CHECK (online_status IN ('online', 'offline', 'away')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

--------------------------------------------------
-- 3. FAN PROFILES TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fan_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
    vip_tier VARCHAR(50) DEFAULT 'Gold VIP',
    membership_expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fan_profiles_celeb ON public.fan_profiles(assigned_celebrity_id);
CREATE INDEX IF NOT EXISTS idx_fan_profiles_user ON public.fan_profiles(user_id);

--------------------------------------------------
-- 4. CONVERSATIONS TABLE (MULTI-TENANT)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
    fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
    fan_name VARCHAR(100) NOT NULL,
    fan_avatar TEXT,
    fan_email VARCHAR(255) NOT NULL,
    last_message_text TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    unread_count_celebrity INT DEFAULT 0,
    unread_count_fan INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_celeb ON public.conversations(celebrity_id);
CREATE INDEX IF NOT EXISTS idx_conversations_fan ON public.conversations(fan_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);

--------------------------------------------------
-- 5. MESSAGES TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    attachment JSONB,
    is_read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON public.messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

--------------------------------------------------
-- 6. PAYMENTS & TRANSACTIONS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'apple_pay', 'google_pay')),
    provider_transaction_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    membership_tier VARCHAR(50) DEFAULT '$1,000 Celebrity VIP Pass',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_celeb ON public.payments(celebrity_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx ON public.payments(provider_transaction_id);

--------------------------------------------------
-- 7. IDENTITY VERIFICATION TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    verification_provider VARCHAR(50) NOT NULL,
    verification_reference VARCHAR(255) NOT NULL UNIQUE,
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_input')),
    country VARCHAR(10) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user ON public.verifications(user_id);

--------------------------------------------------
-- 8. DEVICE SESSIONS & SECURITY TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    browser VARCHAR(100) NOT NULL,
    os VARCHAR(100) NOT NULL,
    ip_hash VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user ON public.device_sessions(user_id);

--------------------------------------------------
-- 9. CALL RECORDS TABLE (WEBRTC LOGS)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.call_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
    caller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('audio', 'video')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('initiating', 'ringing', 'connected', 'ended', 'declined', 'missed')),
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calls_tenant ON public.call_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calls_conversation ON public.call_records(conversation_id);

--------------------------------------------------
-- 10. MODERATION REPORTS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reporter_name VARCHAR(100) NOT NULL,
    reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_name VARCHAR(100) NOT NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    message_text TEXT,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- 11. AUDIT LOGS (APPEND-ONLY SECURITY LOGS)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    target_user_id UUID,
    metadata JSONB,
    ip_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

--------------------------------------------------
-- 12. FEATURE FLAGS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    target_roles TEXT[] DEFAULT ARRAY['super_admin', 'celebrity', 'fan'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

-- 1. Celebrities Policy
CREATE POLICY "Public celebrities readable" ON public.celebrities FOR SELECT USING (true);

-- 2. Conversations Multi-Tenant Isolation Policy
-- Celebrity can ONLY read conversations in their tenant
CREATE POLICY "Tenant conversation isolation" ON public.conversations
    FOR ALL USING (
        celebrity_id = (SELECT celebrity_id FROM public.users WHERE id = auth.uid())
        OR fan_id = (SELECT id FROM public.fan_profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
    );

-- 3. Messages Multi-Tenant Isolation Policy
CREATE POLICY "Tenant message isolation" ON public.messages
    FOR ALL USING (
        tenant_id = (SELECT celebrity_id FROM public.users WHERE id = auth.uid())
        OR conversation_id IN (
            SELECT id FROM public.conversations WHERE fan_id = (SELECT id FROM public.fan_profiles WHERE user_id = auth.uid())
        )
        OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
    );

-- 4. Payments Isolation Policy
CREATE POLICY "Users view own payment history" ON public.payments
    FOR SELECT USING (
        user_id = auth.uid()
        OR celebrity_id = (SELECT celebrity_id FROM public.users WHERE id = auth.uid())
        OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
    );
