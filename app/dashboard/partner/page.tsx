'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';
import { useRealtime } from '@/lib/realtime-context';
import { PartnerConnectCard } from '@/components/partner-connect-card';
import { DecisionRoulette } from '@/components/decision-roulette';
import { MoodEnergyWidget } from '@/components/mood-energy-widget';
import { 
  animalLibrary, 
  animalOptions, 
  AnimalData, 
  formatArchetypeSentence 
} from '@/lib/animal-archetypes';
import { 
  Sparkles, 
  Heart, 
  Lock, 
  Unlock, 
  Eye, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Users, 
  ShieldCheck,
  Flame,
  Award,
  Gamepad2,
  HelpCircle,
  Clock,
  ChevronRight,
  Smile,
  Zap,
  Gift,
  Compass,
  Battery
} from 'lucide-react';

export default function PartnerHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { publish, subscribe } = useRealtime();
  
  // Current active view in the Partner Hub: 'archetypes' | 'roulette' | 'mood' | 'activities'
  const [activeView, setActiveView] = useState<'archetypes' | 'roulette' | 'mood' | 'activities'>('archetypes');

  // Archetype selection state
  const [looksAnimal, setLooksAnimal] = useState<string>('golden_retriever');
  const [behaviorAnimal, setBehaviorAnimal] = useState<string>('sassy_cat');
  const [withYouAnimal, setWithYouAnimal] = useState<string>('otter');

  // Backend state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [archetypeData, setArchetypeData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active category tab for archetype selector
  const [activeSlotTab, setActiveSlotTab] = useState<'looks' | 'behavior' | 'with_you'>('looks');

  const fetchArchetypes = async () => {
    try {
      const res = await fetch('/api/archetypes');
      if (res.ok) {
        const data = await res.json();
        setArchetypeData(data);
        if (data.myArchetype) {
          setLooksAnimal(data.myArchetype.looksAnimal || 'golden_retriever');
          setBehaviorAnimal(data.myArchetype.behaviorAnimal || 'sassy_cat');
          setWithYouAnimal(data.myArchetype.withYouAnimal || 'otter');
        }
      }
    } catch (err) {
      console.error('Error fetching archetypes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchetypes();

    // Listen to partner archetype submission in real-time
    const unsub = subscribe('ARCHETYPE_COMPLETED', () => {
      fetchArchetypes();
    });

    return () => unsub();
  }, [subscribe]);

  const handleSaveArchetype = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/archetypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          looksAnimal,
          behaviorAnimal,
          withYouAnimal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save archetype');
      }

      setSuccessMsg('🎉 Your partner archetype has been safely locked in the secrecy shield!');
      setIsEditing(false);
      await fetchArchetypes();
      publish('ARCHETYPE_COMPLETED', { userCompleted: true });
    } catch (err: any) {
      setError(err.message || 'Error saving selections');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLooksData = animalLibrary[looksAnimal] || animalLibrary.golden_retriever;
  const selectedBehaviorData = animalLibrary[behaviorAnimal] || animalLibrary.sassy_cat;
  const selectedWithYouData = animalLibrary[withYouAnimal] || animalLibrary.otter;

  const dynamicSentence = formatArchetypeSentence(looksAnimal, behaviorAnimal, withYouAnimal);

  const hasMyArchetype = !!archetypeData?.myArchetype;
  const hasPartnerArchetype = !!archetypeData?.partnerCompleted;
  const bothCompleted = !!archetypeData?.bothCompleted;
  const partnerUser = archetypeData?.partner || user?.partner;

  // Activities in Partner Hub
  const upcomingActivities = [
    {
      id: 'velvet_vault',
      title: 'The Velvet Vault 🔒 (18+)',
      status: 'Live & Ready',
      isLive: true,
      tag: '18+ Intimacy & Desires',
      icon: Flame,
      gradient: 'from-red-600 via-rose-500 to-purple-600',
      description: 'Private PIN-locked sanctuary featuring the Desire Mood Matcher and Asynchronous Fantasy / Kink Checker.',
      action: () => router.push('/dashboard/intimacy')
    },
    {
      id: 'archetypes',
      title: 'Mix & Match Animal Archetypes',
      status: 'Live & Ready',
      isLive: true,
      tag: 'Personality & Vibes',
      icon: Sparkles,
      gradient: 'from-amber-500 via-rose-500 to-pink-500',
      description: 'Define your partner through 3 animal traits (Looks, Behavior, With You) with a blind reveal.',
      action: () => setActiveView('archetypes')
    },
    {
      id: 'roulette',
      title: 'Couples Decision Roulette 🎡',
      status: 'Live & Ready',
      isLive: true,
      tag: 'Food · Movies · Dates',
      icon: Compass,
      gradient: 'from-rose-500 via-pink-500 to-purple-600',
      description: 'Eliminate decision fatigue! Enter your options, spin the wheel, or match instantly.',
      action: () => setActiveView('roulette')
    },
    {
      id: 'mood_checkin',
      title: 'Mood & Energy Check-In 🔋',
      status: 'Live & Ready',
      isLive: true,
      tag: 'Real-Time Care Tips',
      icon: Battery,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      description: 'Energy, Stress & Hunger sliders with instant client-side partner care recommendations.',
      action: () => setActiveView('mood')
    },
    {
      id: 'daily_prompts',
      title: 'Daily Secret Questions',
      status: 'Coming Soon',
      isLive: false,
      tag: 'Daily Connection',
      icon: Heart,
      gradient: 'from-rose-500 to-red-500',
      description: 'Answer one spontaneous question about each other every morning. Answers unlock once both respond.',
    },
    {
      id: 'couple_trivia',
      title: 'Couple Trivia & Predictions',
      status: 'Coming Soon',
      isLive: false,
      tag: 'Fun & Play',
      icon: Gamepad2,
      gradient: 'from-purple-500 to-indigo-500',
      description: 'Test how well you really know each other’s quirks, memories, favorite foods, and pet peeves.',
    },
    {
      id: 'love_languages',
      title: 'Love Language Matrix',
      status: 'Coming Soon',
      isLive: false,
      tag: 'Emotional Depth',
      icon: Zap,
      gradient: 'from-teal-500 to-emerald-500',
      description: 'Break down each other’s primary and secondary love languages and how you feel most cherished.',
    }
  ];

  return (
    <DashboardLayout
      title="Your Partner Hub"
      subtitle={partnerUser ? `Cherished space & interactive activities for you and @${partnerUser.username}` : 'Connect with your partner to unlock shared activities and archetype profiles'}
    >
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        
        {/* If Not Connected, show PartnerConnectCard */}
        {!partnerUser ? (
          <div className="space-y-6">
            <PartnerConnectCard onPartnerChanged={fetchArchetypes} />
            <div className="glass-card rounded-2xl p-6 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground">Partner Activities Locked</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Link with your partner using their username or couple code above to unlock the Animal Archetypes game, Decision Roulette, and couple activities!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Partner Overview Banner */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full md:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/25 shrink-0">
                  {partnerUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      Partner Sanctuary
                    </span>
                    {partnerUser.gender && partnerUser.gender !== 'unspecified' && (
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {partnerUser.gender === 'female' ? '👩 She / Her' : partnerUser.gender === 'male' ? '👨 He / Him' : '✨ ' + partnerUser.gender}
                      </span>
                    )}
                    {partnerUser.age && (
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        Age {partnerUser.age}
                      </span>
                    )}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-foreground mt-0.5">
                    Together with <span className="gradient-love-text">@{partnerUser.username}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Private shared space for couple archetype profiles, quizzes, and games.
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-card-interactive w-full md:w-auto justify-center flex-wrap">
                <button
                  onClick={() => setActiveView('archetypes')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'archetypes'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-foreground/80 hover:text-rose-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Archetypes</span>
                </button>
                <button
                  onClick={() => setActiveView('roulette')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'roulette'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-foreground/80 hover:text-rose-500'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Decision Roulette</span>
                </button>
                <button
                  onClick={() => setActiveView('mood')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'mood'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-foreground/80 hover:text-rose-500'
                  }`}
                >
                  <Battery className="w-3.5 h-3.5" />
                  <span>Mood & Energy</span>
                </button>
                <button
                  onClick={() => setActiveView('activities')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'activities'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-foreground/80 hover:text-rose-500'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>All Activities</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: ANIMAL ARCHETYPES VIEW */}
            {activeView === 'archetypes' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                
                {/* Winston Guide */}
                <WinstonGuide
                  title="Winston's Archetype Guide 🐾"
                  message={`Woof! Define @${partnerUser.username}'s inner spirit! Pick an animal for how they look, how they behave, and how sweet they are when they are with you. Keep it a secret until both of you are done! 🐾`}
                />

                {/* State A: BOTH COMPLETED & REVEALED */}
                {bothCompleted && (revealed || hasMyArchetype) && (
                  <div className="space-y-6">
                    {/* Celebration Header */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 text-center border-2 border-rose-500/30 bg-gradient-to-b from-rose-500/10 via-background to-background relative overflow-hidden">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/30 mb-3">
                        <Award className="w-4 h-4" />
                        <span>Blind Reveal Unlocked!</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black text-foreground">
                        Your Couple Animal Archetypes
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                        Here is the sacred truth of what you and @{partnerUser.username} see in each other!
                      </p>
                    </div>

                    {/* Dual Side-by-Side Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* 1. What YOU defined for your partner */}
                      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-500/30 relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Your Vision</span>
                              <h3 className="text-lg font-bold text-foreground">How you see @{partnerUser.username}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
                              ✨
                            </div>
                          </div>

                          <blockquote className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm sm:text-base font-semibold text-foreground italic mb-6">
                            "{formatArchetypeSentence(
                              archetypeData.myArchetype?.looksAnimal || looksAnimal,
                              archetypeData.myArchetype?.behaviorAnimal || behaviorAnimal,
                              archetypeData.myArchetype?.withYouAnimal || withYouAnimal
                            )}"
                          </blockquote>

                          <div className="space-y-3">
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-amber-500 block">🌟 Looks-Wise</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.myArchetype?.looksAnimal]?.looks}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-rose-500 block">⚡ Behavior-Wise</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.myArchetype?.behaviorAnimal]?.behavior}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-pink-500 block">💖 When With You</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.myArchetype?.withYouAnimal]?.with_you}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs glass-card-interactive gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                            <span>Update My Selections</span>
                          </Button>
                        </div>
                      </div>

                      {/* 2. What YOUR PARTNER defined for YOU */}
                      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-pink-500/30 relative flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-500">Partner Vision</span>
                              <h3 className="text-lg font-bold text-foreground">How @{partnerUser.username} sees YOU</h3>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center font-bold">
                              💖
                            </div>
                          </div>

                          <blockquote className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-sm sm:text-base font-semibold text-foreground italic mb-6">
                            "{formatArchetypeSentence(
                              archetypeData.partnerArchetype?.looksAnimal,
                              archetypeData.partnerArchetype?.behaviorAnimal,
                              archetypeData.partnerArchetype?.withYouAnimal
                            )}"
                          </blockquote>

                          <div className="space-y-3">
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-amber-500 block">🌟 Looks-Wise</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.partnerArchetype?.looksAnimal]?.looks}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-rose-500 block">⚡ Behavior-Wise</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.partnerArchetype?.behaviorAnimal]?.behavior}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl glass-card-subtle">
                              <span className="text-[10px] font-bold uppercase text-pink-500 block">💖 When With You</span>
                              <p className="text-xs text-foreground/90 mt-0.5 font-medium">
                                {animalLibrary[archetypeData.partnerArchetype?.withYouAnimal]?.with_you}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Delivered & Verified by Winston 🐾</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* State B: ONE OR BOTH NOT YET REVEALED (Builder Mode) */}
                {(!bothCompleted || isEditing) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                    
                    {/* Left 7 Columns: 3-Slot Animal Picker */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Secrecy Shield Status Alert */}
                      {hasMyArchetype && !isEditing && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>Your profile for @{partnerUser.username} is locked in secret. Waiting for them to complete theirs!</span>
                          </div>
                          <Button
                            onClick={() => setIsEditing(true)}
                            size="sm"
                            variant="ghost"
                            className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 h-8 px-2"
                          >
                            Edit
                          </Button>
                        </div>
                      )}

                      {/* Slot Selector Stepper Tabs */}
                      <div className="glass-card rounded-2xl p-2 grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveSlotTab('looks')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSlotTab === 'looks'
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span>🌟 Looks</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlotTab('behavior')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSlotTab === 'behavior'
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span>⚡ Behavior</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlotTab('with_you')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSlotTab === 'with_you'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span>💖 With You</span>
                        </button>
                      </div>

                      {/* Tab Content: Grid of 14 Animals */}
                      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                              {activeSlotTab === 'looks' && 'Slot 1 · Physical Vibe & Presence'}
                              {activeSlotTab === 'behavior' && 'Slot 2 · How They Move Through Life'}
                              {activeSlotTab === 'with_you' && 'Slot 3 · How They Treat You & Love Language'}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-foreground">
                              {activeSlotTab === 'looks' && `How does @${partnerUser.username} look?`}
                              {activeSlotTab === 'behavior' && `How does @${partnerUser.username} act in the world?`}
                              {activeSlotTab === 'with_you' && `How is @${partnerUser.username} behind closed doors with you?`}
                            </h3>
                          </div>
                        </div>

                        {/* 14 Animal Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                          {animalOptions.map((animal) => {
                            const isSelected =
                              (activeSlotTab === 'looks' && looksAnimal === animal.id) ||
                              (activeSlotTab === 'behavior' && behaviorAnimal === animal.id) ||
                              (activeSlotTab === 'with_you' && withYouAnimal === animal.id);

                            const copyText =
                              activeSlotTab === 'looks'
                                ? animal.looks
                                : activeSlotTab === 'behavior'
                                ? animal.behavior
                                : animal.with_you;

                            return (
                              <div
                                key={animal.id}
                                onClick={() => {
                                  if (activeSlotTab === 'looks') setLooksAnimal(animal.id);
                                  if (activeSlotTab === 'behavior') setBehaviorAnimal(animal.id);
                                  if (activeSlotTab === 'with_you') setWithYouAnimal(animal.id);
                                }}
                                className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/10 border-rose-500 shadow-md shadow-rose-500/20 scale-[1.02]'
                                    : 'glass-card-subtle border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">{animal.emoji}</span>
                                      <span className="text-xs font-bold text-foreground">
                                        {animal.name}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                                    {copyText}
                                  </p>
                                </div>
                                <span className="text-[9px] uppercase font-semibold text-rose-500/80 mt-2 block">
                                  {animal.category}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Columns: Dynamic Stitched Preview & Save Action */}
                    <div className="lg:col-span-5 space-y-5 sticky top-24">
                      <div className="glass-card rounded-3xl p-6 border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-background to-pink-500/10 shadow-xl shadow-rose-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full">
                            Live Sentence Stitcher
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Your Custom Archetype Formula
                        </h4>

                        {/* Stitched Sentence Preview */}
                        <div className="my-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 shadow-inner">
                          <p className="text-sm sm:text-base font-semibold text-foreground italic leading-relaxed">
                            "{dynamicSentence}"
                          </p>
                        </div>

                        {/* Breakdown badges */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center justify-between text-xs p-2 rounded-xl glass-card-subtle">
                            <span className="text-muted-foreground">🌟 Looks Like:</span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              {animalOptions.find(a => a.id === looksAnimal)?.emoji} {animalOptions.find(a => a.id === looksAnimal)?.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs p-2 rounded-xl glass-card-subtle">
                            <span className="text-muted-foreground">⚡ Acts Like:</span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              {animalOptions.find(a => a.id === behaviorAnimal)?.emoji} {animalOptions.find(a => a.id === behaviorAnimal)?.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs p-2 rounded-xl glass-card-subtle">
                            <span className="text-muted-foreground">💖 With You:</span>
                            <span className="font-bold text-foreground flex items-center gap-1">
                              {animalOptions.find(a => a.id === withYouAnimal)?.emoji} {animalOptions.find(a => a.id === withYouAnimal)?.name}
                            </span>
                          </div>
                        </div>

                        {error && (
                          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium mb-4">
                            {error}
                          </div>
                        )}

                        {successMsg && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-4">
                            {successMsg}
                          </div>
                        )}

                        <Button
                          onClick={handleSaveArchetype}
                          disabled={submitting}
                          className="w-full py-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.01] transition-all"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          <span>{submitting ? 'Locking in Secrets...' : 'Lock & Save for @' + partnerUser.username}</span>
                        </Button>

                        <p className="text-[10px] text-muted-foreground text-center mt-3">
                          🔒 Secrecy Guarantee: Your partner will not see this until both of you complete your setup!
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: DECISION ROULETTE VIEW */}
            {activeView === 'roulette' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <DecisionRoulette
                  partner1Name={user?.username || 'You'}
                  partner2Name={partnerUser.username}
                />
              </div>
            )}

            {/* SECTION 3: MOOD & ENERGY LEVEL CHECK-IN */}
            {activeView === 'mood' && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                <MoodEnergyWidget
                  partnerName={partnerUser.username}
                  userName={user?.username || 'You'}
                />
              </div>
            )}

            {/* SECTION 4: ALL PARTNER ACTIVITIES DIRECTORY */}
            {activeView === 'activities' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      Couple Games & Activities
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Fun things to do, discover, and play together about each other.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {upcomingActivities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/40 dark:border-white/10 flex flex-col justify-between hover:border-rose-500/40 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${act.gradient} flex items-center justify-center text-white shadow-md`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              act.isLive
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border border-white/10'
                            }`}>
                              {act.status}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                            {act.tag}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-foreground group-hover:text-rose-500 transition-colors">
                            {act.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
                          {act.isLive ? (
                            <Button
                              onClick={act.action}
                              size="sm"
                              className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white gap-1.5 shadow-md shadow-rose-500/20"
                            >
                              <span>Play Now</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground italic flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> In Winston's Workshop
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
