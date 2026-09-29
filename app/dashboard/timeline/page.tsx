'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Heart, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface Memory {
  id: number | string;
  user_id?: number | string;
  title: string;
  description?: string;
  image_url?: string;
  location?: string;
  memory_date: string;
  is_favorite: boolean;
  created_at: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Form / Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.error('Fetch memories error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMemory(null);
    setTitle('');
    setDescription('');
    setMemoryDate('');
    setLocation('');
    setImageUrl('');
    setIsFavorite(false);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description || '');
    setMemoryDate(memory.memory_date ? memory.memory_date.split('T')[0] : '');
    setLocation(memory.location || '');
    setImageUrl(memory.image_url || '');
    setIsFavorite(memory.is_favorite || false);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !memoryDate) {
      setError('Title and date are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingMemory) {
        const res = await fetch(`/api/memories/${editingMemory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            imageUrl: imageUrl.trim() || null,
            location: location.trim() || null,
            memoryDate,
            isFavorite,
          }),
        });

        if (!res.ok) throw new Error('Failed to update memory');
        const data = await res.json();
        setMemories(memories.map((m) => (m.id === editingMemory.id ? { ...m, ...data.memory } : m)));
      } else {
        const res = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            imageUrl: imageUrl.trim() || null,
            location: location.trim() || null,
            memoryDate,
            isFavorite,
          }),
        });

        if (!res.ok) throw new Error('Failed to add memory');
        const data = await res.json();
        setMemories([data.memory, ...memories]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Error saving memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (memory: Memory) => {
    const nextFav = !memory.is_favorite;
    setMemories(memories.map((m) => (m.id === memory.id ? { ...m, is_favorite: nextFav } : m)));

    try {
      await fetch(`/api/memories/${memory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Delete this precious memory?')) return;

    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMemories(memories.filter((m) => String(m.id) !== String(id)));
      }
    } catch (err) {
      console.error('Delete memory error:', err);
    }
  };

  const displayMemories = filterFavorites
    ? memories.filter((m) => m.is_favorite)
    : memories;

  const sortedMemories = [...displayMemories].sort(
    (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
  );

  return (
    <DashboardLayout
      title="Our Love Timeline"
      subtitle="A chronological journey through all the chapters, trips, and moments of us"
    >
      {/* Winston Guide Tip */}
      <div className="mb-6">
        <WinstonGuide
          variant="card"
          title="Winston's Milestone Chronicle 🐾"
          message="Time flies when you're in love! Record special dates — like when you first met, had your first kiss, or adopted your dream pet."
          dismissible={true}
        />
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card-subtle text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setFilterFavorites(false)}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl transition-all ${
              !filterFavorites
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({memories.length})
          </button>
          <button
            onClick={() => setFilterFavorites(true)}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              filterFavorites
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Treasures ({memories.filter((m) => m.is_favorite).length})</span>
          </button>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </Button>
      </div>

      {/* Timeline Layout */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Tracing timeline...</p>
        </div>
      ) : sortedMemories.length === 0 ? (
        <WinstonGuide
          variant="empty"
          title={filterFavorites ? 'No Favorite Memories Yet!' : 'No Timeline Moments Yet!'}
          message={filterFavorites ? 'Heart some of your favorite memories to pin them as treasured moments.' : 'Record your first date, first trip, or memorable milestone together.'}
          actionText="Add First Memory"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="relative max-w-4xl mx-auto">
          {/* Glowing Vertical Timeline Bar on tablet/desktop */}
          <div className="hidden sm:block absolute left-6 md:left-8 top-4 bottom-4 w-1 bg-gradient-to-b from-rose-500 via-pink-400 to-purple-500 rounded-full shadow-sm" />

          <div className="space-y-4 sm:space-y-8 sm:pl-16 md:pl-20">
            {sortedMemories.map((memory) => {
              return (
                <div key={memory.id} className="relative group">
                  {/* Timeline Node on tablet/desktop */}
                  <div className="hidden sm:flex absolute -left-[3.75rem] md:-left-[4.75rem] top-5 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white dark:bg-slate-900 border-4 border-rose-500 shadow-md items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    {memory.is_favorite ? (
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Memory Glass Card */}
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border-white/60 dark:border-white/10 group-hover:border-rose-400/40 transition-all overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(memory.memory_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {memory.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-400" />
                              {memory.location}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-rose-500 transition-colors">
                          {memory.title}
                        </h3>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity self-end sm:self-start flex-shrink-0">
                        <button
                          onClick={() => handleToggleFavorite(memory)}
                          className={`p-1.5 sm:p-2 rounded-xl glass-card-interactive transition-colors ${
                            memory.is_favorite ? 'text-rose-500' : 'text-muted-foreground'
                          }`}
                          title={memory.is_favorite ? 'Favorited' : 'Favorite'}
                        >
                          <Heart className={`w-4 h-4 ${memory.is_favorite ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(memory)}
                          className="p-1.5 sm:p-2 rounded-xl glass-card-interactive text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Edit Memory"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(memory.id)}
                          className="p-1.5 sm:p-2 rounded-xl glass-card-interactive text-muted-foreground hover:text-rose-600 transition-colors"
                          title="Delete Memory"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photo */}
                    {memory.image_url && (
                      <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 max-h-56 sm:max-h-72 w-full bg-slate-100 dark:bg-slate-900">
                        <img
                          src={memory.image_url}
                          alt={memory.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {memory.description && (
                      <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
                        {memory.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingMemory ? 'Edit Timeline Memory' : 'Add to Our Timeline'}
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
                <label className="text-xs font-semibold text-foreground">Memory Title *</label>
                <Input
                  type="text"
                  placeholder="e.g. When We Danced in the Summer Rain"
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
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Kyoto, Japan or Coffee House"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-rose-500" /> Photo URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">The Story & Feelings</label>
                <textarea
                  rows={4}
                  placeholder="Write down what happened, how you felt, what made it unforgettable..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="favToggle"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
                />
                <label htmlFor="favToggle" className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Pin as Favorite Treasure
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
                  {isSubmitting ? 'Saving...' : editingMemory ? 'Save Changes' : 'Pin to Timeline'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
