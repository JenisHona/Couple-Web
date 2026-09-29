'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Heart, 
  EyeOff, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Moon, 
  Wine, 
  MessageSquareHeart, 
  RefreshCw,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/lib/realtime-context';

interface DesireMatcherProps {
  partnerUsername?: string | null;
}

export function IntimacyDesireMatcher({ partnerUsername = 'Partner' }: DesireMatcherProps) {
  const { publish, subscribe } = useRealtime();
  const [desireLevel, setDesireLevel] = useState<number>(50);
  const [threshold, setThreshold] = useState<number>(60);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Backend state
  const [data, setData] = useState<{
    myDesire: number;
    myThreshold: number;
    myNote: string;
    partnerHasSubmitted: boolean;
    isMatched: boolean;
    partnerDesire: number | null;
    partnerNote: string;
    partnerUsername: string | null;
  } | null>(null);

  const fetchDesireData = async () => {
    try {
      const res = await fetch('/api/intimacy/desire');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setDesireLevel(json.myDesire ?? 50);
        setThreshold(json.myThreshold ?? 60);
        setNote(json.myNote ?? '');
      }
    } catch (err) {
      console.error('Error fetching desire data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesireData();

    // Listen to realtime desire updates from partner
    const unsub = subscribe('INTIMACY_DESIRE_UPDATE', () => {
      fetchDesireData();
    });

    return () => unsub();
  }, [subscribe]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/intimacy/desire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desireLevel, threshold, note }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save desire level');
      
      setFeedback('✨ Your desire level has been safely secured behind the secrecy shield!');
      await fetchDesireData();
      publish('INTIMACY_DESIRE_UPDATE', { desireLevel, threshold });
    } catch (err: any) {
      setFeedback(err.message || 'Error updating desire level');
    } finally {
      setSaving(false);
    }
  };

  const getEmojiForLevel = (val: number) => {
    if (val < 20) return { emoji: '🧊', label: 'Cool & Sleepy', desc: 'Just cozy cuddles and deep sleep tonight.' };
    if (val < 45) return { emoji: '☕', label: 'Warm & Cozy', desc: 'Gentle hugs, back rubs, and soft relaxation.' };
    if (val < 70) return { emoji: '✨', label: 'Flirty & Open', desc: 'Receptive to sparks if the mood strikes.' };
    if (val < 90) return { emoji: '💋', label: 'High Intimacy Desire', desc: 'Craving romantic passion and physical connection.' };
    return { emoji: '🔥', label: 'Max Passion & Fire', desc: 'Unstoppable chemistry and wild romantic mood!' };
  };

  const currentDescriptor = getEmojiForLevel(desireLevel);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
        <p className="text-xs text-muted-foreground">Checking intimacy secrecy shield...</p>
      </div>
    );
  }

  const isMatched = !!data?.isMatched;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Blind Match Status */}
      {isMatched ? (
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-red-500/25 via-rose-500/25 to-pink-500/25 border-2 border-rose-500/60 shadow-2xl shadow-rose-500/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 via-rose-500 to-pink-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-rose-500/40 shrink-0 animate-bounce">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                    Blind Match Triggered
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  It&apos;s an Intimacy Match Tonight! 💋
                </h3>
                <p className="text-xs sm:text-sm text-foreground/80 mt-0.5">
                  Both you ({desireLevel}%) and @{partnerUsername} ({data?.partnerDesire}%) are above your {threshold}% intimacy threshold!
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 text-xs shrink-0 space-y-1">
              <div className="flex items-center justify-between gap-4 font-bold text-foreground">
                <span>Mutual Chemistry:</span>
                <span className="text-rose-500 font-mono">
                  {Math.round(((desireLevel + (data?.partnerDesire || 0)) / 2))}% Match
                </span>
              </div>
              {data?.partnerNote && (
                <p className="text-[11px] text-muted-foreground italic max-w-xs">
                  @{partnerUsername}: &ldquo;{data.partnerNote}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl glass-card-subtle border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  🛡️ Zero-Pressure Blind Match Active
                </span>
              </div>
              <h4 className="font-bold text-foreground text-sm">
                Your desire level is 100% confidential
              </h4>
              <p className="text-xs text-muted-foreground">
                Your partner will ONLY see a match if both of your sliders cross {threshold}%. Otherwise, your score remains completely hidden.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              data?.partnerHasSubmitted 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {data?.partnerHasSubmitted ? '✓ Partner has checked in' : '⏳ Waiting for partner'}
            </span>
          </div>
        </div>
      )}

      {/* Main Desire Controller Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-rose-500/25 bg-gradient-to-br from-white/70 dark:from-slate-950/70 via-background to-rose-500/5 shadow-xl space-y-6">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/20 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> Intimacy Mood Matcher
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Daily Desire Drive
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground mt-1">
              Set Your Mood for Tonight 🌙
            </h3>
          </div>

          {/* Current Level Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-sm shrink-0">
            <span className="text-xl">{currentDescriptor.emoji}</span>
            <span>{desireLevel}% · {currentDescriptor.label}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground">Quick Presets:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { val: 0, emoji: '🧊', label: 'Sleep Only' },
              { val: 25, emoji: '☕', label: 'Cozy Cuddle' },
              { val: 50, emoji: '✨', label: 'Open to Sparks' },
              { val: 75, emoji: '💋', label: 'High Desire' },
              { val: 100, emoji: '🔥', label: 'Wild Passion' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setDesireLevel(preset.val)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  desireLevel === preset.val
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30'
                    : 'glass-card-interactive hover:bg-rose-500/10 border-white/30 dark:border-white/10'
                }`}
              >
                <span className="text-lg">{preset.emoji}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="p-5 rounded-2xl glass-card-subtle border border-white/20 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Intimacy Drive Thermometer
            </span>
            <span className="font-mono font-bold text-rose-500 text-sm">
              {desireLevel}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={desireLevel}
            onChange={(e) => setDesireLevel(Number(e.target.value))}
            className="w-full h-3.5 bg-gradient-to-r from-blue-400 via-purple-400 via-pink-500 to-rose-600 rounded-lg appearance-none cursor-pointer accent-white shadow-inner transition-all"
          />

          <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>🧊 0% Ice Cold (Sleep)</span>
            <span>✨ 50% Receptive</span>
            <span>🔥 100% Fire</span>
          </div>

          <p className="text-xs text-muted-foreground bg-white/40 dark:bg-slate-900/40 p-3 rounded-xl italic">
            &ldquo;{currentDescriptor.desc}&rdquo;
          </p>
        </div>

        {/* Settings: Blind Match Threshold & Secret Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Threshold Selector */}
          <div className="p-4 rounded-2xl glass-card-subtle space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              Match Reveal Threshold
            </label>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Only reveal the match if both partners set their desire at or above this percentage.
            </p>
            <div className="flex gap-2 pt-1">
              {[50, 60, 70, 80].map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setThreshold(th)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    threshold === th
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'glass-card-interactive border-white/20'
                  }`}
                >
                  {th}%
                </button>
              ))}
            </div>
          </div>

          {/* Secret Note for Match */}
          <div className="p-4 rounded-2xl glass-card-subtle space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquareHeart className="w-3.5 h-3.5 text-pink-500" />
              Secret Note for Tonight (Optional)
            </label>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Only shown if a match is successfully triggered.
            </p>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Let's open that chilled wine and take a long warm bath..."
              maxLength={150}
              className="w-full text-xs h-9 px-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-white/30 dark:border-white/10 focus:border-rose-500 outline-none"
            />
          </div>

        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>{saving ? 'Securing in Secrecy Shield...' : 'Lock In & Update My Desire for Tonight'}</span>
        </Button>

      </div>

    </div>
  );
}
