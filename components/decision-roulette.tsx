'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WinstonGuide } from '@/components/winston-guide';
import { useRealtime } from '@/lib/realtime-context';
import { 
  Sparkles, 
  Pizza, 
  Film, 
  Compass, 
  RotateCw, 
  CheckCircle2, 
  X, 
  Plus, 
  Zap, 
  Award, 
  Heart, 
  Share2, 
  Shuffle, 
  Volume2, 
  VolumeX,
  Flame,
  Star,
  Radio,
  Wifi
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type DecisionCategory = 'food' | 'movie' | 'date';

interface CategoryConfig {
  id: DecisionCategory;
  name: string;
  emoji: string;
  icon: React.ElementType;
  placeholder1: string;
  placeholder2: string;
  themeGradient: string;
  accentColor: string;
  presets: string[];
  bannerTitle: string;
}

const CATEGORIES: Record<DecisionCategory, CategoryConfig> = {
  food: {
    id: 'food',
    name: 'Food Decider',
    emoji: '🍕',
    icon: Pizza,
    placeholder1: 'e.g., Sushi, Tacos, Thai Curry...',
    placeholder2: 'e.g., Burgers, Pasta, Ramen...',
    themeGradient: 'from-amber-500 via-orange-500 to-rose-500',
    accentColor: '#f97316',
    presets: ['Sushi 🍣', 'Tacos 🌮', 'Italian Pasta 🍝', 'Ramen 🍜', 'Smash Burgers 🍔', 'Thai Curry 🍲', 'Pizza 🍕', 'Mexican Bowls 🥗'],
    bannerTitle: 'What are we feasting on tonight?',
  },
  movie: {
    id: 'movie',
    name: 'Movie Decider',
    emoji: '🎬',
    icon: Film,
    placeholder1: 'e.g., Sci-Fi Thriller, Rom-Com...',
    placeholder2: 'e.g., Horror Night, Studio Ghibli...',
    themeGradient: 'from-purple-600 via-pink-600 to-rose-500',
    accentColor: '#ec4899',
    presets: ['Rom-Com 💕', 'Sci-Fi Mindbender 🚀', 'Horror / Thriller 👻', 'Studio Ghibli / Anime 🌸', 'Action Blockbuster 💥', 'Murder Mystery 🔍', 'Classic Nostalgia 🎞️'],
    bannerTitle: 'What film are we watching together?',
  },
  date: {
    id: 'date',
    name: 'Date Decider',
    emoji: '✨',
    icon: Compass,
    placeholder1: 'e.g., Sunset Picnic, Bookstore Hop...',
    placeholder2: 'e.g., Cook Together, Arcade Night...',
    themeGradient: 'from-rose-500 via-pink-500 to-purple-600',
    accentColor: '#f43f5e',
    presets: ['Sunset Picnic 🧺', 'Cook New Recipe 🧑‍🍳', 'Arcade & Boba 🕹️', 'Paint & Sip 🎨', 'Stargazing Drive 🌌', 'Cozy Bookstore & Coffee ☕', 'Board Game Showdown 🎲'],
    bannerTitle: 'Where is our next adventure taking us?',
  },
};

const SLICE_COLORS = [
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#d946ef', // Fuchsia
  '#f97316', // Orange
  '#14b8a6', // Teal
];

interface DecisionRouletteProps {
  partner1Name?: string;
  partner2Name?: string;
  onDecisionMade?: (winner: string, category: DecisionCategory) => void;
}

export function DecisionRoulette({
  partner1Name = 'You',
  partner2Name = 'Partner',
  onDecisionMade,
}: DecisionRouletteProps) {
  const { isConnected: isRealtimeConnected, publish, subscribe } = useRealtime();

  const [category, setCategory] = useState<DecisionCategory>('food');
  
  // Lists of choices (up to 5 each)
  const [partner1Choices, setPartner1Choices] = useState<string[]>(['Sushi', 'Thai Curry', 'Woodfire Pizza']);
  const [partner2Choices, setPartner2Choices] = useState<string[]>(['Tacos', 'Burgers', 'Thai Curry']);
  
  // Input fields
  const [p1Input, setP1Input] = useState('');
  const [p2Input, setP2Input] = useState('');

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [instantMatch, setInstantMatch] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeCategory = CATEGORIES[category];

  // Helper: check for instant match
  const checkInstantMatch = (p1List: string[], p2List: string[]): string | null => {
    const p1Map = new Map(p1List.map(item => [item.trim().toLowerCase(), item]));
    for (const item of p2List) {
      const normalized = item.trim().toLowerCase();
      if (p1Map.has(normalized)) {
        return p1Map.get(normalized) || item;
      }
    }
    return null;
  };

  // Helper: combined unique wheel options
  const getCombinedWheelOptions = useCallback((): string[] => {
    const seen = new Set<string>();
    const combined: string[] = [];
    
    [...partner1Choices, ...partner2Choices].forEach(item => {
      const norm = item.trim().toLowerCase();
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        combined.push(item.trim());
      }
    });

    return combined;
  }, [partner1Choices, partner2Choices]);

  const combinedOptions = getCombinedWheelOptions();

  // Trigger Instant Match Celebration
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'],
      });
    } catch {
      // safe fallback if canvas-confetti is not loaded
    }
  };

  // Shared Animation Runner
  const runSpinAnimation = useCallback((
    stopAngle: number,
    spinDuration: number,
    winningOption: string,
    spinCategory: DecisionCategory
  ) => {
    setIsSpinning(true);
    setInstantMatch(null);
    setWinner(null);

    const startTimestamp = performance.now();
    const initialAngle = rotationAngle % 360;

    const animateSpin = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Decelerating Cubic Ease-Out
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const currentAngle = initialAngle + stopAngle * easeOut;

      setRotationAngle(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        setWinner(winningOption);
        triggerConfetti();
        if (onDecisionMade) onDecisionMade(winningOption, spinCategory);
      }
    };

    requestAnimationFrame(animateSpin);
  }, [rotationAngle, onDecisionMade]);

  // Load Initial Shared State from Database
  useEffect(() => {
    const fetchSharedState = async () => {
      try {
        const res = await fetch('/api/roulette/state');
        if (res.ok) {
          const data = await res.json();
          if (data.category && CATEGORIES[data.category as DecisionCategory]) {
            setCategory(data.category as DecisionCategory);
          }
          if (Array.isArray(data.partner1Options) && data.partner1Options.length > 0) {
            setPartner1Choices(data.partner1Options);
          }
          if (Array.isArray(data.partner2Options) && data.partner2Options.length > 0) {
            setPartner2Choices(data.partner2Options);
          }
          if (data.lastWinner) {
            setWinner(data.lastWinner);
          }
        }
      } catch (e) {
        console.warn('Could not fetch initial roulette state:', e);
      }
    };
    fetchSharedState();
  }, []);

  // Real-time Event Subscriptions
  useEffect(() => {
    const unsubUpdate = subscribe('ROULETTE_UPDATE', (msg) => {
      if (msg.data) {
        if (msg.data.category && CATEGORIES[msg.data.category as DecisionCategory]) {
          setCategory(msg.data.category as DecisionCategory);
        }
        if (Array.isArray(msg.data.partner1Choices)) {
          setPartner1Choices(msg.data.partner1Choices);
        }
        if (Array.isArray(msg.data.partner2Choices)) {
          setPartner2Choices(msg.data.partner2Choices);
        }
      }
    });

    const unsubSpin = subscribe('ROULETTE_SPIN', (msg) => {
      if (msg.data && !isSpinning) {
        const { stopAngle, spinDuration, winner: winOption, category: cat } = msg.data;
        runSpinAnimation(stopAngle, spinDuration, winOption, cat);
      }
    });

    const unsubMatch = subscribe('ROULETTE_MATCH', (msg) => {
      if (msg.data) {
        setInstantMatch(msg.data.item);
        setWinner(msg.data.item);
        triggerConfetti();
      }
    });

    return () => {
      unsubUpdate();
      unsubSpin();
      unsubMatch();
    };
  }, [subscribe, isSpinning, runSpinAnimation]);

  // Sync state with partner
  const syncToPartner = (newCat: DecisionCategory, p1: string[], p2: string[]) => {
    publish('ROULETTE_UPDATE', {
      category: newCat,
      partner1Choices: p1,
      partner2Choices: p2,
    });
  };

  // Add Item to Partner 1
  const handleAddP1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!p1Input.trim()) return;
    if (partner1Choices.length >= 5) return;
    if (partner1Choices.some(c => c.toLowerCase() === p1Input.trim().toLowerCase())) return;

    const nextChoices = [...partner1Choices, p1Input.trim()];
    setPartner1Choices(nextChoices);
    setP1Input('');
    setWinner(null);
    syncToPartner(category, nextChoices, partner2Choices);
  };

  // Add Item to Partner 2
  const handleAddP2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!p2Input.trim()) return;
    if (partner2Choices.length >= 5) return;
    if (partner2Choices.some(c => c.toLowerCase() === p2Input.trim().toLowerCase())) return;

    const nextChoices = [...partner2Choices, p2Input.trim()];
    setPartner2Choices(nextChoices);
    setP2Input('');
    setWinner(null);
    syncToPartner(category, partner1Choices, nextChoices);
  };

  // Remove Items
  const handleRemoveP1 = (index: number) => {
    const nextChoices = partner1Choices.filter((_, i) => i !== index);
    setPartner1Choices(nextChoices);
    syncToPartner(category, nextChoices, partner2Choices);
  };

  const handleRemoveP2 = (index: number) => {
    const nextChoices = partner2Choices.filter((_, i) => i !== index);
    setPartner2Choices(nextChoices);
    syncToPartner(category, partner1Choices, nextChoices);
  };

  // Quick Preset Add
  const handleAddPreset = (preset: string, target: 'p1' | 'p2') => {
    const clean = preset.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    if (target === 'p1') {
      if (partner1Choices.length < 5 && !partner1Choices.some(c => c.toLowerCase() === clean.toLowerCase())) {
        const nextChoices = [...partner1Choices, clean];
        setPartner1Choices(nextChoices);
        setWinner(null);
        syncToPartner(category, nextChoices, partner2Choices);
      }
    } else {
      if (partner2Choices.length < 5 && !partner2Choices.some(c => c.toLowerCase() === clean.toLowerCase())) {
        const nextChoices = [...partner2Choices, clean];
        setPartner2Choices(nextChoices);
        setWinner(null);
        syncToPartner(category, partner1Choices, nextChoices);
      }
    }
  };

  // Draw the Roulette Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    if (combinedOptions.length === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add options to build your wheel! 🎲', centerX, centerY);
      return;
    }

    const numSlices = combinedOptions.length;
    const arcSize = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationAngle * Math.PI) / 180);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * arcSize;
      const endAngle = startAngle + arcSize;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
      ctx.fill();

      // Slice border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Slice text
      ctx.save();
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${numSlices > 8 ? 12 : 14}px system-ui, -apple-system, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 4;

      const text = combinedOptions[i];
      const maxChars = numSlices > 6 ? 12 : 16;
      const truncated = text.length > maxChars ? text.slice(0, maxChars - 1) + '…' : text;

      ctx.fillText(truncated, radius - 24, 5);
      ctx.restore();
    }

    // Center Hub Outer Glow
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    // Center Hub Inner Core
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  }, [combinedOptions, rotationAngle]);

  // Handle Spin Logic
  const handleSpin = () => {
    if (isSpinning) return;

    // STEP 1: Pre-spin instant overlap check!
    const match = checkInstantMatch(partner1Choices, partner2Choices);
    if (match) {
      setInstantMatch(match);
      setWinner(match);
      triggerConfetti();
      publish('ROULETTE_MATCH', { item: match, category });
      if (onDecisionMade) onDecisionMade(match, category);
      return;
    }

    // STEP 2: If no instant match, spin the wheel!
    if (combinedOptions.length === 0) return;

    // Calculate spin target (between 5 to 9 full rotations + random offset)
    const numSlices = combinedOptions.length;
    const arcDeg = 360 / numSlices;
    const fullSpins = 360 * (5 + Math.floor(Math.random() * 4));
    
    // Pick winning slice randomly
    const targetSliceIndex = Math.floor(Math.random() * numSlices);
    const winningOption = combinedOptions[targetSliceIndex];
    
    // The top needle is at 270 degrees (or 90deg top relative to canvas)
    // Formula to align slice with top pointer:
    const targetSliceCenter = (targetSliceIndex * arcDeg) + (arcDeg / 2);
    const stopAngle = fullSpins + (360 - targetSliceCenter) + 270;
    const spinDuration = 3800; // 3.8 seconds

    // Broadcast spin to partner so both screens spin simultaneously!
    publish('ROULETTE_SPIN', {
      stopAngle,
      spinDuration,
      winner: winningOption,
      category,
      targetSliceIndex,
    });

    runSpinAnimation(stopAngle, spinDuration, winningOption, category);
  };

  const handleReset = () => {
    setWinner(null);
    setInstantMatch(null);
    setRotationAngle(0);
    publish('ROULETTE_UPDATE', {
      category,
      partner1Choices,
      partner2Choices,
      winner: null,
      instantMatch: null,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      
      {/* Category Selection Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-rose-500" />
                Zero Decision Fatigue
              </span>

              {/* Real-time sync badge */}
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isRealtimeConnected 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                <span>{isRealtimeConnected ? 'Live Couple Sync 🟢' : 'Connecting Sync...'}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
              Couples Decision Roulette 🎡
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {activeCategory.bannerTitle}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-card-interactive flex-wrap">
            {(Object.keys(CATEGORIES) as DecisionCategory[]).map((catKey) => {
              const cat = CATEGORIES[catKey];
              const Icon = cat.icon;
              const isSelected = category === catKey;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setWinner(null);
                    setInstantMatch(null);
                    syncToPartner(cat.id, partner1Choices, partner2Choices);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                      : 'text-foreground/80 hover:text-rose-500 hover:bg-rose-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80 shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Add:
          </span>
          {activeCategory.presets.map((preset) => (
            <div key={preset} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleAddPreset(preset, 'p1')}
                title={`Add to ${partner1Name}`}
                className="px-2.5 py-1 rounded-lg glass-card-subtle hover:bg-rose-500/15 text-[11px] font-medium text-foreground transition-all hover:scale-105"
              >
                + {preset}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Input Form Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Partner 1 Input Column */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {partner1Name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{partner1Name}'s Picks</h3>
                  <span className="text-[10px] text-muted-foreground">Max 5 choices ({partner1Choices.length}/5)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                Partner 1
              </span>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddP1} className="flex items-center gap-2 mt-3">
              <Input
                value={p1Input}
                onChange={(e) => setP1Input(e.target.value)}
                placeholder={activeCategory.placeholder1}
                disabled={partner1Choices.length >= 5 || isSpinning}
                className="rounded-xl text-xs bg-white/50 dark:bg-slate-900/50 border-white/20 h-10"
              />
              <Button
                type="submit"
                disabled={!p1Input.trim() || partner1Choices.length >= 5 || isSpinning}
                size="sm"
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 h-10 px-3.5 font-bold text-xs shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </form>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 mt-4 min-h-[48px]">
              {partner1Choices.map((choice, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-xs shadow-sm animate-in zoom-in-95 duration-150"
                >
                  <span>{choice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPartner1Choices(partner1Choices.filter((_, i) => i !== idx));
                      setWinner(null);
                    }}
                    disabled={isSpinning}
                    className="p-0.5 rounded-md hover:bg-rose-500/20 text-rose-500 opacity-70 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {partner1Choices.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  No choices added yet. Type an option or click a preset above!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Partner 2 Input Column */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-pink-500/30 bg-gradient-to-b from-pink-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {partner2Name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{partner2Name}'s Picks</h3>
                  <span className="text-[10px] text-muted-foreground">Max 5 choices ({partner2Choices.length}/5)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-lg">
                Partner 2
              </span>
            </div>

            {/* Input Row */}
            <form onSubmit={handleAddP2} className="flex items-center gap-2 mt-3">
              <Input
                value={p2Input}
                onChange={(e) => setP2Input(e.target.value)}
                placeholder={activeCategory.placeholder2}
                disabled={partner2Choices.length >= 5 || isSpinning}
                className="rounded-xl text-xs bg-white/50 dark:bg-slate-900/50 border-white/20 h-10"
              />
              <Button
                type="submit"
                disabled={!p2Input.trim() || partner2Choices.length >= 5 || isSpinning}
                size="sm"
                className="rounded-xl bg-pink-500 text-white hover:bg-pink-600 h-10 px-3.5 font-bold text-xs shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </form>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 mt-4 min-h-[48px]">
              {partner2Choices.map((choice, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-semibold text-xs shadow-sm animate-in zoom-in-95 duration-150"
                >
                  <span>{choice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPartner2Choices(partner2Choices.filter((_, i) => i !== idx));
                      setWinner(null);
                    }}
                    disabled={isSpinning}
                    className="p-0.5 rounded-md hover:bg-pink-500/20 text-pink-500 opacity-70 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {partner2Choices.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  No choices added yet. Type an option or click a preset above!
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* INSTANT OVERLAP BANNER (If Pre-Spin Match Found) */}
      {instantMatch && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 text-center border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 shadow-xl shadow-emerald-500/15 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 mb-3">
            <Heart className="w-4 h-4 fill-white animate-ping" />
            <span>Instant Psychic Connection!</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-foreground">
            It’s a Match! You both want <span className="text-emerald-500 font-extrabold underline decoration-wavy">{instantMatch}</span>! 🎉
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            No spin needed! You and your partner are completely in sync for tonight's {activeCategory.name.toLowerCase()}.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs glass-card-interactive gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Decide Something Else</span>
            </Button>
          </div>
        </div>
      )}

      {/* ROULETTE WHEEL ARENA */}
      {!instantMatch && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Top Pointer Pin Needle */}
          <div className="relative flex flex-col items-center z-20 -mb-5">
            <div className="w-7 h-9 bg-gradient-to-b from-rose-500 to-pink-600 rounded-b-full shadow-xl flex items-center justify-center border-2 border-white transform rotate-180 animate-bounce">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          {/* Canvas Roulette Wheel */}
          <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] my-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full drop-shadow-2xl"
            />
          </div>

          {/* Action Button & Spin Controller */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || combinedOptions.length === 0}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-extrabold text-base shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'The Wheel is Deciding...' : 'Hit Roulette! 🎲'}</span>
            </Button>
          </div>

          {/* Wheel Options Count pill */}
          <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
            <span>Combined Unique Choices: <strong>{combinedOptions.length}</strong></span>
            {combinedOptions.length > 0 && <span>· Alternating Slices</span>}
          </div>

        </div>
      )}

      {/* FINAL LOCK-IN WINNER MODAL / BANNER */}
      {winner && !instantMatch && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 text-center border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-background to-purple-500/15 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-500/30 mb-3">
            <Star className="w-4 h-4 fill-white" />
            <span>The Universe Has Spoken!</span>
          </div>
          
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-rose-500">
            Tonight's Official Choice
          </h3>

          <div className="my-4 py-4 px-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-rose-500/30 max-w-md mx-auto shadow-inner">
            <span className="text-2xl sm:text-4xl font-black gradient-love-text block">
              {winner}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Winston has sealed the decision! Time to enjoy your {activeCategory.name.toLowerCase().replace(' decider', '')} date together.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs glass-card-interactive gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-rose-500" />
              <span>Spin Again</span>
            </Button>
            
            <Button
              onClick={handleReset}
              size="sm"
              className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white gap-1.5 shadow-md shadow-rose-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lock It In ❤️</span>
            </Button>
          </div>
        </div>
      )}

      {/* Mascot Guide */}
      <WinstonGuide
        title="Winston's Decision Rule 🐾"
        message="Can't agree on dinner or movies? Type your top 5 cravings or date ideas. If you both pick the exact same thing, I'll instantly match it! Otherwise, let the roulette wheel decide your fate!"
      />

    </div>
  );
}
