'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Image as ImageIcon, Heart } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  isFavorite: boolean;
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([
    {
      id: '1',
      title: 'Our first date memory',
      imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&q=80',
      date: '2024-01-15',
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Beautiful sunset together',
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&q=80',
      date: '2024-02-20',
      isFavorite: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        title,
        imageUrl,
        date: new Date().toISOString().split('T')[0],
        isFavorite: false,
      };
      setGallery([newItem, ...gallery]);
      setTitle('');
      setImageUrl('');
      setShowForm(false);
      setIsSubmitting(false);
    }, 500);
  };

  const toggleFavorite = (id: string) => {
    setGallery(
      gallery.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    setGallery(gallery.filter((item) => item.id !== id));
  };

  return (
    <DashboardLayout title="Our Photo Gallery">
      <div className="space-y-6">
        {/* Add Photo Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </Button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Add a Photo</CardTitle>
              <CardDescription>Share a special moment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <Input
                    type="text"
                    placeholder="Give this photo a title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use a URL to your image. You can upload to Imgur, Unsplash, or other image hosting services.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !imageUrl.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Photo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <Card className="bg-card border-border/50 text-center py-12">
            <CardContent>
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No photos yet. Start capturing your memories!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Upload First Photo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <Card key={item.id} className="bg-card border-border/50 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden bg-muted h-48">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-2 right-2 gap-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                        item.isFavorite
                          ? 'bg-primary/90 text-primary-foreground'
                          : 'bg-white/30 text-white hover:bg-white/50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white/30 text-white hover:bg-destructive/90 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
