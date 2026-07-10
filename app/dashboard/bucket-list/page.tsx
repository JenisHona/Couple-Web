'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

const CATEGORIES = ['travel', 'adventure', 'food', 'gifts', 'experiences', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function BucketListPage() {
  const [items, setItems] = useState<BucketListItem[]>([
    {
      id: '1',
      title: 'Visit Paris together',
      description: 'Our dream romantic getaway to the city of love',
      category: 'travel',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Cook a meal together',
      description: 'Prepare a 3-course dinner for each other',
      category: 'food',
      priority: 'medium',
      completed: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: BucketListItem = {
      id: Date.now().toString(),
      title,
      description,
      category,
      priority,
      completed: false,
    };

    setItems([newItem, ...items]);
    setTitle('');
    setDescription('');
    setCategory('other');
    setPriority('medium');
    setShowForm(false);
  };

  const toggleComplete = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const filteredItems = filter === 'all'
    ? items
    : filter === 'completed'
    ? items.filter((i) => i.completed)
    : items.filter((i) => !i.completed);

  const priorityColors = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-amber-600 bg-amber-50',
    high: 'text-red-600 bg-red-50',
  };

  return (
    <DashboardLayout title="Our Bucket List">
      <div className="space-y-6">
        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['all', 'completed', 'pending'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={f === filter ? 'bg-primary text-primary-foreground' : ''}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {/* Add Item Form */}
        {showForm && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>Add a New Dream</CardTitle>
              <CardDescription>What do you want to achieve together?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                  <Input
                    type="text"
                    placeholder="What do you want to do?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    placeholder="Add more details about this dream..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-24 p-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add to List
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <Card className="bg-card border-border/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {filter === 'completed' ? 'No completed dreams yet!' : 'No dreams added yet!'}
              </p>
              {filter !== 'completed' && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Dream
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`bg-card border-border/50 transition-all ${
                  item.completed ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle className="w-6 h-6 text-primary fill-primary" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-foreground ${
                          item.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            priorityColors[item.priority]
                          }`}
                        >
                          {item.priority} priority
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
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

        {/* Stats */}
        {items.length > 0 && (
          <div className="pt-6 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{items.length}</p>
                  <p className="text-sm text-muted-foreground">Total Dreams</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-accent">{items.filter((i) => i.completed).length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-muted/20 to-muted/10 border-border/50">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((items.filter((i) => i.completed).length / items.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
