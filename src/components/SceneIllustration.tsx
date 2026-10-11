import { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Zap, Flame, Radio, Mic, Play, Pause } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface SceneIllustrationProps {
  genre: string;
  tone: string;
  chapterNumber: number;
  chapterTitle: string;
  settingDescription: string;
  audioCue: string;
  activeSpeaker?: string;
  activeLine?: string;
  castMembers: { player: string; role: string; archetype: string }[];
}

export function SceneIllustration({
  genre,
  tone,
  chapterNumber,
  chapterTitle,
  settingDescription,
  audioCue,
  activeSpeaker,
  activeLine,
  castMembers,
}: SceneIllustrationProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [soundEffectStamp, setSoundEffectStamp] = useState<string | null>(null);

  // Play audio cue
  const handlePlaySceneCue = () => {
    setIsPlayingAudio(true);
    soundEngine.playAudioCueForText(audioCue);
    setSoundEffectStamp('*AUDIO CUE ACTIVATED*');
    setTimeout(() => {
      setIsPlayingAudio(false);
      setSoundEffectStamp(null);
    }, 1800);
  };

  // Read line aloud with TTS
  const handleToggleReadAloud = () => {
    if (isReadingAloud) {
      soundEngine.stopSpeaking();
      setIsReadingAloud(false);
      return;
    }

    if (!activeLine) return;

    setIsReadingAloud(true);
    const speakerIdx = castMembers.findIndex(
      (c) => c.player.toLowerCase() === (activeSpeaker || '').toLowerCase()
    );

    soundEngine.speakLine(activeLine, speakerIdx >= 0 ? speakerIdx : 0, () => {
      setIsReadingAloud(false);
    });
  };

  // Trigger instant soundboard punch
  const handleSoundStamp = (soundType: 'vine' | 'sting' | 'scratch' | 'boing' | 'thunder', label: string) => {
    setSoundEffectStamp(label);
    if (soundType === 'vine') soundEngine.playVineBoom();
    else if (soundType === 'sting') soundEngine.playSuspenseSting();
    else if (soundType === 'scratch') soundEngine.playRecordScratch();
    else if (soundType === 'boing') soundEngine.playComedicBoing();
    else if (soundType === 'thunder') soundEngine.playThunder();

    setTimeout(() => setSoundEffectStamp(null), 1200);
  };

  // Render genre specific stylized vector backdrops
  const renderGenreArtwork = () => {
    switch (genre) {
      case 'Nollywood Drama':
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="nollBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a0808" />
                <stop offset="45%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#1a0404" />
              </linearGradient>
              <linearGradient id="goldGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#713f12" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="marbleFloor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c1917" />
                <stop offset="100%" stopColor="#0c0a09" />
              </linearGradient>
              <filter id="chandelierGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Mansion Hall Background */}
            <rect width="800" height="450" fill="url(#nollBg)" />

            {/* Ornate Gold Archways in Background */}
            <path d="M120 450 V 160 Q 200 80 280 160 V 450 Z" fill="#3b0707" stroke="#eab308" strokeWidth="2" opacity="0.6" />
            <path d="M520 450 V 160 Q 600 80 680 160 V 450 Z" fill="#3b0707" stroke="#eab308" strokeWidth="2" opacity="0.6" />
            <path d="M280 450 V 130 Q 400 30 520 130 V 450 Z" fill="#4c0519" stroke="#facc15" strokeWidth="3" opacity="0.8" />

            {/* Ornate Golden Pillars */}
            <rect x="80" y="80" width="30" height="370" fill="#78350f" stroke="#fef08a" strokeWidth="1.5" />
            <rect x="690" y="80" width="30" height="370" fill="#78350f" stroke="#fef08a" strokeWidth="1.5" />
            <rect x="250" y="110" width="24" height="340" fill="#78350f" stroke="#eab308" strokeWidth="1" opacity="0.7" />
            <rect x="526" y="110" width="24" height="340" fill="#78350f" stroke="#eab308" strokeWidth="1" opacity="0.7" />

            {/* Grand Chandeliers with Glowing Crystals */}
            <g filter="url(#chandelierGlow)">
              <circle cx="400" cy="70" r="120" fill="url(#goldGlow)" />
              {/* Center Chandelier */}
              <line x1="400" y1="0" x2="400" y2="60" stroke="#fef08a" strokeWidth="3" />
              <ellipse cx="400" cy="65" rx="55" ry="12" fill="#eab308" />
              <ellipse cx="400" cy="85" rx="35" ry="8" fill="#facc15" />
              <polygon points="400,115 375,90 425,90" fill="#fef08a" />
              {/* Chandelier teardrop crystals */}
              <circle cx="360" cy="75" r="4" fill="#ffffff" />
              <circle cx="440" cy="75" r="4" fill="#ffffff" />
              <circle cx="380" cy="95" r="3.5" fill="#ffffff" />
              <circle cx="420" cy="95" r="3.5" fill="#ffffff" />
              <circle cx="400" cy="118" r="4.5" fill="#ffffff" />
            </g>

            {/* Rich Velvet Drapery */}
            <path d="M0 0 Q 150 120 200 0 Q 300 130 400 0 Q 500 130 600 0 Q 650 120 800 0 V 110 Q 700 80 600 95 Q 400 110 200 95 Q 100 80 0 110 Z" fill="#881337" opacity="0.85" />
            <path d="M0 0 V 300 Q 80 200 50 0 Z" fill="#9f1239" opacity="0.9" />
            <path d="M800 0 V 300 Q 720 200 750 0 Z" fill="#9f1239" opacity="0.9" />

            {/* Marble Floor & Reflection */}
            <rect x="0" y="320" width="800" height="130" fill="url(#marbleFloor)" />
            <ellipse cx="400" cy="380" rx="300" ry="40" fill="#eab308" opacity="0.12" filter="blur(20px)" />

            {/* Dramatic Spotlight Rays */}
            <polygon points="400,60 160,450 640,450" fill="url(#goldGlow)" opacity="0.25" />
          </svg>
        );

      case 'Sci-Fi Survival':
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="nebula" cx="65%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#0f172a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="consoleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Deep Space Outer Void */}
            <rect width="800" height="450" fill="url(#nebula)" />

            {/* Distant Stars */}
            <circle cx="120" cy="60" r="1.5" fill="#ffffff" />
            <circle cx="280" cy="110" r="2" fill="#7dd3fc" />
            <circle cx="560" cy="50" r="1.8" fill="#ffffff" />
            <circle cx="710" cy="140" r="2.5" fill="#38bdf8" />
            <circle cx="480" cy="180" r="1.2" fill="#ffffff" />
            <circle cx="670" cy="90" r="1" fill="#bae6fd" />

            {/* Giant Glowing Planet Rim in Viewport */}
            <ellipse cx="580" cy="200" rx="200" ry="200" fill="#0369a1" opacity="0.9" />
            <ellipse cx="570" cy="190" rx="195" ry="195" fill="#0284c7" opacity="0.4" />
            <path d="M380 200 A 200 200 0 0 0 780 200" stroke="#38bdf8" strokeWidth="4" fill="none" opacity="0.8" />

            {/* Orbital Station Hexagonal Viewport Framing */}
            <polygon points="0,0 800,0 720,80 80,80" fill="#0f172a" stroke="#0284c7" strokeWidth="2" opacity="0.9" />
            <polygon points="0,0 80,80 80,320 0,400" fill="#0f172a" stroke="#0284c7" strokeWidth="2" opacity="0.9" />
            <polygon points="800,0 720,80 720,320 800,400" fill="#0f172a" stroke="#0284c7" strokeWidth="2" opacity="0.9" />
            <polygon points="0,450 800,450 720,330 80,330" fill="url(#consoleGrad)" stroke="#38bdf8" strokeWidth="2" />

            {/* Holographic Emergency Telemetry Grid */}
            <line x1="80" y1="200" x2="720" y2="200" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
            <circle cx="400" cy="200" r="70" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="10 5" fill="none" opacity="0.6" />
            <rect x="110" y="100" width="120" height="70" rx="4" fill="#0891b2" opacity="0.2" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="120" y1="120" x2="210" y2="120" stroke="#22d3ee" strokeWidth="2" />
            <line x1="120" y1="135" x2="190" y2="135" stroke="#ef4444" strokeWidth="2" />
            <line x1="120" y1="150" x2="170" y2="150" stroke="#22d3ee" strokeWidth="2" />

            {/* Flashing Red Warning Beacons */}
            <circle cx="95" cy="95" r="9" fill="#ef4444" className="animate-ping" opacity="0.8" />
            <circle cx="95" cy="95" r="6" fill="#ef4444" />
            <circle cx="705" cy="95" r="9" fill="#ef4444" className="animate-ping" opacity="0.8" />
            <circle cx="705" cy="95" r="6" fill="#ef4444" />
          </svg>
        );

      case 'Afrofuturistic Heist':
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="neoSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="60%" stopColor="#111827" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>

            {/* Neo-Lagos Skyline */}
            <rect width="800" height="450" fill="url(#neoSky)" />

            {/* Holographic Glowing Megastructures */}
            <rect x="70" y="120" width="85" height="330" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
            <rect x="180" y="80" width="110" height="370" fill="#042f2e" stroke="#06b6d4" strokeWidth="2" opacity="0.9" />
            <polygon points="235,30 200,80 270,80" fill="#10b981" opacity="0.7" />
            <rect x="330" y="150" width="130" height="300" fill="#022c22" stroke="#34d399" strokeWidth="1.5" opacity="0.75" />
            <rect x="500" y="60" width="95" height="390" fill="#064e3b" stroke="#059669" strokeWidth="2" opacity="0.9" />
            <polygon points="547,10 520,60 575,60" fill="#34d399" opacity="0.8" />
            <rect x="625" y="130" width="120" height="320" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />

            {/* Neon Yoruba Runes / Billboards */}
            <g opacity="0.85">
              <rect x="195" y="140" width="80" height="40" rx="4" fill="#0d9488" opacity="0.4" stroke="#2dd4bf" strokeWidth="2" />
              <text x="235" y="165" fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="2">ẸKỌ 2099</text>
              <rect x="515" y="120" width="65" height="35" rx="4" fill="#047857" opacity="0.4" stroke="#10b981" strokeWidth="1.5" />
              <text x="547" y="142" fill="#5eead4" fontSize="11" fontWeight="bold" textAnchor="middle">VAULT-01</text>
            </g>

            {/* Third Mainland Skybridge (Floating Highway) */}
            <path d="M0 320 Q 400 280 800 320 L 800 450 L 0 450 Z" fill="#021c16" stroke="#10b981" strokeWidth="3" />
            <line x1="0" y1="360" x2="800" y2="360" stroke="#34d399" strokeWidth="2" strokeDasharray="25 15" opacity="0.8" />

            {/* Flying Hover Skiff (Getaway Vehicle) */}
            <g transform="translate(360, 240)">
              <ellipse cx="60" cy="20" rx="55" ry="14" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
              <ellipse cx="60" cy="14" rx="30" ry="8" fill="#06b6d4" opacity="0.8" />
              {/* Cyan Thruster Jets */}
              <polygon points="10,20 -15,14 -15,26" fill="#38bdf8" />
              <circle cx="-12" cy="20" r="14" fill="#06b6d4" opacity="0.5" filter="blur(6px)" />
            </g>
          </svg>
        );

      case 'Horror Mystery':
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="bloodMoon" cx="70%" cy="25%" r="40%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="spookyMist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b0764" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Dark Stormy Midnight Sky */}
            <rect width="800" height="450" fill="#090514" />

            {/* Blood-Red Harvest Moon */}
            <circle cx="560" cy="110" r="75" fill="url(#bloodMoon)" />
            <circle cx="560" cy="110" r="60" fill="#e11d48" opacity="0.9" />
            <circle cx="545" cy="95" r="12" fill="#be123c" opacity="0.4" />
            <circle cx="575" cy="125" r="18" fill="#9f1239" opacity="0.4" />

            {/* Spooky Victorian Manor Silhouette */}
            <polygon points="260,160 300,70 340,160" fill="#1e1035" />
            <rect x="270" y="160" width="60" height="180" fill="#130924" stroke="#a855f7" strokeWidth="1" />
            {/* Main Manor Body */}
            <rect x="180" y="210" width="240" height="160" fill="#0d041a" stroke="#7e22ce" strokeWidth="1.5" />
            {/* Clock Tower */}
            <polygon points="380,180 410,100 440,180" fill="#1e1035" />
            <rect x="390" y="180" width="40" height="190" fill="#130924" stroke="#a855f7" strokeWidth="1" />
            {/* Glowing Eerie Clock Face */}
            <circle cx="410" cy="210" r="12" fill="#fef08a" opacity="0.8" />
            <line x1="410" y1="210" x2="410" y2="202" stroke="#451a03" strokeWidth="1.5" />
            <line x1="410" y1="210" x2="416" y2="210" stroke="#451a03" strokeWidth="1.5" />

            {/* Haunted Windows Glowing Amber */}
            <rect x="210" y="240" width="22" height="35" rx="3" fill="#fde047" opacity="0.85" />
            <rect x="260" y="240" width="22" height="35" rx="3" fill="#ca8a04" opacity="0.6" />
            <rect x="330" y="240" width="22" height="35" rx="3" fill="#e11d48" opacity="0.75" />

            {/* Twisted Dead Tree Branches */}
            <path d="M120 400 Q 110 260 70 200 M 110 270 Q 150 220 180 210 M 80 230 Q 50 170 30 160" stroke="#2e1065" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M720 400 Q 700 270 750 190 M 705 280 Q 660 230 630 220" stroke="#2e1065" strokeWidth="7" fill="none" strokeLinecap="round" />

            {/* Creeping Ground Fog */}
            <rect x="0" y="310" width="800" height="140" fill="url(#spookyMist)" />
            <ellipse cx="400" cy="400" rx="420" ry="40" fill="#7e22ce" opacity="0.2" filter="blur(16px)" />
          </svg>
        );

      case 'Romantic Comedy':
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="twilightGala" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4c0519" />
                <stop offset="40%" stopColor="#831843" />
                <stop offset="75%" stopColor="#be185d" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>

            {/* Twilight Sunset Sky */}
            <rect width="800" height="450" fill="url(#twilightGala)" />

            {/* Distant City Skyline Silhouettes */}
            <rect x="50" y="220" width="70" height="160" fill="#4c0519" opacity="0.7" />
            <rect x="140" y="190" width="85" height="190" fill="#3f0719" opacity="0.8" />
            <rect x="250" y="230" width="60" height="150" fill="#4c0519" opacity="0.7" />
            <rect x="520" y="180" width="90" height="200" fill="#3f0719" opacity="0.8" />
            <rect x="640" y="210" width="110" height="170" fill="#4c0519" opacity="0.7" />

            {/* Warm Fairy String Lights */}
            <path d="M0 70 Q 200 130 400 70 Q 600 130 800 70" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.8" />
            {[80, 150, 230, 310, 390, 470, 550, 630, 710].map((cx, i) => (
              <g key={i}>
                <circle cx={cx} cy={85 + Math.sin(i) * 15} r="6" fill="#fef08a" opacity="0.9" />
                <circle cx={cx} cy={85 + Math.sin(i) * 15} r="12" fill="#fde047" opacity="0.3" filter="blur(3px)" />
              </g>
            ))}

            {/* Rooftop Gala Terrace Balcony */}
            <rect x="0" y="340" width="800" height="110" fill="#1c1917" stroke="#fb7185" strokeWidth="2" />
            <line x1="0" y1="370" x2="800" y2="370" stroke="#f43f5e" strokeWidth="1" strokeDasharray="12 8" />

            {/* Champagne Tower */}
            <g transform="translate(370, 270)">
              <polygon points="30,0 20,40 40,40" fill="#fde047" opacity="0.8" />
              <polygon points="15,42 5,70 25,70" fill="#fde047" opacity="0.8" />
              <polygon points="45,42 35,70 55,70" fill="#fde047" opacity="0.8" />
            </g>
          </svg>
        );

      default:
        // Cyberpunk Detective / General Neon
        return (
          <svg className="absolute inset-0 h-full w-full object-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="cyberSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#050510" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>

            <rect width="800" height="450" fill="url(#cyberSky)" />

            {/* Neon Skyscrapers */}
            <rect x="80" y="100" width="90" height="350" fill="#020617" stroke="#06b6d4" strokeWidth="2" />
            <rect x="210" y="60" width="130" height="390" fill="#0f0920" stroke="#ec4899" strokeWidth="2" />
            <rect x="380" y="140" width="80" height="310" fill="#020617" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="500" y="70" width="110" height="380" fill="#061224" stroke="#06b6d4" strokeWidth="2" />
            <rect x="640" y="110" width="100" height="340" fill="#0f0920" stroke="#ec4899" strokeWidth="1.5" />

            {/* Glowing Neon Japanese / Cyber Signs */}
            <rect x="235" y="100" width="30" height="90" rx="3" fill="#be185d" opacity="0.7" stroke="#f43f5e" strokeWidth="2" />
            <text x="250" y="130" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">密</text>
            <text x="250" y="155" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">碼</text>

            <rect x="530" y="120" width="55" height="30" rx="4" fill="#0891b2" opacity="0.8" stroke="#22d3ee" strokeWidth="2" />
            <text x="557" y="140" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">NEON-9</text>

            {/* Wet Street Reflections */}
            <rect x="0" y="360" width="800" height="90" fill="#090d16" stroke="#ec4899" strokeWidth="1.5" />
            <ellipse cx="270" cy="400" rx="120" ry="15" fill="#ec4899" opacity="0.25" filter="blur(10px)" />
            <ellipse cx="550" cy="405" rx="100" ry="12" fill="#06b6d4" opacity="0.3" filter="blur(8px)" />
          </svg>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-400/50 bg-slate-950 shadow-[0_0_40px_rgba(99,102,241,0.25)] select-none">
      {/* 1. CINEMATIC SCENE GRAPHIC VIEWPORT (16:9 Aspect Ratio) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {/* Vector Graphic Artwork Base */}
        {renderGenreArtwork()}

        {/* Dynamic Halftone / Comic Action Screen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 pointer-events-none" />

        {/* Comic Letterbox Corner Decals */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            ACT 0{chapterNumber} // SCENE CAMERA
          </span>
          <span className="rounded-md bg-indigo-950/80 backdrop-blur-md border border-indigo-400/40 px-2 py-1 text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
            {genre}
          </span>
        </div>

        {/* Quick Sound FX & Audio Controls inside Viewport */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* TTS Read Aloud Button */}
          {activeLine && (
            <button
              type="button"
              onClick={handleToggleReadAloud}
              title={isReadingAloud ? 'Stop Voice' : 'Read Line in Character Voice'}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition shadow-lg active:scale-95 ${
                isReadingAloud
                  ? 'border-emerald-400 bg-emerald-500 text-slate-950 animate-pulse'
                  : 'border-white/20 bg-black/75 text-emerald-300 hover:bg-black/90'
              }`}
            >
              <Mic className="h-3 w-3" />
              {isReadingAloud ? 'Voicing...' : 'Read Aloud'}
            </button>
          )}

          {/* Audio Cue Button */}
          <button
            type="button"
            onClick={handlePlaySceneCue}
            title="Play Atmospheric Scene Audio Cue"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition shadow-lg active:scale-95 ${
              isPlayingAudio
                ? 'border-amber-400 bg-amber-400 text-slate-950 ring-2 ring-amber-300/60'
                : 'border-amber-500/40 bg-black/75 text-amber-300 hover:bg-black/90 hover:border-amber-400'
            }`}
          >
            <Volume2 className={`h-3 w-3 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
            {isPlayingAudio ? 'Playing Cue...' : 'Play Scene Cue'}
          </button>
        </div>

        {/* Floating Comic Sound-Effect Stamp (Onomatopoeia) */}
        {soundEffectStamp && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in zoom-in-50 duration-200">
            <div className="rotate-[-6deg] rounded-2xl border-4 border-yellow-300 bg-red-600 px-6 py-3 font-black text-white text-2xl uppercase tracking-widest shadow-[0_0_50px_rgba(234,179,8,0.9)] drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
              💥 {soundEffectStamp} 💥
            </div>
          </div>
        )}

        {/* Character Avatar Cast Lineup Overlaid on Scene */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {castMembers.map((member, i) => {
              const isSpeaker =
                activeSpeaker &&
                member.player.toLowerCase() === activeSpeaker.toLowerCase();
              return (
                <div
                  key={i}
                  className={`group relative flex flex-col items-center transition-all duration-300 ${
                    isSpeaker ? 'scale-110 -translate-y-1' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Speaker Halo */}
                  {isSpeaker && (
                    <span className="absolute -top-3 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 tracking-wider uppercase animate-bounce shadow-md">
                      SPEAKING
                    </span>
                  )}
                  {/* Avatar Bubble */}
                  <div
                    className={`h-11 w-11 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-xl backdrop-blur-md ${
                      isSpeaker
                        ? 'border-amber-400 bg-amber-500/40 text-white ring-4 ring-amber-400/40'
                        : 'border-white/30 bg-black/60 text-indigo-200'
                    }`}
                  >
                    {member.player.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="mt-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white max-w-[65px] truncate">
                    {member.player}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chapter Title Badge */}
          <div className="text-right pointer-events-auto max-w-[55%]">
            <h3 className="text-sm sm:text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
              {chapterTitle}
            </h3>
            <p className="text-[10px] text-amber-200 font-mono tracking-wide line-clamp-1 drop-shadow">
              📍 {settingDescription}
            </p>
          </div>
        </div>
      </div>

      {/* 2. GEN Z INTERACTIVE SOUNDBOARD BAR (Under the visual artwork) */}
      <div className="border-t border-white/10 bg-slate-900/90 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Live Soundboard:
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => handleSoundStamp('vine', 'VINE BOOM!')}
              className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/40 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-900/50 active:scale-95 transition"
            >
              ⚡ Vine Boom
            </button>
            <button
              type="button"
              onClick={() => handleSoundStamp('sting', 'DUN DUN DUN!')}
              className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-950/40 px-2 py-1 text-[10px] font-bold text-purple-300 hover:bg-purple-900/50 active:scale-95 transition"
            >
              🎻 Drama Sting
            </button>
            <button
              type="button"
              onClick={() => handleSoundStamp('scratch', '*RECORD SCRATCH*')}
              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-950/40 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-900/50 active:scale-95 transition"
            >
              💿 Scratch
            </button>
            <button
              type="button"
              onClick={() => handleSoundStamp('boing', 'BOING!')}
              className="flex items-center gap-1 rounded-lg border border-pink-500/30 bg-pink-950/40 px-2 py-1 text-[10px] font-bold text-pink-300 hover:bg-pink-900/50 active:scale-95 transition"
            >
              🤪 Boing
            </button>
            <button
              type="button"
              onClick={() => handleSoundStamp('thunder', 'CRASH!')}
              className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-950/40 px-2 py-1 text-[10px] font-bold text-blue-300 hover:bg-blue-900/50 active:scale-95 transition"
            >
              ⛈️ Thunder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
