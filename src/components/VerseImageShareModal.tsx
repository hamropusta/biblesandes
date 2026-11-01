import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Image as ImageIcon, Share2, Sparkles, X } from 'lucide-react';
import { BibleVerse } from '../data/susamacharDatabase';
import { toNepaliDigits } from '../utils/nepaliDateEngine';

interface VerseImageShareModalProps {
  verse: BibleVerse | null;
  lang: 'ne' | 'en';
  onClose: () => void;
  onNotify: (msg: string) => void;
}

type CardThemeId = 'crimson_gold' | 'himalayan_dawn' | 'parchment_classic' | 'emerald_sanctuary';
type CardLanguageMode = 'bilingual' | 'ne' | 'en';
type CardAspect = 'square' | 'landscape';

interface ThemeConfig {
  id: CardThemeId;
  nameNe: string;
  nameEn: string;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  accentGold: string;
  accentLight: string;
  primaryText: string;
  secondaryText: string;
  mountainFill: string;
  cardBorder: string;
}

const CARD_THEMES: ThemeConfig[] = [
  {
    id: 'crimson_gold',
    nameNe: 'हिमाली सिम्रिक र सुनौलो',
    nameEn: 'Himalayan Crimson & Gold',
    bgStart: '#7F1D1D',
    bgMid: '#450A0A',
    bgEnd: '#1E1B4B',
    accentGold: '#FBBF24',
    accentLight: '#FDE68A',
    primaryText: '#FFFFFF',
    secondaryText: '#FDE68A',
    mountainFill: 'rgba(30, 58, 138, 0.35)',
    cardBorder: 'rgba(251, 191, 36, 0.45)',
  },
  {
    id: 'himalayan_dawn',
    nameNe: 'अन्नपूर्ण प्रभात (निलो)',
    nameEn: 'Annapurna Dawn Navy',
    bgStart: '#0F172A',
    bgMid: '#1E3A8A',
    bgEnd: '#312E81',
    accentGold: '#F59E0B',
    accentLight: '#FEF08A',
    primaryText: '#F8FAFC',
    secondaryText: '#CBD5E1',
    mountainFill: 'rgba(254, 240, 138, 0.12)',
    cardBorder: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'parchment_classic',
    nameNe: 'क्लासिक चर्मपत्र (उज्यालो)',
    nameEn: 'Sacred Parchment Light',
    bgStart: '#FFFBEB',
    bgMid: '#FEF3C7',
    bgEnd: '#F5F5F4',
    accentGold: '#991B1B',
    accentLight: '#B45309',
    primaryText: '#1C1917',
    secondaryText: '#57534E',
    mountainFill: 'rgba(153, 27, 27, 0.07)',
    cardBorder: 'rgba(153, 27, 27, 0.35)',
  },
  {
    id: 'emerald_sanctuary',
    nameNe: 'हरियो खर्क (भजनसंग्रह २३)',
    nameEn: 'Still Waters Emerald',
    bgStart: '#064E3B',
    bgMid: '#022C22',
    bgEnd: '#0F172A',
    accentGold: '#FBBF24',
    accentLight: '#A7F3D0',
    primaryText: '#ECFDF5',
    secondaryText: '#D1FAE5',
    mountainFill: 'rgba(16, 185, 129, 0.16)',
    cardBorder: 'rgba(251, 191, 36, 0.4)',
  },
];

/**
 * Helper to wrap multi-line text onto an HTML5 Canvas context
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export const VerseImageShareModal: React.FC<VerseImageShareModalProps> = ({
  verse,
  lang,
  onClose,
  onNotify,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>('crimson_gold');
  const [languageMode, setLanguageMode] = useState<CardLanguageMode>('bilingual');
  const [aspect, setAspect] = useState<CardAspect>('square');
  const [copiedImage, setCopiedImage] = useState(false);

  const theme = CARD_THEMES.find((t) => t.id === selectedTheme) || CARD_THEMES[0];

  useEffect(() => {
    if (!verse || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = aspect === 'square' ? 1080 : 1280;
    const height = aspect === 'square' ? 1080 : 720;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(0.55, theme.bgMid);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Radial Halo behind Header Logo
    const radial = ctx.createRadialGradient(width / 2, 155, 10, width / 2, 155, 340);
    radial.addColorStop(0, theme.id === 'parchment_classic' ? 'rgba(217, 119, 6, 0.14)' : 'rgba(251, 191, 36, 0.18)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // 3. Himalayan Silhouette at Bottom
    ctx.save();
    ctx.fillStyle = theme.mountainFill;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height - 165);
    ctx.lineTo(width * 0.18, height - 250);
    ctx.lineTo(width * 0.33, height - 180);
    ctx.lineTo(width * 0.52, height - 295);
    ctx.lineTo(width * 0.71, height - 190);
    ctx.lineTo(width * 0.86, height - 260);
    ctx.lineTo(width, height - 175);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Ornamental Outer & Inner Frame Border
    const pad = 42;
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad + 10, pad + 10, width - (pad + 10) * 2, height - (pad + 10) * 2);

    // Corner Accents
    const cornerLen = 26;
    ctx.strokeStyle = theme.accentGold;
    ctx.lineWidth = 4;
    const corners = [
      [pad, pad, 1, 1],
      [width - pad, pad, -1, 1],
      [pad, height - pad, 1, -1],
      [width - pad, height - pad, -1, -1],
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * cornerLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * cornerLen, cy);
      ctx.stroke();
    });

    // 5. Draw Susamachar Logo Badge at Top Center
    const centerX = width / 2;
    const logoY = aspect === 'square' ? 128 : 102;
    const badgeRadius = aspect === 'square' ? 44 : 36;

    // Logo Badge Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, logoY, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = theme.id === 'parchment_classic' ? '#991B1B' : 'rgba(153, 27, 27, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FBBF24';
    ctx.stroke();

    // Draw Gold Cross inside Logo Badge
    ctx.fillStyle = '#FDE68A';
    const crossW = badgeRadius * 0.22;
    const crossH = badgeRadius * 1.1;
    ctx.fillRect(centerX - crossW / 2, logoY - crossH * 0.52, crossW, crossH);
    const armW = badgeRadius * 0.78;
    ctx.fillRect(centerX - armW / 2, logoY - crossH * 0.22, armW, crossW);

    // Open Bible Base Arc inside Badge
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - badgeRadius * 0.5, logoY + badgeRadius * 0.52);
    ctx.quadraticCurveTo(centerX, logoY + badgeRadius * 0.35, centerX + badgeRadius * 0.5, logoY + badgeRadius * 0.52);
    ctx.stroke();
    ctx.restore();

    // Brand Name below Logo
    const brandY = logoY + badgeRadius + 30;
    ctx.fillStyle = theme.accentGold;
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Plus Jakarta Sans", "Mukta", sans-serif';
    ctx.fillText('सुसमाचार • SUSAMACHAR', centerX, brandY);

    // 6. Verse Text Rendering (Auto-fit & Centered)
    const contentWidth = width - 190;
    const nepaliRef = `${verse.bookNameNe} ${toNepaliDigits(verse.chapter)}:${toNepaliDigits(verse.verse)}`;
    const englishRef = `${verse.bookNameEn} ${verse.chapter}:${verse.verse}`;

    let currentY = brandY + (aspect === 'square' ? 75 : 48);

    // Decorative Quote Mark
    ctx.font = 'italic bold 64px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = theme.accentGold;
    ctx.fillText('“', centerX, currentY);
    currentY += 20;

    if (languageMode === 'bilingual' || languageMode === 'ne') {
      const neFontSize =
        languageMode === 'ne'
          ? aspect === 'square' ? 42 : 34
          : aspect === 'square' ? 35 : 28;
      ctx.font = `600 ${neFontSize}px "Mukta", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = theme.primaryText;

      const neLines = wrapCanvasText(ctx, verse.textNe, contentWidth);
      const lineHeight = neFontSize * 1.48;
      neLines.forEach((line) => {
        ctx.fillText(line, centerX, currentY);
        currentY += lineHeight;
      });
    }

    if (languageMode === 'bilingual') {
      // Subtle Divider Line between Nepali and English
      currentY += 6;
      ctx.strokeStyle = theme.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, currentY);
      ctx.lineTo(centerX + 80, currentY);
      ctx.stroke();
      currentY += 36;
    }

    if (languageMode === 'bilingual' || languageMode === 'en') {
      const enFontSize =
        languageMode === 'en'
          ? aspect === 'square' ? 40 : 32
          : aspect === 'square' ? 28 : 23;
      ctx.font = `italic 600 ${enFontSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillStyle = languageMode === 'en' ? theme.primaryText : theme.secondaryText;

      const enLines = wrapCanvasText(ctx, `"${verse.textEn}"`, contentWidth);
      const lineHeight = enFontSize * 1.42;
      enLines.forEach((line) => {
        ctx.fillText(line, centerX, currentY);
        currentY += lineHeight;
      });
    }

    // 7. Book, Chapter & Verse Reference Pill / Banner
    const refY = Math.min(height - 125, currentY + 32);
    ctx.font = 'bold 28px "Mukta", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accentGold;
    const referenceLabel =
      languageMode === 'ne'
        ? `— ${nepaliRef} (पवित्र बाइबल)`
        : languageMode === 'en'
        ? `— ${englishRef} (Holy Bible)`
        : `— ${nepaliRef}  |  ${englishRef}`;
    ctx.fillText(referenceLabel, centerX, refY);

    // 8. Footer Slogan & Watermark
    const footerY = height - 68;
    ctx.font = '500 18px "Mukta", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.secondaryText;
    ctx.fillText(
      'सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ  |  Share the Gospel • Grow in Faith • Serve with Love',
      centerX,
      footerY
    );
  }, [verse, selectedTheme, languageMode, aspect, theme]);

  if (!verse) return null;

  const getFilename = () =>
    `susamachar-${verse.bookNameEn.toLowerCase().replace(/\s+/g, '-')}-${verse.chapter}-${verse.verse}.png`;

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = getFilename();
    a.click();
    onNotify(
      lang === 'ne'
        ? 'बाइबल पदको तस्बिर डाउनलोड गरियो!'
        : 'Bible verse card image downloaded!'
    );
  };

  const handleCopyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopiedImage(true);
          onNotify(
            lang === 'ne'
              ? 'बाइबल पदको तस्बिर क्लिपबोर्डमा कपी गरियो!'
              : 'Verse card image copied to clipboard!'
          );
          setTimeout(() => setCopiedImage(false), 2200);
          return;
        }
      } catch {
        // Fallback to download if clipboard image write is restricted in iframe
      }
      handleDownloadImage();
    }, 'image/png');
  };

  const handleNativeShareImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], getFilename(), { type: 'image/png' });
      const shareData = {
        title: `${verse.bookNameNe} ${verse.chapter}:${verse.verse} — Susamachar`,
        text: `"${verse.textNe}" (${verse.bookNameNe} ${toNepaliDigits(verse.chapter)}:${toNepaliDigits(verse.verse)})\n"${verse.textEn}" (${verse.bookNameEn} ${verse.chapter}:${verse.verse})`,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          return;
        } catch {
          // User cancelled or share failed, fall back to download
        }
      }
      handleDownloadImage();
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-800/10 dark:bg-amber-400/10 text-red-800 dark:text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne'
                  ? 'बाइबल पद तस्बिर कार्ड (Share Verse as Image)'
                  : 'Share Bible Verse as Image Card'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {verse.bookNameNe} {toNepaliDigits(verse.chapter)}:{toNepaliDigits(verse.verse)} · {verse.bookNameEn} {verse.chapter}:{verse.verse}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-stone-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Live Canvas Preview + Right Customization Controls */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Canvas Preview Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-950 rounded-2xl p-4 border border-stone-200/80 dark:border-slate-800">
            <canvas
              ref={canvasRef}
              className="w-full max-h-[420px] object-contain rounded-xl shadow-lg"
            />
          </div>

          {/* Customization & Action Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'ne' ? '१. कार्डको रङ र शैली (Card Theme)' : '1. Select Card Theme'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      selectedTheme === t.id
                        ? 'border-red-800 dark:border-amber-400 bg-red-50/50 dark:bg-slate-800 font-bold'
                        : 'border-stone-200 dark:border-slate-800 hover:border-stone-400'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 border border-white/40 shadow-2xs"
                      style={{ background: `linear-gradient(135deg, ${t.bgStart}, ${t.bgEnd})` }}
                    />
                    <span className="text-xs text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'ne' ? t.nameNe : t.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Language Layout */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'ne' ? '२. भाषा छनोट (Scripture Language)' : '2. Verse Language Layout'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-slate-800 rounded-xl">
                {[
                  { id: 'bilingual', ne: 'द्विभाषी (Both)', en: 'Bilingual' },
                  { id: 'ne', ne: 'नेपाली मात्र', en: 'Nepali Only' },
                  { id: 'en', ne: 'English Only', en: 'English Only' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLanguageMode(m.id as CardLanguageMode)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      languageMode === m.id
                        ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lang === 'ne' ? m.ne : m.en}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Card Aspect Ratio */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'ne' ? '३. तस्बिरको आकार (Card Size)' : '3. Image Aspect Ratio'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspect('square')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    aspect === 'square'
                      ? 'border-red-800 dark:border-amber-400 bg-red-50/50 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Square 1:1 (1080×1080)
                </button>
                <button
                  onClick={() => setAspect('landscape')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    aspect === 'landscape'
                      ? 'border-red-800 dark:border-amber-400 bg-red-50/50 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Landscape 16:9 (1280×720)
                </button>
              </div>
            </div>

            {/* 4. Action Buttons (Download PNG, Share Image, Copy Image) */}
            <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2.5">
              <button
                onClick={handleDownloadImage}
                className="w-full h-11 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>
                  {lang === 'ne'
                    ? 'उच्च गुणस्तरको तस्बिर डाउनलोड गर्नुहोस् (Download PNG)'
                    : 'Download High-Res PNG Image'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleNativeShareImage}
                  className="h-10 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-red-800 dark:text-amber-400" />
                  <span>{lang === 'ne' ? 'तस्बिर सेयर (Share)' : 'Share Image'}</span>
                </button>

                <button
                  onClick={handleCopyImageToClipboard}
                  className="h-10 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {copiedImage ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-800 dark:text-amber-400" />
                  )}
                  <span>
                    {copiedImage
                      ? lang === 'ne' ? 'कपी भयो!' : 'Copied!'
                      : lang === 'ne' ? 'तस्बिर कपी (Copy)' : 'Copy Image'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
