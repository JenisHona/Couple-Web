'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Heart, 
  BookOpen, 
  Images, 
  CheckSquare, 
  Mail, 
  Calendar, 
  Sparkles, 
  Menu, 
  X, 
  LogOut,
  LayoutDashboard,
  Flame,
  Lock
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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
      <div className="min-h-screen bg-romantic-mesh flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-rose-400/20 border-t-rose-500 animate-spin"></div>
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-4 text-xs sm:text-sm font-medium text-muted-foreground animate-pulse">
          Opening our sanctuary...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Blog', icon: BookOpen, href: '/dashboard/blog' },
    { label: 'Gallery', icon: Images, href: '/dashboard/gallery' },
    { label: 'Bucket List', icon: CheckSquare, href: '/dashboard/bucket-list' },
    { label: 'Letters', icon: Mail, href: '/dashboard/love-letters' },
    { label: 'Timeline', icon: Calendar, href: '/dashboard/timeline' },
    { label: 'Dates', icon: Heart, href: '/dashboard/anniversaries' },
    { label: 'Velvet Vault', icon: Flame, href: '/dashboard/intimacy' },
  ];

  // Primary 5 items for mobile floating bottom bar to prevent squishing
  const mobileBottomNavItems = [
    { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Blog', icon: BookOpen, href: '/dashboard/blog' },
    { label: 'Gallery', icon: Images, href: '/dashboard/gallery' },
    { label: 'Letters', icon: Mail, href: '/dashboard/love-letters' },
    { label: 'Dates', icon: Heart, href: '/dashboard/anniversaries' },
  ];

  return (
    <div className="min-h-screen bg-romantic-mesh flex flex-col transition-colors duration-300">
      {/* Top Glass Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-slate-950/85 border-b border-white/50 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none flex-shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-all flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white group-hover:animate-ping" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-bold tracking-tight gradient-love-text whitespace-nowrap">
                  Duo Diary
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-widest text-muted-foreground">
                  Couples Sanctuary
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Visible on xl screens for generous spacing) */}
            <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-2xl glass-card-interactive flex-shrink-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                          : 'text-foreground/80 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-rose-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile, Theme & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <ThemeToggle />

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card-interactive">
                <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-foreground/90 max-w-[90px] lg:max-w-[120px] truncate">
                  {user?.username}
                </span>
                {user?.partner ? (
                  <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span className="max-w-[80px] truncate">@{user.partner.username}</span>
                  </span>
                ) : (
                  <Link href="/dashboard">
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md hover:bg-amber-500/20 transition-all cursor-pointer flex-shrink-0">
                      + Link Partner
                    </span>
                  </Link>
                )}
              </div>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-1.5 rounded-xl glass-card-interactive text-xs font-medium hover:text-rose-600 hover:bg-rose-500/10 h-9 px-3"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>

              {/* Mobile / Tablet menu toggle (Visible on screens < xl) */}
              <button
                className="xl:hidden p-2 rounded-xl glass-card-interactive text-foreground hover:text-rose-500 focus:outline-none flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>
          </div>

          {/* Mobile / Tablet Drawer Top Navigation */}
          {mobileMenuOpen && (
            <div className="xl:hidden py-4 border-t border-white/20 dark:border-white/10 space-y-3 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl glass-card-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block leading-tight">{user?.username}</span>
                    {user?.partner ? (
                      <span className="text-[11px] text-rose-500 font-medium">Linked with @{user.partner.username}</span>
                    ) : (
                      <span className="text-[11px] text-amber-500 font-medium">Single (No partner linked)</span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-rose-500 hover:bg-rose-500/10 h-8"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <button
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                            : 'glass-card-subtle text-foreground hover:text-rose-500 hover:bg-rose-500/10'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Sanctuary Content with responsive padding & bottom clearance for mobile nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 pb-24 lg:pb-12">
        {title && (
          <div className="mb-6 sm:mb-8 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight gradient-love-text">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1 font-medium">
                  {subtitle || 'A sacred and private memory keeper for you both'}
                </p>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Floating Bottom Glass Tab Bar (Hidden on Desktop & Tablets xl) */}
      <div className="xl:hidden fixed bottom-3 left-4 right-4 z-40 max-w-sm sm:max-w-md mx-auto">
        <nav className="glass-panel rounded-2xl p-1.5 shadow-2xl flex items-center justify-around border border-white/40 dark:border-white/10 backdrop-blur-3xl">
          {mobileBottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1 text-center">
                <button
                  className={`w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-foreground/70 hover:text-rose-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <footer className="hidden lg:block mt-auto border-t border-white/20 dark:border-white/10 py-6 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          Cherishing every moment together with{' '}
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline" />
        </p>
      </footer>
    </div>
  );
}
