'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Mail, 
  Heart, 
  CheckCheck, 
  Clock, 
  X,
  Feather,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { WinstonGuide } from '@/components/winston-guide';

interface LoveLetter {
  id: number | string;
  from_user_id: number | string;
  to_user_id?: number | string;
  sender_name?: string;
  sender?: string;
  title?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function LoveLettersPage() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active viewing letter & mobile reader drawer
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [showMobileReader, setShowMobileReader] = useState(false);

  // Write / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);
  const [senderName, setSenderName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await fetch('/api/love-letters');
      if (res.ok) {
        const data = await res.json();
        const letterList: LoveLetter[] = data.letters || [];
        setLetters(letterList);
        if (letterList.length > 0 && !selectedLetter) {
          setSelectedLetter(letterList[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWrite = () => {
    setEditingLetter(null);
    setSenderName(user?.username || '');
    setTitle('');
    setContent('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (letter: LoveLetter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLetter(letter);
    setSenderName(letter.sender_name || letter.sender || user?.username || '');
    setTitle(letter.title || '');
    setContent(letter.content);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write your heartfelt letter message');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingLetter) {
        const res = await fetch(`/api/love-letters/${editingLetter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });

        if (!res.ok) throw new Error('Failed to update love letter');
        const data = await res.json();
        setLetters(letters.map((l) => (l.id === editingLetter.id ? { ...l, ...data.letter } : l)));
        if (selectedLetter?.id === editingLetter.id) {
          setSelectedLetter({ ...selectedLetter, ...data.letter });
        }
      } else {
        const res = await fetch('/api/love-letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, senderName: senderName || user?.username }),
        });

        if (!res.ok) throw new Error('Failed to send love letter');
        const data = await res.json();
        setLetters([data.letter, ...letters]);
        setSelectedLetter(data.letter);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Error saving letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectLetter = async (letter: LoveLetter) => {
    setSelectedLetter(letter);
    setShowMobileReader(true);
    if (!letter.is_read) {
      try {
        await fetch(`/api/love-letters/${letter.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        });
        setLetters(letters.map((l) => (l.id === letter.id ? { ...l, is_read: true } : l)));
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
  };

  const handleDelete = async (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this love letter?')) return;

    try {
      const res = await fetch(`/api/love-letters/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const remaining = letters.filter((l) => String(l.id) !== String(id));
        setLetters(remaining);
        if (selectedLetter && String(selectedLetter.id) === String(id)) {
          setSelectedLetter(remaining.length > 0 ? remaining[0] : null);
          setShowMobileReader(false);
        }
      }
    } catch (err) {
      console.error('Delete letter error:', err);
    }
  };

  const unreadCount = letters.filter((l) => !l.is_read).length;

  return (
    <DashboardLayout
      title="Our Secret Love Letters"
      subtitle="Private heartfelt letters, secret declarations, and timeless love notes"
    >
      {/* Winston Guide Tip */}
      <div className="mb-6">
        <WinstonGuide
          variant="card"
          title="Winston's Secret Mail Tip 💌"
          message="Woof! Leave surprise love notes for your partner here. When they sign in, unread letters will glow until they open and read them!"
          dismissible={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left column: Letter List */}
        <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">All Letters</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] sm:text-[11px] shadow-sm animate-pulse">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <Button
              onClick={handleOpenWrite}
              className="rounded-xl h-9 px-3.5 sm:px-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Write Letter</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Unlocking letters...</p>
            </div>
          ) : letters.length === 0 ? (
            <WinstonGuide
              variant="empty"
              title="Mailbox is Clean & Empty!"
              message="Surprise your partner with sweet words. Tap below to send your first love letter."
              actionText="Write Love Letter"
              onAction={handleOpenWrite}
            />
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {letters.map((letter) => {
                const isSelected = selectedLetter?.id === letter.id;
                const author = letter.sender_name || letter.sender || 'Partner';
                return (
                  <div
                    key={letter.id}
                    onClick={() => handleSelectLetter(letter)}
                    className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                      isSelected
                        ? 'glass-card border-rose-400 dark:border-rose-500 shadow-md ring-2 ring-rose-400/20'
                        : 'glass-card-interactive border-white/50 dark:border-white/10'
                    } ${!letter.is_read ? 'bg-rose-500/10' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!letter.is_read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping" />
                          )}
                          <span className="text-xs font-bold text-foreground truncate">
                            From: {author}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-foreground/90 truncate">
                          {letter.title || 'A letter from the heart'}
                        </h4>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-sans">
                          {letter.content}
                        </p>

                        <div className="flex items-center gap-3 mt-2.5 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(letter.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {letter.is_read ? (
                            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                              <CheckCheck className="w-3 h-3" /> Read
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold">New</span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={(e) => handleOpenEdit(letter, e)}
                          className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Edit Letter"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(letter.id, e)}
                          className="p-1.5 rounded-lg glass-card-interactive text-muted-foreground hover:text-rose-600 transition-colors"
                          title="Delete Letter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Desktop Letter Reader Viewport */}
        <div className="hidden lg:block lg:col-span-7">
          {selectedLetter ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-10 sticky top-24 border-rose-300/30 dark:border-rose-500/20 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 border border-white/40">
                <Heart className="w-6 h-6 fill-white" />
              </div>

              <div className="mb-6 pb-4 border-b border-white/40 dark:border-white/10 pr-14">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 mb-1">
                  <Feather className="w-4 h-4" />
                  <span>Private Love Letter</span>
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  {selectedLetter.title || 'A Message For You'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Penned with love on{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(selectedLetter.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>

              <div className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-serif italic py-4 bg-white/20 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/5">
                {selectedLetter.content}
              </div>

              <div className="mt-8 pt-4 border-t border-white/30 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Always and forever,</p>
                  <p className="text-lg font-bold text-foreground font-serif">
                    {selectedLetter.sender_name || selectedLetter.sender || 'My Love'}
                  </p>
                </div>
                <Button
                  onClick={handleOpenWrite}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs glass-card-interactive gap-1.5 h-9"
                >
                  <Send className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reply with Letter</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center sticky top-24">
              <Mail className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-foreground text-lg">Select a letter to read</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Open one of the secret letters on the left or write a fresh declaration of love.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Full Letter Reader Modal */}
      {showMobileReader && selectedLetter && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 max-w-md w-full relative animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-white/30 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold text-rose-500 uppercase">From: {selectedLetter.sender_name || selectedLetter.sender || 'My Love'}</span>
              </div>
              <button
                onClick={() => setShowMobileReader(false)}
                className="p-1.5 rounded-xl glass-card-interactive text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-foreground mb-1">
              {selectedLetter.title || 'A Message For You'}
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">
              {new Date(selectedLetter.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap font-serif italic py-3 px-4 bg-white/30 dark:bg-black/20 rounded-2xl border border-white/20">
              {selectedLetter.content}
            </div>

            <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-foreground">
                — {selectedLetter.sender_name || selectedLetter.sender || 'My Love'}
              </span>
              <Button
                onClick={() => setShowMobileReader(false)}
                size="sm"
                className="rounded-xl text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white h-8"
              >
                Close Letter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Write / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-modal rounded-3xl p-5 sm:p-7 max-w-lg w-full relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Feather className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {editingLetter ? 'Edit Love Letter' : 'Write a Love Letter'}
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
                <label className="text-xs font-semibold text-foreground">From (Your Signature)</label>
                <Input
                  type="text"
                  placeholder="Your Name or Nickname"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Letter Title</label>
                <Input
                  type="text"
                  placeholder="e.g. You make every day magic..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Your Message *</label>
                <textarea
                  rows={7}
                  placeholder="Pour your heart out into words..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full glass-input p-3 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-serif leading-relaxed"
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
                  {isSubmitting ? 'Sealing...' : editingLetter ? 'Save Changes' : 'Seal & Send Letter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
