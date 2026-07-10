'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('couple');
  const [password, setPassword] = useState('lovestory123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-primary fill-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Our Love Story</h1>
            <p className="text-muted-foreground">A sacred space just for us</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 rounded-lg transition-all"
            >
              {isLoading || authLoading ? 'Logging in...' : 'Enter Our Story'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground text-center">Username: <span className="font-mono text-foreground">couple</span></p>
            <p className="text-xs text-muted-foreground text-center">Password: <span className="font-mono text-foreground">lovestory123</span></p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Made with <Heart className="inline w-4 h-4 text-primary fill-primary" /> for lovers
        </p>
      </div>
    </div>
  );
}
