import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  Palette,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export interface ShareableRpgCardProps {
  isOpen: boolean;
  onClose: () => void;
  rpgClass: string;
  rankTitle: string;
  level: string | number;
  seasonXp: number;
  totalSeasonCap: number;
  biblicalArchetype: {
    name: string;
    context: string;
  };
  anchorVerse: {
    reference: string;
    text: string;
  };
  decodedPurpose: string;
}

type CardTheme = 'celestial' | 'cyber';

export const ShareableRpgCardModal: React.FC<ShareableRpgCardProps> = ({
  isOpen,
  onClose,
  rpgClass,
  rankTitle,
  level,
  seasonXp,
  totalSeasonCap,
  biblicalArchetype,
  anchorVerse,
  decodedPurpose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [theme, setTheme] = useState<CardTheme>('celestial');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState<string | null>(null);

  // Helper to wrap text cleanly on Canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 4
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        if (linesDrawn >= maxLines - 1) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
      } else {
        line = testLine;
      }
    }
    if (line.trim().length > 0 && linesDrawn < maxLines) {
      ctx.fillText(line.trim(), x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution 1080 x 1080 square card
    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    const isCelestial = theme === 'celestial';

    // 1. Background Gradient
    const bgGradient = ctx.createRadialGradient(W / 2, 420, 100, W / 2, H / 2, 800);
    if (isCelestial) {
      bgGradient.addColorStop(0, '#1c1038');
      bgGradient.addColorStop(0.4, '#0e0822');
      bgGradient.addColorStop(1, '#05030d');
    } else {
      bgGradient.addColorStop(0, '#0f1f3d');
      bgGradient.addColorStop(0.4, '#091024');
      bgGradient.addColorStop(1, '#030511');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // 2. Cosmic Background Aura & Sacred Circles
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isCelestial ? 'rgba(168, 85, 247, 0.12)' : 'rgba(6, 182, 212, 0.12)';
    ctx.beginPath();
    ctx.arc(W / 2, 330, 260, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W / 2, 330, 360, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle decorative star points
    const starColor = isCelestial ? 'rgba(253, 224, 71, 0.6)' : 'rgba(103, 232, 249, 0.6)';
    ctx.fillStyle = starColor;
    const stars = [
      [140, 130], [940, 140], [120, 920], [960, 900], [220, 280], [860, 290],
      [540, 90], [190, 680], [890, 680]
    ];
    stars.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Ornate Double Outer Border
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isCelestial ? 'rgba(245, 158, 11, 0.35)' : 'rgba(6, 182, 212, 0.35)';
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.lineWidth = 1;
    ctx.strokeStyle = isCelestial ? 'rgba(168, 85, 247, 0.25)' : 'rgba(147, 51, 234, 0.25)';
    ctx.strokeRect(52, 52, W - 104, H - 104);

    // Corner Ornaments
    const cornerSize = 16;
    const corners = [
      [40, 40],
      [W - 40, 40],
      [40, H - 40],
      [W - 40, H - 40],
    ];
    ctx.fillStyle = isCelestial ? '#f59e0b' : '#06b6d4';
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 4. Top Brand Header
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = isCelestial ? '#c084fc' : '#38bdf8';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('✦ ALTEREGO RPG • PURPOSE ARCHETYPE ✦', W / 2, 95);
    ctx.restore();

    // 5. Level Crest Badge (Center)
    ctx.save();
    const crestX = W / 2;
    const crestY = 195;
    const crestR = 56;

    // Outer Glow Ring
    const crestGlow = ctx.createRadialGradient(crestX, crestY, crestR - 10, crestX, crestY, crestR + 20);
    crestGlow.addColorStop(0, isCelestial ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)');
    crestGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = crestGlow;
    ctx.beginPath();
    ctx.arc(crestX, crestY, crestR + 20, 0, Math.PI * 2);
    ctx.fill();

    // Crest Body
    ctx.fillStyle = isCelestial ? '#170b2e' : '#06172e';
    ctx.strokeStyle = isCelestial ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(crestX, crestY, crestR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Level Text inside Crest
    ctx.textAlign = 'center';
    ctx.fillStyle = isCelestial ? '#fbbf24' : '#67e8f9';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('LEVEL', crestX, crestY - 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(String(level), crestX, crestY + 24);

    // Rank & XP Under Crest
    ctx.fillStyle = isCelestial ? '#e9d5ff' : '#bae6fd';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`${rankTitle.toUpperCase()} • ${seasonXp} / ${totalSeasonCap} SEASON XP`, crestX, 285);
    ctx.restore();

    // 6. Class Specialization Hero Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = isCelestial ? '#a855f7' : '#06b6d4';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('CLASS SPECIALIZATION', W / 2, 335);

    // Hero Class Name
    const classGrad = ctx.createLinearGradient(150, 0, 930, 0);
    if (isCelestial) {
      classGrad.addColorStop(0, '#ffffff');
      classGrad.addColorStop(0.5, '#fef08a');
      classGrad.addColorStop(1, '#fde68a');
    } else {
      classGrad.addColorStop(0, '#ffffff');
      classGrad.addColorStop(0.5, '#7dd3fc');
      classGrad.addColorStop(1, '#a5f3fc');
    }
    ctx.fillStyle = classGrad;
    ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '0.5px';
    wrapText(ctx, rpgClass.toUpperCase(), W / 2, 385, 900, 54, 2);
    ctx.restore();

    // 7. Biblical Archetype Card Box
    ctx.save();
    const archBoxX = 80;
    const archBoxY = 460;
    const archBoxW = W - 160;
    const archBoxH = 220;

    // Glassmorphic background
    ctx.fillStyle = isCelestial ? 'rgba(23, 11, 46, 0.82)' : 'rgba(8, 24, 48, 0.82)';
    ctx.strokeStyle = isCelestial ? 'rgba(168, 85, 247, 0.45)' : 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(archBoxX, archBoxY, archBoxW, archBoxH, 20);
    ctx.fill();
    ctx.stroke();

    // Archetype Eyebrow Pill
    ctx.fillStyle = isCelestial ? 'rgba(168, 85, 247, 0.25)' : 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.roundRect(archBoxX + 24, archBoxY + 20, 200, 28, 8);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = isCelestial ? '#e9d5ff' : '#7dd3fc';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('⚔️ BIBLICAL ARCHETYPE', archBoxX + 36, archBoxY + 39);

    // Archetype Hero Name
    ctx.fillStyle = isCelestial ? '#fbbf24' : '#38bdf8';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(biblicalArchetype.name.toUpperCase(), archBoxX + 24, archBoxY + 84);

    // Context / Virtue Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    wrapText(ctx, biblicalArchetype.context, archBoxX + 24, archBoxY + 120, archBoxW - 48, 28, 3);
    ctx.restore();

    // 8. Anchor Scripture Card Box
    ctx.save();
    const verseBoxX = 80;
    const verseBoxY = 705;
    const verseBoxW = W - 160;
    const verseBoxH = 220;

    ctx.fillStyle = isCelestial ? 'rgba(30, 18, 12, 0.82)' : 'rgba(12, 28, 42, 0.82)';
    ctx.strokeStyle = isCelestial ? 'rgba(245, 158, 11, 0.45)' : 'rgba(14, 165, 233, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(verseBoxX, verseBoxY, verseBoxW, verseBoxH, 20);
    ctx.fill();
    ctx.stroke();

    // Anchor Verse Eyebrow Pill
    ctx.fillStyle = isCelestial ? 'rgba(245, 158, 11, 0.25)' : 'rgba(14, 165, 233, 0.25)';
    ctx.beginPath();
    ctx.roundRect(verseBoxX + 24, verseBoxY + 20, 240, 28, 8);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = isCelestial ? '#fef08a' : '#bae6fd';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(`📜 ANCHOR SCRIPTURE`, verseBoxX + 36, verseBoxY + 39);

    // Reference
    ctx.textAlign = 'right';
    ctx.fillStyle = isCelestial ? '#f59e0b' : '#38bdf8';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(anchorVerse.reference, verseBoxX + verseBoxW - 24, verseBoxY + 40);

    // Scripture Italic Text
    ctx.textAlign = 'left';
    ctx.fillStyle = isCelestial ? '#fef9c3' : '#e0f2fe';
    ctx.font = 'italic 500 20px Georgia, "Times New Roman", serif';
    const quoteText = `“${anchorVerse.text}”`;
    wrapText(ctx, quoteText, verseBoxX + 24, verseBoxY + 85, verseBoxW - 48, 30, 4);
    ctx.restore();

    // 9. Card Footer / Watermark
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = isCelestial ? '#94a3b8' : '#64748b';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('DECODE YOUR PURPOSE & EMBARK ON YOUR 30-DAY CAMPAIGN', W / 2, 980);

    ctx.fillStyle = isCelestial ? '#f59e0b' : '#06b6d4';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('ALTEREGO · QUBATORS AI FOUNDRY', W / 2, 1005);
    ctx.restore();

    // Export image data
    try {
      const url = canvas.toDataURL('image/png');
      setDataUrl(url);
    } catch (e) {
      console.error('Error generating card image url:', e);
    }
  }, [theme, rpgClass, rankTitle, level, seasonXp, totalSeasonCap, biblicalArchetype, anchorVerse, decodedPurpose]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout ensures fonts / render tree are ready
      const t = setTimeout(() => {
        drawCard();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, drawCard]);

  if (!isOpen) return null;

  const socialCaptionText = `⚔️ My AlterEgo RPG Archetype: ${rpgClass.toUpperCase()} (Lvl ${level} • ${rankTitle})\n👑 Biblical Archetype: ${biblicalArchetype.name}\n📜 Anchor Scripture (${anchorVerse.reference}): "${anchorVerse.text}"\n\n🎯 Decoded Divine Ikigai Mandate:\n"${decodedPurpose}"\n\n#AlterEgo #Ikigai #RPGAscension #PurposeDriven`;

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    const safeName = rpgClass.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.download = `AlterEgo_${safeName}_Card.png`;
    link.href = dataUrl;
    link.click();
    setShareSuccessNotice('Image card saved to your device!');
    setTimeout(() => setShareSuccessNotice(null), 3500);
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Check if Web Share API with files is supported
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            handleDownload();
            return;
          }
          const safeName = rpgClass.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const file = new File([blob], `AlterEgo_${safeName}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `AlterEgo RPG Archetype: ${rpgClass}`,
                text: socialCaptionText,
                files: [file],
              });
              setShareSuccessNotice('Shared successfully!');
              setTimeout(() => setShareSuccessNotice(null), 3000);
              return;
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                console.warn('Share error:', err);
              }
            }
          } else {
            // Can share text only
            try {
              await navigator.share({
                title: `AlterEgo RPG: ${rpgClass}`,
                text: socialCaptionText,
              });
              setShareSuccessNotice('Text shared!');
              setTimeout(() => setShareSuccessNotice(null), 3000);
              return;
            } catch {
              // fallback to download
            }
          }
          handleDownload();
        }, 'image/png');
      } else {
        // Fallback for browsers without navigator.share
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && navigator.clipboard.write) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopiedImage(true);
            setShareSuccessNotice('Image copied to clipboard! Paste directly into messages or social media.');
            setTimeout(() => {
              setCopiedImage(false);
              setShareSuccessNotice(null);
            }, 3500);
            return;
          } catch (clipErr) {
            console.warn('Clipboard write image failed, downloading instead:', clipErr);
          }
        }
        handleDownload();
      }, 'image/png');
    } catch {
      handleDownload();
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaptionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `⚔️ My AlterEgo RPG Archetype is ${rpgClass} (Lvl ${level} • ${biblicalArchetype.name})!\n\n📜 "${anchorVerse.reference}": "${anchorVerse.text.slice(0, 100)}..."\n\n#AlterEgo #Ikigai`
  )}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `⚔️ *My AlterEgo RPG Archetype:* ${rpgClass} (Level ${level})\n👑 *Biblical Archetype:* ${biblicalArchetype.name}\n📜 *Anchor Scripture (${anchorVerse.reference}):* "${anchorVerse.text}"\n\nDecode your purpose with AlterEgo!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden high-res canvas used for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-[460px] max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-amber-400/50 bg-slate-950 p-4 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Shareable RPG Social Card</h3>
              <p className="text-[10px] text-slate-400">Class • Level • Biblical Archetype</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-1 text-slate-400 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status / Success Toast */}
        {shareSuccessNotice && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/70 p-2 text-center text-xs font-semibold text-emerald-300 animate-in fade-in">
            {shareSuccessNotice}
          </div>
        )}

        {/* Scrollable Card Preview & Options Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Card Theme Switcher */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 pl-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-400" />
              Card Aesthetic:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme('celestial')}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition cursor-pointer ${
                  theme === 'celestial'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Celestial Gold
              </button>
              <button
                type="button"
                onClick={() => setTheme('cyber')}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition cursor-pointer ${
                  theme === 'cyber'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cyber Neon
              </button>
            </div>
          </div>

          {/* Rendered Live Card Preview Container */}
          <div className="relative group overflow-hidden rounded-2xl border border-indigo-400/40 bg-black/80 p-2 shadow-inner">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="AlterEgo RPG Social Card Preview"
                className="w-full aspect-square object-contain rounded-xl shadow-2xl transition hover:scale-[1.01]"
              />
            ) : (
              <div className="w-full aspect-square flex flex-col items-center justify-center text-slate-400 text-xs">
                <Sparkles className="h-6 w-6 animate-spin text-amber-400 mb-2" />
                Forging celestial card...
              </div>
            )}
            <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-[9px] font-mono text-slate-300 backdrop-blur-md border border-white/10">
              1080 × 1080 HD
            </div>
          </div>

          {/* Social Media Sharing Quick Launchers */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-950/40 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-900/50 hover:text-white transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
              Post on X (Twitter)
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-950/40 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/50 hover:text-white transition"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              Share on WhatsApp
            </a>
          </div>

          {/* Action Grid: Native Share, Download PNG, Copy Image, Copy Caption */}
          <div className="space-y-2 pt-1">
            {/* Primary Share / Download Button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:brightness-110 active:scale-98 transition cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-amber-300" />
              <span>Share Image Card (Social Sheet)</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
                title="Download PNG to your device"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>Save PNG</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
                title="Copy PNG directly to clipboard"
              >
                {copiedImage ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-purple-400" />
                )}
                <span>{copiedImage ? 'Copied!' : 'Copy Image'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
                title="Copy ready-to-post caption text"
              >
                {copiedCaption ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <span>{copiedCaption ? 'Copied!' : 'Caption'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
