'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { IntimacyDesireMatcher } from '@/components/intimacy-desire-matcher';
import { IntimacyFantasyChecker } from '@/components/intimacy-fantasy-checker';
import { IntimacyVaultGate } from '@/components/intimacy-vault-gate';
import { PartnerConnectCard } from '@/components/partner-connect-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  Flame,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function IntimacyVaultPage() {
  const { user } = useAuth();
  
  const [authData, setAuthData] = useState<{
    hasPin: boolean;
    isAgeConfirmed: boolean;
    hasPartner: boolean;
    partnerUsername: string | null;
    userAge: number | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'desire' | 'fantasies'>('desire');

  useEffect(() => {
    fetchAuthStatus();
    // Check session unlock
    const sessionUnlocked = sessionStorage.getItem('duo_diary_vault_unlocked');
    if (sessionUnlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/intimacy/auth');
      if (res.ok) {
        const json = await res.json();
        setAuthData(json);
      }
    } catch (err) {
      console.error('Error fetching intimacy auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlocked = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('duo_diary_vault_unlocked', 'true');
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('duo_diary_vault_unlocked');
  };

  if (loading) {
    return (
      <DashboardLayout title="The Velvet Vault 🔒" subtitle="Loading 18+ intimacy sanctuary...">
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
          <p className="text-xs text-muted-foreground">Securing 18+ intimacy vault...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Not logged in or not connected with partner
  const partnerUser = authData?.hasPartner ? authData.partnerUsername : user?.partner?.username;

  return (
    <DashboardLayout
      title="The Velvet Vault 🔒"
      subtitle="18+ Private Intimacy Sanctuary · Blind Desire Matching & Fantasy Checker"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* If no partner linked */}
        {!partnerUser ? (
          <div className="space-y-6">
            <PartnerConnectCard onPartnerChanged={fetchAuthStatus} />
            <div className="glass-card rounded-2xl p-6 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground">Partner Connection Required</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Link with your partner using their username or couple code to unlock the private Mood Matcher and Fantasy Checker together!
              </p>
            </div>
          </div>
        ) : !isUnlocked || !authData?.isAgeConfirmed || !authData?.hasPin ? (
          /* Locked State / Age Gate / PIN Entry */
          <IntimacyVaultGate
            hasPin={!!authData?.hasPin}
            isAgeConfirmed={!!authData?.isAgeConfirmed}
            userAge={authData?.userAge || user?.age || null}
            onUnlocked={handleUnlocked}
            onPinSet={fetchAuthStatus}
            onAgeConfirmed={fetchAuthStatus}
          />
        ) : (
          /* Unlocked Intimate Sanctuary */
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Security & Navigation Bar */}
            <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-background to-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30 shrink-0">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> PIN Protected & Encrypted
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Linked with @{partnerUser}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Velvet Vault Unlocked
                  </h3>
                </div>
              </div>

              {/* Feature Switcher & Lock Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <div className="flex p-1 rounded-2xl glass-card-subtle">
                  <button
                    onClick={() => setActiveTab('desire')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'desire'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Mood Matcher (Desire)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('fantasies')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'fantasies'
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/25'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fantasy Checker</span>
                  </button>
                </div>

                <Button
                  onClick={handleLockVault}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs text-rose-500 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 h-9"
                  title="Re-lock this tab immediately"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Vault</span>
                </Button>
              </div>
            </div>

            {/* Feature 1: Mood Matcher */}
            {activeTab === 'desire' && (
              <IntimacyDesireMatcher partnerUsername={partnerUser} />
            )}

            {/* Feature 2: Fantasy / Kink Checker */}
            {activeTab === 'fantasies' && (
              <IntimacyFantasyChecker partnerUsername={partnerUser} />
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
