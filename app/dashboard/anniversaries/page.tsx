'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Bell, 
  Heart, 
  Sparkles, 
  X,
  Cake,
  PartyPopper
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface Anniversary {
  id: number | string;
  user_id?: number | string;
  title: string;
  date: string;
  type: 'anniversary' | 'birthday' | 'special' | 'trip';
  description?: string;
  reminder: boolean;
  daysUntil?: number;
  created_at: string;
}

const ANNIVERSARY_TYPES = [
  { value: 'anniversary', label: 'Anniversary', icon: Heart, color: 'text-rose-500 bg-rose-500/15' },
  { value: 'birthday', label: 'Birthday', icon: Cake, color: 'text-purple-500 bg-purple-500/15' },
  { value: 'special', label: 'Milestone', icon: Sparkles, color: 'text-amber-500 bg-amber-500/15' },
  { value: 'trip', label: 'Couple Trip', icon: PartyPopper, color: 'text-teal-500 bg-teal-500/15' },
];

export default function AnniversariesPage() {
  const { user } = useAuth();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Anniversary | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'anniversary' | 'birthday' | 'special' | 'trip'>('anniversary');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  const fetchAnniversaries = async () => {
    try {
      const res = await fetch('/api/anniversaries');
      if (res.ok) {
        const data = await res.json();
        setAnniversaries(data.anniversaries || []);
      }
    } catch (err) {
      console.error('Fetch anniversaries error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysUntil = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dateStr.split('T')[0].split('-').map(Number);
    if (parts.length < 3) return 0;
    const [year, month, day] = parts;
    let eventDate = new Date(today.getFullYear(), month - 1, day);

    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedEvents = useMemo(() => {
    return anniversaries
      .map((a) => ({
        ...a,
        daysUntil: calculateDaysUntil(a.date),
      }))
      .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0));
  }, [anniversaries]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setDate('');
    setType('anniversary');
    setDescription('');
    setReminder(true);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: Anniversary) => {
    setEditingItem(item);
    setTitle(item.title);
    setDate(item.date ? item.date.split('T')[0] : '');
    setType(item.type || 'anniversary');
    setDescription(item.description || '');
    setReminder(item.reminder !== undefined ? item.reminder : true);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Title and date are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingItem) {
        const res = await fetch(`/api/anniversaries/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, date, type, description, reminder }),
        });

        if (!res.ok) throw new Error('Failed to update event');
        const data = await res.json();
        setAnniversaries(anniversaries.map((a) => (a.id === editingItem.id ? { ...a, ...data.anniversary } : a)));
      } else {
        const res = await fetch('/api/anniversaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, date, type, description, reminder }),
        });

        if (!res.ok) throw new Error('Failed to add event');
        const data = await res.json();
        setAnniversaries([...anniversaries, data.anniversary]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Error saving event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReminder = async (item: Anniversary) => {
    const nextVal = !item.reminder;
    setAnniversaries(anniversaries.map((a) => (a.id === item.id ? { ...a, reminder: nextVal } : a)));

    try {
      await fetch(`/api/anniversaries/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder: nextVal }),
      });
    } catch (err) {
      console.error('Toggle reminder error:', err);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Delete this special date?')) return;

    try {
      const res = await fetch(`/api/anniversaries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAnniversaries(anniversaries.filter((a) => String(a.id) !== String(id)));
      }
    } catch (err) {
      console.error('Delete anniversary error:', err);
    }
  };

  return (
    <DashboardLayout
      title="Important Dates & Anniversaries"
      subtitle="Countdowns, milestones, birthdays, and anniversaries to celebrate together"
    >
      {/* Winston Guide Tip */}
      <div className="mb-6">
        <WinstonGuide
          variant="card"
          title="Winston's Countdown Guardian 🐾"
          message="Never forget a special day! Add your anniversaries, birthdays, and planned dates so we can countdown the days together."
          dismissible={true}
        />
      </div>

      {/* Top Action */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{anniversaries.length}</span> special dates
        </div>
        <Button
          onClick={handleOpenCreate}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Date</span>
        </Button>
      </div>

      {/* Events Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Loading calendar dates...</p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <WinstonGuide
          variant="empty"
          title="No Special Dates Added Yet!"
          message="Add your anniversary, birthdays, or upcoming romantic trips so Winston can keep track of them!"
          actionText="Add Important Date"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sortedEvents.map((event) => {
            const typeInfo = ANNIVERSARY_TYPES.find((t) => t.value === event.type) || ANNIVERSARY_TYPES[0];
            const Icon = typeInfo.icon;
            const isSoon = (event.daysUntil ?? 999) <= 30;

            return (
              <div
                key={event.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl glass-card flex flex-col justify-between transition-all duration-300 group border-white/60 dark:border-white/10 ${
                  isSoon ? 'border-rose-400/50 bg-rose-500/5' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-2.5 rounded-2xl ${typeInfo.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleReminder(event)}
                        className={`p-1.5 rounded-lg glass-card-interactive transition-colors ${
                          event.reminder ? 'text-rose-500 font-bold' : 'text-muted-foreground'
                        }`}
                        title={event.reminder ? 'Reminder enabled' : 'Reminder off'}
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Edit Date"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-600 transition-colors"
                        title="Delete Date"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-base sm:text-lg text-foreground group-hover:text-rose-500 transition-colors">
                    {event.title}
                  </h4>

                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  {event.description && (
                    <p className="text-xs text-foreground/80 mt-2 sm:mt-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Countdown pill */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/30 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-rose-500 font-mono">
                      {event.daysUntil === 0 ? 'Today! 🎉' : event.daysUntil}
                    </span>
                    {event.daysUntil !== 0 && (
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground ml-1.5">
                        days away
                      </span>
                    )}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/40 dark:bg-slate-800 text-muted-foreground">
                    {typeInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingItem ? 'Edit Special Date' : 'Add Important Date'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl glass-card-interactive text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Event Title *</label>
                <Input
                  type="text"
                  placeholder="e.g. Our 3rd Anniversary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Date *</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Celebration Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full glass-input h-10 px-3 text-xs rounded-xl focus:outline-none"
                  >
                    {ANNIVERSARY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Notes & Plans</label>
                <textarea
                  rows={3}
                  placeholder="Gift ideas, dinner reservations, or special plans..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reminderToggle"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
                />
                <label htmlFor="reminderToggle" className="text-xs font-medium text-foreground cursor-pointer">
                  Enable countdown reminder badge
                </label>
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl text-xs glass-card-interactive h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-md px-4 h-9"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Date'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
