'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Heart, MapPin, Calendar } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  isFavorite: boolean;
}

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Our First Meeting',
      description: 'The day we met and our hearts connected forever',
      date: '2023-06-15',
      location: 'Coffee Shop',
      isFavorite: true,
    },
    {
      id: '2',
      title: 'First Trip Together',
      description: 'An amazing adventure to the mountains',
      date: '2023-09-20',
      location: 'Mountain Resort',
      isFavorite: true,
    },
    {
      id: '3',
      title: 'Said I Love You',
      description: 'The moment we first said those three beautiful words',
      date: '2023-12-25',
      location: 'Under the Stars',
      isFavorite: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const newMemory: Memory = {
      id: Date.now().toString(),
      title,
      description,
      date,
      location,
      isFavorite: false,
    };

    setMemories([newMemory, ...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setShowForm(false);
  };

  const toggleFavorite = (id: string) => {
    setMemories(
      memories.map((m) =>
        m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setMemories(memories.filter((m) => m.id !== id));
  };

  // Sort by date, newest first
  const sortedMemories = [...memories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout title="Our Timeline">
      <div className="space-y-6">
        {/* Add Memory Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>

        {/* Add Memory Form */}
        {showForm && (
          <Card className="bg-card border-border/50 border-2 border-primary/50">
            <CardHeader>
              <CardTitle>Add a Memory</CardTitle>
              <CardDescription>Capture a special moment in our journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                    <Input
                      type="text"
                      placeholder="Give this memory a title"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <Input
                    type="text"
                    placeholder="Where did this happen?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    placeholder="Tell the story of this moment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-24 p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
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
                    Save Memory
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {sortedMemories.length === 0 ? (
          <Card className="bg-card border-border/50 text-center py-12">
            <CardContent>
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Start building your timeline of memories!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Add First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent"></div>

            {/* Memory cards */}
            <div className="space-y-6 md:pl-20">
              {sortedMemories.map((memory, index) => (
                <div key={memory.id} className="relative">
                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute -left-12 top-6 w-6 h-6 bg-card border-4 border-primary rounded-full items-center justify-center">
                    {memory.isFavorite && (
                      <Heart className="w-3 h-3 text-primary fill-primary" />
                    )}
                  </div>

                  {/* Memory Card */}
                  <Card className="bg-card border-border/50 hover:shadow-lg hover:border-primary/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-foreground flex items-center gap-2">
                            {memory.title}
                            {memory.isFavorite && (
                              <Heart className="w-4 h-4 text-primary fill-primary" />
                            )}
                          </CardTitle>
                          <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(memory.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            {memory.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {memory.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFavorite(memory.id)}
                            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                memory.isFavorite ? 'fill-primary text-primary' : ''
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(memory.id)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    {memory.description && (
                      <CardContent>
                        <p className="text-foreground text-sm">{memory.description}</p>
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
