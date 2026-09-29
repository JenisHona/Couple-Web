'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Heart, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft,
  RotateCw,
  Sparkles
} from 'lucide-react';

import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [age, setAge] = useState<string>('');
  const [otp, setOtp] = useState('');
  
  // Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleTabSwitch = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setStep('auth');
    setUsername('');
    setEmail('');
    setPassword('');
    setGender('female');
    setAge('');
    setOtp('');
    setError('');
    setSuccessMsg('');
  };

  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
    setGender('female');
    setAge('');
    setOtp('');
    setError('');
    setSuccessMsg('');
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!email.trim() || !username.trim() || !password.trim()) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        if (age && Number(age) < 16) {
          setError('You must be at least 16 years old to join Duo Diary 🌸');
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
            gender,
            age: age ? Number(age) : null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initiate registration');
        }

        // Transition to OTP verification step
        setStep('otp');
        setResendCooldown(60);
        setSuccessMsg(`We sent a 6-digit verification code to ${email.trim()}.`);
      } else {
        await login(username.trim(), password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify OTP code');
      }

      // Step verified! Now take user to Login tab as required!
      setStep('auth');
      setIsRegister(false);
      setPassword('');
      setOtp('');
      setSuccessMsg('🎉 Email verified successfully! Please sign in to access your sanctuary.');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setResendCooldown(60);
      setSuccessMsg(data.message || `A new code has been sent to ${email.trim()}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-romantic-mesh flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Floating Glowing Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-400/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-400/15 blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-lg gradient-love-text">Duo Diary</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="glass-modal rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle Top Glass Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />

          {/* VIEW A: OTP Verification View */}
          {step === 'otp' ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="relative w-28 h-28 mx-auto drop-shadow-xl animate-float">
                  <Image
                    src="/winston.png"
                    alt="Winston Mascot"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                  🐾 Winston fetched your verification code!
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight gradient-love-text mt-1">
                  Verify Your Email
                </h1>
                <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">
                  Enter the 6-digit code sent to <span className="font-bold text-foreground">{email}</span>
                </p>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 animate-in shake">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground text-center block">
                    Enter 6-Digit Code
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    autoFocus
                    required
                    className="glass-input h-14 text-2xl font-mono font-black text-center tracking-[0.4em] rounded-2xl text-rose-600 dark:text-rose-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-11 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Verify & Proceed to Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => { setStep('auth'); setError(''); setSuccessMsg(''); }}
                  className="flex items-center gap-1 hover:text-foreground font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`flex items-center gap-1 font-semibold ${
                    resendCooldown > 0 
                      ? 'text-muted-foreground/60 cursor-not-allowed' 
                      : 'text-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: Normal Sign In / Register Form */
            <>
              {/* Header */}
              <div className="text-center space-y-3 mb-6">
                <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-pink-500/10 border border-rose-500/20 text-rose-500 mb-1">
                  <Heart className="w-8 h-8 fill-rose-500/80 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-love-text">
                  {isRegister ? 'Begin Your Story' : 'Welcome Back'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {isRegister 
                    ? 'Create a shared sacred space for two hearts'
                    : 'Sign in to access your couple sanctuary'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-2xl glass-card-subtle mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTabSwitch(false)}
                  className={`py-2 rounded-xl transition-all ${
                    !isRegister
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch(true)}
                  className={`py-2 rounded-xl transition-all ${
                    isRegister
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="off">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-500" /> Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    required
                    className="glass-input h-11 text-sm rounded-xl"
                  />
                </div>

                {isRegister && (
                  <>
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-rose-500" /> Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        autoComplete="off"
                        required
                        className="glass-input h-11 text-sm rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" /> My Gender / Pronouns
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setGender('female')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                            gender === 'female'
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md shadow-rose-500/20'
                              : 'glass-card-subtle border-white/20 text-foreground/80 hover:border-rose-500/30'
                          }`}
                        >
                          <span className="text-base leading-none">👩</span>
                          <span className="text-[11px]">She / Her</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('male')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                            gender === 'male'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-md shadow-blue-500/20'
                              : 'glass-card-subtle border-white/20 text-foreground/80 hover:border-blue-500/30'
                          }`}
                        >
                          <span className="text-base leading-none">👨</span>
                          <span className="text-[11px]">He / Him</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('other')}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                            gender === 'other'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md shadow-purple-500/20'
                              : 'glass-card-subtle border-white/20 text-foreground/80 hover:border-purple-500/30'
                          }`}
                        >
                          <span className="text-base leading-none">✨</span>
                          <span className="text-[11px]">They / Them</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Your Age (Optional)
                        </label>
                        <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          16+ only
                        </span>
                      </div>
                      <Input
                        type="number"
                        min="16"
                        max="120"
                        placeholder="Enter your age (must be 16+)"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        disabled={isLoading}
                        autoComplete="off"
                        className="glass-input h-11 text-sm rounded-xl"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-500" /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    className="glass-input h-11 text-sm rounded-xl"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 animate-in shake">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full h-11 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading || authLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isRegister ? 'Send Verification Code' : 'Enter Our Sanctuary'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-2 z-10">
        A private and secure couple sanctuary
      </div>
    </div>
  );
}
