import { NextRequest } from 'next/server';
import globalEmitter, { SSE_EVENTS } from '@/lib/event-emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const responseStream = new ReadableStream({
    start(controller) {
      controller.enqueue('retry: 10000\n\n');
      controller.enqueue('data: {"type":"ping"}\n\n');

      const onScheduleUpdate = (data: any) => {
        controller.enqueue(`event: ${SSE_EVENTS.SCHEDULE_UPDATE}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const onAlertNew = (data: any) => {
        controller.enqueue(`event: ${SSE_EVENTS.ALERT_NEW}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      globalEmitter.on(SSE_EVENTS.SCHEDULE_UPDATE, onScheduleUpdate);
      globalEmitter.on(SSE_EVENTS.ALERT_NEW, onAlertNew);

      const interval = setInterval(() => {
        try {
          controller.enqueue(':\n\n');
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        globalEmitter.off(SSE_EVENTS.SCHEDULE_UPDATE, onScheduleUpdate);
        globalEmitter.off(SSE_EVENTS.ALERT_NEW, onAlertNew);
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
    },
  });
}
