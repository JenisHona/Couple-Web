'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  images?: string[];
  created_at?: string;
}

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, images: [] }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts([data.post, ...posts]);
        setTitle('');
        setContent('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <DashboardLayout title="Our Blog">
      <div className="space-y-6">
        {/* Create Post Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Write a New Post</CardTitle>
              <CardDescription>Share your thoughts and moments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <Input
                    type="text"
                    placeholder="What's on your mind?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea
                    placeholder="Share your thoughts, feelings, and memories..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full min-h-32 p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
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
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-card border-border/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No posts yet. Start your journey by writing your first post!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Write First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Card key={post._id} className="bg-card border-border/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-xl">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' • '}
                        <span>by {post.author.username}</span>
                      </CardDescription>
                    </div>
                    {post.author.username === user?.username && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap line-clamp-4">{post.content}</p>
                  {post.content.length > 200 && (
                    <p className="text-primary text-sm mt-4 cursor-pointer hover:underline">
                      Read more...
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
