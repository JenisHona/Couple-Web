'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  BookOpen, 
  Image as ImageIcon, 
  Search, 
  X, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface BlogPost {
  id: number | string;
  title: string;
  content: string;
  images?: string[];
  author?: string;
  user_id?: number | string;
  created_at: string;
  updated_at?: string;
}

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Expanded post view
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.images && post.images.length > 0 ? post.images[0] : '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const images = imageUrl.trim() ? [imageUrl.trim()] : [];
      
      if (editingPost) {
        const response = await fetch(`/api/blog/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, images }),
        });

        if (!response.ok) {
          throw new Error('Failed to update post');
        }

        const data = await response.json();
        setPosts(posts.map((p) => (p.id === editingPost.id ? { ...p, ...data.post } : p)));
      } else {
        const response = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, images }),
        });

        if (!response.ok) {
          throw new Error('Failed to create post');
        }

        const data = await response.json();
        setPosts([data.post, ...posts]);
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => String(p.id) !== String(postId)));
        if (selectedPost && String(selectedPost.id) === String(postId)) {
          setSelectedPost(null);
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter((post) => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Our Couple Journal" 
      subtitle="Documenting our shared adventures, heartfelt moments, and love notes"
    >
      {/* Winston Guide Tip */}
      <div className="mb-6 space-y-4">
        <WinstonGuide
          variant="card"
          title="Winston's Journal Guide 📖"
          message="Every memory tells a tale! Write down your shared road trips, cooking experiments, funny inside jokes, and heartfelt confessions."
          dismissible={true}
        />

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search our memories & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 h-10 sm:h-11 text-xs sm:text-sm rounded-xl sm:rounded-2xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Create Post Button */}
          <Button
            onClick={handleOpenCreate}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write Story</span>
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading stories...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <WinstonGuide
          variant="empty"
          title={searchQuery ? 'No Stories Match Your Search' : 'No Stories Written Yet!'}
          message={searchQuery ? 'Try searching for another keyword or phrase.' : 'Every love story is beautiful, but ours is our favorite. Tap below to write your first chapter!'}
          actionText="Write First Story"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredPosts.map((post) => {
            const hasImage = post.images && post.images.length > 0 && post.images[0];
            return (
              <div 
                key={post.id} 
                className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between group border-white/60 dark:border-white/10 hover:border-rose-400/40 transition-all"
              >
                <div>
                  {/* Cover Photo */}
                  {hasImage && (
                    <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={post.images![0]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  )}

                  {/* Header & Meta */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-[10px] uppercase">
                          {post.author || 'Couple'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Edit & Delete Controls */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Edit story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-600 transition-colors"
                          title="Delete story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-rose-500 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-foreground/80 mt-2 sm:mt-3 whitespace-pre-wrap line-clamp-3 sm:line-clamp-4 leading-relaxed font-sans">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Footer read full button */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 border-t border-white/30 dark:border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
                  >
                    Read Full Story &rarr;
                  </button>
                  <span className="text-[10px] text-muted-foreground">
                    {Math.ceil(post.content.length / 400)} min read
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write / Edit Glass Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-xl w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingPost ? 'Edit Journal Entry' : 'Write New Journal Entry'}
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
                <label className="text-xs font-semibold text-foreground">Story Title *</label>
                <Input
                  type="text"
                  placeholder="Give this memory a special title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input h-10 text-xs sm:text-sm rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-500" /> Cover Photo URL (Optional)
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
                <label className="text-xs font-semibold text-foreground">Our Story Content *</label>
                <textarea
                  rows={7}
                  placeholder="Describe this special day, feelings, inside jokes, and cherished moments..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full glass-input p-3 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-sans leading-relaxed"
                  required
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
                  {isSubmitting ? 'Saving...' : editingPost ? 'Update Entry' : 'Publish to Journal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Full Story Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-8 max-w-2xl w-full relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[11px] uppercase">
                Story by {selectedPost.author || 'Us'}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-xl glass-card-interactive text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPost.images && selectedPost.images.length > 0 && selectedPost.images[0] && (
              <div className="rounded-2xl overflow-hidden mb-4 sm:mb-6 h-48 sm:h-64 w-full">
                <img
                  src={selectedPost.images[0]}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground mb-1.5">
              {selectedPost.title}
            </h2>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4 sm:mb-6">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(selectedPost.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="prose dark:prose-invert max-w-none text-foreground/90 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {selectedPost.content}
            </div>

            <div className="mt-6 pt-3 border-t border-white/30 dark:border-white/10 flex justify-end">
              <Button
                onClick={() => setSelectedPost(null)}
                className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold h-9"
              >
                Close Story
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
