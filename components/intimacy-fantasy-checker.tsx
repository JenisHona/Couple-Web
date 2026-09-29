'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  Check, 
  HelpCircle, 
  X, 
  Flame, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  Star,
  Award,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/lib/realtime-context';
import { fantasyCatalog, fantasyCategories, FantasyItem } from '@/lib/fantasy-catalog';

interface FantasyCheckerProps {
  partnerUsername?: string | null;
}

export function IntimacyFantasyChecker({ partnerUsername = 'Partner' }: FantasyCheckerProps) {
  const { publish, subscribe } = useRealtime();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'matches'>('catalog');
  const [myVotes, setMyVotes] = useState<Record<string, 'yes' | 'maybe' | 'no'>>({});
  const [matches, setMatches] = useState<Array<{ fantasyId: string; matchType: 'double_yes' | 'mutual_interest'; item: FantasyItem }>>([]);
  const [partnerVotedCount, setPartnerVotedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchFantasiesData = async () => {
    try {
      const res = await fetch('/api/intimacy/fantasies');
      if (res.ok) {
        const json = await res.json();
        setMyVotes(json.myVotes || {});
        setMatches(json.matches || []);
        setPartnerVotedCount(json.partnerVotedCount || 0);
      }
    } catch (err) {
      console.error('Error fetching fantasies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFantasiesData();

    // Listen to realtime fantasy updates from partner
    const unsub = subscribe('INTIMACY_FANTASY_VOTE', () => {
      fetchFantasiesData();
    });

    return () => unsub();
  }, [subscribe]);

  const handleVote = async (fantasyId: string, vote: 'yes' | 'maybe' | 'no') => {
    // Optimistic UI update
    setMyVotes((prev) => ({ ...prev, [fantasyId]: vote }));
    setSavingId(fantasyId);

    try {
      const res = await fetch('/api/intimacy/fantasies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fantasyId, vote }),
      });
      if (res.ok) {
        await fetchFantasiesData();
        publish('INTIMACY_FANTASY_VOTE', { fantasyId, vote });
      }
    } catch (err) {
      console.error('Error saving fantasy vote:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleResetVotes = async () => {
    if (!window.confirm('Are you sure you want to reset all your fantasy choices?')) return;
    try {
      const res = await fetch('/api/intimacy/fantasies', { method: 'DELETE' });
      if (res.ok) {
        setMyVotes({});
        setMatches([]);
        await fetchFantasiesData();
        publish('INTIMACY_FANTASY_VOTE', { reset: true });
      }
    } catch (err) {
      console.error('Error resetting votes:', err);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? fantasyCatalog
    : fantasyCatalog.filter((item) => item.category === selectedCategory);

  const totalAnswered = Object.keys(myVotes).length;
  const progressPercent = Math.round((totalAnswered / fantasyCatalog.length) * 100);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
        <p className="text-xs text-muted-foreground">Loading private fantasy catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Mutual Matches & Zero-Embarrassment Guarantee */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Asynchronous Match Engine
                </span>
                <span className="text-xs font-bold text-foreground">
                  {matches.length} Mutual Sparks Discovered
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                Private Couple Fantasy & Kink Checker
              </h3>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl glass-card-subtle self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Catalog ({totalAnswered}/{fantasyCatalog.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Matches ({matches.length})</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Secrecy Note */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Your completion: <strong className="text-foreground">{totalAnswered}</strong> of {fantasyCatalog.length}</span>
            <span>@{partnerUsername} has answered: <strong className="text-foreground">{partnerVotedCount}</strong></span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span><strong>Zero Embarrassment Guarantee:</strong> If you say Yes to an idea and your partner says No, your vote is never revealed. Only mutual agreements (Yes/Yes or Yes/Maybe) are shown!</span>
        </div>

      </div>

      {/* VIEW 1: MATCHES REVEAL TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {matches.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-foreground text-lg">No Mutual Matches Yet</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Go down the catalog and answer with 💚 Yes or 💛 Maybe. When @{partnerUsername} answers the same items, your mutual sparks will immediately reveal here!
              </p>
              <Button
                onClick={() => setActiveTab('catalog')}
                size="sm"
                className="rounded-xl text-xs bg-rose-500 text-white mt-2"
              >
                Go to Fantasy Catalog
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-foreground text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Your Mutual Sparks & Desires ({matches.length})
                </h4>
                <span className="text-xs text-muted-foreground">
                  Unlocked for you and @{partnerUsername}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(({ fantasyId, matchType, item }) => (
                  <div
                    key={fantasyId}
                    className="glass-card rounded-2xl p-5 border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-pink-500/5 to-purple-500/15 shadow-lg space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              matchType === 'double_yes'
                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                : 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                            }`}>
                              {matchType === 'double_yes' ? '✨ 100% Double Yes Match' : '💛 Mutual Interest Match'}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              {item.tag}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-foreground text-base mt-1">
                            {item.title}
                          </h5>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/80 leading-relaxed bg-white/40 dark:bg-slate-900/40 p-3 rounded-xl">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {item.intensity}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for tonight
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CATALOG VOTING TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
            {fantasyCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                    : 'glass-card-subtle hover:bg-rose-500/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const currentVote = myVotes[item.id];
              const isMatched = matches.some((m) => m.fantasyId === item.id);

              return (
                <div
                  key={item.id}
                  className={`glass-card rounded-2xl p-5 border transition-all space-y-3.5 relative ${
                    isMatched
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                      : currentVote
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-white/20 dark:border-white/10 hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                            {item.tag}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {item.intensity}
                          </span>
                          {isMatched && (
                            <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Matched!
                            </span>
                          )}
                        </div>
                        <h5 className="font-extrabold text-foreground text-sm sm:text-base mt-1">
                          {item.title}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* 3 Voting Buttons */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground shrink-0">Your vote:</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(item.id, 'yes')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          currentVote === 'yes'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                            : 'glass-card-interactive text-muted-foreground hover:text-emerald-500 hover:border-emerald-500/30'
                        }`}
                        title="Yes, I want to try this!"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Yes</span>
                      </button>

                      <button
                        onClick={() => handleVote(item.id, 'maybe')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          currentVote === 'maybe'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                            : 'glass-card-interactive text-muted-foreground hover:text-amber-500 hover:border-amber-500/30'
                        }`}
                        title="Maybe / Curious to explore"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => handleVote(item.id, 'no')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          currentVote === 'no'
                            ? 'bg-slate-500 text-white shadow-sm scale-105'
                            : 'glass-card-interactive text-muted-foreground hover:text-red-500 hover:border-red-500/30'
                        }`}
                        title="No (Hidden from partner)"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>No</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Reset Action */}
          {totalAnswered > 0 && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleResetVotes}
                className="text-xs text-muted-foreground hover:text-rose-500 flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all my fantasy answers</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
