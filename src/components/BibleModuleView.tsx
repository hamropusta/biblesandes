import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  History,
  Highlighter,
  Image as ImageIcon,
  Search,
  Share2,
  Type,
} from 'lucide-react';
import {
  BIBLE_BOOKS,
  BIBLE_STUDY_ARTICLES,
  BibleBook,
  BibleStudyArticle,
  BibleVerse,
  CURATED_BIBLE_VERSES,
  getVersesForBookChapter,
} from '../data/susamacharDatabase';
import { toNepaliDigits } from '../utils/nepaliDateEngine';
import { VerseImageShareModal } from './VerseImageShareModal';

interface BibleModuleViewProps {
  lang: 'ne' | 'en';
  bookmarks: string[];
  onToggleBookmark: (verseId: string) => void;
  onNotify: (msg: string) => void;
}

export const BibleModuleView: React.FC<BibleModuleViewProps> = ({
  lang,
  bookmarks,
  onToggleBookmark,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<'reader' | 'study' | 'plan' | 'bookmarks'>('reader');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [selectedBookId, setSelectedBookId] = useState<number>(43); // John (यूहन्ना) default or Genesis
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [bibleMode, setBibleMode] = useState<'parallel' | 'ne' | 'en'>('parallel');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlights, setHighlights] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('susamachar_bible_highlights') || '{"43-3-16":"amber"}');
    } catch {
      return { '43-3-16': 'amber' };
    }
  });
  const [readingHistory, setReadingHistory] = useState<Array<{ bookId: number; chapter: number; timestamp: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('susamachar_bible_history') || '[]');
    } catch {
      return [];
    }
  });
  const [completedPlanDays, setCompletedPlanDays] = useState<number[]>([1, 2, 3]);
  const [selectedStudyArticle, setSelectedStudyArticle] = useState<BibleStudyArticle>(BIBLE_STUDY_ARTICLES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(true);
  const [shareImageVerse, setShareImageVerse] = useState<BibleVerse | null>(null);

  const selectedBook: BibleBook = useMemo(
    () => BIBLE_BOOKS.find((b) => b.id === selectedBookId) || BIBLE_BOOKS[0],
    [selectedBookId]
  );

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((b) => testamentFilter === 'ALL' || b.testament === testamentFilter);
  }, [testamentFilter]);

  const currentVerses: BibleVerse[] = useMemo(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      return CURATED_BIBLE_VERSES.filter(
        (v) =>
          v.textNe.toLowerCase().includes(q) ||
          v.textEn.toLowerCase().includes(q) ||
          v.bookNameEn.toLowerCase().includes(q) ||
          v.bookNameNe.includes(q)
      );
    }
    return getVersesForBookChapter(selectedBook.id, selectedChapter);
  }, [selectedBook.id, selectedChapter, searchQuery]);

  // Record reading history & cache offline
  useEffect(() => {
    try {
      localStorage.setItem(
        `susamachar_offline_chapter_${selectedBook.id}_${selectedChapter}`,
        JSON.stringify(currentVerses)
      );
      setReadingHistory((prev) => {
        const filtered = prev.filter((item) => !(item.bookId === selectedBook.id && item.chapter === selectedChapter));
        const next = [
          { bookId: selectedBook.id, chapter: selectedChapter, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ...filtered,
        ].slice(0, 8);
        localStorage.setItem('susamachar_bible_history', JSON.stringify(next));
        return next;
      });
    } catch {
      // ignore storage errors
    }
  }, [selectedBook.id, selectedChapter, currentVerses]);

  const handleHighlight = (verseId: string, color: string) => {
    setHighlights((prev) => {
      const next = { ...prev };
      if (next[verseId] === color) {
        delete next[verseId];
      } else {
        next[verseId] = color;
      }
      localStorage.setItem('susamachar_bible_highlights', JSON.stringify(next));
      return next;
    });
  };

  const handleCopyVerse = (v: BibleVerse) => {
    const text = `${v.bookNameNe} ${toNepaliDigits(v.chapter)}:${toNepaliDigits(v.verse)} (${v.bookNameEn} ${v.chapter}:${v.verse})\n"${v.textNe}"\n"${v.textEn}"\n— Susamachar App`;
    navigator.clipboard?.writeText(text);
    setCopiedId(v.id);
    onNotify(lang === 'ne' ? 'बाइबल पद कपी गरियो!' : 'Bible verse copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareVerse = async (v: BibleVerse) => {
    const text = `${v.bookNameNe} ${toNepaliDigits(v.chapter)}:${toNepaliDigits(v.verse)} — "${v.textNe}" (${v.bookNameEn} ${v.chapter}:${v.verse}: "${v.textEn}")`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Susamachar Holy Bible', text });
        return;
      } catch {
        // fallback to copy
      }
    }
    handleCopyVerse(v);
  };

  const handleDownloadOfflinePack = () => {
    setIsOfflineReady(true);
    localStorage.setItem('susamachar_offline_bible_pack', JSON.stringify(CURATED_BIBLE_VERSES));
    onNotify(
      lang === 'ne'
        ? 'नेपाली र अंग्रेजी बाइबल अफलाइन अध्ययनका लागि सुरक्षित गरियो।'
        : 'Nepali & English Bible chapters cached for offline reading.'
    );
  };

  const fontSizeClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  }[fontSize];

  const highlightBgMap: Record<string, string> = {
    amber: 'bg-amber-100/75 dark:bg-amber-900/30',
    rose: 'bg-rose-100/75 dark:bg-rose-900/30',
    sky: 'bg-sky-100/75 dark:bg-sky-900/30',
    emerald: 'bg-emerald-100/75 dark:bg-emerald-900/30',
  };

  const readingPlanList = [
    { day: 1, titleNe: 'सृष्टि र परमेश्वरको महिमा', titleEn: 'Creation & Glory of God', bookId: 1, chapter: 1, refNe: 'उत्पत्ति १ • भजनसंग्रह १९', refEn: 'Genesis 1 • Psalm 19' },
    { day: 2, titleNe: 'असल गोठालोको प्रतिज्ञा', titleEn: 'Promise of the Good Shepherd', bookId: 19, chapter: 23, refNe: 'भजनसंग्रह २३ • यूहन्ना १०', refEn: 'Psalm 23 • John 10' },
    { day: 3, titleNe: 'डाँडाको उपदेश र धन्यका कुराहरू', titleEn: 'Sermon on the Mount (Beatitudes)', bookId: 40, chapter: 5, refNe: 'मत्ती ५:१–१६', refEn: 'Matthew 5:1–16' },
    { day: 4, titleNe: 'परमेश्वरको अनन्त प्रेम र उद्धार', titleEn: 'God’s Everlasting Love & Salvation', bookId: 43, chapter: 3, refNe: 'यूहन्ना ३:१–२१', refEn: 'John 3:1–21' },
    { day: 5, titleNe: 'ख्रीष्टमा विजेता जीवन', titleEn: 'More Than Conquerors in Christ', bookId: 45, chapter: 8, refNe: 'रोमी ८:१८–३९', refEn: 'Romans 8:18–39' },
    { day: 6, titleNe: 'प्रार्थना र परमेश्वरको शान्ति', titleEn: 'Prayer & Peace of God', bookId: 50, chapter: 4, refNe: 'फिलिप्पी ४:४–१३', refEn: 'Philippians 4:4–13' },
    { day: 7, titleNe: 'नयाँ आकाश र नयाँ पृथ्वीको आशा', titleEn: 'Hope of the New Creation', bookId: 66, chapter: 21, refNe: 'प्रकाश २१:१–७', refEn: 'Revelation 21:1–7' },
  ];

  const bookmarkedVerses = useMemo(() => {
    return CURATED_BIBLE_VERSES.filter((v) => bookmarks.includes(v.id));
  }, [bookmarks]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-stone-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-medium text-red-800 dark:text-amber-400">
            {lang === 'ne' ? 'पवित्र धर्मशास्त्र • पुरानो र नयाँ करार (६६ पुस्तकहरू)' : 'Holy Scripture • Old & New Testament (66 Books)'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {lang === 'ne' ? 'नेपाली र अंग्रेजी पवित्र बाइबल' : 'Bilingual Nepali & English Holy Bible'}
          </h1>
        </div>

        {/* Interactive Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/75 dark:bg-slate-900 rounded-xl">
          <button
            onClick={() => setSubTab('reader')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              subTab === 'reader'
                ? 'bg-red-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ne' ? 'बाइबल अध्ययन (Reader)' : 'Bible Reader'}
          </button>
          <button
            onClick={() => setSubTab('study')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              subTab === 'study'
                ? 'bg-red-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ne' ? 'बाइबल शिक्षा र मनन (Bible Study)' : 'Bible Study & Teachings'}
          </button>
          <button
            onClick={() => setSubTab('plan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              subTab === 'plan'
                ? 'bg-red-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ne' ? 'दैनिक पठन योजना (Reading Plan)' : 'Daily Reading Plan'}
          </button>
          <button
            onClick={() => setSubTab('bookmarks')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              subTab === 'bookmarks'
                ? 'bg-red-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ne' ? `बुकमार्क र इतिहास (${bookmarks.length})` : `Bookmarks & History (${bookmarks.length})`}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: BIBLE READER */}
      {subTab === 'reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Testament, Book & Chapter Selector */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'पुस्तक र अध्याय छान्नुहोस्' : 'Select Book & Chapter'}
              </h2>
              <button
                onClick={handleDownloadOfflinePack}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0"
                title="Save for Offline Reading"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isOfflineReady ? (lang === 'ne' ? 'अफलाइन तयार' : 'Offline Ready') : 'Download'}</span>
              </button>
            </div>

            {/* Testament Filter */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-slate-800 rounded-lg">
              {(['ALL', 'OT', 'NT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTestamentFilter(t)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    testamentFilter === t
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t === 'ALL'
                    ? lang === 'ne' ? 'सबै (६६)' : 'All (66)'
                    : t === 'OT'
                    ? lang === 'ne' ? 'पुरानो (३९)' : 'Old (39)'
                    : lang === 'ne' ? 'नयाँ (२७)' : 'New (27)'}
                </button>
              ))}
            </div>

            {/* Book Dropdown & Quick List */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {lang === 'ne' ? 'बाइबलको पुस्तक (Book)' : 'Bible Book'}
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(Number(e.target.value));
                  setSelectedChapter(1);
                  setSearchQuery('');
                }}
                className="w-full h-11 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                {filteredBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookNumber}. {b.nameNe} ({b.nameEn}) — {b.chaptersCount} {lang === 'ne' ? 'अध्याय' : 'Ch'}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {lang === 'ne' ? `${selectedBook.nameNe} का अध्यायहरू` : `${selectedBook.nameEn} Chapters`}
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {lang === 'ne' ? `अध्याय ${toNepaliDigits(selectedChapter)} / ${toNepaliDigits(selectedBook.chaptersCount)}` : `Ch ${selectedChapter} of ${selectedBook.chaptersCount}`}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setSelectedChapter(ch);
                      setSearchQuery('');
                    }}
                    className={`h-9 rounded-lg text-xs font-mono tabular-nums font-semibold transition-colors ${
                      selectedChapter === ch && !searchQuery
                        ? 'bg-red-800 text-white'
                        : 'bg-stone-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang === 'ne' ? toNepaliDigits(ch) : ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Chapters Quick Jump */}
            <div className="pt-3 border-t border-stone-200/80 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {lang === 'ne' ? 'लोकप्रिय अध्यायहरू (Quick Jump)' : 'Popular Chapters'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { labelNe: 'उत्पत्ति १', labelEn: 'Genesis 1', bookId: 1, ch: 1 },
                  { labelNe: 'भजनसंग्रह २३', labelEn: 'Psalm 23', bookId: 19, ch: 23 },
                  { labelNe: 'हितोपदेश ३', labelEn: 'Proverbs 3', bookId: 20, ch: 3 },
                  { labelNe: 'मत्ती ५', labelEn: 'Matthew 5', bookId: 40, ch: 5 },
                  { labelNe: 'यूहन्ना ३', labelEn: 'John 3', bookId: 43, ch: 3 },
                  { labelNe: 'रोमी ८', labelEn: 'Romans 8', bookId: 45, ch: 8 },
                  { labelNe: 'फिलिप्पी ४', labelEn: 'Philippians 4', bookId: 50, ch: 4 },
                  { labelNe: 'प्रकाश २१', labelEn: 'Revelation 21', bookId: 66, ch: 21 },
                ].map((item) => (
                  <button
                    key={`${item.bookId}-${item.ch}`}
                    onClick={() => {
                      setSelectedBookId(item.bookId);
                      setSelectedChapter(item.ch);
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700 hover:text-red-800 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    {lang === 'ne' ? item.labelNe : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Verses Reader & Toolbar */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6">
            {/* Reader Controls Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-slate-800">
              {/* Search Verses Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ne' ? 'बाइबल पद खोज्नुहोस् (उदा: प्रेम, गोठालो, शान्ति)...' : 'Search Bible verses (e.g., love, shepherd, peace)...'}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              {/* Language Mode & Font Size Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center p-1 bg-stone-100 dark:bg-slate-800 rounded-lg">
                  {(['parallel', 'ne', 'en'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setBibleMode(m)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        bibleMode === m
                          ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m === 'parallel' ? (lang === 'ne' ? 'द्विभाषी' : 'Parallel') : m === 'ne' ? 'नेपाली' : 'English'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const order: Array<'sm' | 'base' | 'lg' | 'xl'> = ['sm', 'base', 'lg', 'xl'];
                    const next = order[(order.indexOf(fontSize) + 1) % order.length];
                    setFontSize(next);
                  }}
                  className="h-9 px-3 rounded-lg border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  title="Adjust Font Size"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>{fontSize.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* Chapter Heading & Prev/Next Chapter Buttons */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBook.testament === 'OT'
                    ? lang === 'ne' ? 'पुरानो करार (Old Testament)' : 'Old Testament'
                    : lang === 'ne' ? 'नयाँ करार (New Testament)' : 'New Testament'}
                  {' · '}
                  {lang === 'ne' ? selectedBook.categoryNe : selectedBook.categoryEn}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {searchQuery
                    ? lang === 'ne'
                      ? `"${searchQuery}" को खोज परिणाम (${currentVerses.length})`
                      : `Search Results for "${searchQuery}" (${currentVerses.length})`
                    : `${selectedBook.nameNe} (${selectedBook.nameEn}) — ${lang === 'ne' ? `अध्याय ${toNepaliDigits(selectedChapter)}` : `Chapter ${selectedChapter}`}`}
                </h2>
              </div>

              {!searchQuery && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedChapter((c) => Math.max(1, c - 1))}
                    disabled={selectedChapter <= 1}
                    className="h-10 w-10 rounded-xl border border-stone-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-slate-800"
                    aria-label="Previous Chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedChapter((c) => Math.min(selectedBook.chaptersCount, c + 1))}
                    disabled={selectedChapter >= selectedBook.chaptersCount}
                    className="h-10 w-10 rounded-xl border border-stone-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-slate-800"
                    aria-label="Next Chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Verses List */}
            <div className="divide-y divide-stone-200/70 dark:divide-slate-800/80">
              {currentVerses.map((v) => {
                const isBookmarked = bookmarks.includes(v.id);
                const highlightColor = highlights[v.id];
                const bgClass = highlightColor ? highlightBgMap[highlightColor] : '';

                return (
                  <div
                    key={v.id}
                    className={`py-4 px-3 -mx-3 rounded-xl transition-colors ${bgClass}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="text-xs font-mono tabular-nums font-bold text-red-800 dark:text-amber-400">
                        {v.bookNameNe} {toNepaliDigits(v.chapter)}:{toNepaliDigits(v.verse)} · {v.bookNameEn} {v.chapter}:{v.verse}
                      </span>

                      {/* Verse Action Controls (Highlight, Bookmark, Copy, Share) */}
                      <div className="flex items-center gap-1 shrink-0">
                        {(['amber', 'rose', 'sky', 'emerald'] as const).map((color) => (
                          <button
                            key={color}
                            onClick={() => handleHighlight(v.id, color)}
                            className={`w-5 h-5 rounded-full border ${
                              highlightColor === color ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-65 hover:opacity-100'
                            } ${
                              color === 'amber'
                                ? 'bg-amber-300 border-amber-500'
                                : color === 'rose'
                                ? 'bg-rose-300 border-rose-500'
                                : color === 'sky'
                                ? 'bg-sky-300 border-sky-500'
                                : 'bg-emerald-300 border-emerald-500'
                            }`}
                            title={`Highlight ${color}`}
                          />
                        ))}
                        <button
                          onClick={() => onToggleBookmark(v.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBookmarked
                              ? 'text-red-700 dark:text-amber-400 bg-red-50 dark:bg-slate-800'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                          title="Bookmark Verse"
                        >
                          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleCopyVerse(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Copy Verse"
                        >
                          {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleShareVerse(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Share Verse Text"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShareImageVerse(v)}
                          className="ml-1 px-2.5 py-1 rounded-lg bg-red-800/10 dark:bg-amber-400/15 text-red-800 dark:text-amber-300 hover:bg-red-800 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                          title="Share as Image Card"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{lang === 'ne' ? 'तस्बिर सेयर' : 'Share as Image'}</span>
                        </button>
                      </div>
                    </div>

                    {(bibleMode === 'parallel' || bibleMode === 'ne') && (
                      <p className={`${fontSizeClass} text-slate-900 dark:text-slate-100 font-medium`}>
                        {v.textNe}
                      </p>
                    )}
                    {(bibleMode === 'parallel' || bibleMode === 'en') && (
                      <p className={`${fontSizeClass} ${bibleMode === 'parallel' ? 'mt-2 text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                        {v.textEn}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Authorized Public Domain & License Notice */}
            <div className="pt-4 border-t border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {lang === 'ne'
                  ? 'स्रोत: नेपाली पवित्र बाइबल (सार्वजनिक संस्करण) र अंग्रेजी KJV / WEB (Public Domain)'
                  : 'Source: Authorized Public Edition Nepali Holy Bible & English KJV / World English Bible (Public Domain)'}
              </span>
              <span>
                {lang === 'ne' ? 'अफलाइन अध्ययन समर्थित (PWA & Local Cache)' : 'Offline Reading Enabled'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BIBLE STUDY, TOPICS, CHARACTERS & GOSPEL */}
      {subTab === 'study' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            {BIBLE_STUDY_ARTICLES.map((art) => (
              <button
                key={art.id}
                onClick={() => setSelectedStudyArticle(art)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selectedStudyArticle.id === art.id
                    ? 'bg-white dark:bg-slate-900 border-red-800 dark:border-amber-500 shadow-xs'
                    : 'bg-white/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-red-800 dark:text-amber-400 font-medium">
                  <span>{art.category.toUpperCase()}</span>
                  <span>·</span>
                  <span>{lang === 'ne' ? art.scriptureRefNe : art.scriptureRefEn}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {lang === 'ne' ? art.titleNe : art.titleEn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {lang === 'ne' ? art.summaryNe : art.summaryEn}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="text-xs text-red-800 dark:text-amber-400 font-semibold">
              {selectedStudyArticle.scriptureRefNe} · {selectedStudyArticle.scriptureRefEn}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedStudyArticle.titleNe}
            </h2>
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              {selectedStudyArticle.titleEn}
            </p>
            <div className="space-y-4 pt-3 border-t border-stone-200 dark:border-slate-800 text-base leading-relaxed text-slate-800 dark:text-slate-200">
              <p>{selectedStudyArticle.contentNe}</p>
              <p className="text-slate-600 dark:text-slate-300">{selectedStudyArticle.contentEn}</p>
            </div>

            <div className="pt-5 border-t border-stone-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'मनन र छलफलका प्रश्नहरू (Study Questions)' : 'Personal & Group Study Questions'}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {(lang === 'ne' ? selectedStudyArticle.studyQuestionsNe : selectedStudyArticle.studyQuestionsEn).map((q, i) => (
                  <li key={i} className="leading-relaxed">{q}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DAILY READING PLAN */}
      {subTab === 'plan' && (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? '७ दिने बाइबल पठन योजना (7-Day Foundational Reading Plan)' : '7-Day Foundational Scripture Reading Plan'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ne' ? 'अध्याय पढ्न क्लिक गर्नुहोस् वा पूरा भएको चिन्ह लगाउनुहोस्।' : 'Click any day to open the scripture passage or mark as completed.'}
              </p>
            </div>
            <span className="text-sm font-mono tabular-nums font-bold text-red-800 dark:text-amber-400">
              {completedPlanDays.length} / {readingPlanList.length} {lang === 'ne' ? 'पूरा भयो' : 'Completed'}
            </span>
          </div>

          <div className="divide-y divide-stone-200/80 dark:divide-slate-800">
            {readingPlanList.map((item) => {
              const isDone = completedPlanDays.includes(item.day);
              return (
                <div key={item.day} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() =>
                        setCompletedPlanDays((prev) =>
                          prev.includes(item.day) ? prev.filter((d) => d !== item.day) : [...prev, item.day]
                        )
                      }
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <p className="text-xs font-mono tabular-nums text-slate-500">
                        {lang === 'ne' ? `दिन ${toNepaliDigits(item.day)} · ${item.refNe}` : `Day ${item.day} · ${item.refEn}`}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {lang === 'ne' ? item.titleNe : item.titleEn}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBookId(item.bookId);
                      setSelectedChapter(item.chapter);
                      setSubTab('reader');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-red-800 hover:text-white transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    {lang === 'ne' ? 'अध्याय पढ्नुहोस्' : 'Read Passage'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: BOOKMARKS & READING HISTORY */}
      {subTab === 'bookmarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'सुरक्षित गरिएका बाइबल पदहरू (Bookmarked Verses)' : 'Saved Bible Verses'}</span>
            </h2>
            {bookmarkedVerses.length === 0 ? (
              <p className="text-sm text-slate-500 py-6">
                {lang === 'ne' ? 'कुनै बाइबल पद बुकमार्क गरिएको छैन।' : 'No verses bookmarked yet. Click the bookmark icon next to any verse.'}
              </p>
            ) : (
              <div className="divide-y divide-stone-200 dark:divide-slate-800">
                {bookmarkedVerses.map((v) => (
                  <div key={v.id} className="py-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono tabular-nums font-bold text-red-800 dark:text-amber-400">
                        {v.bookNameNe} {toNepaliDigits(v.chapter)}:{toNepaliDigits(v.verse)} ({v.bookNameEn} {v.chapter}:{v.verse})
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShareImageVerse(v)}
                          className="text-xs font-semibold text-red-800 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{lang === 'ne' ? 'तस्बिर सेयर' : 'Share as Image'}</span>
                        </button>
                        <button
                          onClick={() => onToggleBookmark(v.id)}
                          className="text-xs text-slate-500 hover:text-red-700"
                        >
                          {lang === 'ne' ? 'हटाउनुहोस्' : 'Remove'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{v.textNe}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{v.textEn}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'भर्खरै पढिएका अध्यायहरू (Reading History)' : 'Recent Reading History'}</span>
            </h2>
            <div className="divide-y divide-stone-200 dark:divide-slate-800">
              {readingHistory.map((h, idx) => {
                const bk = BIBLE_BOOKS.find((b) => b.id === h.bookId) || BIBLE_BOOKS[0];
                return (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {bk.nameNe} ({bk.nameEn}) — {lang === 'ne' ? `अध्याय ${toNepaliDigits(h.chapter)}` : `Chapter ${h.chapter}`}
                      </p>
                      <p className="text-xs font-mono tabular-nums text-slate-500">{h.timestamp}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBookId(h.bookId);
                        setSelectedChapter(h.chapter);
                        setSubTab('reader');
                      }}
                      className="text-xs font-semibold text-red-800 dark:text-amber-400 hover:underline"
                    >
                      {lang === 'ne' ? 'खोल्नुहोस्' : 'Open'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Share Verse as Image Modal */}
      <VerseImageShareModal
        verse={shareImageVerse}
        lang={lang}
        onClose={() => setShareImageVerse(null)}
        onNotify={onNotify}
      />
    </div>
  );
};
