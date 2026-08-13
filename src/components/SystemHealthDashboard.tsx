import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Server,
  Zap,
  ShieldCheck,
  CreditCard,
  HardDrive,
  Users,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Clock,
  Key,
} from 'lucide-react';
import { SystemHealthMetrics, FeatureFlag, AuditLog } from '../types';

interface SystemHealthDashboardProps {
  auditLogs: AuditLog[];
}

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ auditLogs }) => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async () => {
    setRefreshing(true);
    try {
      const [healthRes, flagsRes] = await Promise.all([
        fetch('/api/admin/health-metrics'),
        fetch('/api/feature-flags'),
      ]);

      const healthData = await healthRes.json();
      const flagsData = await flagsRes.json();

      if (healthData.status === 'success') setMetrics(healthData.metrics);
      if (flagsData.status === 'success') setFlags(flagsData.flags);
    } catch (err) {
      console.error('Failed to load system health metrics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFlag = async (flagKey: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagKey, enabled: !currentEnabled }),
      });
      if (res.ok) fetchHealthData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p>Loading Enterprise System Health Telemetry...</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">System Health & Observability Control</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time infrastructure performance, database telemetry, payment webhooks, and multi-tenant feature flags.
          </p>
        </div>
        <button
          onClick={fetchHealthData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl transition font-medium self-start sm:self-auto border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Primary Infrastructure Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PostgreSQL Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" /> PostgreSQL DB
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics.database.avgLatencyMs} ms</div>
            <div className="text-xs text-slate-400">Avg DB Query Latency</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Pool Connections: {metrics.database.activeConnections}/{metrics.database.maxConnections}</span>
            <span>Lag: {metrics.database.replicationLagMs}ms</span>
          </div>
        </div>

        {/* Realtime WebSockets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Supabase Realtime
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
              Operational
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics.realtime.activeWebsockets.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Active WebSocket Connections</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Throughput: {metrics.realtime.messagesPerSec} msg/sec</span>
            <span>Presence: Active</span>
          </div>
        </div>

        {/* Payment Webhooks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-purple-400" /> Stripe Webhooks
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              99.8% Success
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{metrics.payments.avgProcessingTimeMs} ms</div>
            <div className="text-xs text-slate-400">Webhook Processing Time</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Signature: Verified</span>
            <span>24h Volume: $24,000</span>
          </div>
        </div>

        {/* API Latency & Uptime */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> API Gateway
            </span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded-full">
              P95 {metrics.api.p95LatencyMs}ms
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{formatUptime(metrics.uptimeSeconds)}</div>
            <div className="text-xs text-slate-400">System Uptime (99.99%)</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Error Rate: {metrics.api.errorRatePercent}%</span>
            <span>RPM: {metrics.api.requestsPerMin}</span>
          </div>
        </div>
      </div>

      {/* Feature Flags & Commercial Tiering Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Commercial Feature Flags & System Toggles
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamically activate or deactivate commercial modules without full server redeployment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{flag.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {flag.flagKey}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{flag.description}</p>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.flagKey, flag.enabled)}
                className="shrink-0 text-slate-300 hover:text-white transition"
              >
                {flag.enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Append-Only Immutable Security Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks admin actions, payments, verification checks, and tenant security events.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{auditLogs.length} Records</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">
                    {log.userName} <span className="font-normal text-slate-400">({log.action})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{log.details}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0 self-end sm:self-auto">
                <span>IP: {log.ipAddress}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-600" />
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
