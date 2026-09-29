'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Compass, 
  Calendar, 
  Trophy,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface BucketListItem {
  id: number | string;
  user_id?: number | string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  target_date?: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Dreams' },
  { value: 'travel', label: 'Travel' },
  { value: 'adventure', label: 'Adventures' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'other', label: 'Other' },
];

export default function BucketListPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('travel');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/bucket-list');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Fetch bucket list error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('travel');
    setPriority('medium');
    setTargetDate('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setCategory(item.category || 'travel');
    setPriority(item.priority || 'medium');
    setTargetDate(item.target_date ? item.target_date.split('T')[0] : '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingItem) {
        const res = await fetch(`/api/bucket-list/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
            targetDate: targetDate || null,
          }),
        });

        if (!res.ok) throw new Error('Failed to update bucket list item');
        const data = await res.json();
        setItems(items.map((i) => (i.id === editingItem.id ? { ...i, ...data.item } : i)));
      } else {
        const res = await fetch('/api/bucket-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
            targetDate: targetDate || null,
          }),
        });

        if (!res.ok) throw new Error('Failed to create bucket list item');
        const data = await res.json();
        setItems([data.item, ...items]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Error saving goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (item: BucketListItem) => {
    const nextCompleted = !item.completed;
    setItems(items.map((i) => (i.id === item.id ? { ...i, completed: nextCompleted } : i)));

    try {
      await fetch(`/api/bucket-list/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });
    } catch (err) {
      console.error('Toggle bucket item error:', err);
      setItems(items.map((i) => (i.id === item.id ? { ...i, completed: item.completed } : i)));
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Delete this bucket list dream?')) return;

    try {
      const res = await fetch(`/api/bucket-list/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems(items.filter((i) => String(i.id) !== String(id)));
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'completed' && !item.completed) return false;
    if (statusFilter === 'pending' && item.completed) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priorityStyles = {
    low: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
    medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  };

  return (
    <DashboardLayout
      title="Our Couple Bucket List"
      subtitle="Dreams, adventures, and magical milestones we will accomplish side by side"
    >
      {/* Winston Guide Tip */}
      <div className="mb-6">
        <WinstonGuide
          variant="card"
          title="Winston's Adventure Guide 🐾"
          message="Life is short, love is grand! Add dream travel spots, weekend road trips, cozy recipes, or quirky couple goals to accomplish together."
          dismissible={true}
        />
      </div>

      {/* Progress Metric Glass Header */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
              <Trophy className="w-4 h-4" />
              <span>Dream Progress</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
              {completedCount} of {totalCount} Dreams Accomplished
            </h3>
            <p className="text-xs text-muted-foreground">
              {progressPercent === 100 
                ? 'Incredible! You have completed every dream on your list! Add more adventures.' 
                : 'Every checked box is a new memory woven into our story.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-3 sm:p-4 rounded-2xl glass-card flex items-center gap-3 w-full sm:w-auto justify-center">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-rose-500 font-mono">
                  {progressPercent}%
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Completed
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenCreate}
              className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dream</span>
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 sm:h-3 bg-white/40 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 mt-4 sm:mt-6">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex items-center p-1 rounded-2xl glass-card-subtle gap-1 text-xs font-semibold overflow-x-auto">
          {(['all', 'pending', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 sm:py-2 rounded-xl transition-all capitalize text-xs ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'All Goals' : s}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.value
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-bold'
                  : 'glass-card-interactive text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Fetching bucket list...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <WinstonGuide
          variant="empty"
          title="No Goals Found!"
          message={statusFilter !== 'all' || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first couple dream, trip aspiration, or fun date idea!'}
          actionText="Add a Dream"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-card flex items-start gap-3 sm:gap-4 transition-all duration-300 group border-white/60 dark:border-white/10 ${
                item.completed ? 'opacity-70 bg-white/40 dark:bg-slate-900/40' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(item)}
                className="mt-0.5 text-muted-foreground hover:text-rose-500 transition-transform active:scale-90 flex-shrink-0"
                title={item.completed ? 'Mark as incomplete' : 'Mark as completed'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500/20" />
                ) : (
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 hover:text-rose-400 transition-colors" />
                )}
              </button>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`font-bold text-sm sm:text-base text-foreground transition-all ${
                      item.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Edit Dream"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-600 transition-colors"
                      title="Delete Dream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {item.category}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      priorityStyles[item.priority] || priorityStyles.medium
                    }`}
                  >
                    {item.priority}
                  </span>

                  {item.target_date && (
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.target_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingItem ? 'Edit Dream Goal' : 'Add to Our Bucket List'}
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
                <label className="text-xs font-semibold text-foreground">What is our dream? *</label>
                <Input
                  type="text"
                  placeholder="e.g. Watch sunrise in Cappadocia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Details & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add details, steps, or why this dream is special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input h-10 px-3 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="travel">Travel</option>
                    <option value="adventure">Adventures</option>
                    <option value="food">Food & Dining</option>
                    <option value="experiences">Experiences</option>
                    <option value="gifts">Gifts</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full glass-input h-10 px-3 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority ⭐</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Target Date (Optional)</label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                />
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Bucket List'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
