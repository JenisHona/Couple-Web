'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DecisionRoulette } from '@/components/decision-roulette';
import { useAuth } from '@/lib/auth-context';

export default function DecisionRoulettePage() {
  const { user } = useAuth();

  const partner1Name = user?.username || 'You';
  const partner2Name = user?.partner?.username || 'Partner';

  return (
    <DashboardLayout
      title="Couples Decision Roulette 🎡"
      subtitle="Eliminate decision fatigue together · Food, Movies, and Date Night choices"
    >
      <DecisionRoulette
        partner1Name={partner1Name}
        partner2Name={partner2Name}
      />
    </DashboardLayout>
  );
}
