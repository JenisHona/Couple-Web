'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';
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
  Share2
} from 'lucide-react';

export default function AnimalArchetypesPage() {
  const { user } = useAuth();
  
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

  // Active category tab for mobile/stepper
  const [activeTab, setActiveTab] = useState<'looks' | 'behavior' | 'with_you'>('looks');

  useEffect(() => {
    fetchArchetypes();
  }, []);

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

      setSuccessMsg('🎉 Your animal archetype for your partner has been securely saved!');
      setIsEditing(false);
      await fetchArchetypes();
    } catch (err: any) {
      setError(err.message || 'Error saving selections');
    } finally {
      setSubmitting(false);
    }
  };

  const partnerName = archetypeData?.partner?.username ? `@${archetypeData.partner.username}` : 'My Partner';
  const mySentence = formatArchetypeSentence(looksAnimal, behaviorAnimal, withYouAnimal, partnerName);
  
  const hasSubmitted = !!archetypeData?.myArchetype;
  const bothCompleted = archetypeData?.bothCompleted;
  const partnerCompleted = archetypeData?.partnerCompleted;
  const partnerArchetype = archetypeData?.partnerArchetype;

  if (loading) {
    return (
      <DashboardLayout
        title="Animal Archetypes 🐾"
        subtitle="Mix-and-match your partner's true animal personality"
      >
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Gathering animal spirits...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Animal Archetypes 🐾"
      subtitle="Mix-and-match your partner's looks, behavior, and love language"
    >
      {/* Winston Guide Header */}
      <div className="mb-6">
        <WinstonGuide
          variant="card"
          title="Winston's Blind Reveal Quiz 🐾"
          message="Pick 3 animal archetypes for your partner: how they look, how they act in public, and how they treat you. Your answers stay top secret until both of you finish!"
          dismissible={true}
        />
      </div>

      {/* STATE A: BOTH COMPLETED - REVEAL SCREEN */}
      {bothCompleted && partnerArchetype && !isEditing ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Top Celebration Banner */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center border-2 border-rose-500/40 bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-purple-500/20 relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs mb-3 shadow-md animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>Archetypes Revealed!</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Your Couple Archetype Match 💖
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto mt-1">
              Both of you have completed your secret animal profiles! Here is how you truly see each other.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="rounded-xl text-xs glass-card-interactive gap-1.5 h-9"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Change My Picks</span>
              </Button>
            </div>
          </div>

          {/* Side-by-Side Dual Archetype Reveal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: How You See Your Partner */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent space-y-5 relative">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💝</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Your Perspective</span>
                    <h3 className="text-lg font-black text-foreground">How You See {partnerName}</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold">
                  By @{user?.username}
                </span>
              </div>

              {/* Stitched Sentence Callout */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 text-xs sm:text-sm font-serif italic text-foreground leading-relaxed shadow-sm">
                "{mySentence}"
              </div>

              {/* 3 Categories Breakdown */}
              <div className="space-y-3">
                {/* Looks */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[looksAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Looks-Wise: <span className="text-rose-500">{animalLibrary[looksAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[looksAnimal]?.looks}
                  </p>
                </div>

                {/* Behavior */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[behaviorAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Behavior-Wise: <span className="text-purple-500">{animalLibrary[behaviorAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[behaviorAnimal]?.behavior}
                  </p>
                </div>

                {/* With You */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[withYouAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Around You: <span className="text-pink-500">{animalLibrary[withYouAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[withYouAnimal]?.with_you}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: How Your Partner Sees You */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent space-y-5 relative">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💖</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Partner's Perspective</span>
                    <h3 className="text-lg font-black text-foreground">How {partnerName} Sees You</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold">
                  By {partnerName}
                </span>
              </div>

              {/* Partner Stitched Sentence */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/30 dark:border-white/10 text-xs sm:text-sm font-serif italic text-foreground leading-relaxed shadow-sm">
                "{formatArchetypeSentence(
                  partnerArchetype.looksAnimal,
                  partnerArchetype.behaviorAnimal,
                  partnerArchetype.withYouAnimal,
                  `@${user?.username || 'You'}`
                )}"
              </div>

              {/* Partner's 3 Categories Breakdown */}
              <div className="space-y-3">
                {/* Looks */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[partnerArchetype.looksAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Looks-Wise: <span className="text-purple-500">{animalLibrary[partnerArchetype.looksAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[partnerArchetype.looksAnimal]?.looks}
                  </p>
                </div>

                {/* Behavior */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[partnerArchetype.behaviorAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Behavior-Wise: <span className="text-pink-500">{animalLibrary[partnerArchetype.behaviorAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[partnerArchetype.behaviorAnimal]?.behavior}
                  </p>
                </div>

                {/* With You */}
                <div className="p-3.5 rounded-2xl glass-card-subtle">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{animalLibrary[partnerArchetype.withYouAnimal]?.emoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      Around You: <span className="text-rose-500">{animalLibrary[partnerArchetype.withYouAnimal]?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {animalLibrary[partnerArchetype.withYouAnimal]?.with_you}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasSubmitted && !isEditing ? (
        /* STATE B: USER SUBMITTED, WAITING ON PARTNER (BLIND REVEAL LOCKED STATE) */
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 text-center border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-rose-500/5 to-transparent relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-500/30 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Blind Reveal Protected</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Your Selections Are Locked In! 🔒
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              {archetypeData?.isPartnered ? (
                <>
                  Waiting for <span className="font-bold text-foreground">{partnerName}</span> to pick your animal archetypes. As soon as both are submitted, the reveal button will unlock!
                </>
              ) : (
                <>
                  Link with your partner in <Link href="/dashboard" className="text-rose-500 font-bold underline">Step 1</Link> so they can do the archetype quiz for you!
                </>
              )}
            </p>

            {/* Current Selection Preview */}
            <div className="my-6 p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/20 text-xs sm:text-sm font-serif italic text-foreground max-w-lg mx-auto">
              "{mySentence}"
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="rounded-xl text-xs glass-card-interactive gap-1.5 h-10 px-4"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit My Selections</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* STATE C: QUIZ SELECTOR FORM (MIX-AND-MATCH INTERACTIVE FLOW) */
        <form onSubmit={handleSaveArchetype} className="space-y-6">
          {/* Dynamic Sentence Builder Banner */}
          <div className="glass-panel rounded-3xl p-5 sm:p-7 border-2 border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-500/15 shadow-lg relative overflow-hidden">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Live Archetype Sentence
            </span>
            <p className="text-base sm:text-xl font-bold font-serif text-foreground leading-snug">
              "{mySentence}"
            </p>
          </div>

          {/* Stepper Navigation / Category Selector Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-2xl glass-card-subtle text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('looks')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'looks'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>1. Looks-Wise</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('behavior')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'behavior'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>2. Behavior</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('with_you')}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'with_you'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>3. Around You</span>
            </button>
          </div>

          {/* Tab 1: Looks-Wise */}
          {activeTab === 'looks' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">1. Looks-Wise (Physical vibe & presence)</h3>
                  <p className="text-xs text-muted-foreground">What animal represents their facial features, posture, and visual aesthetic?</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveTab('behavior')}
                  size="sm"
                  className="rounded-xl text-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 gap-1"
                >
                  Next: Behavior <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {animalOptions.map((animal) => {
                  const isSelected = looksAnimal === animal.id;
                  return (
                    <div
                      key={animal.id}
                      onClick={() => setLooksAnimal(animal.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'glass-card border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/10 shadow-md scale-[1.02]'
                          : 'glass-card-interactive border-white/40 dark:border-white/10 hover:border-rose-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{animal.emoji}</span>
                          <span className="font-bold text-xs sm:text-sm text-foreground">{animal.name}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {animal.looks}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Behavior-Wise */}
          {activeTab === 'behavior' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">2. Behavior-Wise (Interaction with the world)</h3>
                  <p className="text-xs text-muted-foreground">How do they navigate social situations, energy levels, and daily habits?</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveTab('with_you')}
                  size="sm"
                  className="rounded-xl text-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 gap-1"
                >
                  Next: Around You <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {animalOptions.map((animal) => {
                  const isSelected = behaviorAnimal === animal.id;
                  return (
                    <div
                      key={animal.id}
                      onClick={() => setBehaviorAnimal(animal.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'glass-card border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/10 shadow-md scale-[1.02]'
                          : 'glass-card-interactive border-white/40 dark:border-white/10 hover:border-purple-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{animal.emoji}</span>
                          <span className="font-bold text-xs sm:text-sm text-foreground">{animal.name}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-purple-500 fill-purple-500/20" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {animal.behavior}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: With You */}
          {activeTab === 'with_you' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">3. With You (Love language & 1-on-1 dynamic)</h3>
                  <p className="text-xs text-muted-foreground">How do they act behind closed doors when it is just the two of you?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {animalOptions.map((animal) => {
                  const isSelected = withYouAnimal === animal.id;
                  return (
                    <div
                      key={animal.id}
                      onClick={() => setWithYouAnimal(animal.id)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'glass-card border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10 shadow-md scale-[1.02]'
                          : 'glass-card-interactive border-white/40 dark:border-white/10 hover:border-pink-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{animal.emoji}</span>
                          <span className="font-bold text-xs sm:text-sm text-foreground">{animal.name}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-pink-500 fill-pink-500/20" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {animal.with_you}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              🔒 Your answers stay hidden until both of you lock in your choices.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-11 rounded-xl text-xs glass-card-interactive"
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Saving Archetypes...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock In My Archetypes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
