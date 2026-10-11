import React, { useState } from 'react';
import {
  BellRing,
  Flame,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DailyAffirmation } from '../utils/dailyAffirmations';
import { soundEngine } from '../utils/soundEngine';

export interface MorningNotificationBannerProps {
  isVisible: boolean;
  onClose: () => void;
  affirmation: DailyAffirmation;
  hasClaimedToday: boolean;
  onClaimAlignment: () => void;
  onOpenModal: () => void;
}

export const MorningNotificationBanner: React.FC<MorningNotificationBannerProps> = ({
  isVisible,
  onClose,
  affirmation,
  hasClaimedToday,
  onClaimAlignment,
  onOpenModal,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  if (!isVisible) return null;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechText = `${affirmation.title}. ${affirmation.affirmation}. Today's focus action: ${affirmation.focusAction}. Anchor scripture from ${affirmation.anchorVerse.reference}: ${affirmation.anchorVerse.text}`;
    soundEngine.speakLine(speechText, 0, () => {
      setIsSpeaking(false);
    });
  };

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasClaimedToday) {
      onClaimAlignment();
    }
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-bounce-short shadow-[0_10px_40px_rgba(245,158,11,0.35)]">
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/80 bg-gradient-to-r from-slate-950 via-[#180f2b] to-black p-4 text-white backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/25 blur-3xl" />

        <div className="relative z-10 space-y-2.5">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <BellRing className="h-4 w-4 animate-wiggle" />
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-amber-300">
                  <Sparkles className="h-3 w-3" />
                  Morning Divine Decree Notification
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200 border border-amber-400/30">
                {affirmation.archetype}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-slate-400 hover:text-white transition cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Decree Content */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-amber-200 leading-snug">
              {affirmation.title}
            </h4>
            <p className="text-xs text-slate-100 italic font-serif leading-relaxed line-clamp-2">
              &ldquo;{affirmation.affirmation}&rdquo;
            </p>
            <div className="flex items-center gap-2 text-[10px] text-indigo-300">
              <span className="flex items-center gap-1 font-serif italic">
                <BookOpen className="h-3 w-3 text-indigo-400" />
                {affirmation.anchorVerse.reference}
              </span>
              <span>•</span>
              <span className="text-slate-300 truncate">
                Action: {affirmation.focusAction}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
            {/* Claim +25 XP button */}
            <button
              type="button"
              onClick={handleClaim}
              disabled={hasClaimedToday}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                hasClaimedToday
                  ? 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              }`}
            >
              {hasClaimedToday ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Alignment Claimed (+25 XP)</span>
                </>
              ) : (
                <>
                  <Flame className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
                  <span>Declare & Claim (+25 XP)</span>
                </>
              )}
            </button>

            {/* Voice speak button */}
            <button
              type="button"
              onClick={handleSpeak}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Mute</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Audio</span>
                </>
              )}
            </button>

            {/* View Full Hub */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenModal();
              }}
              className="flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-950/30 px-2.5 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-900/40 transition ml-auto cursor-pointer"
            >
              <span>Full Hub</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
