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
  Images, 
  Maximize2, 
  Calendar, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface GalleryPhoto {
  id: number | string;
  user_id?: number | string;
  image_url: string;
  title: string;
  description?: string;
  category?: string;
  is_favorite: boolean;
  created_at: string;
}

const CATEGORIES = ['All', 'Romantic', 'Cozy', 'Adventures', 'Nature', 'Moments'];

export default function GalleryPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Lightbox view
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GalleryPhoto | null>(null);

  // Form / Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Romantic');
  const [description, setDescription] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Fetch gallery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPhoto(null);
    setTitle('');
    setImageUrl('');
    setCategory('Romantic');
    setDescription('');
    setIsFavorite(false);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (photo: GalleryPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setTitle(photo.title);
    setImageUrl(photo.image_url);
    setCategory(photo.category || 'Romantic');
    setDescription(photo.description || '');
    setIsFavorite(photo.is_favorite || false);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide a valid image URL');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingPhoto) {
        const res = await fetch(`/api/gallery/${editingPhoto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Our Memory',
            imageUrl: imageUrl.trim(),
            category,
            description: description.trim() || null,
            isFavorite,
          }),
        });

        if (!res.ok) throw new Error('Failed to update photo');
        const data = await res.json();
        setPhotos(photos.map((p) => (p.id === editingPhoto.id ? { ...p, ...data.photo } : p)));
        if (activeLightboxPhoto?.id === editingPhoto.id) {
          setActiveLightboxPhoto({ ...activeLightboxPhoto, ...data.photo });
        }
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Our Memory',
            imageUrl: imageUrl.trim(),
            category,
            description: description.trim() || null,
            isFavorite,
          }),
        });

        if (!res.ok) throw new Error('Failed to add photo');
        const data = await res.json();
        setPhotos([data.photo, ...photos]);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Error saving photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (photo: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFav = !photo.is_favorite;
    setPhotos(photos.map((p) => (p.id === photo.id ? { ...p, is_favorite: nextFav } : p)));

    try {
      await fetch(`/api/gallery/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextFav }),
      });
    } catch (err) {
      console.error('Toggle photo favorite error:', err);
    }
  };

  const handleDelete = async (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo from our gallery?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPhotos(photos.filter((p) => String(p.id) !== String(id)));
        if (activeLightboxPhoto && String(activeLightboxPhoto.id) === String(id)) {
          setActiveLightboxPhoto(null);
        }
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  const filteredPhotos = photos.filter((photo) => {
    if (activeCategory === 'All') return true;
    return (photo.category || 'Moments').toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <DashboardLayout
      title="Our Photo Sanctuary"
      subtitle="Visual snapshots of romance, laughs, trips, and beautiful ordinary days"
    >
      {/* Top Winston Tip & Action Bar */}
      <div className="mb-6 space-y-4">
        <WinstonGuide
          variant="card"
          title="Winston's Photo Tip 📸"
          message="Keep your visual memories alive! You can paste any direct image link or photo URL to store high-res snapshots in our shared couple gallery."
          dismissible={true}
        />

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Category Pills with horizontal scroll */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card-subtle overflow-x-auto text-xs font-semibold max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap text-xs ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add Photo Button */}
          <Button
            onClick={handleOpenCreate}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </Button>
        </div>
      </div>

      {/* Photos Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Gathering memories...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <WinstonGuide
          variant="empty"
          title="No Photos in Our Sanctuary Yet!"
          message="Every photo is a treasure of our love! Tap the button below to add your first photo of your dates, road trips, or cozy evenings."
          actionText="Upload First Photo"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActiveLightboxPhoto(photo)}
              className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group relative border-white/60 dark:border-white/10 hover:border-rose-400/50 transition-all flex flex-col justify-between"
            >
              <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />

                {/* Badges & Actions */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/40 text-white border border-white/20">
                    {photo.category || 'Moments'}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFavorite(photo, e)}
                      className={`p-1.5 sm:p-2 rounded-xl backdrop-blur-md transition-all ${
                        photo.is_favorite
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={photo.is_favorite ? 'Favorited' : 'Favorite'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${photo.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(photo, e)}
                      className="p-1.5 sm:p-2 rounded-xl backdrop-blur-md bg-black/40 text-white hover:bg-black/60 transition-all"
                      title="Edit photo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(photo.id, e)}
                      className="p-1.5 sm:p-2 rounded-xl backdrop-blur-md bg-black/40 text-white hover:bg-rose-600 transition-all"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Content Preview */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <h4 className="font-bold text-sm sm:text-base truncate drop-shadow-sm">{photo.title}</h4>
                  {photo.description && (
                    <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 mt-0.5 drop-shadow-sm">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground border-t border-white/30 dark:border-white/10">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(photo.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <span className="font-semibold text-rose-500 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" /> Expand
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {activeLightboxPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setActiveLightboxPhoto(null)}
        >
          <div 
            className="max-w-4xl w-full relative flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLightboxPhoto(null)}
              className="absolute -top-10 sm:-top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Container */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 max-h-[68vh] sm:max-h-[75vh] w-full flex items-center justify-center bg-black/40 shadow-2xl">
              <img
                src={activeLightboxPhoto.image_url}
                alt={activeLightboxPhoto.title}
                className="max-h-[68vh] sm:max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Photo Info Card */}
            <div className="w-full mt-3 sm:mt-4 p-4 sm:p-5 rounded-2xl glass-panel text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    {activeLightboxPhoto.category || 'Moments'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                    {activeLightboxPhoto.title}
                  </h3>
                </div>
                {activeLightboxPhoto.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeLightboxPhoto.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={(e) => handleOpenEdit(activeLightboxPhoto, e)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs glass-card-interactive gap-1.5 h-8 px-3"
                >
                  <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Edit</span>
                </Button>
                <a
                  href={activeLightboxPhoto.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl glass-card-interactive text-xs font-semibold flex items-center gap-1.5 text-foreground hover:text-rose-500 h-8"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingPhoto ? 'Edit Photo Details' : 'Add New Photo'}
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
                <label className="text-xs font-semibold text-foreground">Image URL *</label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/... or hosted link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                  required
                />
              </div>

              {imageUrl && (
                <div className="rounded-xl overflow-hidden h-32 sm:h-36 w-full border border-white/30 dark:border-white/10 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Title</label>
                  <Input
                    type="text"
                    placeholder="e.g. Sunset in Malibu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-input h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input h-10 px-3 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="Romantic">Romantic</option>
                    <option value="Cozy">Cozy</option>
                    <option value="Adventures">Adventures</option>
                    <option value="Nature">Nature</option>
                    <option value="Moments">Moments</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description / Caption</label>
                <textarea
                  rows={3}
                  placeholder="Where was this taken? Why was it special?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input p-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="photoFavToggle"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
                />
                <label htmlFor="photoFavToggle" className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Mark as favorite photo
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
                  {isSubmitting ? 'Saving...' : editingPhoto ? 'Save Changes' : 'Add to Gallery'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
