'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, X, Heart } from 'lucide-react';

interface WinstonGuideProps {
  title?: string;
  message: string;
  variant?: 'banner' | 'card' | 'compact' | 'empty';
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
  className?: string;
}

export function WinstonGuide({
  title = "Winston's Tip 🐾",
  message,
  variant = 'card',
  actionText,
  onAction,
  dismissible = false,
  className = '',
}: WinstonGuideProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === 'empty') {
    return (
      <div className={`glass-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto relative overflow-hidden border border-rose-400/30 ${className}`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 drop-shadow-xl animate-float">
          <Image
            src="/winston.png"
            alt="Winston the Retriever Mascot"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold mb-3">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>Winston is Waiting for Your First Entry!</span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-foreground mb-2">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
          {message}
        </p>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-105 transition-all"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-2xl glass-card-subtle border border-rose-500/20 ${className}`}>
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src="/winston.png"
            alt="Winston"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground/90 font-medium leading-tight">
            <span className="font-bold text-rose-600 dark:text-rose-400">Winston: </span>
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Default 'card' / 'banner' layout
  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-5 border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-purple-500/10 relative overflow-hidden ${className}`}>
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
        {/* Winston Mascot Avatar */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-md animate-float">
          <Image
            src="/winston.png"
            alt="Winston the Retriever Mascot"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {title}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
            {message}
          </p>
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 underline underline-offset-4"
            >
              {actionText} →
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
            title="Dismiss Winston"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
