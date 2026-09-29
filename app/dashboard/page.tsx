'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Images, 
  CheckSquare, 
  Mail, 
  Calendar, 
  Sparkles, 
  Heart, 
  Edit3, 
  ArrowUpRight,
  Award,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface DashboardStats {
  posts: number;
  letters: number;
  bucketTotal: number;
  bucketCompleted: number;
  memories: number;
  photos: number;
  upcomingEvents: Array<{ id: number; title: string; date: string; type: string }>;
  profile: {
    partner1_name: string;
    partner2_name: string;
    relationship_start: string;
    story: string;
  } | null;
}

import { PartnerConnectCard } from '@/components/partner-connect-card';
import { MoodEnergyWidget } from '@/components/mood-energy-widget';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Profile edit form state
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [story, setStory] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        if (data.stats?.profile) {
          setPartner1(data.stats.profile.partner1_name || '');
          setPartner2(data.stats.profile.partner2_name || '');
          if (data.stats.profile.relationship_start) {
            setStartDate(data.stats.profile.relationship_start.split('T')[0]);
          }
          setStory(data.stats.profile.story || '');
        } else {
          setPartner1('');
          setPartner2('');
          setStartDate('');
          setStory('');
        }
      }
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysTogether = (startStr?: string) => {
    if (!startStr) return 0;
    const start = new Date(startStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1Name: partner1,
          partner2Name: partner2,
          relationshipStart: startDate,
          story: story,
        }),
      });
      if (res.ok) {
        setShowProfileModal(false);
        fetchStats();
      }
    } catch (e) {
      console.error('Save profile error:', e);
    } finally {
      setSavingProfile(false);
    }
  };

  const daysTogether = calculateDaysTogether(stats?.profile?.relationship_start || startDate);

  const features = [
    {
      label: 'Your Partner Space',
      icon: Heart,
      count: 'Activities & Games',
      countLabel: 'Animal Archetypes & More',
      description: 'Define your partner with Animal Archetypes & couple activities',
      href: '/dashboard/partner',
      gradient: 'from-amber-500 via-rose-500 to-pink-500',
      shadowColor: 'shadow-rose-500/25',
    },
    {
      label: 'Our Blog',
      icon: BookOpen,
      count: stats?.posts ?? 0,
      countLabel: 'Stories Written',
      description: 'Cherished memories and thoughts in full detail',
      href: '/dashboard/blog',
      gradient: 'from-rose-500 to-pink-500',
      shadowColor: 'shadow-rose-500/20',
    },
    {
      label: 'Photo Gallery',
      icon: Images,
      count: stats?.photos ?? 0,
      countLabel: 'Moments Captured',
      description: 'Our favorite snapshots & visual treasures',
      href: '/dashboard/gallery',
      gradient: 'from-pink-500 to-fuchsia-500',
      shadowColor: 'shadow-pink-500/20',
    },
    {
      label: 'Bucket List',
      icon: CheckSquare,
      count: `${stats?.bucketCompleted ?? 0}/${stats?.bucketTotal ?? 0}`,
      countLabel: 'Dreams Achieved',
      description: 'Adventures and milestones to conquer together',
      href: '/dashboard/bucket-list',
      gradient: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      label: 'Love Letters',
      icon: Mail,
      count: stats?.letters ?? 0,
      countLabel: 'Private Letters',
      description: 'Secret heartfelt notes and declarations',
      href: '/dashboard/love-letters',
      gradient: 'from-red-500 to-rose-500',
      shadowColor: 'shadow-red-500/20',
    },
    {
      label: 'Our Timeline',
      icon: Calendar,
      count: stats?.memories ?? 0,
      countLabel: 'Key Milestones',
      description: 'Chronological timeline of unforgettable days',
      href: '/dashboard/timeline',
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
    },
    {
      label: 'Special Dates',
      icon: Heart,
      count: stats?.upcomingEvents?.length ?? 0,
      countLabel: 'Upcoming Events',
      description: 'Anniversaries, birthdays and countdowns',
      href: '/dashboard/anniversaries',
      gradient: 'from-teal-500 to-emerald-500',
      shadowColor: 'shadow-teal-500/20',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title={`Hello, ${user?.username || 'Love'} ❤️`}
        subtitle="Welcome to our private digital love sanctuary"
      >
        <div className="py-20 sm:py-24 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-rose-400/20 border-t-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
            Connecting to our live couple database...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Hello, ${user?.username || 'Love'} ❤️`}
      subtitle="Welcome to our private digital love sanctuary"
    >
      {/* Partner 1-to-1 Connection System */}
      <div className="mb-6 sm:mb-8">
        <PartnerConnectCard onPartnerChanged={fetchStats} />
      </div>

      {/* Hero Glass Banner: Days Together & Couple Story */}
      <div className="relative glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 mb-6 sm:mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-subtle text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {partner1 && partner2 ? `${partner1} & ${partner2}'s Sanctuary` : partner1 ? `${partner1}'s Couple Sanctuary` : 'Our Couple Sanctuary'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {stats?.profile?.story || 'Welcome to your private shared sanctuary. Tap the pencil to customize your love story.'}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {startDate ? (
                <>
                  Connected since{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </>
              ) : (
                'Set your relationship start date to begin counting your days together'
              )}
            </p>
          </div>

          {/* Days Together Metric & Edit Button */}
          <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none p-3.5 sm:p-5 rounded-2xl glass-card flex items-center gap-3 sm:gap-4 border-rose-400/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 flex-shrink-0 animate-float">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight leading-none">
                  {daysTogether}
                </p>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                  Days in Love
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowProfileModal(true)}
              variant="outline"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl glass-card-interactive flex-shrink-0"
              title="Edit Our Story"
            >
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Realtime Mood & Energy Check-In Widget (100% Free Client-Side Logic Engine) */}
      <MoodEnergyWidget 
        partnerName={user?.partner?.username || 'Partner'} 
        userName={user?.username || 'You'}
        className="mb-6 sm:mb-8"
      />

      {/* Feature Glass Cards Grid: 1 col on small mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href} className="group focus:outline-none block">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 h-full flex flex-col justify-between border-white/60 dark:border-white/10 relative overflow-hidden group-hover:border-rose-400/50">
                <div>
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center text-white shadow-md ${feature.shadowColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="p-2 rounded-xl glass-card-interactive text-muted-foreground group-hover:text-rose-500 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-rose-500 transition-colors">
                    {feature.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/30 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    {feature.countLabel}
                  </span>
                  <span className="font-bold text-sm text-foreground group-hover:text-rose-500 font-mono">
                    {feature.count}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Insights Section: Upcoming Events & Quick Love Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mt-6 sm:mt-8">
        {/* Upcoming Special Dates Card */}
        <div className="lg:col-span-2 glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Upcoming Celebrations</h3>
            </div>
            <Link href="/dashboard/anniversaries">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-rose-500 hover:bg-rose-500/10 h-8 px-2.5">
                View All
              </Button>
            </Link>
          </div>

          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3.5 sm:p-4 rounded-2xl glass-card-subtle flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{evt.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(evt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 flex-shrink-0">
                    {evt.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No upcoming dates scheduled yet.{' '}
              <Link href="/dashboard/anniversaries" className="text-rose-500 font-semibold hover:underline">
                Add an anniversary
              </Link>
            </div>
          )}
        </div>

        {/* Bucket List Quick Progress */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Bucket List Journey</h3>
            </div>

            <div className="space-y-3 mt-3 sm:mt-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Dreams Completed</span>
                <span className="text-foreground">
                  {stats?.bucketTotal ? Math.round(((stats?.bucketCompleted || 0) / stats.bucketTotal) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 sm:h-3 bg-white/40 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.bucketTotal ? Math.round(((stats?.bucketCompleted || 0) / stats.bucketTotal) * 100) : 0}%`
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                You&apos;ve fulfilled <span className="font-bold text-foreground">{stats?.bucketCompleted || 0}</span> out of{' '}
                <span className="font-bold text-foreground">{stats?.bucketTotal || 0}</span> couple dreams together!
              </p>
            </div>
          </div>

          <div className="pt-4 sm:pt-5 mt-4 border-t border-white/20 dark:border-white/10">
            <Link href="/dashboard/bucket-list" className="block w-full">
              <Button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs shadow-md h-9">
                Add New Dream
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Couple Story Glass Modal with responsive padding and scroll */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Customize Our Story</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-xl glass-card-interactive text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Partner 1</label>
                  <Input
                    type="text"
                    placeholder="First partner's name"
                    value={partner1}
                    onChange={(e) => setPartner1(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Partner 2</label>
                  <Input
                    type="text"
                    placeholder="Second partner's name"
                    value={partner2}
                    onChange={(e) => setPartner2(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Relationship Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Our Motto or Story Snippet</label>
                <textarea
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="e.g. In every universe, I will always choose you..."
                  className="w-full glass-input p-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-xl text-xs glass-card-interactive h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-md h-9 px-4"
                >
                  {savingProfile ? 'Saving...' : 'Save Story'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
