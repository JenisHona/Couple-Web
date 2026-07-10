'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Calendar, Gift, Bell, Heart } from 'lucide-react';

interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: 'anniversary' | 'birthday' | 'special';
  description: string;
  reminder: boolean;
  daysUntil?: number;
}

const ANNIVERSARY_TYPES = [
  { value: 'anniversary', label: 'Anniversary', icon: Heart, color: 'text-red-500' },
  { value: 'birthday', label: 'Birthday', icon: Gift, color: 'text-purple-500' },
  { value: 'special', label: 'Special Date', icon: Calendar, color: 'text-amber-500' },
];

export default function AnniversariesPage() {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([
    {
      id: '1',
      title: 'Our 1st Anniversary',
      date: '2024-06-15',
      type: 'anniversary',
      description: 'One year of beautiful memories together',
      reminder: true,
    },
    {
      id: '2',
      title: 'Your Birthday',
      date: '2024-08-22',
      type: 'birthday',
      description: 'Celebrate your special day',
      reminder: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'anniversary' | 'birthday' | 'special'>('anniversary');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState(true);

  const calculateDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    let eventDate = new Date(year, month - 1, day);

    // If the date has already passed this year, move to next year
    if (eventDate < today) {
      eventDate.setFullYear(eventDate.getFullYear() + 1);
    }

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingAnniversaries = useMemo(() => {
    return anniversaries
      .map((a) => ({
        ...a,
        daysUntil: calculateDaysUntil(a.date),
      }))
      .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0));
  }, [anniversaries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const newAnniversary: Anniversary = {
      id: Date.now().toString(),
      title,
      date,
      type,
      description,
      reminder,
    };

    setAnniversaries([newAnniversary, ...anniversaries]);
    setTitle('');
    setDate('');
    setType('anniversary');
    setDescription('');
    setReminder(true);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setAnniversaries(anniversaries.filter((a) => a.id !== id));
  };

  const toggleReminder = (id: string) => {
    setAnniversaries(
      anniversaries.map((a) =>
        a.id === id ? { ...a, reminder: !a.reminder } : a
      )
    );
  };

  return (
    <DashboardLayout title="Special Dates & Anniversaries">
      <div className="space-y-6">
        {/* Add Anniversary Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Important Date
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="bg-card border-border/50 border-2 border-primary/50">
            <CardHeader>
              <CardTitle>Add an Important Date</CardTitle>
              <CardDescription>Never miss a special moment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                    <Input
                      type="text"
                      placeholder="What are we celebrating?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {ANNIVERSARY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    placeholder="Add any details or notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-24 p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="reminder" className="text-sm text-foreground cursor-pointer">
                    Remind me about this date
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim() || !date.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save Date
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
          {upcomingAnniversaries.length === 0 ? (
            <Card className="bg-card border-border/50 text-center py-12">
              <CardContent>
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming dates. Add your special moments!</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add First Date
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAnniversaries.map((anniversary) => {
                const typeInfo = ANNIVERSARY_TYPES.find((t) => t.value === anniversary.type);
                const TypeIcon = typeInfo?.icon || Calendar;
                const isUpcoming = anniversary.daysUntil! < 30;

                return (
                  <Card
                    key={anniversary.id}
                    className={`bg-card border-border/50 transition-all ${
                      isUpcoming ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-secondary ${typeInfo?.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-foreground">{anniversary.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(anniversary.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(anniversary.id)}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {anniversary.description && (
                        <p className="text-sm text-foreground">{anniversary.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-primary">{anniversary.daysUntil}</p>
                          <p className="text-xs text-muted-foreground">
                            day{anniversary.daysUntil !== 1 ? 's' : ''} away
                          </p>
                        </div>

                        <button
                          onClick={() => toggleReminder(anniversary.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            anniversary.reminder
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary/50 text-muted-foreground'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
