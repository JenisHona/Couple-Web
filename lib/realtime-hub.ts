// Real-time Event Hub for Couple Sanctuary bidirectional broadcasts

type Subscriber = (payload: string) => void;

class RealtimeHub {
  private static instance: RealtimeHub;
  private subscribers: Map<string, Set<Subscriber>> = new Map();

  private constructor() {}

  public static getInstance(): RealtimeHub {
    if (!RealtimeHub.instance) {
      // Use globalThis in Next.js development so HMR doesn't wipe active connections
      if (!(global as any).__duo_diary_realtime_hub__) {
        (global as any).__duo_diary_realtime_hub__ = new RealtimeHub();
      }
      RealtimeHub.instance = (global as any).__duo_diary_realtime_hub__;
    }
    return RealtimeHub.instance;
  }

  public subscribe(channel: string, callback: Subscriber): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Return cleanup function
    return () => {
      const set = this.subscribers.get(channel);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  public broadcast(channel: string, event: string, data: any, sender?: { id: string; username: string }) {
    const set = this.subscribers.get(channel);
    if (!set || set.size === 0) return;

    const message = JSON.stringify({
      event,
      data,
      sender,
      timestamp: Date.now(),
    });

    const sseFormatted = `event: ${event}\ndata: ${message}\n\n`;

    set.forEach((send) => {
      try {
        send(sseFormatted);
      } catch (err) {
        console.error('Error sending to subscriber:', err);
      }
    });
  }

  public getChannelSubscriberCount(channel: string): number {
    return this.subscribers.get(channel)?.size || 0;
  }
}

export const realtimeHub = RealtimeHub.getInstance();
