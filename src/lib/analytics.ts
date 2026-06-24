import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'toronto_ferry_session_id';

export function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function logAnalyticsEvent(type: string, meta: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    const sessionId = getSessionId();
    const path = window.location.pathname;

    await fetch('/api/v1/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        path,
        sessionId,
        meta,
      }),
    });
  } catch (err) {
    console.error('Failed to log analytics event:', err);
  }
}
