'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  UserPlus, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Users,
  ShieldCheck,
  AlertCircle,
  Link as LinkIcon,
  Unlink,
  Battery,
  BatteryCharging,
  BatteryLow,
  Brain,
  Pizza,
  Zap,
  Flame,
  Moon,
  Sun,
  Compass,
  Smile,
  Activity,
  UserCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { evaluateMoodEngine, getStoredMood, saveStoredMood, MoodState } from '@/components/mood-energy-widget';

interface PartnerRequest {
  id: number;
  senderId?: string;
  receiverId?: string;
  username: string;
  email: string;
  coupleCode?: string;
  createdAt: string;
}

interface PartnerData {
  user: any;
  partner: any;
  coupleCode: string;
  incomingRequests: PartnerRequest[];
  outgoingRequests: PartnerRequest[];
}

export function PartnerConnectCard({ onPartnerChanged }: { onPartnerChanged?: () => void }) {
  const { user, refreshUser } = useAuth();
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [partnerMood, setPartnerMood] = useState<MoodState>({ energy: 50, stress: 30, hunger: 40 });
  const [showMoodAdjust, setShowMoodAdjust] = useState(false);

  useEffect(() => {
    fetchPartnerData();
    const initial = getStoredMood();
    setPartnerMood(initial);

    const handleSync = (e: any) => {
      if (e.detail) {
        setPartnerMood(e.detail);
      }
    };

    window.addEventListener('duo_diary_mood_updated', handleSync);
    return () => window.removeEventListener('duo_diary_mood_updated', handleSync);
  }, [user]);

  const updatePartnerEnergy = (val: number) => {
    const next = { ...partnerMood, energy: val };
    setPartnerMood(next);
    saveStoredMood(next);
  };

  const updatePartnerStress = (val: number) => {
    const next = { ...partnerMood, stress: val };
    setPartnerMood(next);
    saveStoredMood(next);
  };

  const updatePartnerHunger = (val: number) => {
    const next = { ...partnerMood, hunger: val };
    setPartnerMood(next);
    saveStoredMood(next);
  };

  const applyPresetInModal = (eVal: number, sVal: number, hVal: number) => {
    const next = { energy: eVal, stress: sVal, hunger: hVal };
    setPartnerMood(next);
    saveStoredMood(next);
  };

  const fetchPartnerData = async () => {
    try {
      const res = await fetch('/api/partner');
      if (res.ok) {
        const data = await res.json();
        setPartnerData(data);
      }
    } catch (e) {
      console.error('Failed to fetch partner data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = partnerData?.coupleCode || user?.coupleCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      setFeedback({ type: 'success', message: data.message });
      setIdentifier('');
      await fetchPartnerData();
      await refreshUser();
      if (onPartnerChanged) onPartnerChanged();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error sending request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/partner/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept request');
      }

      setFeedback({ type: 'success', message: data.message });
      await fetchPartnerData();
      await refreshUser();
      if (onPartnerChanged) onPartnerChanged();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error accepting request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/partner/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        await fetchPartnerData();
      }
    } catch (err) {
      console.error('Error rejecting:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/partner/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        await fetchPartnerData();
      }
    } catch (err) {
      console.error('Error cancelling:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to unlink from your partner?')) return;

    setDisconnecting(true);
    try {
      const res = await fetch('/api/partner/disconnect', {
        method: 'POST',
      });
      if (res.ok) {
        setShowManageModal(false);
        await fetchPartnerData();
        await refreshUser();
        if (onPartnerChanged) onPartnerChanged();
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading) return null;

  const isConnected = !!(partnerData?.partner || user?.partner);
  const currentPartner = partnerData?.partner || user?.partner;
  const myCoupleCode = partnerData?.coupleCode || user?.coupleCode || 'LOVE-CODE';

  // State A: Already Connected
  if (isConnected && currentPartner) {
    return (
      <>
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/30 shrink-0">
              <Heart className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  Shared Sanctuary Active
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Connected with <span className="gradient-love-text">@{currentPartner.username}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                All memories, letters, photos, and dreams are shared between both of you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <Link href="/dashboard/partner">
              <Button
                size="sm"
                className="rounded-xl text-xs bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 gap-1.5 h-9 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Partner Activities & Archetypes</span>
              </Button>
            </Link>
            <Button
              onClick={() => setShowManageModal(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs glass-card-interactive gap-1.5 h-9"
            >
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Partner Info</span>
            </Button>
          </div>
        </div>

        {/* Partner Manage Modal with Full Profile, Mood & Energy Dashboard */}
        {showManageModal && (() => {
          const moodResult = evaluateMoodEngine(partnerMood);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 space-y-5 border border-rose-500/30 shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/15 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
                      <Heart className="w-5 h-5 fill-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Sanctuary Partner Card
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-foreground">
                        @{currentPartner.username}&apos;s Profile & Vitals
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowManageModal(false)}
                    className="p-2 rounded-xl glass-card-interactive text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Partner Identity Card */}
                <div className="p-4 sm:p-5 rounded-2xl glass-card-subtle border border-white/30 dark:border-white/10 relative overflow-hidden space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-rose-500/30 shrink-0 ring-2 ring-rose-400/40">
                        {currentPartner.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-foreground text-base sm:text-lg">
                            @{currentPartner.username}
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <p className="text-xs text-muted-foreground">{currentPartner.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Identity Badges (Gender, Age, Sanctuary status) */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {currentPartner.gender && currentPartner.gender !== 'unspecified' && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 flex items-center gap-1">
                        {currentPartner.gender === 'female' ? '👩 She / Her' : currentPartner.gender === 'male' ? '👨 He / Him' : '✨ ' + currentPartner.gender}
                      </span>
                    )}
                    {currentPartner.age ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center gap-1">
                        🎂 Age {currentPartner.age}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-500/10 text-muted-foreground border border-slate-500/20">
                        Age 16+ Verified
                      </span>
                    )}
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 1-to-1 Linked
                    </span>
                  </div>

                  {/* Bio / Motto */}
                  <div className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 text-xs text-foreground/90 italic">
                    &ldquo;{currentPartner.bio || 'Two souls sharing one beautiful sanctuary 💕'}&rdquo;
                  </div>

                  {/* Couple Code */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-rose-500" /> Couple Code:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{myCoupleCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 rounded-md glass-card-interactive hover:text-rose-500 transition-all text-muted-foreground"
                        title="Copy Code"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Partner Live Mood & Energy Dashboard */}
                <div className="p-4 sm:p-5 rounded-2xl glass-card-subtle border border-rose-500/25 space-y-4 bg-gradient-to-br from-rose-500/5 via-transparent to-purple-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          Live State
                        </span>
                        <h4 className="font-extrabold text-foreground text-sm sm:text-base">
                          Mood & Energy Vitals 🔋
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Real-time status based on partner sliders
                      </p>
                    </div>

                    {/* Dynamic Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${moodResult.badgeBg} ${moodResult.badgeText} ${moodResult.badgeBorder} shadow-sm font-bold text-xs shrink-0`}>
                      <span>{moodResult.badgeEmoji}</span>
                      <span>{moodResult.badge}</span>
                    </div>
                  </div>

                  {/* 3 Visual Battery / Meter Gauges */}
                  <div className="space-y-3">
                    
                    {/* Gauge 1: Energy Battery */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1 text-foreground">
                          {partnerMood.energy > 60 ? (
                            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                          ) : partnerMood.energy > 25 ? (
                            <Battery className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <BatteryLow className="w-3.5 h-3.5 text-red-500" />
                          )}
                          Energy Battery:
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {partnerMood.energy}% ({partnerMood.energy < 30 ? 'Drained 🪫' : partnerMood.energy > 70 ? 'Hyper ⚡' : 'Moderate 🔋'})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${partnerMood.energy}%` }}
                        />
                      </div>
                    </div>

                    {/* Gauge 2: Stress Level */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1 text-foreground">
                          <Brain className={`w-3.5 h-3.5 ${partnerMood.stress > 60 ? 'text-red-500' : 'text-purple-500'}`} />
                          Stress Level:
                        </span>
                        <span className={`font-mono font-bold ${partnerMood.stress > 60 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}>
                          {partnerMood.stress}% ({partnerMood.stress < 30 ? 'Zen & Calm 🧘' : partnerMood.stress > 65 ? 'Overwhelmed 🤯' : 'Normal 🧠'})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${partnerMood.stress > 60 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                          style={{ width: `${partnerMood.stress}%` }}
                        />
                      </div>
                    </div>

                    {/* Gauge 3: Hunger Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1 text-foreground">
                          <Pizza className={`w-3.5 h-3.5 ${partnerMood.hunger > 60 ? 'text-amber-500' : 'text-rose-500'}`} />
                          Hunger Meter:
                        </span>
                        <span className={`font-mono font-bold ${partnerMood.hunger > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {partnerMood.hunger}% ({partnerMood.hunger < 30 ? 'Full 🥗' : partnerMood.hunger > 60 ? 'Starving 🍕' : 'Peckish 🥪'})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${partnerMood.hunger > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'}`}
                          style={{ width: `${partnerMood.hunger}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Immediate Partner Care Tips */}
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                        Recommended Care Action
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {moodResult.headline}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium">
                      {moodResult.summary}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {moodResult.tips.map((tip, idx) => {
                        const TipIcon = tip.icon;
                        return (
                          <div key={idx} className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/15 space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                              <TipIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{tip.title}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                              {tip.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible Sliders & Presets Adjuster */}
                  <div className="pt-1">
                    <button
                      onClick={() => setShowMoodAdjust(!showMoodAdjust)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-all"
                    >
                      <span>{showMoodAdjust ? 'Hide Sliders Adjuster' : '⚡ Adjust Sliders & Presets Directly'}</span>
                      {showMoodAdjust ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showMoodAdjust && (
                      <div className="mt-3 p-3.5 rounded-xl glass-card-subtle border border-white/20 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Presets */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">Presets:</span>
                          <button
                            onClick={() => applyPresetInModal(15, 85, 80)}
                            className="px-2 py-0.5 rounded-lg glass-card-interactive text-[10px] font-semibold shrink-0"
                          >
                            🚨 Hangry
                          </button>
                          <button
                            onClick={() => applyPresetInModal(85, 20, 30)}
                            className="px-2 py-0.5 rounded-lg glass-card-interactive text-[10px] font-semibold shrink-0"
                          >
                            ⚡ Hype
                          </button>
                          <button
                            onClick={() => applyPresetInModal(25, 20, 20)}
                            className="px-2 py-0.5 rounded-lg glass-card-interactive text-[10px] font-semibold shrink-0"
                          >
                            🛌 Cozy
                          </button>
                          <button
                            onClick={() => applyPresetInModal(50, 30, 40)}
                            className="px-2 py-0.5 rounded-lg glass-card-interactive text-[10px] font-semibold shrink-0"
                          >
                            ✨ Balanced
                          </button>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="space-y-2 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-foreground">Battery:</span>
                              <span className="font-mono text-emerald-600">{partnerMood.energy}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={partnerMood.energy}
                              onChange={(e) => updatePartnerEnergy(Number(e.target.value))}
                              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-foreground">Stress:</span>
                              <span className="font-mono text-purple-600">{partnerMood.stress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={partnerMood.stress}
                              onChange={(e) => updatePartnerStress(Number(e.target.value))}
                              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-semibold text-foreground">Hunger:</span>
                              <span className="font-mono text-amber-600">{partnerMood.hunger}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={partnerMood.hunger}
                              onChange={(e) => updatePartnerHunger(Number(e.target.value))}
                              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts to Shared Activities */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Shared Sanctuary Activities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link 
                      href="/dashboard/roulette"
                      onClick={() => setShowManageModal(false)}
                      className="p-3 rounded-2xl glass-card-interactive border border-rose-500/20 flex items-center gap-3 hover:border-rose-500/40 transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-foreground truncate">Couples Decision Roulette</h5>
                        <p className="text-[10px] text-muted-foreground">Spin for Food, Movies, Dates</p>
                      </div>
                    </Link>

                    <Link 
                      href="/dashboard/partner"
                      onClick={() => setShowManageModal(false)}
                      className="p-3 rounded-2xl glass-card-interactive border border-purple-500/20 flex items-center gap-3 hover:border-purple-500/40 transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-foreground truncate">Animal Archetypes</h5>
                        <p className="text-[10px] text-muted-foreground">Quiz & Secret Trait Reveal</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex justify-between items-center gap-3">
                  <Button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-9"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>{disconnecting ? 'Unlinking...' : 'Unlink Partner'}</span>
                  </Button>

                  <Button
                    onClick={() => setShowManageModal(false)}
                    size="sm"
                    className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white h-9 px-5 font-semibold shadow-md shadow-rose-500/25"
                  >
                    Close Vitals
                  </Button>
                </div>

              </div>
            </div>
          );
        })()}
      </>
    );
  }

  // State B: NOT Connected Yet - Primary Onboarding Card
  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-pink-500/5 to-purple-500/15 shadow-xl shadow-rose-500/10 relative overflow-hidden">
      {/* Decorative Glow Orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-xl animate-float">
            <Image
              src="/winston.png"
              alt="Winston the Retriever Mascot"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                Step 1 · Essential
              </span>
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                🐾 Winston Says: Link Up!
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
              Add Your Partner to Your Sanctuary
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Woof! Connect with your partner so I can guard all your stories, secret letters, photos, and dreams together!
            </p>
          </div>
        </div>
      </div>

      {/* Incoming Requests Banner (if someone added this user!) */}
      {partnerData?.incomingRequests && partnerData.incomingRequests.length > 0 && (
        <div className="mb-6 space-y-3">
          {partnerData.incomingRequests.map((req) => (
            <div 
              key={req.id} 
              className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-500/30">
                  <Heart className="w-5 h-5 fill-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Incoming Partner Request</span>
                  </div>
                  <h4 className="font-extrabold text-foreground text-sm sm:text-base">
                    @{req.username} <span className="text-xs font-normal text-muted-foreground">({req.email})</span> wants to link!
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => handleRejectRequest(req.id)}
                  disabled={submitting}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs glass-card-interactive h-9 px-3"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => handleAcceptRequest(req.id)}
                  disabled={submitting}
                  size="sm"
                  className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 h-9 px-4 gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Accept & Link</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: 2 Options (Share Your Code OR Search Partner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Option 1: Share Your Couple Code */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card-subtle flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-rose-500" /> Option A: Share Your Couple Code
            </span>
            <h3 className="font-bold text-foreground text-sm mt-1">
              Give this code to your partner
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              When they sign up and enter your code, you will be automatically linked.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 h-11 bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 rounded-xl px-3 flex items-center justify-between font-mono text-base font-black tracking-widest text-rose-600 dark:text-rose-400">
              <span>{myCoupleCode}</span>
            </div>
            <Button
              onClick={handleCopyCode}
              type="button"
              className="h-11 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white gap-1.5 px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Option 2: Send Partner Request */}
        <div className="p-4 sm:p-5 rounded-2xl glass-card-subtle flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-rose-500" /> Option B: Send Partner Request
            </span>
            <h3 className="font-bold text-foreground text-sm mt-1">
              Enter partner username, email or couple code
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              They will receive an invitation in their sanctuary immediately.
            </p>
          </div>

          <form onSubmit={handleSendRequest} className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="e.g. username, email, or LOVE-CODE"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={submitting}
                className="glass-input h-11 text-xs rounded-xl flex-1"
                required
              />
              <Button
                type="submit"
                disabled={submitting || !identifier.trim()}
                className="h-11 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white gap-1.5 px-4 shrink-0 shadow-md shadow-rose-500/25"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending...' : 'Send'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Outgoing Requests (Waiting State) */}
      {partnerData?.outgoingRequests && partnerData.outgoingRequests.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Sent Invitations (Awaiting Response)
          </div>
          <div className="space-y-2">
            {partnerData.outgoingRequests.map((req) => (
              <div 
                key={req.id} 
                className="p-3 rounded-xl glass-card-subtle flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-foreground font-bold">@{req.username}</span>
                  <span className="text-muted-foreground text-[11px]">({req.email})</span>
                </div>
                <button
                  onClick={() => handleCancelRequest(req.id)}
                  disabled={submitting}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  Cancel Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
