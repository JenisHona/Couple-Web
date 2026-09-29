import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { realtimeHub } from '@/lib/realtime-hub';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userProfile = await getUserProfileWithPartner(payload.userId);
    if (!userProfile) {
      return new Response('User not found', { status: 404 });
    }

    const coupleCode = userProfile.coupleCode || `USER-${userProfile.id}`;
    const channel = `couple:${coupleCode}`;

    let cleanup: (() => void) | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // 1. Send initial connected event
        const initialPayload = JSON.stringify({
          event: 'CONNECTED',
          channel,
          user: { id: userProfile.id, username: userProfile.username },
          partner: userProfile.partner ? { id: userProfile.partner.id, username: userProfile.partner.username } : null,
          timestamp: Date.now(),
        });
        controller.enqueue(encoder.encode(`event: CONNECTED\ndata: ${initialPayload}\n\n`));

        // 2. Subscribe to realtime hub
        cleanup = realtimeHub.subscribe(channel, (chunk: string) => {
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch (err) {
            console.error('Error enqueuing to SSE stream:', err);
          }
        });

        // 3. Heartbeat ping every 15s to keep connection alive
        heartbeatTimer = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
          } catch (err) {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
          }
        }, 15000);
      },
      cancel() {
        if (cleanup) cleanup();
        if (heartbeatTimer) clearInterval(heartbeatTimer);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    console.error('SSE connection error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
