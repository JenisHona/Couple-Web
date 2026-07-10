'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Images, CheckSquare, Mail, Calendar, Sparkles, Heart } from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      label: 'Blog',
      icon: BookOpen,
      description: 'Share your thoughts and moments together',
      href: '/dashboard/blog',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Gallery',
      icon: Images,
      description: 'Collect your favorite memories and photos',
      href: '/dashboard/gallery',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
    {
      label: 'Bucket List',
      icon: CheckSquare,
      description: 'Dreams to achieve together',
      href: '/dashboard/bucket-list',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Love Letters',
      icon: Mail,
      description: 'Express your feelings privately',
      href: '/dashboard/love-letters',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Timeline',
      icon: Sparkles,
      description: 'Our relationship journey',
      href: '/dashboard/timeline',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Anniversaries',
      icon: Calendar,
      description: 'Important dates and milestones',
      href: '/dashboard/anniversaries',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <DashboardLayout title="Welcome to Our Love Story">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer bg-card border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-foreground">{feature.label}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Our Story at a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Moments Together
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">Forever Growing</p>
              <p className="text-muted-foreground text-sm mt-2">Each memory is a treasure</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Dreams to Chase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">Always Together</p>
              <p className="text-muted-foreground text-sm mt-2">Making plans for tomorrow</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-muted/20 to-muted/10 border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Love Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">Infinite</p>
              <p className="text-muted-foreground text-sm mt-2">Just the beginning...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
