'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, Unlock, ShieldAlert, Sparkles, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntimacyVaultGateProps {
  hasPin: boolean;
  isAgeConfirmed: boolean;
  userAge: number | null;
  onUnlocked: () => void;
  onPinSet: () => void;
  onAgeConfirmed: () => void;
}

export function IntimacyVaultGate({
  hasPin,
  isAgeConfirmed,
  userAge,
  onUnlocked,
  onPinSet,
  onAgeConfirmed,
}: IntimacyVaultGateProps) {
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [ageChecked, setAgeChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Age Verification (Must be 18+)
  if (!isAgeConfirmed) {
    const handleConfirmAge = async () => {
      if (!ageChecked) {
        setError('Please check the box to confirm you are 18+ years of age.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/intimacy/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'confirm_age', confirmAge: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to verify age');
        onAgeConfirmed();
      } catch (err: any) {
        setError(err.message || 'Age verification failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="glass-card rounded-3xl p-6 sm:p-10 border-2 border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-background to-purple-950/20 max-w-lg mx-auto text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

        <div className="relative w-20 h-20 mx-auto animate-float">
          <Image src="/winston.png" alt="Winston Mascot" fill className="object-contain" priority />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-500 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> 18+ Age Restricted Area
          </div>
          <h2 className="text-2xl font-black text-foreground">
            The Velvet Vault 🔒
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome to your private couples intimacy sanctuary. This area contains adult relationship tools (Desire Mood Matcher & Fantasy Checker).
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-2xl glass-card-subtle text-left space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ageChecked}
              onChange={(e) => setAgeChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-rose-500 text-rose-500 focus:ring-rose-500 accent-rose-500"
            />
            <span className="text-xs text-foreground font-medium leading-normal">
              I certify under penalty of perjury that I and my partner are at least <strong>18 years of age</strong> and wish to access intimate couples connection features.
            </span>
          </label>
        </div>

        <Button
          onClick={handleConfirmAge}
          disabled={loading || !ageChecked}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Enter 18+ Velvet Vault'}</span>
        </Button>
      </div>
    );
  }

  // Step 2: Set PIN if no PIN is created yet
  if (!hasPin) {
    const handleSetPin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPin.length < 4) {
        setError('PIN must be 4 digits.');
        return;
      }
      if (newPin !== confirmPin) {
        setError('PINs do not match.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/intimacy/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_pin', newPin }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to set PIN');
        setSuccess('Vault PIN created successfully!');
        onPinSet();
        onUnlocked();
      } catch (err: any) {
        setError(err.message || 'Error setting PIN');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="glass-card rounded-3xl p-6 sm:p-10 border-2 border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-background to-purple-950/20 max-w-md mx-auto text-center space-y-6 shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/30">
          <KeyRound className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Create Your 4-Digit Vault PIN
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            This PIN secures your desires and fantasies so random visitors or shared devices cannot view them.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSetPin} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-foreground">New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold h-12 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 focus:border-rose-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-foreground">Confirm 4-Digit PIN</label>
            <input
              type="password"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold h-12 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/10 focus:border-rose-500 outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || newPin.length < 4}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-md"
          >
            {loading ? 'Securing...' : 'Set PIN & Unlock Vault'}
          </Button>
        </form>
      </div>
    );
  }

  // Step 3: Unlock Vault PIN
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/intimacy/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_pin', pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect PIN');
      onUnlocked();
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const updated = pin + digit;
      setPin(updated);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-10 border-2 border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-background to-purple-950/20 max-w-sm mx-auto text-center space-y-6 shadow-2xl relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/30">
        <Lock className="w-8 h-8 animate-pulse" />
      </div>

      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
          🔒 Private & Confidential
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
          Unlock Velvet Vault
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Enter your 4-digit PIN to access intimacy tools.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Visual PIN Dots */}
      <div className="flex justify-center gap-3 py-2">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              pin.length > idx
                ? 'bg-rose-500 border-rose-500 scale-110 shadow-md shadow-rose-500/40'
                : 'border-white/30 dark:border-white/20 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeypadPress(num)}
            className="h-12 rounded-xl glass-card-interactive text-base font-bold text-foreground hover:bg-rose-500/20 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPin('')}
          className="h-12 rounded-xl glass-card-interactive text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('0')}
          className="h-12 rounded-xl glass-card-interactive text-base font-bold text-foreground hover:bg-rose-500/20 active:scale-95"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-xl glass-card-interactive text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95"
        >
          ⌫
        </button>
      </div>

      <form onSubmit={handleUnlock}>
        <Button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-md gap-2"
        >
          <Unlock className="w-4 h-4" />
          <span>{loading ? 'Checking...' : 'Unlock Sanctuary'}</span>
        </Button>
      </form>
    </div>
  );
}
