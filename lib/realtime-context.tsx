'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Heart, Flame, Compass, Battery, CheckCircle2 } from 'lucide-react';

export interface RealtimeMessage {
  event: string;
  data: any;
  sender?: { id: string; username: string };
  timestamp: number;
}

interface RealtimeContextType {
  isConnected: boolean;
  publish: (event: string, data: any) => Promise<boolean>;
  subscribe: (event: string, callback: (msg: RealtimeMessage) => void) => () => void;
  lastMessage: RealtimeMessage | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [liveToast, setLiveToast] = useState<{ title: string; desc: string; icon?: React.ElementType } | null>(null);
  
  const listenersRef = useRef<Map<string, Set<(msg: RealtimeMessage) => void>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((title: string, desc: string, icon?: React.ElementType) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setLiveToast({ title, desc, icon });
    toastTimeoutRef.current = setTimeout(() => {
      setLiveToast(null);
    }, 4500);
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let retryTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        const es = new EventSource('/api/realtime/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          // Auto retry after 3 seconds
          retryTimeout = setTimeout(connectSSE, 3000);
        };

        const handleIncomingEvent = (e: MessageEvent) => {
          try {
            const parsed: RealtimeMessage = JSON.parse(e.data);
            setLastMessage(parsed);

            // Notify specific event listeners
            const listeners = listenersRef.current.get(parsed.event);
            if (listeners) {
              listeners.forEach((cb) => cb(parsed));
            }

            // Also notify wildcard '*' listeners
            const allListeners = listenersRef.current.get('*');
            if (allListeners) {
              allListeners.forEach((cb) => cb(parsed));
            }

            // Friendly mascot toasts if event was sent by partner (not self)
            const isFromPartner = parsed.sender && String(parsed.sender.id) !== String(user.id);
            if (isFromPartner) {
              const senderName = parsed.sender?.username || 'Your partner';
              
              if (parsed.event === 'ROULETTE_SPIN') {
                showToast(
                  '🎡 Wheel Spun!',
                  `@${senderName} just spun the Decision Roulette! Winner: ${parsed.data?.winner || 'Spinning...'}`,
                  Compass
                );
              } else if (parsed.event === 'ROULETTE_MATCH') {
                showToast(
                  '🎉 Instant Match!',
                  `Both of you entered "${parsed.data?.item}"! It's a match!`,
                  Sparkles
                );
              } else if (parsed.event === 'MOOD_SYNC') {
                showToast(
                  '🔋 Partner Mood Check-In',
                  `@${senderName} updated their live energy & mood sliders.`,
                  Battery
                );
              } else if (parsed.event === 'INTIMACY_DESIRE_UPDATE' && parsed.data?.isMatched) {
                showToast(
                  '🔥 Intimacy Match Tonight!',
                  `You and @${senderName} both crossed your desire threshold!`,
                  Flame
                );
              } else if (parsed.event === 'ARCHETYPE_COMPLETED') {
                showToast(
                  '🐾 Archetype Ready!',
                  `@${senderName} locked in their animal archetype choices! Ready to reveal.`,
                  Sparkles
                );
              }
            }
          } catch (err) {
            console.warn('Realtime parse warning:', err);
          }
        };

        // Listen to custom event types
        const eventTypes = [
          'CONNECTED',
          'ROULETTE_UPDATE',
          'ROULETTE_SPIN',
          'ROULETTE_MATCH',
          'MOOD_SYNC',
          'INTIMACY_DESIRE_UPDATE',
          'INTIMACY_FANTASY_VOTE',
          'ARCHETYPE_COMPLETED',
          'LOVE_LETTER_SENT',
          'TYPING_STATUS',
        ];

        eventTypes.forEach((type) => {
          es.addEventListener(type, handleIncomingEvent);
        });
      } catch (err) {
        console.error('SSE initialization error:', err);
      }
    };

    connectSSE();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [isAuthenticated, user, showToast]);

  // Publish message to couple room
  const publish = useCallback(async (event: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/realtime/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to publish realtime event:', err);
      return false;
    }
  }, []);

  // Subscribe to specific event
  const subscribe = useCallback((event: string, callback: (msg: RealtimeMessage) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    return () => {
      const set = listenersRef.current.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          listenersRef.current.delete(event);
        }
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, publish, subscribe, lastMessage }}>
      {children}

      {/* Live Real-time Notification Toast */}
      {liveToast && (() => {
        const ToastIcon = liveToast.icon || Sparkles;
        return (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/95 via-pink-500/95 to-purple-600/95 text-white shadow-2xl shadow-rose-500/30 backdrop-blur-xl border border-white/20 flex items-start gap-3.5 max-w-sm">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ToastIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-extrabold text-sm text-white truncate">
                    {liveToast.title}
                  </h5>
                  <span className="text-[10px] font-bold uppercase bg-white/20 px-1.5 py-0.5 rounded text-white/90">
                    Live
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-0.5 leading-snug">
                  {liveToast.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
