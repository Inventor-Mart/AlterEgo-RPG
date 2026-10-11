import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Target,
  ExternalLink,
  MessageCircle,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Volume1,
} from 'lucide-react';
import { DailyAffirmation, getRandomDecree } from '../utils/dailyAffirmations';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendAffirmationNotification,
  isNotificationSupported,
  isInsideIframe,
  NotificationSettings,
} from '../utils/dailyNotificationService';
import { soundEngine } from '../utils/soundEngine';

export interface DailyAffirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  affirmation: DailyAffirmation;
  streak: number;
  totalDailyXp: number;
  hasClaimedToday: boolean;
  onClaimAlignment: () => void;
  archetypeName?: string;
}

export const DailyAffirmationModal: React.FC<DailyAffirmationModalProps> = ({
  isOpen,
  onClose,
  affirmation: initialAffirmation,
  streak,
  totalDailyXp,
  hasClaimedToday,
  onClaimAlignment,
  archetypeName,
}) => {
  const [affirmation, setAffirmation] = useState<DailyAffirmation>(initialAffirmation);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [notifSupported, setNotifSupported] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<string>('default');
  const [inIframe, setInIframe] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setAffirmation(initialAffirmation);
  }, [initialAffirmation]);

  useEffect(() => {
    if (isOpen) {
      setNotifSupported(isNotificationSupported());
      setInIframe(isInsideIframe());
      const current = getNotificationSettings();
      setNotifSettings(current);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionState(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    const text = `👑 ALTEREGO DAILY DECREE\n"${affirmation.affirmation}"\n\n🎯 ACTION ANCHOR:\n${affirmation.focusAction}\n\n📖 ANCHOR SCRIPTURE (${affirmation.anchorVerse.reference}):\n"${affirmation.anchorVerse.text}"\n\nAscend your divine purpose on AlterEgo: ${window.location.origin}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleToggleNotifications = async () => {
    if (!notifSettings.enabled) {
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      setFeedbackNotice({
        type: 'success',
        text: 'Daily Morning Notifications activated! Scheduled for ' + updated.time + '.',
      });
      soundEngine.playCelestialChime();
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      setFeedbackNotice({
        type: 'info',
        text: 'Morning notifications paused.',
      });
    }
  };

  const handleToggleBrowserPush = async () => {
    if (inIframe) {
      setFeedbackNotice({
        type: 'info',
        text: 'Running in embedded preview: Click "Open Standalone Tab" below to enable system lock-screen push notifications. In-App Morning Banners & Audio Chimes are already active!',
      });
      return;
    }

    const result = await requestNotificationPermission();
    setPermissionState(result.permission);
    if (result.granted) {
      const updated = { ...notifSettings, browserPush: true, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      setFeedbackNotice({
        type: 'success',
        text: 'Browser lock-screen notifications enabled!',
      });
      soundEngine.playCelestialChime();
    } else {
      setFeedbackNotice({
        type: 'error',
        text: result.reason || 'Notification permission not granted.',
      });
    }
  };

  const handleTimeChange = (newTime: string) => {
    const updated = { ...notifSettings, time: newTime };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    setFeedbackNotice({
      type: 'success',
      text: `Morning notification time updated to ${newTime}.`,
    });
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    const result = await sendAffirmationNotification(
      affirmation.title,
      `${affirmation.affirmation} (${affirmation.anchorVerse.reference})`,
      {
        affirmation,
        playAudio: true,
      }
    );

    if (result.deliveredNative) {
      setFeedbackNotice({
        type: 'success',
        text: '✓ System notification sent to your OS & In-App Morning Banner displayed!',
      });
    } else {
      setFeedbackNotice({
        type: 'success',
        text: '✓ Morning Banner triggered at top of screen with Celestial Chime audio!',
      });
    }

    setTimeout(() => setTestSent(false), 3000);
  };

  const handleShareNative = async () => {
    const text = `👑 ALTEREGO DAILY DECREE (${affirmation.anchorVerse.reference})\n"${affirmation.affirmation}"\n\nAscend your divine purpose on AlterEgo.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: affirmation.title,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleShareTwitter = () => {
    const tweet = encodeURIComponent(
      `👑 ALTEREGO DAILY DECREE (${affirmation.anchorVerse.reference}):\n"${affirmation.affirmation.substring(0, 160)}..."\n\nAscend your divine calling:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweet}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `👑 *ALTEREGO DAILY DECREE*\n_${affirmation.affirmation}_\n\n🎯 *Today's Focus Action:*\n${affirmation.focusAction}\n\n📖 *Anchor Scripture:* ${affirmation.anchorVerse.reference}\n\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleOpenStandalone = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-b from-slate-950 via-[#0e071c] to-black shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-400/20 px-5 py-4 bg-amber-950/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Daily Divine Alignment</h2>
              <p className="text-[10px] text-amber-300/80 font-mono">
                {affirmation.archetype} • Morning Purpose Hub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-500/20 text-slate-200">
          {/* Feedback banner if any action occurred */}
          {feedbackNotice && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed animate-fade-in ${
                feedbackNotice.type === 'success'
                  ? 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
                  : feedbackNotice.type === 'error'
                  ? 'border border-rose-500/40 bg-rose-950/60 text-rose-200'
                  : 'border border-indigo-500/40 bg-indigo-950/60 text-indigo-200'
              }`}
            >
              {feedbackNotice.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              )}
              <div className="flex-1">
                <span>{feedbackNotice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackNotice(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Streak Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-black/50 p-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                  Alignment Streak
                </span>
                <p className="text-sm font-black text-white">
                  {streak} {streak === 1 ? 'Consecutive Day' : 'Consecutive Days'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-mono">Total Daily Bonus</span>
              <span className="font-mono text-xs font-bold text-amber-400">+{totalDailyXp} XP</span>
            </div>
          </div>

          {/* Today's Decree Full Text */}
          <div className="rounded-2xl border border-amber-400/40 bg-black/60 p-4 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                Today&apos;s Proclamation
              </span>
              <button
                type="button"
                onClick={() => setAffirmation(getRandomDecree(archetypeName))}
                className="text-[10px] text-indigo-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Cycle Next</span>
              </button>
            </div>

            <h3 className="text-base font-extrabold text-amber-200 leading-snug">
              {affirmation.title}
            </h3>

            <blockquote className="text-xs italic leading-relaxed text-slate-100 font-serif border-l-2 border-amber-400/70 pl-3">
              &ldquo;{affirmation.affirmation}&rdquo;
            </blockquote>

            {/* Focus Action */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 flex items-start gap-2.5">
              <Target className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Prescribed Daily Action
                </span>
                <p className="text-xs text-slate-200 leading-snug mt-0.5">
                  {affirmation.focusAction}
                </p>
              </div>
            </div>

            {/* Scripture Anchor */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2.5 flex items-start gap-2.5">
              <BookOpen className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Anchor Verse • {affirmation.anchorVerse.reference}
                </span>
                <p className="text-xs italic text-indigo-100/90 leading-snug mt-0.5 font-serif">
                  &ldquo;{affirmation.anchorVerse.text}&rdquo;
                </p>
              </div>
            </div>

            {/* Audio Voice Narration Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-pulse'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>Listen Aloud (Speech Engine)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Upgraded Daily Morning Notification Engine */}
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-950/20 via-black to-slate-950 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    Daily Morning Notification
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    Dual Engine: In-App Banner + System Push
                  </span>
                </div>
              </div>

              {/* Master toggle */}
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  notifSettings.enabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notifSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Delivery Methods Status Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2 text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-white">In-App Banner & Audio</strong>
                  <span className="text-[9px] text-emerald-300">100% Active in Preview & App</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <div>
                  <strong className="block text-white">Morning Time</strong>
                  <span className="text-[9px] text-amber-300 font-mono">
                    {notifSettings.time} Daily
                  </span>
                </div>
              </div>
            </div>

            {/* Time Settings & Test Button */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Scheduled Alarm Time:</span>
                </label>
                <select
                  value={notifSettings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="rounded-lg border border-amber-400/40 bg-slate-900 px-2 py-1 text-xs font-mono font-bold text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="06:00">06:00 AM (Dawn)</option>
                  <option value="07:00">07:00 AM (Early)</option>
                  <option value="08:00">08:00 AM (Standard)</option>
                  <option value="09:00">09:00 AM (Workday Start)</option>
                  <option value="10:00">10:00 AM (Mid-Morning)</option>
                </select>
              </div>

              {/* Instant Test Button */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-[10px] text-slate-400">
                  Verify notification sound & banner now:
                </span>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={testSent}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/30 transition shadow-sm cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>{testSent ? '✓ Triggering...' : 'Test Notification Now'}</span>
                </button>
              </div>
            </div>

            {/* If in iframe: show standalone helper */}
            {inIframe && (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2.5 flex items-start justify-between gap-2">
                <div className="text-[10px] text-indigo-200 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold text-indigo-300">
                    <Maximize2 className="h-3 w-3" />
                    <span>Embedded Preview Notice</span>
                  </div>
                  <p className="text-[9px] text-indigo-200/80 leading-relaxed">
                    Browser push notifications on OS lock-screens require a standalone window. In-App Morning Banners & Audio Chimes are already fully working here!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenStandalone}
                  className="shrink-0 rounded-lg border border-indigo-400/50 bg-indigo-500/20 px-2.5 py-1 text-[10px] font-bold text-indigo-200 hover:bg-indigo-500/30 transition cursor-pointer"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </div>

          {/* Social Media Sharing Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Share Divine Decree
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-2 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-950/40 py-2 text-[11px] font-bold text-sky-300 hover:bg-sky-900/50 transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                <span>Post on X</span>
              </button>

              <button
                type="button"
                onClick={handleShareNative}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 py-2 text-[11px] font-bold text-amber-300 hover:bg-amber-900/50 transition cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action: Claim Alignment */}
        <div className="border-t border-amber-400/20 p-4 bg-black/60">
          <button
            type="button"
            onClick={() => {
              if (!hasClaimedToday) {
                onClaimAlignment();
              }
            }}
            disabled={hasClaimedToday}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition shadow-md cursor-pointer ${
              hasClaimedToday
                ? 'border border-emerald-500/40 bg-emerald-950/80 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white hover:brightness-110 active:scale-98 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
          >
            {hasClaimedToday ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Divine Alignment Claimed Today (+25 XP)</span>
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 text-amber-200 animate-bounce" />
                <span>Speak Decree & Claim Daily Alignment (+25 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
