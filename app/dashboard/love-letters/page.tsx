'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LoveLetter {
  id: string;
  from: string;
  content: string;
  date: string;
  isRead: boolean;
}

export default function LoveLettersPage() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LoveLetter[]>([
    {
      id: '1',
      from: 'partner',
      content: 'You make every day feel like a fairytale. Thank you for being my everything.',
      date: '2024-03-01',
      isRead: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newLetter: LoveLetter = {
        id: Date.now().toString(),
        from: user?.username || 'me',
        content,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
      };

      setLetters([newLetter, ...letters]);
      setContent('');
      setShowForm(false);
      setIsSubmitting(false);
    }, 300);
  };

  const markAsRead = (id: string) => {
    setLetters(
      letters.map((l) => (l.id === id ? { ...l, isRead: true } : l))
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this letter?')) return;
    setLetters(letters.filter((l) => l.id !== id));
    setSelectedLetter(null);
  };

  const unreadCount = letters.filter((l) => !l.isRead).length;

  return (
    <DashboardLayout title="Love Letters">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letters List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              Messages
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h2>
            <Button
              onClick={() => setShowForm(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Write Letter
            </Button>
          </div>

          {/* Write Form */}
          {showForm && (
            <Card className="bg-card border-border/50 border-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Write a Love Letter
                </CardTitle>
                <CardDescription>Express your feelings in a private message</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Message</label>
                    <textarea
                      placeholder="Pour your heart out here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full min-h-40 p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                      disabled={isSubmitting || !content.trim()}
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Mail className="w-4 h-4" />
                      {isSubmitting ? 'Sending...' : 'Send Love Letter'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Letters */}
          {letters.length === 0 ? (
            <Card className="bg-card border-border/50 text-center py-12">
              <CardContent>
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No letters yet. Start expressing your love!</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Write First Letter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {letters.map((letter) => (
                <Card
                  key={letter.id}
                  onClick={() => {
                    setSelectedLetter(letter);
                    markAsRead(letter.id);
                  }}
                  className={`bg-card border-border/50 cursor-pointer hover:shadow-lg transition-all ${
                    !letter.isRead ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!letter.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                          )}
                          <p className="font-semibold text-foreground text-sm">From: {letter.from}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(letter.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-foreground text-sm mt-3 line-clamp-2">{letter.content}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(letter.id);
                        }}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Letter Viewer */}
        <div className="lg:col-span-1">
          {selectedLetter ? (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 sticky top-20 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {selectedLetter.from}'s Letter
                </CardTitle>
                <CardDescription>
                  {new Date(selectedLetter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border/50 text-center py-12 sticky top-20">
              <CardContent>
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a letter to read it here. This space is private and just for you both.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
