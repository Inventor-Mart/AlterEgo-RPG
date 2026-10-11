import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Bell,
  Sparkles,
  BookOpen,
  Target,
  RefreshCw,
} from 'lucide-react';
import { DailyAffirmation, getRandomDecree } from '../utils/dailyAffirmations';
import { soundEngine } from '../utils/soundEngine';

export interface DailyAffirmationCardProps {
  affirmation: DailyAffirmation;
  streak: number;
  hasClaimedToday: boolean;
  onClaimAlignment: () => void;
  onOpenModal: () => void;
  archetypeName?: string;
}

export const DailyAffirmationCard: React.FC<DailyAffirmationCardProps> = ({
  affirmation: initialAffirmation,
  streak,
  hasClaimedToday,
  onClaimAlignment,
  onOpenModal,
  archetypeName,
}) => {
  const [affirmation, setAffirmation] = useState<DailyAffirmation>(initialAffirmation);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync if prop changes
  React.useEffect(() => {
    setAffirmation(initialAffirmation);
  }, [initialAffirmation]);

  const handleSpeak = () => {
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

  const handleCopy = () => {
    const text = `👑 ALTEREGO DAILY DECREE (${affirmation.anchorVerse.reference})\n"${affirmation.affirmation}"\n\n🎯 TODAY'S ACTION:\n${affirmation.focusAction}\n\n📖 ANCHOR SCRIPTURE:\n${affirmation.anchorVerse.reference} — "${affirmation.anchorVerse.text}"`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleRefresh = () => {
    const fresh = getRandomDecree(archetypeName);
    setAffirmation(fresh);
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-slate-950/80 p-4 shadow-[0_0_25px_rgba(245,158,11,0.18)] backdrop-blur-md transition-all">
      {/* Decorative top ambient flare */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-500/20 blur-2xl" />

      {/* Header bar: Date, Archetype & Streak */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            {todayFormatted}
          </span>
          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
            {affirmation.archetype}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Daily Streak Indicator */}
          <div
            title={`Current Daily Alignment Streak: ${streak} Days`}
            className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-950/50 px-2 py-0.5 text-[9px] font-bold text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.25)]"
          >
            <Flame className="h-3 w-3 text-orange-400 animate-pulse" />
            <span>{streak} {streak === 1 ? 'Day' : 'Days'}</span>
          </div>

          {/* Quick Notification Settings Button */}
          <button
            type="button"
            onClick={onOpenModal}
            title="Daily Notifications & Affirmation Settings"
            className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition cursor-pointer"
          >
            <Bell className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Title & Affirmation Core */}
      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="bg-gradient-to-r from-amber-200 via-yellow-100 to-indigo-200 bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
            {affirmation.title}
          </h3>
          <button
            type="button"
            onClick={handleRefresh}
            title="Reflect alternative decree"
            className="text-slate-400 hover:text-amber-300 transition shrink-0 p-0.5 active:rotate-180"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        <blockquote className="mt-2 text-xs font-medium leading-relaxed text-slate-200 italic font-serif border-l-2 border-amber-400/60 pl-2.5">
          &ldquo;{affirmation.affirmation}&rdquo;
        </blockquote>

        {/* Daily Focus Action */}
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-[11px] text-slate-300">
          <Target className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[9px] block">
              Today&apos;s Focus Action
            </span>
            <span className="leading-snug">{affirmation.focusAction}</span>
          </div>
        </div>

        {/* Anchor Verse Pill */}
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 font-serif italic text-amber-300/80">
            <BookOpen className="h-3 w-3 text-amber-400/80" />
            {affirmation.anchorVerse.reference}
          </span>
          <span className="font-mono text-[9px] text-purple-300/80 font-semibold">
            {affirmation.attributeBonus}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-white/10">
        {/* Claim / Declare Button */}
        <button
          type="button"
          onClick={onClaimAlignment}
          disabled={hasClaimedToday}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition shadow-md cursor-pointer ${
            hasClaimedToday
              ? 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-default'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white hover:brightness-110 active:scale-98 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
          }`}
        >
          {hasClaimedToday ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Alignment Claimed (+25 XP)</span>
            </>
          ) : (
            <>
              <Flame className="h-3.5 w-3.5 text-amber-200 animate-bounce" />
              <span>Declare & Claim (+25 XP)</span>
            </>
          )}
        </button>

        {/* Voice Read-Aloud Button */}
        <button
          type="button"
          onClick={handleSpeak}
          title={isSpeaking ? 'Stop voice reading' : 'Listen to decree spoken aloud'}
          className={`rounded-xl border p-2 transition cursor-pointer ${
            isSpeaking
              ? 'border-indigo-400 bg-indigo-500/30 text-indigo-200 animate-pulse'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-amber-300'
          }`}
        >
          {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy decree to clipboard"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={onOpenModal}
          title="Share decree & view morning meditation"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
