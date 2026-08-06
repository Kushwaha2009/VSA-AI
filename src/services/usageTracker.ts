import { FeatureCategory, ActivityItem, FeatureUtilizationStats } from '../types';

export interface TrackFeatureOptions {
  subFeature?: string;
  fileName?: string;
  fileSize?: number;
  details?: string;
  status?: 'success' | 'failed' | 'processing';
  durationMs?: number;
  persona?: string;
}

const LOCAL_STORAGE_KEY = 'vsa_feature_utilization_v1';
const MAX_LOCAL_EVENTS = 100;

// Listeners for in-app reactive tracking updates
type UsageListener = (event: ActivityItem) => void;
const listeners: Set<UsageListener> = new Set();

export function subscribeToUsage(listener: UsageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Centralized Feature Utilization Tracking Service
 * Logs feature executions across PDF Suite, AI Chat, Image Studio, Video Tools, and Authentication.
 */
export async function trackFeatureUsage(
  feature: FeatureCategory,
  actionName: string,
  options: TrackFeatureOptions = {}
): Promise<ActivityItem> {
  // Get active session if available
  let userId = 'usr_guest';
  let token = '';

  try {
    const rawSession = localStorage.getItem('vsa_auth_session_v1');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.user?.id) userId = session.user.id;
      if (session?.token) token = session.token;
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  const activityItem: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    toolType: feature,
    actionName,
    details: options.details || (options.fileName ? `File: ${options.fileName}` : `${feature} operation`),
    status: options.status || 'success',
    fileSize: options.fileSize || 0,
    fileName: options.fileName || '',
    timestamp: new Date().toISOString(),
  };

  // 1. Save to Local Storage for offline analytics & instant responsiveness
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const events: ActivityItem[] = localRaw ? JSON.parse(localRaw) : [];
    events.unshift(activityItem);
    if (events.length > MAX_LOCAL_EVENTS) events.pop();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Could not write to local utilization storage', e);
  }

  // 2. Dispatch to internal subscribers
  listeners.forEach((fn) => {
    try {
      fn(activityItem);
    } catch (err) {
      console.error('Error in usage listener:', err);
    }
  });

  // 3. Post to backend tracking endpoint
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/tracking/event', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        toolType: feature,
        actionName,
        subFeature: options.subFeature,
        details: activityItem.details,
        status: activityItem.status,
        fileSize: options.fileSize,
        fileName: options.fileName,
        userId,
        persona: options.persona,
        durationMs: options.durationMs,
      }),
    }).catch((err) => {
      // Background non-blocking sync
      console.debug('Async tracking post deferred:', err);
    });
  } catch (e) {
    // Non-blocking
  }

  return activityItem;
}

/**
 * Retrieve aggregated feature utilization stats from backend or local fallback
 */
export async function fetchFeatureUtilizationStats(token?: string): Promise<FeatureUtilizationStats | null> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/admin/feature-utilization', { headers });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch remote feature utilization stats, using fallback', e);
  }

  return null;
}

/**
 * Calculate client-side fallback utilization summary
 */
export function getLocalUtilizationSummary(): {
  total: number;
  byCategory: Record<string, number>;
} {
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const events: ActivityItem[] = localRaw ? JSON.parse(localRaw) : [];
    const byCategory: Record<string, number> = {
      'ai-chat': 0,
      pdf: 0,
      image: 0,
      video: 0,
    };

    events.forEach((ev) => {
      if (byCategory[ev.toolType] !== undefined) {
        byCategory[ev.toolType] += 1;
      }
    });

    return {
      total: events.length,
      byCategory,
    };
  } catch {
    return {
      total: 0,
      byCategory: { 'ai-chat': 0, pdf: 0, image: 0, video: 0 },
    };
  }
}
