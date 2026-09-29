'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryLow, 
  Brain, 
  Pizza, 
  Sparkles, 
  Heart, 
  AlertTriangle, 
  Coffee, 
  Moon, 
  Flame, 
  Sun, 
  CheckCircle2, 
  HelpCircle,
  RotateCcw,
  Zap,
  Smile,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/lib/realtime-context';

export interface MoodState {
  energy: number;   // 0 = Drained, 100 = Hyper
  stress: number;   // 0 = Zen/Calm, 100 = Overwhelmed
  hunger: number;   // 0 = Full, 100 = Starving
}

interface SuggestionResult {
  stateKey: 'hangry' | 'adventure' | 'cozy' | 'balanced';
  badge: string;
  badgeEmoji: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  headline: string;
  summary: string;
  tips: Array<{
    title: string;
    description: string;
    icon: React.ElementType;
    actionTag: string;
  }>;
}

// 100% Client-Side Pure Hardcoded Logic Engine (Zero AI API calls, Zero Server Cost)
export function evaluateMoodEngine(mood: MoodState): SuggestionResult {
  const { energy, stress, hunger } = mood;

  // RULE 1: State A - Hangry Alert (Stress > 65 && Energy < 35 && Hunger > 60)
  if (stress > 65 && energy < 35 && hunger > 60) {
    return {
      stateKey: 'hangry',
      badge: 'Handle With Care',
      badgeEmoji: '🚨',
      badgeBg: 'bg-red-500/15',
      badgeText: 'text-red-600 dark:text-red-400',
      badgeBorder: 'border-red-500/30',
      glowColor: 'from-red-500/20 via-orange-500/10 to-red-500/20',
      headline: 'Hangry & Overwhelmed Warning 🚨',
      summary: 'High stress combined with low battery and high hunger! Proceed with gentle TLC.',
      tips: [
        {
          title: 'Order Comfort Food Immediately',
          description: 'Do not ask "what do you want?". Order their favorite takeout or bring food with zero friction.',
          icon: Pizza,
          actionTag: 'Emergency Snack',
        },
        {
          title: '30 Minutes of Sacred Quiet',
          description: 'Give them low-stimulus space, dim the lights, and save all serious decisions for later.',
          icon: Moon,
          actionTag: 'Low Pressure',
        },
        {
          title: 'Comfort Touch, Zero Questions',
          description: 'A warm blanket, glass of cold water, or gentle shoulder rub without expecting conversation.',
          icon: Heart,
          actionTag: 'Pure Comfort',
        },
      ],
    };
  }

  // RULE 2: State B - Adventure / Action Mode (Energy > 65 && Stress < 40)
  if (energy > 65 && stress < 40) {
    return {
      stateKey: 'adventure',
      badge: 'Ready For Action',
      badgeEmoji: '⚡',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      glowColor: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/20',
      headline: 'Peak Energy & Good Vibes ⚡',
      summary: 'Supercharged and stress-free! Perfect window for spontaneous memory-making.',
      tips: [
        {
          title: 'Spontaneous Date Outing',
          description: 'Hit an arcade, grab late-night boba/dessert, or take a scenic late-night drive together.',
          icon: Zap,
          actionTag: 'Date Idea',
        },
        {
          title: 'Kitchen Dance Party',
          description: 'Blast your favorite couple playlist and dance around the living room while cooking.',
          icon: Flame,
          actionTag: 'High Energy',
        },
        {
          title: 'Conquer a Bucket List Goal',
          description: 'Channel this active momentum into planning your next weekend trip or outdoor adventure.',
          icon: Sparkles,
          actionTag: 'Bucket List',
        },
      ],
    };
  }

  // RULE 3: State C - Pure Cozy Couch Mode (Energy < 40 && Stress < 40)
  if (energy < 40 && stress < 40) {
    return {
      stateKey: 'cozy',
      badge: 'Pure Cozy Mode',
      badgeEmoji: '🛌',
      badgeBg: 'bg-indigo-500/15',
      badgeText: 'text-indigo-600 dark:text-indigo-400',
      badgeBorder: 'border-indigo-500/30',
      glowColor: 'from-indigo-500/20 via-purple-500/10 to-blue-500/20',
      headline: 'Cozy Recharge Mode 🛌',
      summary: 'Peaceful and calm, but battery is running low. Time for pillow fort relaxation.',
      tips: [
        {
          title: 'Movie Marathon & Heavy Blankets',
          description: 'Queue up a comfort movie, put phones on silent, and get under the fluffiest duvet.',
          icon: Moon,
          actionTag: 'Couch Time',
        },
        {
          title: 'Surprise Warm Beverage',
          description: 'Brew a soothing hot chamomile tea, warm matcha, or hot chocolate with mini marshmallows.',
          icon: Coffee,
          actionTag: 'Warmth',
        },
        {
          title: 'Silent Parallel Play',
          description: 'Read books, browse memes side-by-side, or cuddle with zero agenda or talking required.',
          icon: Heart,
          actionTag: 'Recharge',
        },
      ],
    };
  }

  // RULE 4: State D - Balanced / Smooth Sailing (Default)
  return {
    stateKey: 'balanced',
    badge: 'Smooth Sailing',
    badgeEmoji: '✨',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30',
    glowColor: 'from-rose-500/15 via-pink-500/10 to-purple-500/15',
    headline: 'Balanced & Harmonic ✨',
    summary: 'Steady mood and manageable stress levels. Great time for a meaningful check-in.',
    tips: [
      {
        title: 'Sweet Appreciation Note',
        description: 'Leave a surprise note or send a sweet text asking about their favorite highlight of the day.',
        icon: Heart,
        actionTag: 'Connection',
      },
      {
        title: 'Cook Dinner Together',
        description: 'Put on soft lo-fi music and chop veggies side-by-side for a relaxed home-cooked meal.',
        icon: Pizza,
        actionTag: 'Quality Time',
      },
      {
        title: 'Evening Sunset Walk',
        description: 'Step outside for a 15-minute hand-in-hand stroll to unwind and breathe fresh air.',
        icon: Sun,
        actionTag: 'Fresh Air',
      },
    ],
  };
}

export function getStoredMood(): MoodState {
  if (typeof window === 'undefined') return { energy: 50, stress: 30, hunger: 40 };
  try {
    const raw = localStorage.getItem('duo_diary_partner_mood');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.energy === 'number' && typeof parsed.stress === 'number' && typeof parsed.hunger === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return { energy: 50, stress: 30, hunger: 40 };
}

export function saveStoredMood(mood: MoodState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('duo_diary_partner_mood', JSON.stringify(mood));
    window.dispatchEvent(new CustomEvent('duo_diary_mood_updated', { detail: mood }));
  } catch (e) {
    // Ignore error
  }
}

interface MoodEnergyWidgetProps {
  partnerName?: string;
  userName?: string;
  className?: string;
}

export function MoodEnergyWidget({
  partnerName = 'Partner',
  userName = 'You',
  className = '',
}: MoodEnergyWidgetProps) {
  const { isConnected: isRealtimeConnected, publish, subscribe } = useRealtime();

  // Slider states (0 to 100)
  const [energy, setEnergy] = useState<number>(50);
  const [stress, setStress] = useState<number>(30);
  const [hunger, setHunger] = useState<number>(40);

  useEffect(() => {
    const initial = getStoredMood();
    setEnergy(initial.energy);
    setStress(initial.stress);
    setHunger(initial.hunger);

    const handleSync = (e: any) => {
      if (e.detail) {
        setEnergy(e.detail.energy);
        setStress(e.detail.stress);
        setHunger(e.detail.hunger);
      }
    };

    window.addEventListener('duo_diary_mood_updated', handleSync);

    // Realtime broadcast subscription
    const unsub = subscribe('MOOD_SYNC', (msg) => {
      if (msg.data && typeof msg.data.energy === 'number') {
        setEnergy(msg.data.energy);
        setStress(msg.data.stress);
        setHunger(msg.data.hunger);
      }
    });

    return () => {
      window.removeEventListener('duo_diary_mood_updated', handleSync);
      unsub();
    };
  }, [subscribe]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const broadcastMood = useCallback((nextMood: MoodState, immediate: boolean = false) => {
    // 1. Instant local storage and UI sync (0ms latency)
    saveStoredMood(nextMood);

    // 2. Debounce the network broadcast request so dragging the slider doesn't spam APIs
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (immediate) {
      publish('MOOD_SYNC', nextMood);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        publish('MOOD_SYNC', nextMood);
      }, 350);
    }
  }, [publish]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Update storage and broadcast whenever sliders change
  const updateEnergy = (val: number) => {
    setEnergy(val);
    broadcastMood({ energy: val, stress, hunger });
  };

  const updateStress = (val: number) => {
    setStress(val);
    broadcastMood({ energy, stress: val, hunger });
  };

  const updateHunger = (val: number) => {
    setHunger(val);
    broadcastMood({ energy, stress, hunger: val });
  };

  // Hardcoded engine evaluation (Instantaneous, 0ms latency, zero API costs)
  const result = useMemo(() => {
    return evaluateMoodEngine({ energy, stress, hunger });
  }, [energy, stress, hunger]);

  // Quick Preset Handlers (Immediate network publish)
  const applyPreset = (eVal: number, sVal: number, hVal: number) => {
    setEnergy(eVal);
    setStress(sVal);
    setHunger(hVal);
    broadcastMood({ energy: eVal, stress: sVal, hunger: hVal }, true);
  };

  return (
    <div className={`glass-card rounded-3xl p-5 sm:p-7 border border-rose-500/25 bg-gradient-to-br from-white/70 dark:from-slate-950/70 via-background to-rose-500/5 shadow-xl relative overflow-hidden ${className}`}>
      
      {/* Background Accent Glow based on state */}
      <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${result.glowColor} rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-all duration-500`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/20 dark:border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live Check-In
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Client-Side Instant Engine
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-foreground mt-1">
            Mood & Energy Level Check-In 🔋
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adjust your sliders in real-time to generate partner care tips instantly.
          </p>
        </div>

        {/* Dynamic Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${result.badgeBg} ${result.badgeText} ${result.badgeBorder} shadow-sm font-bold text-xs shrink-0 self-start sm:self-auto transition-all duration-300 animate-in zoom-in-95`}>
          <span className="text-base">{result.badgeEmoji}</span>
          <span>{result.badge}</span>
        </div>
      </div>

      {/* Quick Mood Presets */}
      <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs z-10 relative">
        <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
          <Zap className="w-3 h-3 text-amber-500" /> Presets:
        </span>
        <button
          onClick={() => applyPreset(15, 85, 80)}
          className="px-2.5 py-1 rounded-xl glass-card-subtle hover:bg-red-500/15 text-[11px] font-semibold text-foreground transition-all shrink-0 hover:border-red-500/30"
        >
          🚨 Late Night Hangry
        </button>
        <button
          onClick={() => applyPreset(85, 20, 30)}
          className="px-2.5 py-1 rounded-xl glass-card-subtle hover:bg-emerald-500/15 text-[11px] font-semibold text-foreground transition-all shrink-0 hover:border-emerald-500/30"
        >
          ⚡ Friday Night Hype
        </button>
        <button
          onClick={() => applyPreset(25, 20, 20)}
          className="px-2.5 py-1 rounded-xl glass-card-subtle hover:bg-indigo-500/15 text-[11px] font-semibold text-foreground transition-all shrink-0 hover:border-indigo-500/30"
        >
          🛌 Sunday Couch Potato
        </button>
        <button
          onClick={() => applyPreset(50, 30, 40)}
          className="px-2.5 py-1 rounded-xl glass-card-subtle hover:bg-rose-500/15 text-[11px] font-semibold text-foreground transition-all shrink-0 hover:border-rose-500/30"
        >
          ✨ Chill & Balanced
        </button>
      </div>

      {/* Main Grid: Left Sliders, Right Realtime Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* Left 6 Columns: Interactive Sliders */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Slider 1: Energy Battery */}
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/20 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                {energy > 60 ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-500" />
                ) : energy > 25 ? (
                  <Battery className="w-4 h-4 text-amber-500" />
                ) : (
                  <BatteryLow className="w-4 h-4 text-red-500" />
                )}
                Energy Battery
              </span>
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {energy}% · {energy < 30 ? 'Drained' : energy > 70 ? 'Hyper' : 'Moderate'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={energy}
              onChange={(e) => updateEnergy(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>🪫 0% Drained</span>
              <span>⚡ 100% Hyper</span>
            </div>
          </div>

          {/* Slider 2: Stress Level */}
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/20 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Brain className={`w-4 h-4 ${stress > 60 ? 'text-red-500' : 'text-purple-500'}`} />
                Stress Level
              </span>
              <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg ${
                stress > 60 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}>
                {stress}% · {stress < 30 ? 'Zen & Calm' : stress > 65 ? 'Overwhelmed' : 'Normal'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stress}
              onChange={(e) => updateStress(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>🧘 0% Zen Calm</span>
              <span>🤯 100% Overwhelmed</span>
            </div>
          </div>

          {/* Slider 3: Hunger Meter */}
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/20 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Pizza className={`w-4 h-4 ${hunger > 60 ? 'text-amber-500' : 'text-rose-500'}`} />
                Hunger Meter
              </span>
              <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg ${
                hunger > 60 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {hunger}% · {hunger < 30 ? 'Full' : hunger > 60 ? 'Starving' : 'Peckish'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hunger}
              onChange={(e) => updateHunger(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>🥗 0% Full</span>
              <span>🍕 100% Starving</span>
            </div>
          </div>

        </div>

        {/* Right 6 Columns: Instant Actionable Partner Care Tips */}
        <div className="lg:col-span-6 space-y-3">
          
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 dark:border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Actionable Partner Care Plan
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                For @{partnerName}
              </span>
            </div>
            <h4 className="text-base font-bold text-foreground">
              {result.headline}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* 3 Actionable Real-Life Tips Cards */}
          <div className="space-y-2.5">
            {result.tips.map((tip, idx) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl glass-card-subtle border border-white/30 dark:border-white/10 flex items-start gap-3 hover:border-rose-500/30 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/20 to-pink-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <TipIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-bold text-foreground truncate">
                        {tip.title}
                      </h5>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0">
                        {tip.actionTag}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
