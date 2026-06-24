import { EventEmitter } from 'events';

declare global {
  var globalEmitter: EventEmitter | undefined;
}

const globalEmitter = globalThis.globalEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalEmitter = globalEmitter;
}

export default globalEmitter;
export const SSE_EVENTS = {
  SCHEDULE_UPDATE: 'schedule:update',
  ALERT_NEW: 'alert:new',
};
