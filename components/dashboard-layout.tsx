'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Images, CheckSquare, Mail, Calendar, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Blog', icon: BookOpen, href: '/dashboard/blog' },
    { label: 'Gallery', icon: Images, href: '/dashboard/gallery' },
    { label: 'Bucket List', icon: CheckSquare, href: '/dashboard/bucket-list' },
    { label: 'Love Letters', icon: Mail, href: '/dashboard/love-letters' },
    { label: 'Timeline', icon: Sparkles, href: '/dashboard/timeline' },
    { label: 'Anniversaries', icon: Calendar, href: '/dashboard/anniversaries' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border/50 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Our Story</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="gap-2 hover:bg-primary/10 hover:text-primary">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground hidden sm:inline">
                Welcome, <span className="font-semibold text-primary">{user?.username}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border hover:bg-destructive/10 hover:text-destructive"
              >
                Logout
              </Button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-primary/10">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-2">A special place in our love story</p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
