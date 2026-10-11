import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Sparkles,
  Clapperboard,
  Copy,
  Check,
  RotateCcw,
  Compass,
  Coins,
  Heart,
  Wrench,
  Globe2,
  Users,
  ScrollText,
  Shield,
  BookOpen,
  Trophy,
  Award,
  AlertCircle,
  Crown,
  Zap,
  Flame,
  ArrowRight,
  Mail,
  Lock,
  Unlock,
  Clock,
  FileText,
  CreditCard,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkle,
  Send,
  Dice5,
  Volume2,
  VolumeX,
  Mic,
  Music,
  Play,
  Share2,
  Layers,
  Radio,
  Film,
  Camera,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
} from 'lucide-react';
import {
  getRealisticCharacterPhoto,
  getStoredCustomAvatars,
  setStoredCustomAvatar,
  compressImageFile,
} from './utils/characterAvatars';
import {
  clearStoredVisualBible,
  lockOrGetCharacterVisualBible,
} from './utils/characterConsistency';
import { SceneIllustration } from './components/SceneIllustration';
import { StudioScriptPortraitView } from './components/StudioScriptPortraitView';
import { ComicPanelViewer } from './components/ComicPanelViewer';
import { CinematicSceneStage } from './components/CinematicSceneStage';
import { AuthModal } from './components/AuthModal';
import { ServicesLaunchHubModal } from './components/ServicesLaunchHubModal';
import { ShareableRpgCardModal } from './components/ShareableRpgCardModal';
import { DailyAffirmationCard } from './components/DailyAffirmationCard';
import { DailyAffirmationModal } from './components/DailyAffirmationModal';
import { MorningNotificationBanner } from './components/MorningNotificationBanner';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getTodayAffirmation } from './utils/dailyAffirmations';
import {
  getNotificationSettings,
  saveNotificationSettings,
  sendAffirmationNotification,
} from './utils/dailyNotificationService';
import { soundEngine } from './utils/soundEngine';
import {
  auth,
  onAuthStateChanged,
  testConnection,
  saveUserAlterEgoData,
  loadUserAlterEgoData,
  type User as FirebaseUser,
} from './lib/firebase';

type View = 'alterego' | 'sceneswap';

interface BiblicalArchetype {
  name: string;
  context: string;
}

interface AnchorVerse {
  reference: string;
  text: string;
}

interface WeeklyQuest {
  id: number;
  task: string;
  points: number;
}

interface AlterEgoResult {
  decoded_purpose: string;
  biblical_archetype: BiblicalArchetype;
  rpg_class: string;
  anchor_verse: AnchorVerse;
  weekly_quests: WeeklyQuest[];
}

interface TaskCopilotResult {
  task_type: string;
  summary: string;
  execution_steps: string[];
  physical_checklist?: string[];
  draft_template: string;
  leadership_tip: string;
}

export interface SceneSwapCastMember {
  player: string;
  role: string;
  archetype: string;
  motivation: string;
  secret?: string;
}

export interface SceneSwapScriptLine {
  speaker: string;
  direction?: string;
  line: string;
}

export interface SceneSwapPlotChoice {
  id: 'A' | 'B' | 'C';
  label: string;
  description: string;
  consequence_hint: string;
}

export interface SceneSwapChapterResult {
  chapter_number: number;
  chapter_title: string;
  genre: string;
  tone: string;
  setting_description: string;
  audio_cue: string;
  cast: SceneSwapCastMember[];
  script_lines: SceneSwapScriptLine[];
  plot_choices: SceneSwapPlotChoice[];
  is_finale: boolean;
  finale_summary?: string;
}

interface GenreOption {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  color: string;
  defaultTone: string;
  sampleHooks: string[];
}

const GENRE_OPTIONS: GenreOption[] = [
  {
    id: 'Nollywood Drama',
    name: 'Nollywood Drama',
    badge: 'Ikoyi Royal Drama',
    tagline: 'High-stakes family dynasties, disputed wills, shocking paternity reveals, and fierce matriarchs.',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
    defaultTone: 'Explosive & Theatrical',
    sampleHooks: [
      'Chief Balogun secretly changed his will on his deathbed leaving the entire estate to an unknown relative.',
      'During the high-society wedding reception, a blue envelope containing DNA results is discovered under the cake.',
      'The family bank accounts are suddenly frozen by anti-fraud detectives as sirens wail outside the compound gate.',
      "An uninvited guest arrives claiming to be Chief's legitimate first-born child with matching birthmarks.",
    ],
  },
  {
    id: 'Sci-Fi Survival',
    name: 'Sci-Fi Survival',
    badge: 'Deep Space Orbital',
    tagline: 'Orbital station breach, failing life support, rogue AI protocols, and desperate zero-G gambits.',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
    defaultTone: 'High Tension & Claustrophobic',
    sampleHooks: [
      'Oxygen reserves are down to six minutes and the manual airlock override only has one charge left.',
      'The station biometric sensors report 4 biological heartbeats, but only 3 crew members boarded.',
      'A classified AI override message reveals one of the crew was secretly ordered to scuttle the vessel.',
      'The escape pod was locked from the outside and a stealth ship is decoupling from the docking ring.',
    ],
  },
  {
    id: 'Afrofuturistic Heist',
    name: 'Afrofuturistic Heist',
    badge: 'Neo-Lagos 2099',
    tagline: 'Cyber-masquerades, vibranium neural vaults, high-speed flyover getaways, and tech syndicate betrayal.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    defaultTone: 'Slick & Adrenaline Pumping',
    sampleHooks: [
      'The cyber-vault password requires reciting an ancient Yoruba proverb into a neural retina scanner.',
      'The quantum hard drive is overheating and will wipe all decentralized bank ledgers in 120 seconds.',
      'One of the crew members was secretly replaced with an undercover android sent by the megacorp.',
      'The getaway hover-skiff has lost thruster stabilization above the Third Mainland Skybridge.',
    ],
  },
  {
    id: 'Horror Mystery',
    name: 'Horror Mystery',
    badge: 'Occult Gothic',
    tagline: 'Foggy highland estates, eerie radio frequencies, cursed heirlooms, and supernatural shadows.',
    color: 'from-purple-500/20 to-rose-500/20 border-purple-500/30 text-purple-300',
    defaultTone: 'Spooky & Suspenseful',
    sampleHooks: [
      'The grandfather clock chimed 13 times at midnight and the locked basement door unbolted itself.',
      'Every portrait along the hallway gallery has had its eyes scratched out since sunset.',
      'A voice on the dead rotary telephone claims to be speaking from the empty room right next door.',
      'A hidden diary found behind the fireplace names all the party guests as sacrifices.',
    ],
  },
  {
    id: 'Romantic Comedy',
    name: 'Romantic Comedy',
    badge: 'Gala Chaos',
    tagline: 'Awkward society galas, fake dating contracts, wine spills, and hilarious romantic disasters.',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300',
    defaultTone: 'Pure Comedy & Slapstick',
    sampleHooks: [
      'Two sworn rivals agreed to pose as an engaged couple to secure a ten million dollar venture check.',
      'The engagement ring was accidentally baked into the catering soufflé served to the governor.',
      'A loud toast goes disastrously wrong when the microphone amplifies a private whispered confession.',
      'Both of their demanding ex-partners show up as the guest of honor and lead violinist.',
    ],
  },
  {
    id: 'Cyberpunk Detective',
    name: 'Cyberpunk Detective',
    badge: 'Neon Noir',
    tagline: 'Acid rain, flickering hologram billboards, corrupt mega-corporation informants, and memory chips.',
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300',
    defaultTone: 'Grim & Cynical Wit',
    sampleHooks: [
      'The murder victim was a synthetic clone with a classified serial number linked to one of the players.',
      'A cyber-informant leaves a glowing memory shard inside an umbrella before disappearing into the rain.',
      "The detective's synthetic eye feed has been hijacked and is broadcasting live to bounty hunters.",
      'The blackout knocks out neon grid power across District 9 as sirens echo down the alley.',
    ],
  },
];

const TONE_OPTIONS = [
  'Explosive & Theatrical',
  'Pure Comedy & Slapstick',
  'High Tension & Claustrophobic',
  'Absurd & Chaotic',
  'Spooky & Suspenseful',
];

const PLAYER_PRESETS = [
  { name: 'Nollywood Royals', players: ['Florence', 'Dapo', 'Kemi'] },
  { name: 'Neo-Lagos Crew', players: ['Tunde', 'Amaka', 'Zola', 'Kael'] },
  { name: 'Station 9 Survivors', players: ['Alex', 'Ray', 'Maya'] },
  { name: 'Campus Drama', players: ['Chioma', 'Femi', 'Sarah', 'David'] },
];

const PLAYER_COLOR_STYLES = [
  { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40', badge: 'bg-emerald-500/30 text-emerald-200' },
  { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40', badge: 'bg-indigo-500/30 text-indigo-200' },
  { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', badge: 'bg-amber-500/30 text-amber-200' },
  { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40', badge: 'bg-purple-500/30 text-purple-200' },
  { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40', badge: 'bg-rose-500/30 text-rose-200' },
];

interface GearItem {
  slot: string;
  icon: typeof Shield;
  name: string;
  tier: string;
  unlocked: boolean;
  perk: string;
  lore: string;
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur-md transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

const labelClass = 'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200/80';

// Web Audio API harmonic crystal chime
function playQuestCompleteChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Graceful fallback
  }
}

// Haptic feedback sequence
function triggerHapticFeedback() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([30, 20, 30]);
    } catch {
      // Ignored
    }
  }
}

// Processing glow animation (FR-2.0, "AI" removed per user request)
function ProcessingGlow({ caption }: { caption: string }) {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-purple-500/20 blur-md" />
        <span className="absolute inset-0 rounded-full border border-indigo-400/50 shadow-[0_0_40px_rgba(99,102,241,0.7)]" />
        <span className="relative flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 shadow-[0_0_32px_rgba(168,85,247,0.85)]">
          <Sparkles className="h-7 w-7 text-white animate-pulse" />
        </span>
      </div>
      <p className="bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-lg font-bold tracking-wide text-transparent">
        Decoding in Progress...
      </p>
      <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-indigo-200/70">{caption}</p>
      <div className="mt-5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-bounce" />
      </div>
    </div>
  );
}

// FR-3.1: Dynamic Evolutive RPG Avatar Component (Padded & Sized to 96px with Contained Glow)
function RpgAvatar({
  level,
  xp,
  isSovereignPro,
}: {
  level: string;
  xp: number;
  isSovereignPro?: boolean;
}) {
  const isMax = xp >= 750;
  const isLvl4 = xp >= 500 && xp < 750;
  const isLvl3 = xp >= 250 && xp < 500;
  const isLvl2 = xp >= 50 && xp < 250;

  return (
    <div className="relative flex items-center justify-center my-1 select-none">
      {/* Outer ambient glow halo (contained, no text bleed) */}
      <div
        className={`absolute -inset-1 rounded-full blur-md opacity-75 transition-all duration-700 pointer-events-none ${
          isSovereignPro || isMax
            ? 'bg-amber-400/50'
            : isLvl4
            ? 'bg-amber-500/40'
            : isLvl3
            ? 'bg-purple-500/40'
            : isLvl2
            ? 'bg-indigo-500/40'
            : 'bg-indigo-600/30'
        }`}
      />

      <div
        className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 bg-gradient-to-b shadow-xl transition-all duration-500 ${
          isSovereignPro || isMax
            ? 'border-amber-400/90 from-indigo-950 via-purple-900 to-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
            : isLvl4
            ? 'border-purple-400/80 from-indigo-950 via-purple-950 to-amber-950 shadow-[0_0_18px_rgba(217,119,6,0.4)]'
            : isLvl3
            ? 'border-purple-400/80 from-indigo-950 via-purple-950 to-black shadow-[0_0_16px_rgba(168,85,247,0.4)]'
            : isLvl2
            ? 'border-indigo-400/70 from-slate-900 via-indigo-950 to-black shadow-[0_0_12px_rgba(99,102,241,0.35)]'
            : 'border-white/20 from-slate-950 to-slate-900'
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="celestialWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background Runes */}
          <circle cx="100" cy="100" r="85" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="72" stroke="rgba(167,139,250,0.15)" />

          {/* LEVEL MAX / Sovereign Pro: Seraphic Radiant Wings */}
          {(isMax || isSovereignPro) && (
            <g className="animate-pulse origin-center">
              <path
                d="M 60 110 C 20 80 15 40 45 25 C 55 45 65 75 75 95 Z"
                fill="url(#celestialWing)"
                stroke="#FDE047"
                strokeWidth="1.5"
              />
              <path
                d="M 50 125 C 10 100 5 70 30 55 C 40 75 55 95 65 115 Z"
                fill="url(#celestialWing)"
              />
              <path
                d="M 140 110 C 180 80 185 40 155 25 C 145 45 135 75 125 95 Z"
                fill="url(#celestialWing)"
                stroke="#FDE047"
                strokeWidth="1.5"
              />
              <path
                d="M 150 125 C 190 100 195 70 170 55 C 160 75 145 95 135 115 Z"
                fill="url(#celestialWing)"
              />
            </g>
          )}

          {/* LEVEL 3, 4 & MAX: Shoulder Pauldrons */}
          {(isLvl3 || isLvl4 || isMax) && (
            <g>
              <path
                d="M 40 155 L 75 135 L 85 170 L 45 185 Z"
                fill={isMax ? 'url(#goldGlow)' : 'url(#purpleGlow)'}
                stroke={isMax ? '#FEF08A' : '#E9D5FF'}
                strokeWidth="1.5"
              />
              <path
                d="M 160 155 L 125 135 L 115 170 L 155 185 Z"
                fill={isMax ? 'url(#goldGlow)' : 'url(#purpleGlow)'}
                stroke={isMax ? '#FEF08A' : '#E9D5FF'}
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Body Robes / Chestplate */}
          <path
            d="M 55 195 C 60 145 80 130 100 130 C 120 130 140 145 145 195 Z"
            fill={isMax ? '#1E1B4B' : isLvl4 ? '#1B1536' : isLvl3 ? '#0F172A' : isLvl2 ? '#1E1B4B' : '#090D16'}
            stroke={isMax ? '#F59E0B' : isLvl4 ? '#F59E0B' : isLvl3 ? '#A855F7' : isLvl2 ? '#6366F1' : '#475569'}
            strokeWidth="2"
          />

          {/* Level 2+ Runic Circuit Collar / Chest Core */}
          {(isLvl2 || isLvl3 || isLvl4 || isMax) && (
            <g>
              <polygon
                points="100,140 110,155 100,170 90,155"
                fill={isMax ? '#FEF08A' : isLvl4 ? '#FDE047' : isLvl3 ? '#C084FC' : '#818CF8'}
                className="animate-pulse"
              />
              <line
                x1="100"
                y1="130"
                x2="100"
                y2="140"
                stroke={isMax ? '#FDE047' : '#A78BFA'}
                strokeWidth="2"
              />
            </g>
          )}

          {/* Head & Face Silhouette */}
          <ellipse cx="100" cy="85" rx="28" ry="34" fill="#0F172A" />

          {/* Level 1: Apprentice Hood */}
          <path
            d="M 68 88 C 68 50 132 50 132 88 C 132 110 120 125 100 125 C 80 125 68 110 68 88 Z"
            fill={isMax ? '#311042' : isLvl4 ? '#2E1065' : isLvl3 ? '#1E1B4B' : isLvl2 ? '#1E1B4B' : '#0B0F19'}
            stroke={isMax ? '#F59E0B' : isLvl4 ? '#C084FC' : isLvl3 ? '#C084FC' : isLvl2 ? '#818CF8' : '#334155'}
            strokeWidth="1.5"
          />

          {/* Glowing Eyes */}
          <ellipse
            cx="90"
            cy="86"
            rx="5"
            ry="2.5"
            fill={isMax ? '#FEF08A' : isLvl4 ? '#FEF08A' : isLvl3 ? '#E9D5FF' : isLvl2 ? '#38BDF8' : '#A5B4FC'}
            className="animate-pulse"
          />
          <ellipse
            cx="110"
            cy="86"
            rx="5"
            ry="2.5"
            fill={isMax ? '#FEF08A' : isLvl4 ? '#FEF08A' : isLvl3 ? '#E9D5FF' : isLvl2 ? '#38BDF8' : '#A5B4FC'}
            className="animate-pulse"
          />

          {/* LEVEL 2: Circlet */}
          {isLvl2 && !isLvl3 && !isLvl4 && !isMax && (
            <path
              d="M 80 75 Q 100 70 120 75"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* LEVEL 3 & 4: Diadem */}
          {(isLvl3 || isLvl4) && !isMax && (
            <g>
              <path
                d="M 76 72 L 88 64 L 100 58 L 112 64 L 124 72"
                stroke={isLvl4 ? '#FDE047' : 'url(#purpleGlow)'}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="100" cy="58" r="3.5" fill={isLvl4 ? '#FEF08A' : '#C084FC'} />
            </g>
          )}

          {/* LEVEL MAX: Celestial Crown */}
          {isMax && (
            <g className="animate-bounce [animation-duration:2.5s]">
              <path
                d="M 72 70 L 80 50 L 92 62 L 100 42 L 108 62 L 120 50 L 128 70 Z"
                fill="url(#goldGlow)"
                stroke="#FEF08A"
                strokeWidth="1.5"
              />
              <circle cx="100" cy="42" r="3" fill="#FFFFFF" />
              <circle cx="80" cy="50" r="2.5" fill="#FEF08A" />
              <circle cx="120" cy="50" r="2.5" fill="#FEF08A" />
              <circle cx="100" cy="24" r="5" fill="#FDE047" className="animate-ping" opacity="0.6" />
              <circle cx="100" cy="24" r="3.5" fill="#FFFFFF" />
            </g>
          )}
        </svg>

        {/* Level Badge Pill */}
        <div className="absolute bottom-1 flex items-center gap-1 rounded-full border border-white/20 bg-black/85 px-2 py-0.5 text-[8px] font-bold tracking-wider backdrop-blur-md">
          <Zap className={`h-2.5 w-2.5 ${isMax ? 'text-amber-400' : 'text-purple-400'}`} />
          <span className={isMax ? 'text-amber-300' : 'text-indigo-200'}>
            LVL {level}
          </span>
        </div>
      </div>
    </div>
  );
}

// Full Gear Loadout with Lore & Descriptions (Fixes Truncation)
function getGearLoadout(xp: number): GearItem[] {
  return [
    {
      slot: 'Crown / Helm',
      icon: Crown,
      name:
        xp >= 750
          ? 'Crown of Sovereign Favor'
          : xp >= 500
          ? 'Sovereign Diadem of Light'
          : xp >= 250
          ? 'Vanguard Diadem of Wisdom'
          : xp >= 50
          ? 'Circlet of Awakened Focus'
          : 'Apprentice Hood of Seeking',
      tier: xp >= 750 ? 'Celestial' : xp >= 500 ? 'Ascended' : xp >= 250 ? 'Epic' : xp >= 50 ? 'Rare' : 'Initiate',
      unlocked: true,
      perk:
        xp >= 750
          ? '+100% Divine Authority & Favor'
          : xp >= 500
          ? '+75% Vision & Strategic Insight'
          : xp >= 250
          ? '+50% Macro System Governance'
          : xp >= 50
          ? '+25% Disciplined Intellect'
          : 'Humility & Receptivity',
      lore:
        xp >= 750
          ? 'An immortal golden circlet worn only by leaders who have built sustained institutions and walked in divine dominion.'
          : xp >= 500
          ? 'Infused with illuminated clarity, allowing the bearer to see through market noise and direct high-tempo teams.'
          : xp >= 250
          ? 'Carved with sacred geometric runes that shield the mind from career doubt and decision fatigue.'
          : xp >= 50
          ? 'A modest silver circlet that anchors daily morning focus and intentional scripture reflection.'
          : 'A simple woven initiate cowl worn while discerning your true calling in the wilderness.',
    },
    {
      slot: 'Armor / Robe',
      icon: Shield,
      name:
        xp >= 750
          ? 'Celestial Robes of Dominion'
          : xp >= 500
          ? 'Sovereign Vanguard Regalia'
          : xp >= 250
          ? 'Vanguard Aegis Plate'
          : xp >= 50
          ? 'Cipher Runic Breastplate'
          : 'Linen Seeker Vestments',
      tier: xp >= 750 ? 'Celestial' : xp >= 500 ? 'Ascended' : xp >= 250 ? 'Epic' : xp >= 50 ? 'Rare' : 'Initiate',
      unlocked: true,
      perk:
        xp >= 750
          ? 'Woven with Celestial Radiance'
          : xp >= 500
          ? 'Unyielding Community Protection'
          : xp >= 250
          ? 'High-Stakes Leadership Resilience'
          : xp >= 50
          ? 'Reinforced Runic Sigils'
          : 'Pure Dedication to Craft',
      lore:
        xp >= 750
          ? 'Pristine vestments reflecting uncompromised integrity, moral authority, and generational endurance.'
          : xp >= 500
          ? 'Reinforced ceremonial regalia designed for public leaders navigating heavy institutional responsibility.'
          : xp >= 250
          ? 'Hardened alloy plate that withstands sharp criticism, technical friction, and operational setbacks.'
          : xp >= 50
          ? 'Inlaid with kinetic micro-circuits that convert emotional energy into productive execution.'
          : 'Handmade linen robes marking the first brave steps away from comfortable mediocrity.',
    },
    {
      slot: 'Catalyst / Weapon',
      icon: Flame,
      name:
        xp >= 750
          ? 'Scepter of Zion Manifestation'
          : xp >= 500
          ? 'Aegis Staff of Market Impact'
          : xp >= 250
          ? 'Compass of Ancient Wisdom'
          : xp >= 50
          ? 'Illuminated Stylus of Insight'
          : 'Uncarved Stylus of Faith',
      tier: xp >= 750 ? 'Celestial' : xp >= 500 ? 'Ascended' : xp >= 250 ? 'Epic' : xp >= 50 ? 'Rare' : 'Initiate',
      unlocked: xp >= 50,
      perk:
        xp >= 750
          ? 'Commands Ideas into Physical Form'
          : xp >= 500
          ? 'Directs Market & Community Solutions'
          : xp >= 250
          ? 'Calibrates Teams & Institutions'
          : xp >= 50
          ? 'Translates Vision to Action'
          : 'Awaiting First Breakthrough',
      lore:
        xp >= 750
          ? 'A sacred command scepter that synthesizes vision, human capital, and capital allocation into physical empires.'
          : xp >= 500
          ? 'A walking staff tuned to the real-world needs of marginalized communities and emergent economic opportunities.'
          : xp >= 250
          ? 'An ancient navigational astrolabe that points unerringly toward high-leverage strategic partnerships.'
          : xp >= 50
          ? 'A precision stylus that turns fleeting inspirations into structured sprint backlogs.'
          : 'An unetched stylus ready to record your initial Ikigai matrix.',
    },
    {
      slot: 'Relic / Aura',
      icon: Sparkles,
      name:
        xp >= 750
          ? 'Seraphic Light Core'
          : xp >= 500
          ? 'Covenant Blessing Orb'
          : xp >= 250
          ? 'Aura of Fellowship'
          : xp >= 50
          ? 'Beacon of Conviction'
          : 'Dormant Spark',
      tier: xp >= 750 ? 'Celestial' : xp >= 500 ? 'Ascended' : xp >= 250 ? 'Epic' : xp >= 50 ? 'Rare' : 'Initiate',
      unlocked: xp >= 250,
      perk:
        xp >= 750
          ? 'Infinite Generational Legacy'
          : xp >= 500
          ? 'Magnifies Collective Influence'
          : xp >= 250
          ? 'Empowers All Collaborative Allies'
          : xp >= 50
          ? 'Ignites Clear Internal Conviction'
          : 'Inner Calling Dormant in Heart',
      lore:
        xp >= 750
          ? 'The immortal burning embers of a purpose lived with totality, echoing long after this life concludes.'
          : xp >= 500
          ? 'A covenant relic that magnetically attracts honest patrons, collaborators, and visionary investors.'
          : xp >= 250
          ? 'An ambient aura that inspires courage in team members and dissolves toxic room politics.'
          : xp >= 50
          ? 'A spark of internal divine fire that reignites passion during late-night debugging and drafting.'
          : 'A dormant ember waiting for faith and focused action to blow it into flame.',
    },
  ];
}

const CHAPTER_METADATA = [
  { chapter: 1, week: 'Week 1', title: 'The Awakening', focus: 'Foundational Ikigai grounding and daily disciplines', targetXp: 250 },
  { chapter: 2, week: 'Week 2', title: 'The Forge of Craft', focus: 'Deep technical sprints and prototype construction', targetXp: 500 },
  { chapter: 3, week: 'Week 3', title: 'The Trial of Impact', focus: 'Direct public release, outreach, and user trials', targetXp: 750 },
  { chapter: 4, week: 'Week 4', title: 'Sovereign Dominion', focus: 'High-leverage monetization and celestial ascension', targetXp: 1000 },
];

export default function App() {
  const [view, setView] = useState<View>('alterego');

  // AlterEgo inputs (FR-1.0)
  const [passion, setPassion] = useState('');
  const [skill, setSkill] = useState('');
  const [worldNeed, setWorldNeed] = useState('');
  const [monetization, setMonetization] = useState('');

  // Character Sheet State (FR-2.0, FR-3.0 & FR-3.2)
  const [alterEgoResult, setAlterEgoResult] = useState<AlterEgoResult | null>(() => {
    try {
      const saved = localStorage.getItem('alterego_blueprint');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Current Chapter (1 to 4)
  const [currentChapter, setCurrentChapter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alterego_chapter');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Chapter Start Timestamp (FR-3.3: 7-Day Time-Lock)
  const [chapterStartedAt, setChapterStartedAt] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alterego_chapter_start');
      return saved ? parseInt(saved, 10) : Date.now();
    } catch {
      return Date.now();
    }
  });

  // Prior completed chapters base XP (250 XP per completed chapter)
  const [priorChaptersXp, setPriorChaptersXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alterego_prior_xp');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Completed Quests IDs
  const [completedQuestIds, setCompletedQuestIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('alterego_completed_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sovereign Pass (Pro Status) State (FR-5.0)
  const [isSovereignPro, setIsSovereignPro] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alterego_sovereign_pro') === 'true';
    } catch {
      return false;
    }
  });

  // Modals
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showShareCardModal, setShowShareCardModal] = useState<boolean>(false);
  const [showDailyAffirmationModal, setShowDailyAffirmationModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showServicesHubModal, setShowServicesHubModal] = useState<boolean>(false);

  // Daily Alignment Streak & Purpose Affirmation State
  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alterego_daily_streak');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [lastClaimedDate, setLastClaimedDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem('alterego_last_claimed_date');
    } catch {
      return null;
    }
  });
  const [dailyBonusXp, setDailyBonusXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alterego_daily_bonus_xp');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const todayDateStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = lastClaimedDate === todayDateStr;
  const todayAffirmation = getTodayAffirmation(alterEgoResult?.biblical_archetype?.name);

  const handleClaimDailyAlignment = () => {
    if (hasClaimedToday) return;

    let nextStreak = 1;
    if (lastClaimedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastClaimedDate === yesterdayStr) {
        nextStreak = dailyStreak + 1;
      } else if (lastClaimedDate === todayDateStr) {
        nextStreak = dailyStreak;
      } else {
        nextStreak = 1;
      }
    } else {
      nextStreak = 1;
    }

    const newBonusXp = dailyBonusXp + 25;
    setDailyStreak(nextStreak);
    setLastClaimedDate(todayDateStr);
    setDailyBonusXp(newBonusXp);

    try {
      localStorage.setItem('alterego_daily_streak', nextStreak.toString());
      localStorage.setItem('alterego_last_claimed_date', todayDateStr);
      localStorage.setItem('alterego_daily_bonus_xp', newBonusXp.toString());
    } catch {}

    soundEngine.playCelestialChime();
    setCloudNotice(`🔥 Day ${nextStreak} Divine Alignment Claimed! +25 Season XP Earned.`);
    setTimeout(() => setCloudNotice(null), 4000);

    if (currentUser?.uid && alterEgoResult) {
      void syncCurrentStateToCloud(currentUser.uid);
    }
  };

  // Morning Notification Banner & Scheduler State
  const [showMorningBanner, setShowMorningBanner] = useState<boolean>(false);
  const [morningNotificationAffirmation, setMorningNotificationAffirmation] = useState(todayAffirmation);

  // Sync todayAffirmation if archetype changes
  useEffect(() => {
    setMorningNotificationAffirmation(todayAffirmation);
  }, [todayAffirmation]);

  // 1. Listen for in-app morning notification event (from test button, manual triggers, or timer)
  useEffect(() => {
    const handleMorningAlertEvent = (event: any) => {
      if (event?.detail?.affirmation) {
        setMorningNotificationAffirmation(event.detail.affirmation);
      } else {
        setMorningNotificationAffirmation(todayAffirmation);
      }
      setShowMorningBanner(true);
    };

    window.addEventListener('alterego-morning-alert', handleMorningAlertEvent);
    return () => {
      window.removeEventListener('alterego-morning-alert', handleMorningAlertEvent);
    };
  }, [todayAffirmation]);

  // 2. Active Clock Checker for Daily Morning Notification (runs every 20 seconds)
  useEffect(() => {
    const checkMorningNotificationTime = () => {
      try {
        const settings = getNotificationSettings();
        if (!settings.enabled) return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        const targetTimeStr = settings.time || '08:00';

        // Trigger if notification not yet dispatched today and time has arrived or passed
        if (settings.lastNotifiedDate !== todayDateStr && currentTimeStr >= targetTimeStr) {
          const currentAffirmation = getTodayAffirmation(alterEgoResult?.biblical_archetype?.name);
          void sendAffirmationNotification(
            currentAffirmation.title,
            `${currentAffirmation.affirmation} (${currentAffirmation.anchorVerse.reference})`,
            {
              affirmation: currentAffirmation,
              playAudio: settings.sound,
            }
          );
          saveNotificationSettings({ ...settings, lastNotifiedDate: todayDateStr });
        }
      } catch (err) {
        console.error('Morning notification check failed:', err);
      }
    };

    // Immediate check on mount/state update
    checkMorningNotificationTime();

    // Regular interval
    const intervalId = setInterval(checkMorningNotificationTime, 20000);
    return () => clearInterval(intervalId);
  }, [alterEgoResult, todayDateStr]);

  // Firebase Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  // Developer Mode (Access restricted to Owner/Dev)
  // Activated by:
  // 1) Logged in as owner martorefe@gmail.com
  // 2) URL query param ?dev=true or ?admin=true (persisted in localStorage)
  // 3) Keyboard shortcut Ctrl+Shift+D / Cmd+Shift+D
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dev') === 'true' || urlParams.get('admin') === 'true') {
          localStorage.setItem('alterego_dev_mode', 'true');
          return true;
        }
        return localStorage.getItem('alterego_dev_mode') === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });
  const [devModeNotice, setDevModeNotice] = useState<string | null>(null);

  // Auto-enable Developer Mode if authenticated user is the project owner
  useEffect(() => {
    if (currentUser?.email === 'martorefe@gmail.com' && !isDevMode) {
      setIsDevMode(true);
      try {
        localStorage.setItem('alterego_dev_mode', 'true');
      } catch {}
    }
  }, [currentUser, isDevMode]);

  // Keyboard shortcut listener for Ctrl+Shift+D / Cmd+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleDevMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDevMode = () => {
    setIsDevMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem('alterego_dev_mode', 'true');
        } else {
          localStorage.removeItem('alterego_dev_mode');
          setView('alterego'); // Always ensure view returns to AlterEgo when locking dev mode
        }
      } catch {}
      setDevModeNotice(
        next
          ? '🛠️ Developer Mode Enabled: Midnight Studio, PRD v1.3 & Services Hub Active'
          : '🔒 Public Mode Active: Developer Tools Hidden'
      );
      setTimeout(() => setDevModeNotice(null), 4000);
      return next;
    });
  };

  // Pro Task Copilot State (FR-5.0: Task Drafting & Physical Playbooks)
  const [showCopilotModal, setShowCopilotModal] = useState<boolean>(false);
  const [copilotTask, setCopilotTask] = useState<string>('');
  const [copilotCustomInput, setCopilotCustomInput] = useState<string>('');
  const [copilotResult, setCopilotResult] = useState<TaskCopilotResult | null>(null);
  const [loadingCopilot, setLoadingCopilot] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [copiedPlaybook, setCopiedPlaybook] = useState<boolean>(false);

  // Support & Resend Email Form
  const [supportSenderEmail, setSupportSenderEmail] = useState<string>('');
  const [supportCategory, setSupportCategory] = useState<string>('Divine Purpose & Guidance');
  const [supportSubject, setSupportSubject] = useState<string>('');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportSending, setSupportSending] = useState<boolean>(false);
  const [supportSentSuccess, setSupportSentSuccess] = useState<{
    success: boolean;
    mode: 'live' | 'simulated';
    messageId?: string;
    note?: string;
  } | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSent, setSupportSent] = useState<boolean>(false);

  // Paystack Checkout State
  const [paystackEmail, setPaystackEmail] = useState<string>('martorefe@gmail.com');
  const [paystackLoading, setPaystackLoading] = useState<boolean>(false);
  const [paystackMessage, setPaystackMessage] = useState<string | null>(null);
  const [paystackCurrency, setPaystackCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [paystackAuthUrl, setPaystackAuthUrl] = useState<string | null>(null);

  // SceneSwap Party Lobby State (FR-1.0)
  const [partyPlayers, setPartyPlayers] = useState<string[]>(['Amaka', 'Tunde', 'Chioma']);
  const [newPlayerInput, setNewPlayerInput] = useState<string>('');
  const [playerInputError, setPlayerInputError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('Nollywood Drama');
  const [selectedTone, setSelectedTone] = useState<string>('Explosive & Theatrical');
  const [wildcardHook, setWildcardHook] = useState<string>('');

  // SceneSwap Custom Player Photo Avatars
  const [playerCustomPhotos, setPlayerCustomPhotos] = useState<Record<string, string>>(() => getStoredCustomAvatars());
  const playerPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [activePhotoUploadPlayer, setActivePhotoUploadPlayer] = useState<string | null>(null);

  // SceneSwap Multi-Branch Engine & Teleprompter State (FR-2.0 & FR-3.0)
  const [activeChapter, setActiveChapter] = useState<SceneSwapChapterResult | null>(null);
  const [chapterHistory, setChapterHistory] = useState<Array<{
    chapter: SceneSwapChapterResult;
    chosenChoice?: SceneSwapPlotChoice;
  }>>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isTeleprompterView, setIsTeleprompterView] = useState<boolean>(true);
  const [activeScriptMode, setActiveScriptMode] = useState<'comic' | 'studio'>('comic');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [voteCounts, setVoteCounts] = useState<{ A: number; B: number; C: number }>({ A: 0, B: 0, C: 0 });
  const [selectedVoteId, setSelectedVoteId] = useState<'A' | 'B' | 'C' | null>(null);
  const [isBranchingChapter, setIsBranchingChapter] = useState<boolean>(false);
  const [copiedDirectorsCut, setCopiedDirectorsCut] = useState<boolean>(false);

  // Status & error handling (EC-1.1)
  const [processing, setProcessing] = useState<View | null>(null);
  const [advancingChapter, setAdvancingChapter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Time-Lock Calculation (7 Days in MS = 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const timeElapsedInChapter = now - chapterStartedAt;
  const timeRemainingInChapter = Math.max(0, SEVEN_DAYS_MS - timeElapsedInChapter);
  const isTimeLocked = !isSovereignPro && timeRemainingInChapter > 0;

  const daysLeft = Math.floor(timeRemainingInChapter / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeRemainingInChapter % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemainingInChapter % (1000 * 60 * 60)) / (1000 * 60));

  // Firebase Auth listener and Firestore boot test
  useEffect(() => {
    void testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudData = await loadUserAlterEgoData(user.uid);
          if (cloudData && cloudData.alterEgoResult) {
            setAlterEgoResult(cloudData.alterEgoResult);
            setCurrentChapter(cloudData.currentChapter || 1);
            setChapterStartedAt(cloudData.chapterStartedAt || Date.now());
            setPriorChaptersXp(cloudData.priorChaptersXp || 0);
            setCompletedQuestIds(cloudData.completedQuestIds || []);
            if (cloudData.isSovereignPro) {
              setIsSovereignPro(true);
              localStorage.setItem('alterego_sovereign_pro', 'true');
            }
            if (cloudData.dailyStreak) {
              setDailyStreak(cloudData.dailyStreak);
              localStorage.setItem('alterego_daily_streak', cloudData.dailyStreak.toString());
            }
            if (cloudData.lastClaimedAffirmationDate) {
              setLastClaimedDate(cloudData.lastClaimedAffirmationDate);
              localStorage.setItem('alterego_last_claimed_date', cloudData.lastClaimedAffirmationDate);
            }
            if (cloudData.dailyBonusXp) {
              setDailyBonusXp(cloudData.dailyBonusXp);
              localStorage.setItem('alterego_daily_bonus_xp', cloudData.dailyBonusXp.toString());
            }
            setLastSyncedAt(cloudData.updatedAt || new Date().toISOString());
            setCloudNotice('Character dossier restored from Firebase Firestore!');
            setTimeout(() => setCloudNotice(null), 4000);
          } else {
            const savedBlueprint = localStorage.getItem('alterego_blueprint');
            if (savedBlueprint) {
              void syncCurrentStateToCloud(user.uid);
            }
          }
        } catch (err) {
          console.error('Error fetching cloud data on login:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  async function syncCurrentStateToCloud(uidOverride?: string) {
    const uid = uidOverride || currentUser?.uid;
    if (!uid) return;
    setIsSyncingCloud(true);
    try {
      await saveUserAlterEgoData(uid, {
        alterEgoResult,
        currentChapter,
        chapterStartedAt,
        priorChaptersXp,
        completedQuestIds,
        isSovereignPro,
        dailyStreak,
        lastClaimedAffirmationDate: lastClaimedDate || undefined,
        dailyBonusXp,
      });
      const nowIso = new Date().toISOString();
      setLastSyncedAt(nowIso);
      setCloudNotice('Saved to Firebase Firestore');
      setTimeout(() => setCloudNotice(null), 3000);
    } catch (err) {
      console.error('Failed to sync to Firestore:', err);
    } finally {
      setIsSyncingCloud(false);
    }
  }

  // Sync to localStorage & Firebase
  useEffect(() => {
    if (alterEgoResult) {
      try {
        localStorage.setItem('alterego_blueprint', JSON.stringify(alterEgoResult));
      } catch {
        // Ignored
      }
      if (currentUser?.uid) {
        void syncCurrentStateToCloud(currentUser.uid);
      }
    }
  }, [alterEgoResult]);

  useEffect(() => {
    try {
      localStorage.setItem('alterego_chapter', currentChapter.toString());
      localStorage.setItem('alterego_chapter_start', chapterStartedAt.toString());
      localStorage.setItem('alterego_prior_xp', priorChaptersXp.toString());
      localStorage.setItem('alterego_completed_quests', JSON.stringify(completedQuestIds));
      localStorage.setItem('alterego_sovereign_pro', isSovereignPro.toString());
    } catch {
      // Ignored
    }
    if (currentUser?.uid && alterEgoResult) {
      void syncCurrentStateToCloud(currentUser.uid);
    }
  }, [currentChapter, chapterStartedAt, priorChaptersXp, completedQuestIds, isSovereignPro]);

  // Check for Paystack redirect callback params (?reference=... or ?trxref=...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('reference') || urlParams.get('trxref');
      if (ref) {
        setShowProModal(true);
        void handleVerifyPaystackPayment(ref);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Validation rules (FR-1.0 & EC-1.2)
  const passionClean = passion.trim();
  const skillClean = skill.trim();
  const worldNeedClean = worldNeed.trim();
  const monetizationClean = monetization.trim();

  const isPassionValid = passionClean.length >= 20;
  const isSkillValid = skillClean.length >= 20;
  const isWorldNeedValid = worldNeedClean.length >= 20;
  const isMonetizationValid = monetizationClean.length >= 20;

  const isAlterEgoValid =
    isPassionValid && isSkillValid && isWorldNeedValid && isMonetizationValid;

  // Active Chapter Quests & Current Season XP calculation
  const activeQuests = alterEgoResult?.weekly_quests || [];
  const currentChapterXp = activeQuests.reduce((acc, quest) => {
    return completedQuestIds.includes(quest.id) ? acc + quest.points : acc;
  }, 0);

  const totalSeasonXp = Math.min(1000, priorChaptersXp + currentChapterXp + dailyBonusXp);
  const totalSeasonCap = 1000;
  const seasonPercentage = Math.min(100, Math.round((totalSeasonXp / totalSeasonCap) * 100));

  // Check if all quests in current chapter are complete
  const allCurrentQuestsDone =
    activeQuests.length > 0 && activeQuests.every((q) => completedQuestIds.includes(q.id));

  // Season Rank Tiers (FR-3.2: 1,000 XP Season)
  function getCharacterRank(xp: number) {
    if (xp >= 750) return { title: 'Divine Sovereign', level: 'MAX', color: 'from-amber-400 to-yellow-300' };
    if (xp >= 500) return { title: 'Sovereign Vanguard', level: '4', color: 'from-purple-400 to-amber-300' };
    if (xp >= 250) return { title: 'Kingdom Artisan', level: '3', color: 'from-purple-400 to-indigo-300' };
    if (xp >= 50) return { title: 'Awakened Seeker', level: '2', color: 'from-indigo-400 to-cyan-300' };
    return { title: 'Novice Initiate', level: '1', color: 'from-slate-400 to-slate-200' };
  }

  const rank = getCharacterRank(totalSeasonXp);
  const gearLoadout = getGearLoadout(totalSeasonXp);
  const activeChapterMeta = CHAPTER_METADATA.find((c) => c.chapter === currentChapter) || CHAPTER_METADATA[0];

  // Submit AlterEgo with 8000ms timeout safeguard (EC-1.1)
  async function handleAlterEgo(e: FormEvent) {
    e.preventDefault();
    if (!isAlterEgoValid || processing) return;

    setErrorMessage(null);
    setProcessing('alterego');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/alterego', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passion: passionClean,
          skill: skillClean,
          worldNeed: worldNeedClean,
          monetization: monetizationClean,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('API failure');
      const data: AlterEgoResult = await res.json();
      setAlterEgoResult(data);
      setCurrentChapter(1);
      setChapterStartedAt(Date.now());
      setPriorChaptersXp(0);
      setCompletedQuestIds([]);
    } catch {
      clearTimeout(timeoutId);
      setErrorMessage(
        'The heavens are busy writing your scroll. Please verify your internet connection and try again.'
      );
    } finally {
      setProcessing(null);
    }
  }

  // Toggle Quest Checkbox (FR-3.0)
  function toggleQuest(questId: number) {
    const isCompleted = completedQuestIds.includes(questId);
    if (!isCompleted) {
      playQuestCompleteChime();
      triggerHapticFeedback();
      setCompletedQuestIds([...completedQuestIds, questId]);
    } else {
      setCompletedQuestIds(completedQuestIds.filter((id) => id !== questId));
    }
  }

  // Advance Chapter (FR-3.2 & FR-3.3: 4-Week Journey & Time-Lock)
  async function handleAdvanceChapter() {
    if (!alterEgoResult || currentChapter >= 4 || advancingChapter) return;
    if (isTimeLocked) {
      setShowProModal(true);
      return;
    }

    setAdvancingChapter(true);
    setErrorMessage(null);

    try {
      const nextChapterNum = currentChapter + 1;
      const res = await fetch('/api/alterego/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: nextChapterNum,
          rpg_class: alterEgoResult.rpg_class,
          decoded_purpose: alterEgoResult.decoded_purpose,
          biblical_archetype: alterEgoResult.biblical_archetype.name,
        }),
      });

      if (!res.ok) throw new Error('Chapter advance error');
      const data = await res.json();

      playQuestCompleteChime();
      triggerHapticFeedback();

      // Accumulate past chapter points and reset 7-day timer
      setPriorChaptersXp((prev) => prev + 250);
      setCurrentChapter(nextChapterNum);
      setChapterStartedAt(Date.now());
      setAlterEgoResult((prev) => (prev ? { ...prev, weekly_quests: data.quests } : null));
    } catch {
      setErrorMessage('Could not load next chapter. Please try again.');
    } finally {
      setAdvancingChapter(false);
    }
  }

  // Fast-Forward Time (For Testing / Pro User Bypass)
  function fastForwardSevenDays() {
    // Set timestamp to 8 days ago
    setChapterStartedAt(Date.now() - (SEVEN_DAYS_MS + 1000));
  }

  // Pro Task Copilot Launch Handler (FR-5.0)
  async function handleLaunchTaskCopilot(taskDescription: string) {
    if (!alterEgoResult) return;
    const taskToRun = taskDescription.trim();
    if (!taskToRun) return;

    setCopilotTask(taskToRun);
    setCopilotCustomInput(taskToRun);
    setShowCopilotModal(true);
    setCopiedDraft(false);
    setCopiedPlaybook(false);

    if (!isSovereignPro) {
      setLoadingCopilot(false);
      return;
    }

    setLoadingCopilot(true);

    try {
      const res = await fetch('/api/alterego/task-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskToRun,
          rpg_class: alterEgoResult.rpg_class,
          decoded_purpose: alterEgoResult.decoded_purpose,
        }),
      });

      if (!res.ok) throw new Error('Copilot error');
      const data: TaskCopilotResult = await res.json();
      setCopilotResult(data);
    } catch {
      const isPhysical = /team|organize|recruit|meet|call|physical|people|venue|workshop|setup|host/i.test(taskToRun);
      setCopilotResult({
        task_type: isPhysical ? 'Physical & Organizational Playbook' : 'Drafting & Written Strategy',
        summary: `Execute "${taskToRun}" with structured operational excellence.`,
        execution_steps: [
          'Step 1 (Architecture): Define 3 core milestones & assign single-owner responsibilities.',
          'Step 2 (Outreach): Send the tailored collaboration draft to 2-3 trusted allies.',
          'Step 3 (Logistics): Secure the physical or digital meeting room; share the agenda 24 hours ahead.',
          'Step 4 (Sprint Cadence): Run a 30-minute kickoff and establish weekly accountability.',
        ],
        physical_checklist: [
          'Team Roles: Team Catalyst, Operations Coordinator, Scribe',
          'Physical Logistics: Quiet meeting space, whiteboard/notebook, shared Google Doc',
          'Cadence: 30-min standing sync with documented takeaways',
        ],
        draft_template: `Subject: Strategic Action Plan: ${taskToRun.slice(0, 45)}...\n\nHi [Name],\n\nI am currently driving forward a key milestone: "${taskToRun}".\n\nGiven your exceptional strength in [Their Skill], I would value having you as a foundational partner on this initiative. The objective is to achieve tangible progress while establishing clear structural accountability.\n\nCould we connect this week for a brief 20-minute alignment sync?\n\nBest regards,\n[Your Name] - ${alterEgoResult.rpg_class}`,
        leadership_tip: 'Nehemiah rebuilt the walls by assigning each family to the portion directly before their house. Delegation with personal ownership creates unstoppable momentum.',
      });
    } finally {
      setLoadingCopilot(false);
    }
  }

  // Add player chip with validation (FR-1.0: 2-5 players, max 12 chars)
  function handleAddPartyPlayer() {
    setPlayerInputError(null);
    const cleaned = newPlayerInput.trim();
    if (!cleaned) return;
    if (cleaned.length > 12) {
      setPlayerInputError('Player name cannot exceed 12 characters');
      return;
    }
    if (partyPlayers.some((p) => p.toLowerCase() === cleaned.toLowerCase())) {
      setPlayerInputError(`"${cleaned}" is already in the cast!`);
      return;
    }
    if (partyPlayers.length >= 5) {
      setPlayerInputError('Maximum 5 players allowed in party lobby');
      return;
    }
    setPartyPlayers([...partyPlayers, cleaned]);
    setNewPlayerInput('');
    soundEngine.playDialogueBlip(1.3);
  }

  function handleRemovePartyPlayer(indexToRemove: number) {
    setPlayerInputError(null);
    if (partyPlayers.length <= 2) {
      setPlayerInputError('A minimum of 2 players is required for multi-character scripts');
      return;
    }
    setPartyPlayers(partyPlayers.filter((_, idx) => idx !== indexToRemove));
    soundEngine.playDialogueBlip(0.8);
  }

  function handleApplyPlayerPreset(preset: string[]) {
    setPlayerInputError(null);
    setPartyPlayers([...preset]);
    soundEngine.playDialogueBlip(1.1);
  }

  function handleTriggerUploadPhoto(playerName: string) {
    setActivePhotoUploadPlayer(playerName);
    playerPhotoInputRef.current?.click();
  }

  async function handlePlayerPhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activePhotoUploadPlayer) return;
    try {
      const dataUrl = await compressImageFile(file, 400, 0.85);
      setStoredCustomAvatar(activePhotoUploadPlayer, dataUrl);
      setPlayerCustomPhotos((prev) => ({
        ...prev,
        [activePhotoUploadPlayer.toLowerCase()]: dataUrl,
      }));
      soundEngine.playDialogueBlip(1.3);
    } catch (err) {
      console.warn('Failed to compress/save photo:', err);
    } finally {
      if (e.target) e.target.value = '';
      setActivePhotoUploadPlayer(null);
    }
  }

  function handleUpdateCustomPhotoFromStage(playerName: string, dataUrl: string) {
    setPlayerCustomPhotos((prev) => ({
      ...prev,
      [playerName.toLowerCase()]: dataUrl,
    }));
  }

  function handleRollWildcardHook() {
    const genreObj = GENRE_OPTIONS.find((g) => g.id === selectedGenre) || GENRE_OPTIONS[0];
    const hooks = genreObj.sampleHooks;
    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    setWildcardHook(randomHook);
    soundEngine.playComedicBoing();
  }

  // SceneSwap Start Shoot (FR-2.0: Chapter 1 Generation)
  async function handleStartPartyShoot(e?: FormEvent) {
    if (e) e.preventDefault();
    if (processing || partyPlayers.length < 2) return;

    setErrorMessage(null);
    setProcessing('sceneswap');
    soundEngine.playSuspenseSting();

    try {
      const res = await fetch('/api/sceneswap/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: partyPlayers,
          genre: selectedGenre,
          tone: selectedTone,
          wildcardHook: wildcardHook.trim(),
          chapterNumber: 1,
        }),
      });

      if (!res.ok) throw new Error('SceneSwap shoot failed');
      const data: SceneSwapChapterResult = await res.json();

      // Reset and lock character visual bible for consistency across all acts
      clearStoredVisualBible();
      lockOrGetCharacterVisualBible(data.cast, selectedGenre, playerCustomPhotos);

      setActiveChapter(data);
      setChapterHistory([]);
      setCurrentLineIndex(0);
      setVoteCounts({ A: 0, B: 0, C: 0 });
      setSelectedVoteId(null);
      setIsTeleprompterView(true);
      playQuestCompleteChime();
      triggerHapticFeedback();
      soundEngine.playAudioCueForText(data.audio_cue);
    } catch {
      setErrorMessage('The scene director encountered a blackout. Please verify your connection and try again.');
    } finally {
      setProcessing(null);
    }
  }

  // Vote on Choice (FR-3.0)
  function handleVoteChoice(choiceId: 'A' | 'B' | 'C') {
    playQuestCompleteChime();
    triggerHapticFeedback();
    setSelectedVoteId(choiceId);
    setVoteCounts((prev) => ({
      ...prev,
      [choiceId]: prev[choiceId] + 1,
    }));
    soundEngine.playDialogueBlip(0.9);
  }

  // Lock In Vote and Branch to Next Act (FR-2.0 & FR-3.0)
  async function handleLockInVoteAndBranch() {
    if (!activeChapter || isBranchingChapter) return;

    // Pick highest voted choice or selected choice or first choice
    let chosenId: 'A' | 'B' | 'C' = selectedVoteId || 'A';
    const highestVote = Math.max(voteCounts.A, voteCounts.B, voteCounts.C);
    if (highestVote > 0) {
      if (voteCounts.A === highestVote) chosenId = 'A';
      else if (voteCounts.B === highestVote) chosenId = 'B';
      else if (voteCounts.C === highestVote) chosenId = 'C';
    }

    const chosenOption = activeChapter.plot_choices.find((c) => c.id === chosenId) || activeChapter.plot_choices[0];
    const nextChapterNumber = activeChapter.chapter_number + 1;

    setIsBranchingChapter(true);
    setErrorMessage(null);
    soundEngine.playVineBoom();

    try {
      const newHistoryItem = {
        chapter: activeChapter,
        chosenChoice: chosenOption,
      };
      const updatedHistory = [...chapterHistory, newHistoryItem];

      const res = await fetch('/api/sceneswap/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: partyPlayers,
          genre: selectedGenre,
          tone: selectedTone,
          chapterNumber: nextChapterNumber,
          chosenChoice: chosenOption,
          priorChaptersSummary: updatedHistory.map((h) => ({
            chapterNumber: h.chapter.chapter_number,
            title: h.chapter.chapter_title,
            chosenChoiceLabel: h.chosenChoice?.label,
          })),
        }),
      });

      if (!res.ok) throw new Error('Branch generation failed');
      const nextChapterData: SceneSwapChapterResult = await res.json();

      setChapterHistory(updatedHistory);
      setActiveChapter(nextChapterData);
      setCurrentLineIndex(0);
      setVoteCounts({ A: 0, B: 0, C: 0 });
      setSelectedVoteId(null);
      setIsTeleprompterView(true);
      playQuestCompleteChime();
      triggerHapticFeedback();
      if (nextChapterData.is_finale) {
        soundEngine.playApplause();
      } else {
        soundEngine.playAudioCueForText(nextChapterData.audio_cue);
      }
    } catch {
      setErrorMessage('Failed to roll next scene branch. Please try again.');
    } finally {
      setIsBranchingChapter(false);
    }
  }

  function handleResetPartyShoot() {
    setActiveChapter(null);
    setChapterHistory([]);
    setCurrentLineIndex(0);
    setVoteCounts({ A: 0, B: 0, C: 0 });
    setSelectedVoteId(null);
  }

  // Copy Full Director's Cut Screenplay (All Acts)
  function handleCopyDirectorsCut() {
    if (!activeChapter) return;
    const allActs = [...chapterHistory.map((h) => h.chapter), activeChapter];

    let scriptDoc = `========================================================\n`;
    scriptDoc += `🎬 SCENESWAP DIRECTOR'S CUT SCREENPLAY\n`;
    scriptDoc += `GENRE: ${selectedGenre.toUpperCase()} (${selectedTone})\n`;
    scriptDoc += `CAST OF CHARACTERS:\n`;
    activeChapter.cast.forEach((c) => {
      scriptDoc += `  • ${c.player.toUpperCase()} as ${c.role} (${c.archetype})\n    Motivation: ${c.motivation}${c.secret ? ` | Secret: ${c.secret}` : ''}\n`;
    });
    scriptDoc += `========================================================\n\n`;

    allActs.forEach((act, actIdx) => {
      scriptDoc += `--------------------------------------------------------\n`;
      scriptDoc += `ACT ${act.chapter_number}: ${act.chapter_title.toUpperCase()}\n`;
      scriptDoc += `SETTING: ${act.setting_description}\n`;
      scriptDoc += `AUDIO CUE: ${act.audio_cue}\n`;
      scriptDoc += `--------------------------------------------------------\n\n`;

      act.script_lines.forEach((line) => {
        scriptDoc += `${line.speaker.toUpperCase()}`;
        if (line.direction) scriptDoc += ` ${line.direction}`;
        scriptDoc += `:\n"${line.line}"\n\n`;
      });

      const historyEntry = chapterHistory[actIdx];
      if (historyEntry?.chosenChoice) {
        scriptDoc += `[GROUP VOTE RESULT ➔ ${historyEntry.chosenChoice.label}: ${historyEntry.chosenChoice.description}]\n\n`;
      }
    });

    if (activeChapter.is_finale && activeChapter.finale_summary) {
      scriptDoc += `========================================================\n`;
      scriptDoc += `🏆 THE GRAND FINALE RESOLUTION:\n`;
      scriptDoc += `${activeChapter.finale_summary}\n`;
      scriptDoc += `========================================================\n`;
    }

    navigator.clipboard.writeText(scriptDoc);
    setCopiedDirectorsCut(true);
    triggerHapticFeedback();
    setTimeout(() => setCopiedDirectorsCut(false), 2500);
  }

  function fillSampleAlterEgoTech() {
    setPassion('Writing clean scalable code, designing immersive interfaces, and mentoring younger devs.');
    setSkill('Full-stack engineering, system architecture, database optimization, and high-tempo debugging.');
    setWorldNeed('Directional clarity for youth in emerging markets and ethical AI tools that dignify labor.');
    setMonetization('Enterprise technical consulting, high-leverage SaaS products, and bespoke creator tools.');
  }

  function fillSampleAlterEgoKingdom() {
    setPassion('Building spiritual communities, strategic leadership, and creative storycrafting in Africa.');
    setSkill('Public speaking, executive operations, team building, and financial stewardship.');
    setWorldNeed('Ethical business leadership, structural integrity in institutions, and faith-driven innovation.');
    setMonetization('Executive advisory, high-impact venture building studios, and leadership accelerators.');
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetCharacterSheet() {
    setAlterEgoResult(null);
    setCurrentChapter(1);
    setChapterStartedAt(Date.now());
    setPriorChaptersXp(0);
    setCompletedQuestIds([]);
    try {
      localStorage.removeItem('alterego_blueprint');
      localStorage.removeItem('alterego_chapter');
      localStorage.removeItem('alterego_chapter_start');
      localStorage.removeItem('alterego_prior_xp');
      localStorage.removeItem('alterego_completed_quests');
    } catch {
      // Ignored
    }
  }

  async function handleSendSupportEmail(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportSending(true);
    setSupportError(null);
    setSupportSentSuccess(null);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: supportSenderEmail.trim() || undefined,
          category: supportCategory,
          subject: supportSubject.trim() || undefined,
          message: supportMessage.trim(),
          userClass: alterEgoResult?.rpg_class,
          chapter: currentChapter,
          seasonXp: totalSeasonXp,
          isPro: isSovereignPro,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email via Resend.');
      }

      setSupportSentSuccess({
        success: true,
        mode: data.mode || 'live',
        messageId: data.messageId,
        note: data.note,
      });
      playQuestCompleteChime();
      triggerHapticFeedback();
    } catch (err: any) {
      setSupportError(err?.message || 'Network error connecting to Resend service.');
    } finally {
      setSupportSending(false);
    }
  }

  // Paystack Sovereign Pass Checkout Handler
  async function handlePaystackCheckout() {
    if (!paystackEmail.trim() || !paystackEmail.includes('@')) {
      setPaystackMessage('Please enter a valid billing email address.');
      return;
    }

    setPaystackLoading(true);
    setPaystackMessage(null);

    // Amounts: ₦7,500 = 750,000 kobo, or $9.99 = 999 cents
    const amountInMinorUnits = paystackCurrency === 'NGN' ? 750000 : 999;
    const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY;

    try {
      // Step 1: Initialize transaction with backend endpoint
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: paystackEmail.trim(),
          amount: amountInMinorUnits,
          currency: paystackCurrency,
          callback_url: window.location.href.split('?')[0],
          metadata: {
            customer_name: alterEgoResult?.rpg_class || 'Operative',
            purpose: 'AlterEgo Sovereign Pass',
            user_class: alterEgoResult?.rpg_class,
            chapter: currentChapter,
          },
        }),
      });

      const initData = await initRes.json();
      const reference = initData?.data?.reference || `AE_${Date.now()}`;
      if (initData?.data?.authorization_url) {
        setPaystackAuthUrl(initData.data.authorization_url);
      }

      // Check if Paystack Inline JS popup is available and a public key is set
      const paystackInline = (window as any).PaystackPop;

      if (publicKey && paystackInline) {
        const handler = paystackInline.setup({
          key: publicKey,
          email: paystackEmail.trim(),
          amount: amountInMinorUnits,
          currency: paystackCurrency,
          ref: reference,
          metadata: {
            custom_fields: [
              {
                display_name: 'Pass Tier',
                variable_name: 'pass_tier',
                value: 'AlterEgo Sovereign Pass',
              },
            ],
          },
          callback: function (response: any) {
            void handleVerifyPaystackPayment(response?.reference || reference);
          },
          onClose: function () {
            setPaystackLoading(false);
            setPaystackMessage('Payment window was closed.');
          },
        });
        handler.openIframe();
      } else {
        // Developer Preview / Simulated Verification Mode (if no live key is provisioned yet)
        // Automatically completes verification so user can test the Pro upgrade experience seamlessly!
        await handleVerifyPaystackPayment(reference);
      }
    } catch (err: any) {
      setPaystackMessage(err?.message || 'Failed to initialize Paystack checkout.');
      setPaystackLoading(false);
    }
  }

  async function handleVerifyPaystackPayment(reference: string) {
    try {
      const verifyRes = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.status) {
        setIsSovereignPro(true);
        setPaystackMessage('Payment verified! Sovereign Pass is now active.');
        playQuestCompleteChime();
        triggerHapticFeedback();

        // Dispatch official Sovereign Pass receipt via Resend
        void fetch('/api/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerEmail: paystackEmail.trim(),
            customerName: currentUser?.displayName || alterEgoResult?.rpg_class || 'Operative',
            amount: paystackCurrency === 'NGN' ? '₦7,500' : '$9.99',
            currency: paystackCurrency,
            reference,
            userClass: alterEgoResult?.rpg_class,
            chapter: currentChapter,
          }),
        }).catch(console.warn);

        setTimeout(() => {
          setShowProModal(false);
          setPaystackMessage(null);
          if (copilotTask) {
            handleLaunchTaskCopilot(copilotTask);
          }
        }, 1200);
      } else {
        setPaystackMessage(verifyData.message || 'Payment verification failed.');
      }
    } catch (err: any) {
      setPaystackMessage(err?.message || 'Error verifying payment.');
    } finally {
      setPaystackLoading(false);
    }
  }

  const isProcessing = processing !== null;

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-950 px-0 sm:px-3 py-0 sm:py-6 selection:bg-purple-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/25 blur-[130px]" />
        <div className="absolute left-[15%] top-[10%] h-80 w-80 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute bottom-[8%] right-[14%] h-72 w-72 rounded-full bg-violet-500/15 blur-[90px]" />
        <div className="absolute top-[40%] right-[10%] h-48 w-48 rounded-full bg-pink-500/10 blur-[80px]" />
      </div>

      {/* Cyberpunk Midnight Phone Bezel Container (Desktop Preview Bezel, Edge-to-Edge on Mobile) */}
      <div className="relative w-full sm:w-[420px] max-w-full sm:rounded-[3rem] border-0 sm:border border-indigo-400/40 bg-black p-0 sm:p-[10px] sm:shadow-[0_0_40px_rgba(99,102,241,0.45),0_0_80px_rgba(168,85,247,0.28),inset_0_0_0_1px_rgba(167,139,250,0.25)] sm:ring-1 sm:ring-purple-400/30">
        <div className="relative flex h-svh sm:h-[790px] flex-col overflow-hidden rounded-none sm:rounded-[2.35rem] bg-gradient-to-b from-slate-950 via-[#0b0618] to-slate-950">
          {/* Top Speaker / Dynamic Island Notch (Only shown on Desktop Preview) */}
          <div className="hidden sm:flex absolute left-1/2 top-2 z-20 h-[22px] w-[124px] -translate-x-1/2 items-center justify-between rounded-full bg-black/90 px-3 shadow-[0_0_14px_rgba(99,102,241,0.35)]">
            <span className="h-2 w-2 rounded-full bg-indigo-500/60 ring-2 ring-indigo-400/20" />
            <span className="h-1.5 w-7 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Header & Quick Action Badges */}
          <div className="relative z-10 px-4 sm:px-5 pb-2 pt-4 sm:pt-7">
            <div className="flex items-center justify-between">
              {/* Overline brand: Pathfinder */}
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-indigo-300/80">
                  PATHFINDER
                </p>
                {isDevMode && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-950/70 px-1.5 py-0.2 text-[8px] font-mono text-purple-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
                    PRD v1.3
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Firebase Cloud Sync Button */}
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  title={currentUser ? `Cloud Sync Active (${currentUser.email})` : 'Save Character to Firebase Cloud'}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider transition cursor-pointer ${
                    currentUser
                      ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'border-indigo-400/30 bg-indigo-950/50 text-indigo-300 hover:border-indigo-400/60 hover:text-indigo-100'
                  }`}
                >
                  <Cloud className="h-2.5 w-2.5 text-emerald-400" />
                  <span className="truncate max-w-[55px]">
                    {currentUser ? (currentUser.email ? currentUser.email.split('@')[0] : 'SAVED') : 'CLOUD'}
                  </span>
                </button>

                {/* Daily Purpose Decree & Alignment Streak Button */}
                <button
                  type="button"
                  onClick={() => setShowDailyAffirmationModal(true)}
                  title={`Daily Divine Alignment • ${dailyStreak} Day Streak`}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-950/60 px-2 py-0.5 text-[9px] font-bold text-orange-300 hover:border-orange-400 hover:text-orange-200 transition cursor-pointer shadow-[0_0_8px_rgba(249,115,22,0.25)]"
                >
                  <Flame className="h-2.5 w-2.5 text-orange-400 animate-pulse" />
                  <span>{dailyStreak > 0 ? `${dailyStreak}D` : 'DECREE'}</span>
                </button>

                {/* Sovereign Pass Pro Badge (FR-5.0) */}
                <button
                  type="button"
                  onClick={() => setShowProModal(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider transition cursor-pointer ${
                    isSovereignPro
                      ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-amber-300'
                  }`}
                >
                  <Crown className="h-2.5 w-2.5 text-amber-400" />
                  {isSovereignPro ? 'PRO ACTIVE' : 'UPGRADE PRO'}
                </button>

                {/* Support Email Button (FR-4.0) */}
                <button
                  type="button"
                  onClick={() => setShowSupportModal(true)}
                  title="Contact Support (martorefe@gmail.com)"
                  className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-400 hover:border-indigo-400/40 hover:text-indigo-200 transition cursor-pointer"
                >
                  <Mail className="h-3 w-3" />
                </button>

                {/* Developer Mode Only: Launch Services Hub (2.A Auth, 2.B Paystack, 2.C Email) */}
                {isDevMode && (
                  <button
                    type="button"
                    onClick={() => setShowServicesHubModal(true)}
                    title="Developer Mode: Launch Services Hub (Firebase Auth, Paystack & Resend)"
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[9px] font-bold text-cyan-300 hover:border-cyan-400 hover:text-cyan-100 transition cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                  >
                    <Zap className="h-2.5 w-2.5 text-cyan-400" />
                    <span>SERVICES</span>
                  </button>
                )}
              </div>
            </div>

            {/* Official App Title: AlterEgo.RPG */}
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 via-purple-500/25 to-amber-500/20 border border-indigo-400/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                  <Compass className="h-4 w-4 text-indigo-300" />
                </div>
                <h1
                  title="AlterEgo.RPG • Pathfinder"
                  className="flex items-baseline gap-0.5 select-none text-xl font-black tracking-tight"
                >
                  <span className="bg-gradient-to-r from-indigo-100 via-white to-purple-200 bg-clip-text text-transparent">
                    AlterEgo
                  </span>
                  <span className="text-purple-400 font-black">.</span>
                  <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent tracking-wider">
                    RPG
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {/* View Switcher: AlterEgo RPG vs SceneSwap Studio */}
                <div className="flex rounded-xl border border-white/15 bg-white/10 p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setView('alterego');
                      soundEngine.playDialogueBlip(1.0);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      view === 'alterego'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="h-3 w-3" />
                    <span>AlterEgo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView('sceneswap');
                      soundEngine.playDialogueBlip(1.2);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      view === 'sceneswap'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clapperboard className="h-3 w-3" />
                    <span>SceneSwap</span>
                  </button>
                </div>

                {/* PWA Install Button */}
                <PWAInstallButton />

                {isDevMode && (
                  <button
                    type="button"
                    onClick={toggleDevMode}
                    title="Developer Mode Active • Click to switch to Public Mode"
                    className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-400/20 transition cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    DEV MODE
                  </button>
                )}
              </div>
            </div>

            {/* Developer Mode Notification Toast */}
            {devModeNotice && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/80 py-1 px-2.5 text-[10px] font-medium text-amber-300 animate-fade-in shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">{devModeNotice}</span>
              </div>
            )}

            {/* Cloud Sync Status Toast */}
            {cloudNotice && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/70 py-1 px-2.5 text-[10px] font-medium text-emerald-300 animate-fade-in shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">{cloudNotice}</span>
              </div>
            )}


          </div>

          {/* Main Content Viewport */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 pt-1 text-slate-200 scrollbar-thin scrollbar-thumb-indigo-500/20">
            {errorMessage && (
              <div className="mb-3.5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200 shadow-lg animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {processing === 'alterego' ? (
              <ProcessingGlow caption="The heavens are weaving your Ikigai signals into your Biblical Archetype scroll..." />
            ) : processing === 'sceneswap' ? (
              <ProcessingGlow caption="Casting your players into a living, dynamic script..." />
            ) : view === 'alterego' ? (
              alterEgoResult ? (
                /* FR-3.0, FR-3.1, FR-3.2, FR-3.3: THE RPG SYSTEM & 4-WEEK CAMPAIGN DASHBOARD */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Bar with Chapter Tracker & Re-Tune */}
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                      <Sparkle className="h-3 w-3 text-amber-400" />
                      Season 1 • Chapter {currentChapter} of 4
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={resetCharacterSheet}
                        className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-indigo-300 hover:bg-white/10 transition active:scale-95"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Re-Tune
                      </button>
                    </div>
                  </div>

                  {/* Character Class Header with Evolutive Avatar (FR-3.1 & FR-3.2) */}
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-black/80 p-4 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md border border-indigo-400/30 bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-300">
                        Class Specialization
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowShareCardModal(true)}
                          className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-300 hover:bg-amber-400/20 transition cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        >
                          <Share2 className="h-2.5 w-2.5 text-amber-400" />
                          <span>Share Card</span>
                        </button>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                          <Award className="h-3.5 w-3.5" />
                          Lvl {rank.level}
                        </span>
                      </div>
                    </div>

                    {/* Evolutive Avatar Portrait Card */}
                    <div className="my-2 flex flex-col items-center justify-center">
                      <RpgAvatar
                        level={rank.level}
                        xp={totalSeasonXp}
                        isSovereignPro={isSovereignPro}
                      />
                      <h2 className="mt-2 text-center bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                        {alterEgoResult.rpg_class}
                      </h2>
                      <p className="text-[11px] font-medium text-indigo-200/90">
                        {rank.title}
                      </p>
                    </div>

                    {/* 4-Week Season XP Progress Bar (FR-3.2) */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300">
                          30-Day Campaign XP:
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {totalSeasonXp} / {totalSeasonCap} XP
                        </span>
                      </div>
                      <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                          style={{ width: `${seasonPercentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                        <span>Chapter {currentChapter}: {activeChapterMeta.title}</span>
                        <span className="text-amber-400 font-bold">{seasonPercentage}% Season Goal</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Divine Purpose Decree & Alignment Card */}
                  <DailyAffirmationCard
                    affirmation={todayAffirmation}
                    streak={dailyStreak}
                    hasClaimedToday={hasClaimedToday}
                    onClaimAlignment={handleClaimDailyAlignment}
                    onOpenModal={() => setShowDailyAffirmationModal(true)}
                    archetypeName={alterEgoResult.biblical_archetype?.name}
                  />

                  {/* FR-3.1: Equipped Class Gear Loadout Grid (Full Text Display with Deep-Dive Inspector) */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        <Shield className="h-3.5 w-3.5 text-amber-400" />
                        Equipped Gear Specialization
                      </p>
                      <span className="text-[10px] text-indigo-300 font-medium">
                        Tap slot for full lore
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {gearLoadout.map((gear, idx) => {
                        const Icon = gear.icon;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedGear(gear)}
                            className={`rounded-xl border p-2.5 text-left transition cursor-pointer select-none flex flex-col justify-between ${
                              gear.tier === 'Celestial'
                                ? 'border-amber-400/50 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:border-amber-300'
                                : gear.tier === 'Ascended'
                                ? 'border-amber-500/40 bg-purple-950/25 hover:border-amber-400'
                                : gear.tier === 'Epic'
                                ? 'border-purple-400/40 bg-purple-950/20 hover:border-purple-300'
                                : gear.tier === 'Rare'
                                ? 'border-indigo-400/40 bg-indigo-950/20 hover:border-indigo-300'
                                : 'border-white/10 bg-black/30 hover:border-white/20'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                                  {gear.slot}
                                </span>
                                <span
                                  className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${
                                    gear.tier === 'Celestial'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : gear.tier === 'Ascended'
                                      ? 'bg-amber-500/20 text-amber-200'
                                      : gear.tier === 'Epic'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : gear.tier === 'Rare'
                                      ? 'bg-indigo-500/20 text-indigo-300'
                                      : 'bg-white/10 text-slate-400'
                                  }`}
                                >
                                  {gear.tier}
                                </span>
                              </div>

                              <p className="mt-1 text-xs font-bold text-white leading-tight">
                                {gear.name}
                              </p>
                            </div>

                            <p className="mt-1.5 text-[9px] text-amber-300/90 font-medium leading-tight">
                              {gear.perk}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* The Blueprint Subcard (FR-3.0) */}
                  <div className="space-y-3">
                    {/* Decoded Purpose */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm shadow-sm">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        Decoded Purpose
                      </p>
                      <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-200">
                        {alterEgoResult.decoded_purpose}
                      </p>
                    </div>

                    {/* Biblical Archetype */}
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-300">
                          <Shield className="h-3.5 w-3.5 text-purple-400" />
                          Biblical Archetype
                        </p>
                        <span className="rounded-lg bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                          {alterEgoResult.biblical_archetype.name}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        {alterEgoResult.biblical_archetype.context}
                      </p>
                    </div>

                    {/* Anchor Verse */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                        Anchor Scripture • {alterEgoResult.anchor_verse.reference}
                      </p>
                      <blockquote className="mt-1.5 text-xs italic leading-relaxed text-amber-100/90 font-serif">
                        &ldquo;{alterEgoResult.anchor_verse.text}&rdquo;
                      </blockquote>
                    </div>

                    {/* Quest Tracker List (FR-3.0, FR-3.2 & FR-3.3 Time-Lock Engine) */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                          <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                          {activeChapterMeta.week}: {activeChapterMeta.title}
                        </p>
                        <span className="text-[10px] text-emerald-400/90 font-mono">
                          {completedQuestIds.length}/{activeQuests.length} Quests
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <p className="text-[10px] text-slate-400">
                          {activeChapterMeta.focus}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isSovereignPro) {
                              setShowProModal(true);
                            } else {
                              setShowCopilotModal(true);
                              if (!copilotResult && activeQuests.length > 0) {
                                handleLaunchTaskCopilot(activeQuests[0].task);
                              }
                            }
                          }}
                          className="flex items-center gap-1 rounded-lg bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-400/20 transition shrink-0 cursor-pointer"
                        >
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span>Pro Task Copilot</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {activeQuests.map((quest) => {
                          const isDone = completedQuestIds.includes(quest.id);
                          return (
                            <div
                              key={quest.id}
                              onClick={() => toggleQuest(quest.id)}
                              className={`group flex items-start gap-3 rounded-xl border p-2.5 transition cursor-pointer select-none ${
                                isDone
                                  ? 'border-emerald-500/40 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                  : 'border-white/10 bg-black/30 hover:border-indigo-400/40 hover:bg-white/5'
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                  isDone
                                    ? 'border-emerald-400 bg-emerald-500 text-black'
                                    : 'border-slate-500 group-hover:border-indigo-400'
                                }`}
                              >
                                {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>

                              <div className="flex-1">
                                <p
                                  className={`text-xs leading-snug transition ${
                                    isDone
                                      ? 'text-slate-400 line-through'
                                      : 'text-slate-200 group-hover:text-white'
                                  }`}
                                >
                                  {quest.task}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-block text-[10px] font-bold font-mono ${
                                        isDone ? 'text-emerald-400' : 'text-amber-400'
                                      }`}
                                    >
                                      +{quest.points} XP
                                    </span>
                                    {isDone && (
                                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold">
                                        Claimed
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLaunchTaskCopilot(quest.task);
                                    }}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                                      isSovereignPro
                                        ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                                        : 'bg-white/5 border border-white/10 text-slate-400 hover:border-amber-400/40 hover:text-amber-300'
                                    }`}
                                  >
                                    <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                                    <span>{isSovereignPro ? 'Pro Guide & Draft' : 'Guide & Draft (Pro)'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Advance Chapter & 7-Day Time-Lock Callout (FR-3.3) */}
                      {allCurrentQuestsDone && currentChapter < 4 && (
                        <div className="mt-3.5 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black/60 p-3 shadow-lg animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                              <Sparkle className="h-4 w-4 text-amber-400" />
                              {activeChapterMeta.week} Mastery Reached!
                            </span>
                            {isTimeLocked ? (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono bg-black/50 px-2 py-0.5 rounded-full border border-amber-400/30">
                                <Clock className="h-3 w-3" />
                                {daysLeft}d {hoursLeft}h {minutesLeft}m
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <Unlock className="h-3 w-3" />
                                Unlocked
                              </span>
                            )}
                          </div>

                          {isTimeLocked ? (
                            <div className="mt-2 space-y-2">
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                <strong className="text-amber-200">7-Day Integration Rule:</strong> Solidify your daily habits and let your breakthroughs ground in real life before starting Chapter {currentChapter + 1}.
                              </p>

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                                <button
                                  type="button"
                                  onClick={fastForwardSevenDays}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1"
                                >
                                  ⚡ Fast-Forward 7 Days (Demo Mode)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowProModal(true)}
                                  className="flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-400/40 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
                                >
                                  <Zap className="h-3 w-3 text-amber-400" />
                                  Skip with Sovereign Pass
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                                Your integration period is complete. Advance your journey into the next tier.
                              </p>
                              <button
                                type="button"
                                disabled={advancingChapter}
                                onClick={handleAdvanceChapter}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 px-3 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-60"
                              >
                                <span>
                                  {advancingChapter
                                    ? 'Consulting the Scroll...'
                                    : `Begin Chapter ${currentChapter + 1}: ${CHAPTER_METADATA[currentChapter]?.title}`}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post-30-Day Endgame Loop (FR-3.4) */}
                      {allCurrentQuestsDone && currentChapter === 4 && (
                        <div className="mt-3.5 rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-black/80 p-3.5 shadow-xl animate-in fade-in space-y-3">
                          <div className="text-center">
                            <Crown className="mx-auto h-7 w-7 text-amber-400 animate-bounce" />
                            <h4 className="mt-1 text-sm font-extrabold text-amber-200 uppercase tracking-widest">
                              30-Day Purpose Campaign Conquered!
                            </h4>
                            <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                              You have achieved Full Sovereign Ascension (1,000 XP) and unlocked your eternal celestial gear.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-400/20">
                            {/* Prestige Season 2 (Coming Soon) */}
                            <div className="rounded-xl border border-purple-400/30 bg-purple-950/20 p-2.5 text-left">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-purple-300 uppercase">
                                <Sparkle className="h-3 w-3 text-purple-400" />
                                Prestige Season 2
                              </span>
                              <p className="text-[10px] text-purple-400 font-semibold mt-1">
                                Coming Soon
                              </p>
                            </div>

                            {/* Export Purpose Dossier */}
                            <button
                              type="button"
                              onClick={() => setShowDossierModal(true)}
                              className="rounded-xl border border-amber-400/40 bg-amber-950/40 p-2.5 text-left hover:bg-amber-900/50 transition cursor-pointer"
                            >
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 uppercase">
                                <FileText className="h-3 w-3 text-amber-400" />
                                Purpose Dossier
                              </span>
                              <p className="text-[10px] text-slate-300 mt-1">
                                Export full executive 30-day credential scroll.
                              </p>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSupportCategory('Post-30-Day Prestige Season 2');
                              setShowSupportModal(true);
                            }}
                            className="w-full flex items-center justify-between rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-2.5 text-left hover:bg-indigo-900/50 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-indigo-400" />
                              <span className="text-[11px] font-bold text-indigo-200">
                                Contact Support (Resend)
                              </span>
                            </div>
                            <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                              martorefe@gmail.com <ChevronRight className="h-3 w-3" />
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="space-y-2">
                      {/* Primary Social Media Shareable RPG Card Button */}
                      <button
                        type="button"
                        onClick={() => setShowShareCardModal(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 py-2.5 px-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:brightness-110 active:scale-98 transition cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5 text-amber-300" />
                        <span>Generate Shareable Social Card</span>
                        <span className="rounded-full bg-black/30 border border-amber-300/40 px-1.5 py-0.5 text-[9px] font-mono text-amber-200">
                          HD PNG
                        </span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDossierModal(true)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-400" />
                          Executive Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const summary = `ALTEREGO RPG CHARACTER SHEET (30-DAY CAMPAIGN)\nClass: ${alterEgoResult.rpg_class}\nRank: ${rank.title} (Lvl ${rank.level}) - ${totalSeasonXp}/${totalSeasonCap} Season XP\nActive Chapter: Chapter ${currentChapter} (${activeChapterMeta.title})\n\nDECODED PURPOSE:\n${alterEgoResult.decoded_purpose}\n\nBIBLICAL ARCHETYPE: ${alterEgoResult.biblical_archetype.name}\n${alterEgoResult.biblical_archetype.context}\n\nANCHOR SCRIPTURE (${alterEgoResult.anchor_verse.reference}):\n"${alterEgoResult.anchor_verse.text}"\n\nWEEKLY QUESTS:\n${activeQuests
                              .map((q) => `[${completedQuestIds.includes(q.id) ? 'X' : ' '}] ${q.task} (+${q.points} XP)`)
                              .join('\n')}\n\nEQUIPPED GEAR:\n${gearLoadout.map((g) => `- ${g.slot}: ${g.name} (${g.tier})`).join('\n')}`;
                            copyToClipboard(summary);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-950/50 py-2.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 transition"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? 'Copied Sheet!' : 'Copy Summary'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* FR-1.0: THE INTEGRATED DATA INTAKE MATRIX */
                <form className="flex flex-col gap-3" onSubmit={handleAlterEgo}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Four signals of Ikigai. Minimum 20 characters per quadrant.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={fillSampleAlterEgoTech}
                        className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                      >
                        Sample: Tech
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={fillSampleAlterEgoKingdom}
                        className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2"
                      >
                        Sample: Leader
                      </button>
                    </div>
                  </div>

                  {/* Field_01: Passion */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="passion" className={labelClass}>
                        <Heart className="h-3 w-3 text-pink-400" />
                        Field 01: Passion
                      </label>
                      <span
                        className={`font-mono text-[10px] ${
                          isPassionValid ? 'text-emerald-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {passionClean.length}/20 min
                      </span>
                    </div>
                    <textarea
                      id="passion"
                      rows={2}
                      maxLength={500}
                      value={passion}
                      onChange={(e) => setPassion(e.target.value)}
                      placeholder="What activities make you lose track of time? What brings you genuine joy?"
                      className={inputClass}
                    />
                  </div>

                  {/* Field_02: Skill */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="skill" className={labelClass}>
                        <Wrench className="h-3 w-3 text-cyan-400" />
                        Field 02: Skill
                      </label>
                      <span
                        className={`font-mono text-[10px] ${
                          isSkillValid ? 'text-emerald-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {skillClean.length}/20 min
                      </span>
                    </div>
                    <textarea
                      id="skill"
                      rows={2}
                      maxLength={500}
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      placeholder="What are your natural talents, professional skills, or things others praise you for?"
                      className={inputClass}
                    />
                  </div>

                  {/* Field_03: World_Need */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="worldNeed" className={labelClass}>
                        <Globe2 className="h-3 w-3 text-emerald-400" />
                        Field 03: World Need
                      </label>
                      <span
                        className={`font-mono text-[10px] ${
                          isWorldNeedValid ? 'text-emerald-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {worldNeedClean.length}/20 min
                      </span>
                    </div>
                    <textarea
                      id="worldNeed"
                      rows={2}
                      maxLength={500}
                      value={worldNeed}
                      onChange={(e) => setWorldNeed(e.target.value)}
                      placeholder="What real-world issues, local problems, or societal bugs do you desire to fix?"
                      className={inputClass}
                    />
                  </div>

                  {/* Field_04: Monetization */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="monetization" className={labelClass}>
                        <Coins className="h-3 w-3 text-amber-400" />
                        Field 04: Monetization
                      </label>
                      <span
                        className={`font-mono text-[10px] ${
                          isMonetizationValid ? 'text-emerald-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {monetizationClean.length}/20 min
                      </span>
                    </div>
                    <textarea
                      id="monetization"
                      rows={2}
                      maxLength={500}
                      value={monetization}
                      onChange={(e) => setMonetization(e.target.value)}
                      placeholder="What career titles, freelance services, or businesses do you want to get paid for?"
                      className={inputClass}
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={!isAlterEgoValid || isProcessing}
                    className={`mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] transition ${
                      !isAlterEgoValid || isProcessing
                        ? 'opacity-50 pointer-events-none'
                        : 'hover:brightness-110 active:scale-[0.98]'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    Decode My Divine Purpose
                  </button>
                  {!isAlterEgoValid && (
                    <p className="text-center text-[10px] text-slate-500">
                      Fill all 4 fields (minimum 20 characters each) to unlock
                    </p>
                  )}
                </form>
              )
            ) : activeChapter ? (
              /* FR-2.0 & FR-3.0: SCENESWAP MULTI-BRANCH SCREENPLAY & GRAPHIC NOVEL ENGINE */
              <div className="space-y-3 flex-1 flex flex-col min-h-full animate-in fade-in zoom-in-95 duration-200">
                {/* Top Control Bar with Act Tracker, Audio Toggle, Mode Switch */}
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      <Clapperboard className="h-3 w-3 text-purple-400" />
                      Act {activeChapter.chapter_number} of 3
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {activeChapter.is_finale ? 'Grand Finale' : activeChapter.chapter_number === 2 ? 'Rising Crisis' : 'Inciting Incident'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Sound Mute / Unmute Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const muted = soundEngine.toggleMute();
                        setIsSoundMuted(muted);
                      }}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition active:scale-95 ${
                        isSoundMuted
                          ? 'border-red-500/30 bg-red-950/40 text-red-300'
                          : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                      }`}
                      title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isSoundMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {isSoundMuted ? 'Muted' : 'Audio ON'}
                    </button>

                    {/* Graphic Novel Stage vs Studio Script Toggle */}
                    <button
                      type="button"
                      onClick={() => setActiveScriptMode(activeScriptMode === 'comic' ? 'studio' : 'comic')}
                      className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-900/40 transition active:scale-95"
                    >
                      <Film className="h-3 w-3 text-amber-400" />
                      {activeScriptMode === 'comic' ? '📱 Studio Script (TikTok)' : '🎬 Graphic Novel Stage'}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetPartyShoot}
                      className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/10 transition active:scale-95"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Lobby
                    </button>
                  </div>
                </div>

                {/* 3-Act Narrative Progress Bar */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1.5">
                    <span className="font-semibold text-indigo-300">Branching Story Progression:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {activeChapter.chapter_number === 1 ? 'Act 1: Inciting Incident' : activeChapter.chapter_number === 2 ? 'Act 2: The Rising Crisis' : 'Act 3: The Grand Finale'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeChapter.chapter_number >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-800'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeChapter.chapter_number >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-slate-800'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeChapter.chapter_number >= 3 ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-800'}`} />
                  </div>
                </div>

                {/* PRIMARY STAGE: CINEMATIC GRAPHIC NOVEL (REALISTIC IMAGE + ONE LINE AT A TIME) */}
                {activeScriptMode === 'comic' ? (
                  <CinematicSceneStage
                    genre={activeChapter.genre}
                    tone={activeChapter.tone}
                    chapterNumber={activeChapter.chapter_number}
                    chapterTitle={activeChapter.chapter_title}
                    settingDescription={activeChapter.setting_description}
                    audioCue={activeChapter.audio_cue}
                    cast={activeChapter.cast}
                    scriptLines={activeChapter.script_lines}
                    plotChoices={activeChapter.plot_choices}
                    isFinale={activeChapter.is_finale}
                    finaleSummary={activeChapter.finale_summary}
                    currentLineIndex={currentLineIndex}
                    onLineChange={(idx) => setCurrentLineIndex(idx)}
                    selectedVoteId={selectedVoteId}
                    onSelectVote={(id) => setSelectedVoteId(id)}
                    voteCounts={voteCounts}
                    onLockInVoteAndBranch={handleLockInVoteAndBranch}
                    isBranchingChapter={isBranchingChapter}
                    onResetToLobby={handleResetPartyShoot}
                    playerColorStyles={PLAYER_COLOR_STYLES}
                    customPlayerPhotos={playerCustomPhotos}
                    onUpdateCustomPhoto={handleUpdateCustomPhotoFromStage}
                  />
                ) : (
                  /* SECONDARY VIEW: COMPLETE STUDIO SCREENPLAY SCRIPT & DOSSIER (TIKTOK PORTRAIT & SCREEN-FILLING) */
                  <StudioScriptPortraitView
                    genre={activeChapter.genre}
                    tone={activeChapter.tone}
                    chapterNumber={activeChapter.chapter_number}
                    chapterTitle={activeChapter.chapter_title}
                    settingDescription={activeChapter.setting_description}
                    audioCue={activeChapter.audio_cue}
                    cast={activeChapter.cast}
                    scriptLines={activeChapter.script_lines}
                    plotChoices={activeChapter.plot_choices}
                    isFinale={activeChapter.is_finale}
                    finaleSummary={activeChapter.finale_summary}
                    currentLineIndex={currentLineIndex}
                    onLineChange={(idx) => setCurrentLineIndex(idx)}
                    selectedVoteId={selectedVoteId}
                    onSelectVote={(id) => setSelectedVoteId(id)}
                    voteCounts={voteCounts}
                    onLockInVoteAndBranch={handleLockInVoteAndBranch}
                    isBranchingChapter={isBranchingChapter}
                    onResetToLobby={handleResetPartyShoot}
                    playerColorStyles={PLAYER_COLOR_STYLES}
                    customPlayerPhotos={playerCustomPhotos}
                    onUpdateCustomPhoto={handleUpdateCustomPhotoFromStage}
                  />
                )}
              </div>
            ) : (
              /* FR-1.0: PARTY LOBBY ENGINE */
              <form className="flex flex-col gap-4" onSubmit={handleStartPartyShoot}>
                {/* Hidden File Picker for Custom Player Avatars */}
                <input
                  type="file"
                  ref={playerPhotoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePlayerPhotoFileChange}
                />

                {/* Lobby Header */}
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/60 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                    <Clapperboard className="h-3.5 w-3.5 text-purple-400" />
                    Interactive Party Script Lobby
                  </div>
                  <h3 className="text-sm font-extrabold text-white">
                    Cast Your Hangout Into A 3-Act Branching Film
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tag 2 to 5 friends, upload custom photos or use realistic character portraits, and vote live after every act.
                  </p>
                </div>

                {/* FR-1.0: Interactive Tag/Chip Input Box for Players with Avatars */}
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>
                      <Users className="h-3 w-3 text-indigo-400" />
                      Party Cast Roster ({partyPlayers.length}/5)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      2 to 5 players required
                    </span>
                  </div>

                  {/* Player Chips Display with Avatar */}
                  <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-xl border border-white/10 bg-black/40">
                    {partyPlayers.map((player, index) => {
                      const color = PLAYER_COLOR_STYLES[index % PLAYER_COLOR_STYLES.length];
                      const hasCustom = !!playerCustomPhotos[player.toLowerCase()];
                      const avatarUrl = getRealisticCharacterPhoto(player, '', selectedGenre, playerCustomPhotos);

                      return (
                        <div
                          key={index}
                          className={`inline-flex items-center gap-2 rounded-xl border ${color.border} ${color.bg} px-2.5 py-1.5 text-xs font-bold ${color.text} shadow-sm animate-in fade-in duration-150`}
                        >
                          {/* Player Avatar Thumbnail with Camera Upload Action */}
                          <div
                            onClick={() => handleTriggerUploadPhoto(player)}
                            className="relative group cursor-pointer h-7 w-7 rounded-full overflow-hidden border border-white/30 shrink-0 bg-slate-900 shadow"
                            title={`Tap to upload custom photo for ${player}`}
                          >
                            <img
                              src={avatarUrl}
                              alt={player}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Camera className="h-3 w-3 text-white" />
                            </div>
                            {hasCustom && (
                              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black" title="Custom Photo Active" />
                            )}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-white text-xs">{player}</span>
                              {hasCustom && (
                                <span className="text-[8px] bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded font-mono">
                                  Custom Photo
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleTriggerUploadPhoto(player)}
                              className="rounded p-1 text-slate-400 hover:text-amber-300 hover:bg-white/10 transition"
                              title={`Upload custom photo for ${player}`}
                            >
                              <Camera className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePartyPlayer(index)}
                              className="rounded hover:bg-white/10 p-1 text-slate-400 hover:text-white transition"
                              title="Remove player"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {partyPlayers.length === 0 && (
                      <span className="text-xs text-slate-500 italic py-0.5">
                        No players added yet. Add at least 2 friends below.
                      </span>
                    )}
                  </div>

                  {/* Add Player Input Row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={newPlayerInput}
                      onChange={(e) => {
                        setNewPlayerInput(e.target.value);
                        setPlayerInputError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddPartyPlayer();
                        }
                      }}
                      placeholder="Enter player name (e.g. Tunde)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleAddPartyPlayer}
                      disabled={!newPlayerInput.trim() || partyPlayers.length >= 5}
                      className="shrink-0 flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition"
                    >
                      + Add
                    </button>
                  </div>

                  {playerInputError && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      ⚠️ {playerInputError}
                    </p>
                  )}

                  {/* Quick Cast Presets */}
                  <div className="pt-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Or Quick-Load Cast Preset:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PLAYER_PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleApplyPlayerPreset(preset.players)}
                          className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/10 hover:text-white transition"
                        >
                          {preset.name} ({preset.players.length})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Genre Selector Cards */}
                <div className="space-y-2">
                  <label className={labelClass}>
                    <Clapperboard className="h-3 w-3 text-purple-400" />
                    Cinematic Genre Presets
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GENRE_OPTIONS.map((g) => {
                      const isSelected = selectedGenre === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => {
                            setSelectedGenre(g.id);
                            setSelectedTone(g.defaultTone);
                            soundEngine.playDialogueBlip(1.1);
                          }}
                          className={`cursor-pointer rounded-xl border p-3 transition select-none flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-400 bg-gradient-to-br from-indigo-950/70 to-purple-950/40 shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">
                                {g.name}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${g.color}`}>
                                {g.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                              {g.tagline}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tone & Vibe Modifier */}
                <div>
                  <label htmlFor="toneSelect" className={labelClass}>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    Tone & Vibe
                  </label>
                  <select
                    id="toneSelect"
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer mt-1`}
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plot Hook / Wildcard Generator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="wildcardInput" className={labelClass}>
                      <Zap className="h-3 w-3 text-pink-400" />
                      Plot Seed / Wildcard Hook (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleRollWildcardHook}
                      className="flex items-center gap-1 text-[10px] font-bold text-pink-400 hover:text-pink-300 underline underline-offset-2 transition"
                    >
                      <Dice5 className="h-3 w-3" />
                      Roll Wildcard Hook
                    </button>
                  </div>
                  <input
                    id="wildcardInput"
                    type="text"
                    value={wildcardHook}
                    onChange={(e) => setWildcardHook(e.target.value)}
                    placeholder="e.g. Someone brings a counterfeit deed to the wedding dinner"
                    className={inputClass}
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Custom premise, inside joke, or roll the dice for surprising genre seeds.
                  </span>
                </div>

                {/* Gen Z Soundboard Deck & Audio FX Test */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-pink-300">
                      <Music className="h-3.5 w-3.5 text-pink-400" />
                      Gen Z Party Soundboard & FX Deck
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const muted = soundEngine.toggleMute();
                        setIsSoundMuted(muted);
                      }}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border transition ${
                        isSoundMuted ? 'border-red-500/30 bg-red-950/40 text-red-300' : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                      }`}
                    >
                      {isSoundMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      {isSoundMuted ? 'Muted' : 'Audio Active'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tap to test interactive sound effects for your acting shoot:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => soundEngine.playVineBoom()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-950/40 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-900/50 active:scale-95 transition"
                    >
                      ⚡ Vine Boom
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.playSuspenseSting()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-purple-500/30 bg-purple-950/40 py-1.5 text-[10px] font-bold text-purple-300 hover:bg-purple-900/50 active:scale-95 transition"
                    >
                      🎻 Sting
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.playRecordScratch()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/40 py-1.5 text-[10px] font-bold text-amber-300 hover:bg-amber-900/50 active:scale-95 transition"
                    >
                      💿 Scratch
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.playComedicBoing()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-pink-500/30 bg-pink-950/40 py-1.5 text-[10px] font-bold text-pink-300 hover:bg-pink-900/50 active:scale-95 transition"
                    >
                      🤪 Boing
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.playThunder()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-blue-500/30 bg-blue-950/40 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-900/50 active:scale-95 transition"
                    >
                      ⛈️ Thunder
                    </button>
                    <button
                      type="button"
                      onClick={() => soundEngine.playApplause()}
                      className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 py-1.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/50 active:scale-95 transition"
                    >
                      👏 Cheer
                    </button>
                  </div>
                </div>

                {/* Launch CTA Button */}
                <button
                  type="submit"
                  disabled={partyPlayers.length < 2 || processing === 'sceneswap'}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                >
                  <Clapperboard className="h-4 w-4" />
                  Start Party Shoot & Roll Act 1 ({partyPlayers.length} Players)
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Gear Inspector Deep-Dive Modal (Fixes Truncation) */}
      {selectedGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-[380px] overflow-hidden rounded-3xl border border-indigo-400/50 bg-slate-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    selectedGear.tier === 'Celestial'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : selectedGear.tier === 'Ascended'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                      : selectedGear.tier === 'Epic'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : selectedGear.tier === 'Rare'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {selectedGear.tier} Tier
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {selectedGear.slot}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGear(null)}
                className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                {selectedGear.name}
              </h3>
              <p className="mt-1 text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-400" />
                {selectedGear.perk}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Artifact Lore
              </p>
              <p className="text-xs text-slate-300 leading-relaxed italic font-serif">
                &ldquo;{selectedGear.lore}&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedGear(null)}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
            >
              Equipped & Active
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Resend Transactional Email Support Modal (FR-4.0) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-[420px] max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-indigo-400/50 bg-slate-950 p-5 shadow-2xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/40">
                  <Mail className="h-4 w-4 text-indigo-400" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Support & Executive Desk
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-400">
                      Resend Email Service Connected
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportSentSuccess(null);
                  setSupportError(null);
                }}
                className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            {supportSentSuccess ? (
              /* Success State */
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-center space-y-3 animate-in fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-200">
                    Inquiry Dispatched via Resend!
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {supportSentSuccess.note || 'Your message has been transmitted directly to martorefe@gmail.com.'}
                  </p>
                  {supportSentSuccess.messageId && (
                    <p className="mt-2 font-mono text-[9px] text-emerald-400/80">
                      Resend ID: {supportSentSuccess.messageId}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-left text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-mono text-indigo-300">martorefe@gmail.com</span>
                  </div>
                  {supportSenderEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reply-to:</span>
                      <span className="font-mono text-slate-200">{supportSenderEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-200">{supportCategory}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSupportSentSuccess(null);
                      setSupportMessage('');
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                  >
                    Send Another
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-xs font-bold text-white hover:brightness-110 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Support Form */
              <form onSubmit={handleSendSupportEmail} className="space-y-3 overflow-y-auto pr-0.5">
                <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-3 py-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300/80">Direct Mailbox</span>
                    <p className="font-mono text-indigo-200 text-xs">martorefe@gmail.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('martorefe@gmail.com')}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Sender Email Input */}
                <div>
                  <label htmlFor="supportEmail" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Your Email (for replies)
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={supportSenderEmail}
                    onChange={(e) => setSupportSenderEmail(e.target.value)}
                    placeholder="e.g. founder@domain.com or martorefe@gmail.com"
                    className={inputClass}
                  />
                </div>

                {/* Category Picker */}
                <div>
                  <label htmlFor="supportCat" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Inquiry Category
                  </label>
                  <select
                    id="supportCat"
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="Divine Purpose & Guidance" className="bg-slate-900 text-white">Divine Purpose & Ikigai Guidance</option>
                    <option value="AlterEgo Sovereign Pass (Pro)" className="bg-slate-900 text-white">AlterEgo Sovereign Pass (Pro)</option>
                    <option value="Task Execution & Playbooks" className="bg-slate-900 text-white">Task Execution & Physical Playbooks</option>
                    <option value="Post-30-Day Prestige Season 2" className="bg-slate-900 text-white">Post-30-Day Prestige Season 2</option>
                    <option value="Feature Idea or Bug Report" className="bg-slate-900 text-white">Feature Idea or Bug Report</option>
                    <option value="General Inquiry & Coaching" className="bg-slate-900 text-white">General Inquiry & Bespoke Coaching</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="supportNote" className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      Message / Inquiry Details
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {supportMessage.trim().length} chars
                    </span>
                  </div>
                  <textarea
                    id="supportNote"
                    rows={3}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Share your inquiry, feature idea, question, or feedback..."
                    className={inputClass}
                  />
                </div>

                {/* Auto-attached Telemetry */}
                <div className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="text-indigo-400 font-bold shrink-0">Auto-Attached:</span>
                  <span className="truncate">
                    {alterEgoResult?.rpg_class || 'Candidate'} • Ch.{currentChapter} • {totalSeasonXp} XP {isSovereignPro ? '• PRO' : ''}
                  </span>
                </div>

                {/* Error Banner */}
                {supportError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-2.5 text-[11px] text-rose-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{supportError}</span>
                  </div>
                )}

                {/* Send Button via Resend */}
                <button
                  type="submit"
                  disabled={supportSending || !supportMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  {supportSending ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Dispatching via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Message via Resend</span>
                    </>
                  )}
                </button>

                {/* Fallback to mailto */}
                <div className="pt-1 text-center">
                  <a
                    href={`mailto:martorefe@gmail.com?subject=AlterEgo%20Support:%20${encodeURIComponent(supportCategory)}&body=${encodeURIComponent(
                      `Sender: ${supportSenderEmail || 'Not specified'}\nClass: ${alterEgoResult?.rpg_class || 'Candidate'}\nChapter: ${currentChapter}\nXP: ${totalSeasonXp}\n\nMessage:\n${supportMessage || 'Hello, I need assistance with AlterEgo.'}`
                    )}`}
                    onClick={() => setSupportSent(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-indigo-300 transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Or launch local email client</span>
                  </a>
                  {supportSent && (
                    <p className="mt-1 text-[10px] text-emerald-400">
                      Local email client invoked.
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Sovereign Pass Pro Modal (FR-5.0 Paid Feature) */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-amber-400/60 bg-gradient-to-b from-[#160c2e] via-slate-950 to-black p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-amber-200">
                  AlterEgo Sovereign Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ascend to full sovereign empowerment. Unlock tactical task drafting, physical team playbooks, instant pacing, and mythic gear.
            </p>

            <div className="space-y-2.5 rounded-2xl border border-amber-400/30 bg-black/50 p-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Task Drafting & Strategic Ghostwriter</p>
                  <p className="text-[11px] text-slate-400">Ready-to-use written drafts (outreach emails, proposals, sprint agendas, announcements) tailored to your class.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Physical & Organizational Playbooks</p>
                  <p className="text-[11px] text-slate-400">Step-by-step guides for real-world tasks: organizing physical teams, delegation matrices, logistics, and kickoff meetings.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Instant Time-Lock Bypass</p>
                  <p className="text-[11px] text-slate-400">Skip the 7-day waiting period between chapters whenever you desire.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Mythic Celestial Gear Skins</p>
                  <p className="text-[11px] text-slate-400">Equip radiant golden seraphic wings and celestial aura instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ScrollText className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Executive Purpose Dossier Export</p>
                  <p className="text-[11px] text-slate-400">Print-ready portfolio scroll for pitch decks and LinkedIn profiles.</p>
                </div>
              </div>
            </div>

            {/* Pricing and Paystack Checkout */}
            <div className="rounded-2xl border border-amber-400/30 bg-black/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Sovereign Pass
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-extrabold text-amber-300">
                      {paystackCurrency === 'NGN' ? '₦7,500' : '$9.99'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">/ month</span>
                  </div>
                </div>

                {/* Currency toggle */}
                <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPaystackCurrency('NGN')}
                    className={`rounded-md px-2.5 py-1 font-bold transition cursor-pointer ${
                      paystackCurrency === 'NGN'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    NGN (₦)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaystackCurrency('USD')}
                    className={`rounded-md px-2.5 py-1 font-bold transition cursor-pointer ${
                      paystackCurrency === 'USD'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {!isSovereignPro ? (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Billing Email Address
                    </label>
                    <input
                      type="email"
                      value={paystackEmail}
                      onChange={(e) => setPaystackEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {paystackMessage && (
                    <p className={`text-[11px] leading-relaxed p-2 rounded-lg border ${
                      paystackMessage.includes('verified') || paystackMessage.includes('active')
                        ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                        : 'border-rose-500/30 bg-rose-950/30 text-rose-300'
                    }`}>
                      {paystackMessage}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handlePaystackCheckout}
                    disabled={paystackLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3 text-xs font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4 text-black" />
                    {paystackLoading ? 'Connecting to Paystack...' : `Pay ${paystackCurrency === 'NGN' ? '₦7,500' : '$9.99'} via Paystack`}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 px-1">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      Secured by Paystack
                    </span>
                    <span>Cards • Transfer • USSD</span>
                  </div>

                  {paystackAuthUrl && (
                    <div className="pt-1 text-center">
                      <a
                        href={paystackAuthUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-300/90 hover:text-amber-200 underline underline-offset-2 transition"
                      >
                        Popup blocked? Click here to pay on Paystack directly →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-center">
                    <p className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-400" />
                      AlterEgo Sovereign Pass is Active
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Task Copilot, bypass time-locks, and mythic skins unlocked.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSovereignPro(false);
                      triggerHapticFeedback();
                    }}
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-950/40 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition cursor-pointer"
                  >
                    Cancel Subscription (Deactivate)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Executive Purpose Dossier Export Modal (FR-3.4) */}
      {showDossierModal && alterEgoResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-amber-400/60 bg-slate-950 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Executive Purpose Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl border border-white/10 bg-black/60 font-serif text-xs text-slate-200">
              <div className="border-b border-white/10 pb-2 text-center">
                <p className="text-[10px] uppercase font-sans tracking-widest text-amber-400">
                  Qubators AI Foundry • Official Credential
                </p>
                <h2 className="text-base font-bold text-white mt-1">
                  {alterEgoResult.rpg_class}
                </h2>
                <p className="text-[11px] text-slate-400 font-sans">
                  {rank.title} • {totalSeasonXp} Season XP
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-[10px] uppercase tracking-wider text-indigo-300">
                  Divine Purpose Mandate:
                </p>
                <p className="mt-1 italic leading-relaxed text-slate-300">
                  &ldquo;{alterEgoResult.decoded_purpose}&rdquo;
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-[10px] uppercase tracking-wider text-purple-300">
                  Biblical Archetype Synthesis:
                </p>
                <p className="mt-0.5 font-bold text-white">
                  {alterEgoResult.biblical_archetype.name}
                </p>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {alterEgoResult.biblical_archetype.context}
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-[10px] uppercase tracking-wider text-amber-300">
                  Anchor Scripture ({alterEgoResult.anchor_verse.reference}):
                </p>
                <p className="mt-1 italic text-amber-100/90 leading-relaxed">
                  &ldquo;{alterEgoResult.anchor_verse.text}&rdquo;
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-[10px] uppercase tracking-wider text-emerald-300">
                  Equipped Specialization Artifacts:
                </p>
                <ul className="mt-1 space-y-1 font-sans text-[11px] text-slate-300">
                  {gearLoadout.map((g, i) => (
                    <li key={i}>
                      • <strong className="text-white">{g.slot}:</strong> {g.name} ({g.tier}) - {g.perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const text = `QUBATORS AI FOUNDRY • OFFICIAL EXECUTIVE PURPOSE DOSSIER\nClass: ${alterEgoResult.rpg_class}\nRank: ${rank.title} (${totalSeasonXp} Season XP)\n\nDIVINE PURPOSE:\n"${alterEgoResult.decoded_purpose}"\n\nBIBLICAL ARCHETYPE: ${alterEgoResult.biblical_archetype.name}\n${alterEgoResult.biblical_archetype.context}\n\nANCHOR SCRIPTURE (${alterEgoResult.anchor_verse.reference}):\n"${alterEgoResult.anchor_verse.text}"\n\nARTIFACT LOADOUT:\n${gearLoadout.map(g => `- ${g.slot}: ${g.name} (${g.tier})`).join('\n')}`;
                copyToClipboard(text);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 py-3 text-xs font-bold text-white hover:brightness-110 transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Dossier Copied to Clipboard!' : 'Copy Formatted Dossier Scroll'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Pro Task Copilot & Strategic Ghostwriter Modal */}
      {showCopilotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-[440px] max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-amber-400/60 bg-gradient-to-b from-[#140b28] via-slate-950 to-black p-5 shadow-2xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/40">
                  <Zap className="h-4 w-4 text-amber-400" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    Pro Task Copilot & Playbook
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Physical Execution & Executive Ghostwriting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCopilotModal(false)}
                className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Task Input / Selector Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-amber-400" />
                  Target Task
                </label>
                {activeQuests.length > 0 && (
                  <span className="text-[9px] text-indigo-300/80">
                    Chapter {currentChapter} Quests
                  </span>
                )}
              </div>

              {/* Quick Quest Pill Buttons */}
              {activeQuests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeQuests.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        handleLaunchTaskCopilot(q.task);
                      }}
                      className={`text-left rounded-lg px-2 py-1 text-[10px] font-medium border transition cursor-pointer ${
                        copilotTask === q.task
                          ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      Q{idx + 1}: {q.task.length > 28 ? q.task.slice(0, 28) + '...' : q.task}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Task Input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={copilotCustomInput}
                  onChange={(e) => setCopilotCustomInput(e.target.value)}
                  placeholder="Or enter any task (e.g., Organize a 5-person physical team)..."
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-400/70"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && copilotCustomInput.trim()) {
                      handleLaunchTaskCopilot(copilotCustomInput.trim());
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!copilotCustomInput.trim() || loadingCopilot}
                  onClick={() => handleLaunchTaskCopilot(copilotCustomInput.trim())}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                >
                  Guide
                </button>
              </div>
            </div>

            {/* Content Body */}
            {!isSovereignPro ? (
              /* Pro Paywall Teaser if user opens without active subscription */
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-950/30 to-black/60 p-4 text-center space-y-3">
                <Crown className="mx-auto h-8 w-8 text-amber-400 animate-bounce" />
                <h4 className="text-sm font-bold text-amber-200">
                  Sovereign Pass Feature Required
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Task Execution Copilot & Written Ghostwriting is exclusive to Sovereign Pass holders. Get step-by-step real-world team playbooks and copy-pasteable drafts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSovereignPro(true);
                    playQuestCompleteChime();
                    triggerHapticFeedback();
                    if (copilotTask) {
                      handleLaunchTaskCopilot(copilotTask);
                    }
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-2.5 text-xs font-bold text-black hover:brightness-110 transition shadow-lg cursor-pointer"
                >
                  Activate Sovereign Pass ($9.99/mo or ₦7,500)
                </button>
              </div>
            ) : loadingCopilot ? (
              /* Loading Spinner */
              <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg">
                    <Sparkles className="h-5 w-5 text-black animate-spin" />
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-200">
                  Architecting Operational Playbook & Drafting Written Copy...
                </p>
                <p className="text-[10px] text-slate-400">
                  Synthesizing physical logistics for {alterEgoResult?.rpg_class}
                </p>
              </div>
            ) : copilotResult ? (
              /* Display Copilot Result */
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-200">
                {/* Task Type Badge & Summary */}
                <div className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                      {copilotResult.task_type.includes('Physical') ? (
                        <Users className="h-3 w-3 text-amber-400" />
                      ) : (
                        <FileText className="h-3 w-3 text-amber-400" />
                      )}
                      {copilotResult.task_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alterEgoResult?.rpg_class}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 font-medium">
                    {copilotResult.summary}
                  </p>
                </div>

                {/* Step-by-Step Execution Playbook */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-indigo-400" />
                    Physical & Operational Playbook
                  </p>
                  <div className="space-y-1.5">
                    {copilotResult.execution_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-[11px] leading-snug"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 border border-indigo-400/30 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical Checklist & Logistics (if present) */}
                {copilotResult.physical_checklist && copilotResult.physical_checklist.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-400" />
                      Team & Physical Logistics Checklist
                    </p>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 space-y-1 text-[11px]">
                      {copilotResult.physical_checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Written Draft / Template Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-amber-400" />
                      Ready-to-Use Written Draft
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        copyToClipboard(copilotResult.draft_template);
                        setCopiedDraft(true);
                        setTimeout(() => setCopiedDraft(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      {copiedDraft ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDraft ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-amber-100/90 select-all">
                    {copilotResult.draft_template}
                  </pre>
                </div>

                {/* Kingdom / Leadership Principle */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-2.5 space-y-0.5">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-purple-300">
                    Archetype Leadership Principle
                  </p>
                  <p className="italic text-[11px] text-purple-200/90 leading-relaxed">
                    &ldquo;{copilotResult.leadership_tip}&rdquo;
                  </p>
                </div>
              </div>
            ) : null}

            {/* Bottom Actions */}
            {copilotResult && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    copyToClipboard(copilotResult.draft_template);
                    setCopiedDraft(true);
                    setTimeout(() => setCopiedDraft(false), 2000);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
                >
                  {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedDraft ? 'Copied Draft!' : 'Copy Draft'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fullText = `ALTEREGO PRO TASK PLAYBOOK: ${copilotTask}\nType: ${copilotResult.task_type}\nClass: ${alterEgoResult?.rpg_class}\n\nSTRATEGIC SUMMARY:\n${copilotResult.summary}\n\nEXECUTION STEPS:\n${copilotResult.execution_steps.join('\n')}\n\nPHYSICAL CHECKLIST:\n${(copilotResult.physical_checklist || []).join('\n')}\n\nWRITTEN DRAFT:\n${copilotResult.draft_template}\n\nLEADERSHIP PRINCIPLE:\n"${copilotResult.leadership_tip}"`;
                    copyToClipboard(fullText);
                    setCopiedPlaybook(true);
                    setTimeout(() => setCopiedPlaybook(false), 2000);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-2.5 text-xs font-bold text-black hover:brightness-110 transition cursor-pointer"
                >
                  {copiedPlaybook ? <Check className="h-3.5 w-3.5 text-black" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>{copiedPlaybook ? 'Playbook Copied!' : 'Copy Full Playbook'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Firebase Cloud Sync & Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        lastSyncedAt={lastSyncedAt}
        onSyncNow={() => syncCurrentStateToCloud()}
        isSyncing={isSyncingCloud}
      />

      {/* Production Services Launch Hub Modal (2.A, 2.B, 2.C) */}
      <ServicesLaunchHubModal
        isOpen={showServicesHubModal}
        onClose={() => setShowServicesHubModal(false)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenCheckout={() => setShowProModal(true)}
      />

      {/* Shareable RPG Social Card Modal */}
      {alterEgoResult && (
        <ShareableRpgCardModal
          isOpen={showShareCardModal}
          onClose={() => setShowShareCardModal(false)}
          rpgClass={alterEgoResult.rpg_class}
          rankTitle={rank.title}
          level={rank.level}
          seasonXp={totalSeasonXp}
          totalSeasonCap={totalSeasonCap}
          biblicalArchetype={alterEgoResult.biblical_archetype}
          anchorVerse={alterEgoResult.anchor_verse}
          decodedPurpose={alterEgoResult.decoded_purpose}
        />
      )}

      {/* Daily Divine Affirmation & Morning Purpose Modal */}
      <DailyAffirmationModal
        isOpen={showDailyAffirmationModal}
        onClose={() => setShowDailyAffirmationModal(false)}
        affirmation={todayAffirmation}
        streak={dailyStreak}
        totalDailyXp={dailyBonusXp}
        hasClaimedToday={hasClaimedToday}
        onClaimAlignment={handleClaimDailyAlignment}
        archetypeName={alterEgoResult?.biblical_archetype?.name}
      />

      {/* Morning Notification Floating Banner */}
      <MorningNotificationBanner
        isVisible={showMorningBanner}
        onClose={() => setShowMorningBanner(false)}
        affirmation={morningNotificationAffirmation}
        hasClaimedToday={hasClaimedToday}
        onClaimAlignment={handleClaimDailyAlignment}
        onOpenModal={() => setShowDailyAffirmationModal(true)}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
