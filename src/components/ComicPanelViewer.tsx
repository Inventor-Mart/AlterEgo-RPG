import { useState } from 'react';
import { ChevronRight, ChevronLeft, Volume2, Mic, Sparkles, MessageSquare, Clapperboard, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export interface ScriptLineItem {
  speaker: string;
  direction?: string;
  line: string;
}

export interface CastItem {
  player: string;
  role: string;
  archetype: string;
  motivation: string;
  secret?: string;
}

interface ComicPanelViewerProps {
  scriptLines: ScriptLineItem[];
  cast: CastItem[];
  currentLineIndex: number;
  onLineChange: (index: number) => void;
  playerColorStyles: { border: string; bg: string; text: string; ring?: string; badge?: string }[];
}

export function ComicPanelViewer({
  scriptLines,
  cast,
  currentLineIndex,
  onLineChange,
  playerColorStyles,
}: ComicPanelViewerProps) {
  const [viewMode, setViewMode] = useState<'card' | 'strip'>('card');
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);

  const getPlayerIndex = (speaker: string) => {
    const idx = cast.findIndex((c) => c.player.toLowerCase() === speaker.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const getPlayerEmoji = (speaker: string, index: number) => {
    const emojis = ['💅', '🕵️', '👑', '😱', '😏', '😎', '💀', '🔥'];
    return emojis[index % emojis.length];
  };

  const handleNext = () => {
    if (currentLineIndex < scriptLines.length - 1) {
      soundEngine.playDialogueBlip(1.0 + (currentLineIndex % 3) * 0.15);
      onLineChange(currentLineIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentLineIndex > 0) {
      soundEngine.playDialogueBlip(0.9);
      onLineChange(currentLineIndex - 1);
    }
  };

  const handleSpeakLine = (line: string, speakerIdx: number, idx: number) => {
    setActiveSpeechIdx(idx);
    soundEngine.speakLine(line, speakerIdx, () => {
      setActiveSpeechIdx(null);
    });
  };

  const currentItem = scriptLines[currentLineIndex];
  const currentSpeakerIdx = currentItem ? getPlayerIndex(currentItem.speaker) : 0;
  const currentStyle = playerColorStyles[currentSpeakerIdx % playerColorStyles.length];
  const currentCast = cast.find((c) => c.player.toLowerCase() === currentItem?.speaker.toLowerCase());

  return (
    <div className="space-y-3">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Clapperboard className="h-4 w-4 text-pink-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Graphic Dialogue Stage
          </span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              viewMode === 'card'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 Reel Focus
          </button>
          <button
            type="button"
            onClick={() => setViewMode('strip')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              viewMode === 'strip'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎨 Comic Strip
          </button>
        </div>
      </div>

      {/* MODE 1: REEL FOCUS (Gen Z Single Tap Card with bold visual presence) */}
      {viewMode === 'card' && currentItem && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-pink-500/40 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 p-4 sm:p-6 shadow-[0_0_35px_rgba(236,72,153,0.15)] space-y-4">
          {/* Header with Line Counter & Speaker Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-inner border border-white/20">
                {getPlayerEmoji(currentItem.speaker, currentSpeakerIdx)}
              </span>
              <div>
                <span className={`text-sm font-black tracking-wide block ${currentStyle.text}`}>
                  {currentItem.speaker}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  as {currentCast?.role || 'Lead Character'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSpeakLine(currentItem.line, currentSpeakerIdx, currentLineIndex)}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                  activeSpeechIdx === currentLineIndex
                    ? 'bg-emerald-400 text-slate-950 animate-pulse'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                {activeSpeechIdx === currentLineIndex ? 'Voicing...' : 'Hear Line'}
              </button>

              <span className="font-mono text-xs font-bold text-slate-400 bg-black/60 px-2 py-1 rounded-lg border border-white/10">
                {currentLineIndex + 1} / {scriptLines.length}
              </span>
            </div>
          </div>

          {/* Acting Direction (If present) */}
          {currentItem.direction && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-200 italic font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider not-italic text-amber-400">
                Action:
              </span>
              &ldquo;{currentItem.direction}&rdquo;
            </div>
          )}

          {/* Big Stylized Comic Speech Bubble with Pointer Tail */}
          <div
            onClick={handleNext}
            className="group relative cursor-pointer rounded-2xl border-2 border-white/20 bg-slate-900/90 p-5 shadow-2xl transition hover:border-pink-400/70 hover:bg-black/90 active:scale-[0.99]"
          >
            {/* Comic Callout Tail */}
            <div className="absolute -top-3 left-6 h-0 w-0 border-x-8 border-x-transparent border-b-8 border-b-slate-900/90" />

            <div className="relative">
              <blockquote className="text-base sm:text-lg font-bold leading-relaxed text-white drop-shadow-sm">
                &ldquo;{currentItem.line}&rdquo;
              </blockquote>

              <div className="mt-3 flex items-center justify-between text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  Tap card to advance
                </span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Next ➔
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Navigation Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={currentLineIndex === 0}
              onClick={handlePrev}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Line Dots */}
            <div className="flex items-center gap-1 max-w-[200px] overflow-hidden">
              {scriptLines.map((_, i) => (
                <div
                  key={i}
                  onClick={() => onLineChange(i)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    i === currentLineIndex
                      ? 'w-6 bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                      : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {currentLineIndex < scriptLines.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                Next Line
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <CheckCircle2 className="h-4 w-4" />
                Act Concluded
              </span>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: COMIC STRIP (Visual vertical webtoon panels) */}
      {viewMode === 'strip' && (
        <div className="space-y-3.5">
          {scriptLines.map((line, idx) => {
            const speakerIdx = getPlayerIndex(line.speaker);
            const style = playerColorStyles[speakerIdx % playerColorStyles.length];
            const isCurrent = idx === currentLineIndex;
            const castInfo = cast.find((c) => c.player.toLowerCase() === line.speaker.toLowerCase());

            return (
              <div
                key={idx}
                onClick={() => onLineChange(idx)}
                className={`relative cursor-pointer rounded-2xl border transition-all p-3.5 sm:p-4 ${
                  isCurrent
                    ? 'border-pink-500/80 bg-slate-900 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-1 ring-pink-400/50 scale-[1.01]'
                    : 'border-white/10 bg-black/60 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Left Avatar Column */}
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg border border-white/20">
                      {getPlayerEmoji(line.speaker, speakerIdx)}
                    </span>
                    <span className="mt-1 font-mono text-[9px] text-slate-400">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Right Bubble Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${style.text}`}>
                          {line.speaker}
                        </span>
                        {castInfo && (
                          <span className="text-[10px] text-slate-400">
                            ({castInfo.role})
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeakLine(line.line, speakerIdx, idx);
                        }}
                        className="rounded-lg bg-white/5 p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>

                    {line.direction && (
                      <p className="text-[11px] text-amber-200/90 italic font-sans">
                        🎬 {line.direction}
                      </p>
                    )}

                    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-2.5 text-xs font-medium text-white leading-relaxed">
                      &ldquo;{line.line}&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
