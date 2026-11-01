/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Coins,
  Copy,
  Download,
  FileText,
  Globe,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Info,
  Lock,
  Menu,
  MessageCircle,
  Moon,
  Music,
  Newspaper,
  Pause,
  Play,
  Radio,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Sun,
  User,
  Volume2,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { BhajanModuleView } from './components/BhajanModuleView';
import { BibleModuleView } from './components/BibleModuleView';
import { CalendarConverterView } from './components/CalendarConverterView';
import { CommunityModulesView } from './components/CommunityModulesView';
import { NewsPortalView } from './components/NewsPortalView';
import { PrayerWallView } from './components/PrayerWallView';
import { VerseImageShareModal } from './components/VerseImageShareModal';
import {
  ADMIN_USERS,
  AdminUserRecord,
  AuditLogItem,
  BIBLE_STUDY_ARTICLES,
  BibleVerse,
  ChristianEventItem,
  CURATED_BIBLE_VERSES,
  GalleryAlbum,
  GoldSilverRateData,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CHRISTIAN_EVENTS,
  INITIAL_GALLERY_ALBUMS,
  INITIAL_GOLD_SILVER_RATES,
  INITIAL_NEWS_ARTICLES,
  INITIAL_PRAYER_REQUESTS,
  INITIAL_RADIO_STATIONS,
  NEPAL_CHURCH_DIRECTORY,
  NewsArticle,
  PrayerRequestItem,
  RadioStation,
} from './data/susamacharDatabase';
import { convertADToBS, toNepaliDigits } from './utils/nepaliDateEngine';
import { sacredRadioEngine } from './utils/sacredAudioSynthesizer';
import { useOnlineStatus, usePWAInstall } from './utils/usePWAInstall';

type PrimarySection =
  | 'home'
  | 'bible'
  | 'bhajan'
  | 'calendar'
  | 'converter'
  | 'news'
  | 'prayer'
  | 'radio'
  | 'rates'
  | 'gallery'
  | 'events'
  | 'churches'
  | 'admin';

export default function App() {
  const [lang, setLang] = useState<'ne' | 'en'>('ne');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<PrimarySection>('home');

  // Application Data State (synced with /api/* backend)
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [prayers, setPrayers] = useState<PrayerRequestItem[]>(INITIAL_PRAYER_REQUESTS);
  const [radioStations, setRadioStations] = useState<RadioStation[]>(INITIAL_RADIO_STATIONS);
  const [rates, setRates] = useState<GoldSilverRateData>(INITIAL_GOLD_SILVER_RATES);
  const [calendarEvents, setCalendarEvents] = useState(INITIAL_CALENDAR_EVENTS);
  const [galleryAlbums] = useState<GalleryAlbum[]>(INITIAL_GALLERY_ALBUMS);
  const [events] = useState<ChristianEventItem[]>(INITIAL_CHRISTIAN_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUserRecord>(ADMIN_USERS[0]);

  // User Personalization & Auth State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('susamachar_bookmarks') || '["43-3-16","19-23-1"]');
    } catch {
      return ['43-3-16', '19-23-1'];
    }
  });
  const [savedNewsIds, setSavedNewsIds] = useState<number[]>([1]);
  const [favoriteStationIds, setFavoriteStationIds] = useState<number[]>([1]);

  // Live FM Radio Audio State
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.75);

  // Modals & Drawers
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showIOSInstallModal, setShowIOSInstallModal] = useState<boolean>(false);
  const [showMobileMenuDrawer, setShowMobileMenuDrawer] = useState<boolean>(false);
  const [activeFooterModal, setActiveFooterModal] = useState<
    'about' | 'privacy' | 'terms' | 'tools' | 'whatsapp' | 'ai' | null
  >(null);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'जय मसीह! म सुसमाचार AI बाइबल सहायक हुँ। बाइबल पद, दैनिक मनन, प्रार्थना वा इसाई जीवनसम्बन्धी कुनै पनि प्रश्न सोध्नुहोस्।\n\nJai Masih! I am the Susamachar AI Bible Assistant. Ask me any question about Scripture, devotionals, prayer, or Christian living.',
    },
  ]);
  const [shareHomeVerse, setShareHomeVerse] = useState<BibleVerse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAskAiAssistant = async (customPrompt?: string) => {
    const promptText = (customPrompt ?? aiInput).trim();
    if (!promptText || aiLoading) return;
    setAiMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    if (!customPrompt) setAiInput('');
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, lang }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            data.reply ||
            'परमेश्वरको वचनले भन्दछ: "परमप्रभु मेरो गोठाला हुनुहुन्छ; मलाई केहीको खाँचो हुँदैन।" (भजनसंग्रह २३:१)',
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'परमेश्वरको वचनले भन्दछ: "तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।" (भजनसंग्रह ११९:१०५ / Psalm 119:105)',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // User Auth & Notification Preferences
  const [userSession, setUserSession] = useState<{
    fullName: string;
    email: string;
    churchName: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authChurch, setAuthChurch] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({
    dailyVerse: true,
    prayerReminders: true,
    christianNews: true,
    upcomingEvents: true,
    radioPrograms: false,
    christianFestivals: true,
  });

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const todayBS = useMemo(() => convertADToBS(2026, 10, 31), []);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial API hydration from Express backend (/api/*)
  useEffect(() => {
    Promise.all([
      fetch('/api/news?admin=true').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/prayers?admin=true').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/rates').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/radio').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/calendar/events').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/admin/dashboard').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([newsRes, prayersRes, ratesRes, radioRes, calRes, dashRes]) => {
        if (newsRes?.articles) setNews(newsRes.articles);
        if (prayersRes?.prayers) setPrayers(prayersRes.prayers);
        if (ratesRes?.rates) setRates(ratesRes.rates);
        if (radioRes?.stations) setRadioStations(radioRes.stations);
        if (calRes?.events) setCalendarEvents(calRes.events);
        if (dashRes?.auditLogs) setAuditLogs(dashRes.auditLogs);
      })
      .catch(() => {
        // Uses preloaded offline-capable state when offline
      });
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Radio Playback Handler
  const handlePlayStation = (station: RadioStation) => {
    if (activeStationId === station.id && isPlayingRadio) {
      sacredRadioEngine.stop();
      setIsPlayingRadio(false);
      notify(lang === 'ne' ? `${station.nameNe} रोकियो।` : `Paused ${station.nameEn}`);
    } else {
      setActiveStationId(station.id);
      setIsPlayingRadio(true);
      sacredRadioEngine.start(station.melodyPreset, radioVolume);
      notify(
        lang === 'ne'
          ? `प्रत्यक्ष प्रसारण: ${station.nameNe} (${station.frequency})`
          : `Now Playing: ${station.nameEn} (${station.frequency})`
      );
    }
  };

  const handleVolumeChange = (vol: number) => {
    setRadioVolume(vol);
    sacredRadioEngine.setVolume(vol);
  };

  const handleToggleBookmark = (verseId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(verseId) ? prev.filter((id) => id !== verseId) : [...prev, verseId];
      localStorage.setItem('susamachar_bookmarks', JSON.stringify(next));
      return next;
    });
    notify(lang === 'ne' ? 'बाइबल बुकमार्क अद्यावधिक गरियो।' : 'Bible bookmark updated.');
  };

  const handleToggleSaveNews = (id: number) => {
    setSavedNewsIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    notify(lang === 'ne' ? 'समाचार बुकमार्क सुरक्षित गरियो।' : 'News article bookmark updated.');
  };

  const handleSubmitPrayer = async (data: {
    requesterName: string;
    location: string;
    category: PrayerRequestItem['category'];
    title: string;
    requestText: string;
    visibility: 'public' | 'private';
  }) => {
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        setPrayers((prev) => [json.prayer, ...prev]);
        return;
      }
    } catch {
      // Offline fallback
    }
    const fallbackPrayer: PrayerRequestItem = {
      id: Date.now(),
      requesterName: data.requesterName,
      location: data.location,
      category: data.category,
      titleEn: data.title,
      titleNe: data.title,
      requestTextEn: data.requestText,
      requestTextNe: data.requestText,
      visibility: data.visibility,
      moderationStatus: data.visibility === 'private' ? 'approved' : 'pending',
      prayerStatus: 'active',
      prayedCount: 1,
      createdAtBs: '२०८३ कार्तिक १४',
      createdAtAd: '2026-10-31',
    };
    setPrayers((prev) => [fallbackPrayer, ...prev]);
  };

  const handlePrayForRequest = async (id: number) => {
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, prayedCount: p.prayedCount + 1 } : p)));
    try {
      await fetch(`/api/prayers/${id}/pray`, { method: 'POST' });
    } catch {
      // ignore offline
    }
  };

  // Admin handlers
  const handleCreateNews = async (payload: Partial<NewsArticle>) => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setNews((prev) => [json.article, ...prev]);
        return;
      }
    } catch {
      // fallback
    }
  };

  const handleDeleteNews = async (id: number) => {
    setNews((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  const handleModeratePrayer = async (
    id: number,
    moderationStatus: 'approved' | 'rejected',
    prayerStatus?: 'active' | 'answered'
  ) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, moderationStatus, prayerStatus: prayerStatus || p.prayerStatus }
          : p
      )
    );
    try {
      await fetch(`/api/admin/prayers/${id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationStatus, prayerStatus }),
      });
    } catch {
      // ignore
    }
  };

  const handleUpdateRates = async (payload: {
    fineGoldTola: number;
    tejabiGoldTola: number;
    silverTola: number;
    rateDateBs: string;
  }) => {
    try {
      const res = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setRates(json.rates);
      }
    } catch {
      // ignore
    }
  };

  const handleAddRadioStation = async (payload: {
    nameEn: string;
    nameNe: string;
    frequency: string;
    locationEn: string;
    locationNe: string;
    streamUrl: string;
  }) => {
    try {
      const res = await fetch('/api/admin/radio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setRadioStations((prev) => [...prev, json.station]);
      }
    } catch {
      // ignore
    }
  };

  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'reset') {
      notify(lang === 'ne' ? `पासवर्ड रिसेट लिंक ${authEmail} मा पठाइयो।` : `Password reset link sent to ${authEmail}`);
      setAuthMode('login');
      return;
    }
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: authFullName || 'विश्वासी सदस्य',
          email: authEmail,
          password: authPassword,
          churchName: authChurch || 'Local Fellowship',
        }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.isAdmin && json.admin) {
          setCurrentAdmin(json.admin);
          setActiveSection('admin');
          setShowAccountModal(false);
          notify(`Signed in as Admin: ${json.admin.roleNameEn}`);
          return;
        }
        setUserSession({
          fullName: json.user?.fullName || authFullName || 'आशिष गुरुङ',
          email: json.user?.email || authEmail,
          churchName: json.user?.churchName || authChurch || 'Patan Koinonia Church',
        });
        setShowAccountModal(false);
        notify(lang === 'ne' ? 'सफलतापूर्वक लगइन भयो!' : 'Signed in successfully!');
      } else {
        notify(json.error || 'Authentication failed');
      }
    } catch {
      setUserSession({
        fullName: authFullName || 'आशिष गुरुङ (Ashish Gurung)',
        email: authEmail || 'member@susamachar.org',
        churchName: authChurch || 'Patan Koinonia Church',
      });
      setShowAccountModal(false);
      notify(lang === 'ne' ? 'अफलाइन प्रोफाइल सक्रिय भयो।' : 'Signed in to local profile.');
    }
  };

  // Global search results
  const globalSearchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return { verses: [], news: [], study: [], churches: [] };
    return {
      verses: CURATED_BIBLE_VERSES.filter(
        (v) => v.textNe.toLowerCase().includes(q) || v.textEn.toLowerCase().includes(q) || v.bookNameNe.includes(q) || v.bookNameEn.toLowerCase().includes(q)
      ),
      news: news.filter(
        (n) => n.titleNe.includes(q) || n.titleEn.toLowerCase().includes(q) || n.summaryNe.includes(q)
      ),
      study: BIBLE_STUDY_ARTICLES.filter(
        (s) => s.titleNe.includes(q) || s.titleEn.toLowerCase().includes(q)
      ),
      churches: NEPAL_CHURCH_DIRECTORY.filter(
        (c) => c.nameNe.includes(q) || c.nameEn.toLowerCase().includes(q) || c.cityEn.toLowerCase().includes(q)
      ),
    };
  }, [globalSearchQuery, news]);

  const dailyVerse = CURATED_BIBLE_VERSES.find((v) => v.id === '43-3-16') || CURATED_BIBLE_VERSES[0];

  // All Home Screen Modules
  const homeModulesGrid = [
    { id: 'bible', icon: BookOpen, ne: 'पवित्र बाइबल', en: 'Bible Reading', descNe: 'नेपाली र अंग्रेजी ६६ पुस्तक', descEn: 'Nepali & English 66 Books', color: 'text-red-800 dark:text-amber-400' },
    { id: 'bhajan', icon: Music, ne: 'ख्रीष्टिय भजन', en: 'Christian Bhajan', descNe: 'भजन, कोरस र गितार कर्ड', descEn: 'Nepali Hymns, Lyrics & Chords', color: 'text-red-800 dark:text-amber-400' },
    { id: 'prayer', icon: HeartHandshake, ne: 'प्रार्थना पर्खाल', en: 'Prayer Wall', descNe: 'प्रार्थना निवेदन र मध्यस्थता', descEn: 'Submit & Pray Together', color: 'text-blue-800 dark:text-sky-400' },
    { id: 'calendar', icon: Calendar, ne: 'नेपाली पात्रो', en: 'Nepali Calendar', descNe: 'वि.सं. २०८३ पर्व र बिदा', descEn: 'BS/AD Festivals & Holidays', color: 'text-red-800 dark:text-amber-400' },
    { id: 'converter', icon: ArrowLeftRight, ne: 'मिति परिवर्तन', en: 'Date Converter', descNe: 'BS ↔ AD यथार्थ रूपान्तरण', descEn: 'Exact BS to AD Converter', color: 'text-emerald-700 dark:text-emerald-400' },
    { id: 'news', icon: Newspaper, ne: 'इसाई समाचार', en: 'Christian News', descNe: '१० विधाका ताजा समाचार', descEn: '10 Categories Portal', color: 'text-blue-800 dark:text-sky-400' },
    { id: 'radio', icon: Radio, ne: 'एफ.एम. रेडियो', en: 'FM Radio', descNe: '२४ घण्टे भजन र वचन', descEn: 'Live Christian Stations', color: 'text-red-800 dark:text-amber-400' },
    { id: 'rates', icon: Coins, ne: 'सुनचाँदी दर', en: 'Gold & Silver Rates', descNe: 'तोला र ग्राममा दैनिक मूल्य', descEn: 'Daily NPR Tola & Gram', color: 'text-amber-600 dark:text-amber-400' },
    { id: 'gallery', icon: ImageIcon, ne: 'फोटो ग्यालरी', en: 'Photo Gallery', descNe: 'आराधना र सेवाका तस्बिर', descEn: 'Albums & Event Photos', color: 'text-blue-800 dark:text-sky-400' },
    { id: 'events', icon: Bell, ne: 'इसाई कार्यक्रम', en: 'Christian Events', descNe: 'सम्मेलन, सेमिनार र क्याम्प', descEn: 'Conferences & Seminars', color: 'text-emerald-700 dark:text-emerald-400' },
    { id: 'churches', icon: Building2, ne: 'मण्डली निर्देशिका', en: 'Church Directory', descNe: 'नेपालका स्थानीय मण्डलीहरू', descEn: 'Churches Across Nepal', color: 'text-red-800 dark:text-amber-400' },
    { id: 'admin', icon: Shield, ne: 'एडमिन ड्यासबोर्ड', en: 'Multi-Admin CMS', descNe: '८ भूमिका र सुरक्षा नियन्त्रण', descEn: '8-Role RBAC & SQL/APK', color: 'text-slate-800 dark:text-slate-200' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* =====================================================================
          HEADER SYSTEM (Desktop Top Utility Bar + Main Navbar | Mobile 2-Row Header)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 shadow-xs">
        {/* -----------------------------------------------------------------
            DESKTOP VIEW (md and up):
            1. Top Utility Bar ABOVE Navbar: Date on left | Search, Eng/Nep, Notifications, Account on right
            2. Main Navbar BELOW Top Bar: Logo, Navigation Links, Primary CTA
           ----------------------------------------------------------------- */}
        <div className="hidden md:block">
          {/* Row 1 (Above Main Navbar): Clean Utility Bar */}
          <div className="bg-stone-100/90 dark:bg-slate-950/90 border-b border-stone-200/80 dark:border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4 text-xs">
              {/* Left: Nepali Date */}
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-red-800 dark:text-amber-400 shrink-0" />
                <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {lang === 'ne' ? todayBS.formattedNe : todayBS.formattedEn}
                </span>
              </div>

              {/* Right: Search, Eng/Nep, Notifications, Account (+ Theme toggle) */}
              <div className="flex items-center gap-2.5">
                {/* Search */}
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5 hover:border-red-800 dark:hover:border-amber-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                  <span>{lang === 'ne' ? 'खोज्नुहोस् (Search)' : 'Search'}</span>
                </button>

                {/* Eng / नेप Language Switcher */}
                <button
                  onClick={() => setLang((l) => (l === 'ne' ? 'en' : 'ne'))}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 hover:border-red-800 dark:hover:border-amber-400 transition-colors whitespace-nowrap shrink-0"
                  title="Switch Language (English / नेपाली)"
                >
                  <Globe className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                  <span>
                    <span className={lang === 'en' ? 'text-red-800 dark:text-amber-400 font-bold' : ' opacity-75'}>
                      Eng
                    </span>
                    <span className="mx-1 text-slate-400">/</span>
                    <span className={lang === 'ne' ? 'text-red-800 dark:text-amber-400 font-bold' : 'opacity-75'}>
                      नेप
                    </span>
                  </span>
                </button>

                {/* सूचना (Notifications) */}
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:border-red-800 dark:hover:border-amber-400 transition-colors whitespace-nowrap shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                  <span>{lang === 'ne' ? 'सूचना' : 'Alerts'}</span>
                </button>

                {/* खाता (Account) */}
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="h-7 px-3 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium hover:border-red-800 dark:hover:border-amber-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                  <span>
                    {userSession
                      ? userSession.fullName.split(' ')[0]
                      : lang === 'ne'
                      ? 'खाता (Account)'
                      : 'Account'}
                  </span>
                </button>

                {/* Subtle Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-red-800 dark:hover:border-amber-400 transition-colors shrink-0"
                  aria-label="Toggle Dark Mode"
                  title="Dark / Light Mode"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                </button>

                {/* Optional PWA Install Pill */}
                {!isInstalled && (isInstallable || isIOS) && (
                  <button
                    onClick={() => {
                      if (isInstallable) {
                        install();
                      } else if (isIOS) {
                        setShowIOSInstallModal(true);
                      }
                    }}
                    className="h-7 px-2.5 rounded-lg bg-blue-900 text-white font-semibold flex items-center gap-1 hover:bg-blue-800 whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>{lang === 'ne' ? 'एप इन्स्टल' : 'Install App'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 (Main Desktop Navbar): Logo, Navigation Links, Primary CTA */}
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
            {/* Brand Logo + Wordmark */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('home');
              }}
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-red-900 dark:text-amber-400 whitespace-nowrap shrink-0"
            >
              <span className="w-9 h-9 rounded-xl bg-red-800 text-amber-300 flex items-center justify-center font-serif text-lg shadow-xs shrink-0">
                ✝
              </span>
              <span>सुसमाचार · Susamachar</span>
            </a>

            {/* Navigation Links with Icons & Names (Home, Bible, Bhajan, Prayer, News, Church) */}
            <nav className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 overflow-x-auto">
              {[
                { id: 'home', icon: Home, ne: 'गृहपृष्ठ (Home)', en: 'Home' },
                { id: 'bible', icon: BookOpen, ne: 'बाइबल (Bible)', en: 'Bible' },
                { id: 'bhajan', icon: Music, ne: 'भजन (Bhajan)', en: 'Bhajan' },
                { id: 'prayer', icon: HeartHandshake, ne: 'प्रार्थना (Prayer)', en: 'Prayer' },
                { id: 'news', icon: Newspaper, ne: 'समाचार (News)', en: 'News' },
                { id: 'churches', icon: Building2, ne: 'मण्डली (Church)', en: 'Church' },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as PrimarySection)}
                    className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-red-800/10 text-red-800 dark:bg-amber-400/15 dark:text-amber-400 font-bold'
                        : 'hover:text-red-800 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{lang === 'ne' ? item.ne : item.en}</span>
                  </button>
                );
              })}
            </nav>

            {/* Primary CTA Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveSection('calendar')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[38px] flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'नेपाली पात्रो' : 'Calendar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            MOBILE VIEW (below md):
            Line 1: Logo on left | Search + Three-line menu icon on right
            Line 2: Date on left | Eng/Nep + Sign In on right
           ----------------------------------------------------------------- */}
        <div className="md:hidden">
          {/* Mobile Line 1: Logo, Search, Three-Line Menu Icon */}
          <div className="px-4 h-14 flex items-center justify-between gap-2 border-b border-stone-200/80 dark:border-slate-800/80">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('home');
              }}
              className="flex items-center gap-2 text-base font-bold tracking-tight text-red-900 dark:text-amber-400 whitespace-nowrap shrink-0"
            >
              <span className="w-8 h-8 rounded-lg bg-red-800 text-amber-300 flex items-center justify-center font-serif text-base shrink-0">
                ✝
              </span>
              <span>सुसमाचार · Susamachar</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-red-800 dark:text-amber-400" />
                <span>{lang === 'ne' ? 'खोज' : 'Search'}</span>
              </button>

              <button
                onClick={() => setShowMobileMenuDrawer(true)}
                className="h-9 w-9 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Line 2: Date, Eng/Nep, Sign In */}
          <div className="px-4 py-2 bg-stone-100/90 dark:bg-slate-950/90 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200 truncate">
              {lang === 'ne' ? todayBS.formattedNe : todayBS.formattedEn}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setLang((l) => (l === 'ne' ? 'en' : 'ne'))}
                className="h-7 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
                <span>Eng / नेप</span>
              </button>

              <button
                onClick={() => setShowAccountModal(true)}
                className="h-7 px-2.5 rounded-lg bg-red-800 text-white font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {userSession
                    ? userSession.fullName.split(' ')[0]
                    : lang === 'ne'
                    ? 'Sign In / लगइन'
                    : 'Sign In'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Three-Line Hamburger Navigation Drawer */}
      {showMobileMenuDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-stone-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto p-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-red-800 text-amber-300 flex items-center justify-center font-serif text-base">
                    ✝
                  </span>
                  <div>
                    <p className="text-sm font-bold text-red-900 dark:text-amber-400">सुसमाचार · Susamachar</p>
                    <p className="text-[11px] text-slate-500">{todayBS.formattedNe}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenuDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                {[
                  { id: 'home', ne: 'गृहपृष्ठ (Home)', en: 'Home', icon: Home },
                  { id: 'bible', ne: 'पवित्र बाइबल (Holy Bible)', en: 'Holy Bible', icon: BookOpen },
                  { id: 'bhajan', ne: 'ख्रीष्टिय भजन (Bhajan)', en: 'Christian Bhajan', icon: Music },
                  { id: 'prayer', ne: 'प्रार्थना पर्खाल (Prayer Wall)', en: 'Prayer Wall', icon: HeartHandshake },
                  { id: 'news', ne: 'इसाई समाचार (Christian News)', en: 'Christian News Portal', icon: Newspaper },
                  { id: 'churches', ne: 'मण्डली निर्देशिका (Church)', en: 'Church Directory', icon: Building2 },
                  { id: 'calendar', ne: 'नेपाली पात्रो (Nepali Calendar)', en: 'Nepali Calendar', icon: Calendar },
                  { id: 'converter', ne: 'मिति परिवर्तन (Date Converter)', en: 'BS ↔ AD Date Converter', icon: ArrowLeftRight },
                  { id: 'radio', ne: 'एफ.एम. रेडियो (FM Radio)', en: 'Christian FM Radio', icon: Radio },
                  { id: 'rates', ne: 'सुनचाँदी दर (Gold & Silver Rates)', en: 'Gold & Silver Rates', icon: Coins },
                  { id: 'gallery', ne: 'फोटो ग्यालरी (Photo Gallery)', en: 'Photo Gallery', icon: ImageIcon },
                  { id: 'events', ne: 'इसाई कार्यक्रम (Events)', en: 'Christian Events', icon: Bell },
                  { id: 'admin', ne: 'एडमिन ड्यासबोर्ड (Admin CMS)', en: 'Multi-Admin CMS', icon: Shield },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as PrimarySection);
                        setShowMobileMenuDrawer(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-red-800 text-white'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ne' ? item.ne : item.en}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-slate-800 space-y-2 text-xs">
                <button
                  onClick={() => {
                    setShowMobileMenuDrawer(false);
                    setShowNotificationsModal(true);
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-800 dark:text-amber-400" />
                    {lang === 'ne' ? 'सूचना सेटिङ (Notifications)' : 'Notification Settings'}
                  </span>
                </button>

                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    {lang === 'ne' ? 'डार्क / लाइट मोड (Theme)' : 'Toggle Dark / Light Mode'}
                  </span>
                  <span>{darkMode ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Connectivity Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>
            {lang === 'ne'
              ? 'अफलाइन मोड सक्रिय छ — सुरक्षित गरिएको बाइबल र पात्रो प्रयोग हुँदैछ।'
              : 'Offline Mode Active — Reading from cached Bible, Calendar, and News data.'}
          </span>
        </div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE CONTENT CONTAINER
         ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ===================================================================
            HOME SCREEN (All 14 Sections from Section 2)
           =================================================================== */}
        {activeSection === 'home' && (
          <div className="space-y-10">
            {/* 1. Christian Hero Banner & 2. Daily Bible Verse Split */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 7 Columns: Himalayan Sanctuary Hero Banner */}
              <div className="lg:col-span-7 relative rounded-3xl overflow-hidden bg-slate-900 min-h-[340px] flex flex-col justify-end p-6 sm:p-8 text-white">
                <img
                  src="/art/hero-himalayan-church.svg"
                  alt="Susamachar Himalayan Christian Community Sanctuary"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />

                <div className="relative z-10 space-y-3 max-w-2xl">
                  <p className="text-xs font-semibold tracking-wide text-amber-300">
                    सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                    {lang === 'ne'
                      ? 'सुसमाचार – नेपाली इसाई संजाल तथा बाइबल मञ्च'
                      : 'Susamachar – Nepali Christian Community & Scripture Platform'}
                  </h1>
                  <p className="text-sm text-stone-200 leading-relaxed">
                    Share the Gospel • Grow in Faith • Serve with Love — Access the bilingual Holy Bible, Bikram Sambat Calendar, Christian News Portal, Live FM Radio, and Prayer Wall.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveSection('bible')}
                      className="h-11 px-5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{lang === 'ne' ? 'पवित्र बाइबल पढ्नुहोस्' : 'Read Holy Bible'}</span>
                    </button>
                    <button
                      onClick={() => handlePlayStation(radioStations[0])}
                      className="h-11 px-5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white border border-white/25 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      {isPlayingRadio ? <Pause className="w-4 h-4 text-amber-300" /> : <Play className="w-4 h-4 text-amber-300" />}
                      <span>
                        {lang === 'ne' ? 'प्रत्यक्ष भजन रेडियो (FM 105.1)' : 'Listen Live FM Radio'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Daily Bible Verse Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-red-800 dark:text-amber-400">
                      {lang === 'ne' ? 'आजको बाइबल पद (Daily Verse)' : 'Daily Scripture Verse'}
                    </span>
                    <span className="font-mono tabular-nums">{todayBS.formattedNe}</span>
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed font-editorial">
                    “{dailyVerse.textNe}”
                  </blockquote>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    “{dailyVerse.textEn}”
                  </p>

                  <p className="text-xs font-mono tabular-nums font-bold text-red-800 dark:text-amber-400">
                    — {dailyVerse.bookNameNe} {toNepaliDigits(dailyVerse.chapter)}:{toNepaliDigits(dailyVerse.verse)} ({dailyVerse.bookNameEn} {dailyVerse.chapter}:{dailyVerse.verse})
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`"${dailyVerse.textNe}" — ${dailyVerse.bookNameNe} ३:१६`);
                        notify(lang === 'ne' ? 'आजको बाइबल पद कपी गरियो!' : 'Daily verse copied!');
                      }}
                      className="h-9 px-3 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'कपी' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(dailyVerse.id)}
                      className="h-9 px-3 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-slate-800"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'बुकमार्क' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setShareHomeVerse(dailyVerse)}
                      className="h-9 px-3 rounded-xl bg-red-800/10 dark:bg-amber-400/15 text-red-800 dark:text-amber-300 hover:bg-red-800 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'तस्बिर सेयर' : 'Share as Image'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveSection('bible')}
                    className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    {lang === 'ne' ? 'पूरै अध्याय पढ्नुहोस् →' : 'Read Full Chapter →'}
                  </button>
                </div>
              </div>
            </section>

            {/* All 12 Interactive Module Cards Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? 'सुसमाचार सेवा तथा मोड्युलहरू (All Platform Modules)' : 'Explore Susamachar Modules & Services'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'ne'
                      ? 'बाइबल, प्रार्थना, नेपाली पात्रो, मिति परिवर्तन, समाचार, एफ.एम. रेडियो र सुनचाँदी दर'
                      : 'Direct access to Scripture, Nepali Calendar, Date Converter, News, Radio, Bullion Rates, and Directory'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {homeModulesGrid.map((m) => {
                  const IconComp = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (m.id === 'study') {
                          setActiveSection('bible');
                        } else {
                          setActiveSection(m.id as PrimarySection);
                        }
                      }}
                      className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl p-4 text-left hover:border-red-800 dark:hover:border-amber-400 transition-all group flex flex-col justify-between min-h-[116px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <IconComp className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <div className="mt-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {lang === 'ne' ? m.ne : m.en}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {lang === 'ne' ? m.descNe : m.descEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Christian News Portal Highlights + Live FM Radio & Gold/Silver Snapshot */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: Latest Christian News */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-red-800 dark:text-amber-400">
                      {lang === 'ne' ? 'नेपाल तथा विश्व इसाई समाचार' : 'Christian News Portal'}
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {lang === 'ne' ? 'प्रमुख समाचार र मण्डली गतिविधि' : 'Featured Christian News & Stories'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveSection('news')}
                    className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    {lang === 'ne' ? 'सबै समाचार हेर्नुहोस् →' : 'View All News →'}
                  </button>
                </div>

                <div className="divide-y divide-stone-200/75 dark:divide-slate-800">
                  {news.slice(0, 3).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setActiveSection('news')}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 cursor-pointer group"
                    >
                      <img
                        src={art.featuredImage}
                        alt={art.titleEn}
                        referrerPolicy="no-referrer"
                        className="w-full sm:w-36 h-24 rounded-xl object-cover shrink-0 bg-slate-900"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-red-800 dark:text-amber-400">
                            {lang === 'ne' ? art.categoryNameNe : art.categoryNameEn}
                          </span>
                          <span>·</span>
                          <span>{art.publishedAtBs}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-800 dark:group-hover:text-amber-400 transition-colors leading-snug">
                          {lang === 'ne' ? art.titleNe : art.titleEn}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {lang === 'ne' ? art.summaryNe : art.summaryEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Columns: Live FM Radio + Daily Gold/Silver Bullion Card */}
              <div className="lg:col-span-5 space-y-6">
                {/* Live FM Radio Quick Player Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-400 font-semibold">
                        {lang === 'ne' ? 'प्रत्यक्ष इसाई एफ.एम. रेडियो' : '24/7 Christian FM Broadcast'}
                      </p>
                      <h3 className="text-lg font-bold mt-0.5">
                        {lang === 'ne' ? 'आत्मिक भजन र बाइबल वचन' : 'Nepali Worship & Bible Stream'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSection('radio')}
                      className="text-xs font-semibold text-amber-300 hover:underline"
                    >
                      {lang === 'ne' ? 'सबै स्टेशन →' : 'All Stations →'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {radioStations.slice(0, 2).map((st) => {
                      const active = activeStationId === st.id && isPlayingRadio;
                      return (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-mono tabular-nums text-amber-300">
                              {st.frequency} · {lang === 'ne' ? st.locationNe : st.locationEn}
                            </p>
                            <p className="text-sm font-bold truncate">
                              {lang === 'ne' ? st.nameNe : st.nameEn}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePlayStation(st)}
                            className={`h-9 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                              active ? 'bg-amber-400 text-slate-950' : 'bg-red-800 hover:bg-red-700 text-white'
                            }`}
                          >
                            {active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{active ? (lang === 'ne' ? 'रोक्नुहोस्' : 'Pause') : lang === 'ne' ? 'बजाउनुहोस्' : 'Play'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Gold & Silver Rates Snapshot Card */}
                <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        {lang === 'ne' ? 'दैनिक सुनचाँदी दर (FENEGOSIDA)' : 'Nepal Gold & Silver Rates (NPR)'}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {rates.rateDateBs} ({rates.rateDateAd})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveSection('rates')}
                      className="text-xs font-bold text-red-800 dark:text-amber-400 hover:underline"
                    >
                      {lang === 'ne' ? 'इतिहास र ग्राम दर →' : 'Full History →'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'छापावाल सुन (तोला)' : 'Fine Gold / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.fineGoldTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'तेजाबी सुन (तोला)' : 'Tejabi / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.tejabiGoldTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">
                        {lang === 'ne' ? 'असल चाँदी (तोला)' : 'Silver / Tola'}
                      </span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1 block">
                        रू {rates.silverTola.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 14: Contact & About Us + Platform Architecture Banner */}
            <section className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-amber-400">
                  <Info className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'हाम्रो बारेमा र सम्पर्क (About Susamachar & Contact)' : 'About Susamachar Christian Network & Contact'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  “Share the Gospel • Grow in Faith • Serve with Love”
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'ne'
                    ? 'सुसमाचार (इसाई संजाल) नेपाली भाषी मण्डली, युवा र परिवारहरूका लागि तयार पारिएको द्विभाषी डिजिटल मञ्च हो। यसमा पवित्र बाइबल, प्रार्थना पर्खाल, नेपाली पात्रो, मिति रूपान्तरण, इसाई समाचार र एफ.एम. रेडियो समावेश छन्।'
                    : 'Susamachar is a bilingual Nepali & English Christian platform uniting believers across Nepal and the global diaspora with Scripture, prayer intercession, Bikram Sambat calendar tools, Christian journalism, and live worship radio.'}
                </p>
                <p className="text-xs font-mono text-slate-500 pt-1">
                  Central Office: Jawalakhel, Lalitpur, Nepal · Email: info@susamachar.org · Phone: +977-01-5548200
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <button
                  onClick={() => setActiveSection('admin')}
                  className="h-11 px-5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                >
                  <Shield className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'मल्टी-एडमिन ड्यासबोर्ड र SQL/APK कोड' : 'Open Multi-Admin CMS & SQL/APK Code'}</span>
                </button>
                <button
                  onClick={() => setActiveSection('churches')}
                  className="h-11 px-5 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'नेपाल मण्डली निर्देशिका हेर्नुहोस्' : 'Browse Nepal Church Directory'}</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================
            BIBLE MODULE VIEW
           =================================================================== */}
        {activeSection === 'bible' && (
          <BibleModuleView
            lang={lang}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            NEPALI CALENDAR & BS/AD DATE CONVERTER VIEW
           =================================================================== */}
        {(activeSection === 'calendar' || activeSection === 'converter') && (
          <CalendarConverterView
            lang={lang}
            calendarEvents={calendarEvents}
            initialSubTab={activeSection === 'converter' ? 'converter' : 'calendar'}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            CHRISTIAN NEWS PORTAL VIEW
           =================================================================== */}
        {activeSection === 'news' && (
          <NewsPortalView
            lang={lang}
            articles={news}
            savedNewsIds={savedNewsIds}
            onToggleSaveNews={handleToggleSaveNews}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            NEPALI CHRISTIAN BHAJAN & CHORUS VIEW
           =================================================================== */}
        {activeSection === 'bhajan' && (
          <BhajanModuleView lang={lang} onNotify={notify} />
        )}

        {/* ===================================================================
            PRAYER WALL & INTERCESSION VIEW
           =================================================================== */}
        {activeSection === 'prayer' && (
          <PrayerWallView
            lang={lang}
            prayers={prayers}
            onSubmitPrayer={handleSubmitPrayer}
            onPrayForRequest={handlePrayForRequest}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            COMMUNITY RESOURCES (RADIO, GOLD/SILVER, GALLERY, EVENTS, CHURCHES)
           =================================================================== */}
        {(['radio', 'rates', 'gallery', 'events', 'churches'] as const).includes(
          activeSection as 'radio' | 'rates' | 'gallery' | 'events' | 'churches'
        ) && (
          <CommunityModulesView
            lang={lang}
            initialSubTab={activeSection as 'radio' | 'rates' | 'gallery' | 'events' | 'churches'}
            radioStations={radioStations}
            activeStationId={activeStationId}
            isPlayingRadio={isPlayingRadio}
            radioVolume={radioVolume}
            favoriteStationIds={favoriteStationIds}
            onPlayStation={handlePlayStation}
            onChangeVolume={handleVolumeChange}
            onToggleFavoriteStation={(id) =>
              setFavoriteStationIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            rates={rates}
            galleryAlbums={galleryAlbums}
            events={events}
            churches={NEPAL_CHURCH_DIRECTORY}
            onNotify={notify}
          />
        )}

        {/* ===================================================================
            MULTI-ADMIN DASHBOARD & RBAC CONSOLE
           =================================================================== */}
        {activeSection === 'admin' && (
          <AdminDashboardView
            lang={lang}
            currentAdmin={currentAdmin}
            onSelectAdminRole={setCurrentAdmin}
            news={news}
            onCreateNews={handleCreateNews}
            onDeleteNews={handleDeleteNews}
            prayers={prayers}
            onModeratePrayer={handleModeratePrayer}
            rates={rates}
            onUpdateRates={handleUpdateRates}
            radioStations={radioStations}
            onAddRadioStation={handleAddRadioStation}
            auditLogs={auditLogs}
            onNotify={notify}
          />
        )}
      </main>

      {/* Persistent Background FM Radio Mini-Player Bar */}
      {activeStationId && (
        <div className="fixed bottom-20 right-4 left-4 lg:left-auto lg:w-96 z-40 bg-slate-900 text-white border border-slate-700 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                const st = radioStations.find((s) => s.id === activeStationId);
                if (st) handlePlayStation(st);
              }}
              className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0"
            >
              {isPlayingRadio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-amber-400 font-mono truncate">
                {isPlayingRadio ? 'LIVE FM STREAM' : 'PAUSED'} · {radioStations.find((s) => s.id === activeStationId)?.frequency}
              </p>
              <p className="text-xs font-bold truncate">
                {lang === 'ne'
                  ? radioStations.find((s) => s.id === activeStationId)?.nameNe
                  : radioStations.find((s) => s.id === activeStationId)?.nameEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={radioVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 accent-amber-400"
            />
            <button
              onClick={() => {
                sacredRadioEngine.stop();
                setIsPlayingRadio(false);
                setActiveStationId(null);
              }}
              className="p-1 text-slate-400 hover:text-white"
              title="Close Radio Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          UNIVERSAL FIXED BOTTOM NAVIGATION BAR (Mobile, Tablet & Desktop)
          Displays Icon + Name for: Home, Bible, Bhajan, Prayer, News, Church
         ===================================================================== */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-stone-200 dark:border-slate-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 grid grid-cols-6 items-center h-16">
          {[
            { id: 'home', icon: Home, ne: 'गृहपृष्ठ', en: 'Home' },
            { id: 'bible', icon: BookOpen, ne: 'बाइबल', en: 'Bible' },
            { id: 'bhajan', icon: Music, ne: 'भजन', en: 'Bhajan' },
            { id: 'prayer', icon: HeartHandshake, ne: 'प्रार्थना', en: 'Prayer' },
            { id: 'news', icon: Newspaper, ne: 'समाचार', en: 'News' },
            { id: 'churches', icon: Building2, ne: 'मण्डली', en: 'Church' },
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as PrimarySection)}
                className={`min-h-[48px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl mx-0.5 sm:mx-1.5 transition-colors ${
                  isActive
                    ? 'text-red-800 dark:text-amber-400 bg-red-800/10 dark:bg-amber-400/15 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-red-800 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800/60 font-medium'
                }`}
              >
                <IconComp className="w-5 h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs md:text-sm tracking-tight whitespace-nowrap">
                  {lang === 'ne' ? item.ne : item.en}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================
          REDESIGNED FOOTER:
          Line 1: Logo + Brand Name, with Slogan directly underneath the Logo
          Line 2: About Us · Privacy · Terms/Conditions · Tools · Support (WhatsApp) · AI
         ===================================================================== */}
      <footer className="bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">
          {/* First Line / Block: Logo + Slogan underneath Logo */}
          <div className="flex flex-col items-center space-y-2">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('home');
              }}
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-red-900 dark:text-amber-400"
            >
              <span className="w-9 h-9 rounded-xl bg-red-800 text-amber-300 flex items-center justify-center font-serif text-lg shadow-xs">
                ✝
              </span>
              <span>सुसमाचार · Susamachar</span>
            </a>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-xl">
              {lang === 'ne'
                ? '“सुसमाचार बाँडौँ • विश्वासमा बढौँ • प्रेममा सेवा गरौँ”'
                : '“Share the Gospel • Grow in Faith • Serve with Love”'}
            </p>
          </div>

          {/* Second Line: About Us, Privacy, Terms/Conditions, Tools, Support (WhatsApp), AI */}
          <div className="w-full pt-5 border-t border-stone-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setActiveFooterModal('about')}
              className="hover:text-red-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'हाम्रो बारेमा (About Us)' : 'About Us'}</span>
            </button>

            <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveFooterModal('privacy')}
              className="hover:text-red-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'गोपनीयता नीति (Privacy)' : 'Privacy Policy'}</span>
            </button>

            <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveFooterModal('terms')}
              className="hover:text-red-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'सेवाका सर्तहरू (Terms & Conditions)' : 'Terms & Conditions'}</span>
            </button>

            <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveFooterModal('tools')}
              className="hover:text-red-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 text-red-800 dark:text-amber-400" />
              <span>{lang === 'ne' ? 'उपकरणहरू (Tools)' : 'Tools'}</span>
            </button>

            <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveFooterModal('whatsapp')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/25 hover:bg-emerald-600/20 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'सहायता (Support · WhatsApp)' : 'Support (WhatsApp)'}</span>
            </button>

            <span className="text-stone-300 dark:text-slate-700 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveFooterModal('ai')}
              className="px-3 py-1.5 rounded-xl bg-red-800 text-white hover:bg-red-900 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'ne' ? 'AI बाइबल सहायक (AI)' : 'AI Assistant'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-3">
            <span>© {new Date().getFullYear()} Susamachar – Christian App | सुसमाचार – इसाई संजाल</span>
            <span>·</span>
            <button
              onClick={() => setActiveSection('admin')}
              className="hover:text-red-800 dark:hover:text-amber-400 underline underline-offset-4"
            >
              {lang === 'ne' ? 'एडमिन पोर्टल (Admin CMS)' : 'Admin CMS'}
            </button>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          FOOTER MODALS: ABOUT US, PRIVACY, TERMS, TOOLS, WHATSAPP SUPPORT, AI
         ===================================================================== */}
      {activeFooterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeFooterModal === 'about' && (
                  <>
                    <Info className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'हाम्रो बारेमा (About Susamachar)' : 'About Susamachar – Christian App'}</span>
                  </>
                )}
                {activeFooterModal === 'privacy' && (
                  <>
                    <Lock className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}</span>
                  </>
                )}
                {activeFooterModal === 'terms' && (
                  <>
                    <FileText className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'सेवाका सर्तहरू (Terms & Conditions)' : 'Terms & Conditions'}</span>
                  </>
                )}
                {activeFooterModal === 'tools' && (
                  <>
                    <Wrench className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'दैनिक उपयोगी उपकरणहरू (Susamachar Tools)' : 'Susamachar Christian & Daily Tools'}</span>
                  </>
                )}
                {activeFooterModal === 'whatsapp' && (
                  <>
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'ne' ? 'व्हाट्सएप सहायता (WhatsApp Support)' : 'WhatsApp Community & Technical Support'}</span>
                  </>
                )}
                {activeFooterModal === 'ai' && (
                  <>
                    <Sparkles className="w-5 h-5 text-red-800 dark:text-amber-400" />
                    <span>{lang === 'ne' ? 'सुसमाचार AI बाइबल सहायक (AI Assistant)' : 'Susamachar AI Bible & Devotional Assistant'}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveFooterModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeFooterModal === 'about' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-900 dark:text-white">
                  सुसमाचार – इसाई संजाल (Susamachar – Christian App)
                </p>
                <p>
                  {lang === 'ne'
                    ? 'सुसमाचार एप नेपाल र विश्वभरका नेपाली भाषी विश्वासीहरूका लागि तयार पारिएको सम्पूर्ण डिजिटल प्लेटफर्म हो। यसमा नेपाली र अंग्रेजी पवित्र बाइबल, प्रार्थना पर्खाल, विक्रम सम्वत् पात्रो, मिति परिवर्तन, इसाई समाचार, २४ घण्टे क्रिश्चियन एफ.एम. रेडियो, सुनचाँदीको दैनिक दर र मण्डली निर्देशिका उपलब्ध छन्।'
                    : 'Susamachar is a bilingual Nepali and English Christian platform uniting believers across Nepal and the global diaspora with the Holy Bible, Prayer Wall, Bikram Sambat Calendar, BS/AD Date Converter, Christian News Portal, 24/7 FM Radio, and Church Directory.'}
                </p>
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-1">
                  <p><strong>Email:</strong> info@susamachar.org</p>
                  <p><strong>Phone / WhatsApp:</strong> +977-1-5548900 / +977-9851000000</p>
                  <p><strong>Office:</strong> Jawalakhel, Lalitpur, Nepal</p>
                </div>
              </div>
            )}

            {activeFooterModal === 'privacy' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Prayer Request Privacy:</strong> Private prayer requests submitted on Susamachar are strictly confidential and never displayed on the public Prayer Wall without explicit consent and pastoral moderation.
                </p>
                <p>
                  <strong>2. Personal Data Protection:</strong> Your account email, saved Bible bookmarks, and notification preferences are encrypted and never sold or shared with third-party advertisers.
                </p>
                <p>
                  <strong>3. Offline Storage:</strong> Bible chapters and Nepali Calendar data cached on your device remain strictly local for offline reading.
                </p>
              </div>
            )}

            {activeFooterModal === 'terms' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Scripture Licensing:</strong> All Nepali and English Bible translations provided in Susamachar are authorized public domain or licensed editions for personal devotion and church study.
                </p>
                <p>
                  <strong>2. Community Conduct:</strong> Users submitting prayer requests or news comments agree to uphold Christian love, mutual respect, and truthfulness.
                </p>
                <p>
                  <strong>3. Editorial Verification:</strong> Christian news articles and church events are verified by our editorial and pastoral moderation team before publication.
                </p>
              </div>
            )}

            {activeFooterModal === 'tools' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    id: 'calendar',
                    titleNe: 'नेपाली पात्रो (BS/AD Calendar)',
                    titleEn: 'Nepali Calendar (BS 2083)',
                    descNe: 'पर्व, बिदा र मण्डली कार्यक्रम',
                    descEn: 'Christian festivals & public holidays',
                    icon: Calendar,
                  },
                  {
                    id: 'converter',
                    titleNe: 'मिति परिवर्तन (Date Converter)',
                    titleEn: 'BS ↔ AD Date Converter',
                    descNe: 'विक्रम सम्वत् र ईस्वी सम्वत् रूपान्तरण',
                    descEn: 'Exact Bikram Sambat to Gregorian',
                    icon: ArrowLeftRight,
                  },
                  {
                    id: 'rates',
                    titleNe: 'सुनचाँदी दर (Gold & Silver)',
                    titleEn: 'Gold & Silver Rates (NPR)',
                    descNe: 'दैनिक तोला र १० ग्रामको मूल्य',
                    descEn: 'Daily Fine Gold, Tejabi & Silver',
                    icon: Coins,
                  },
                  {
                    id: 'bible',
                    titleNe: 'पद तस्बिर कार्ड (Verse Image Tool)',
                    titleEn: 'Bible Verse Image Generator',
                    descNe: 'बाइबल पदलाई आकर्षक कार्डमा सेयर गर्नुहोस्',
                    descEn: 'Create & download verse cards',
                    icon: ImageIcon,
                  },
                ].map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveSection(tool.id as PrimarySection);
                        setActiveFooterModal(null);
                      }}
                      className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 hover:border-red-800 dark:hover:border-amber-400 text-left flex items-start gap-3 transition-colors"
                    >
                      <ToolIcon className="w-5 h-5 text-red-800 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {lang === 'ne' ? tool.titleNe : tool.titleEn}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === 'ne' ? tool.descNe : tool.descEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeFooterModal === 'whatsapp' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    {lang === 'ne'
                      ? 'सुसमाचार २४/७ व्हाट्सएप सहायता र प्रार्थना डेस्क'
                      : 'Susamachar WhatsApp Support & Prayer Desk'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lang === 'ne'
                      ? 'प्राविधिक सहयोग, मण्डली सूचीकरण, समाचार पठाउन वा आकस्मिक प्रार्थना निवेदनका लागि हाम्रो व्हाट्सएप नम्बरमा सम्पर्क गर्नुहोस्।'
                      : 'Reach our support team on WhatsApp for technical assistance, church listing updates, news submissions, or urgent pastoral prayer.'}
                  </p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    WhatsApp: +977 985-1000000
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://wa.me/9779851000000?text=Jai%20Masih%20Susamachar%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'WhatsApp मा च्याट खोल्नुहोस्' : 'Open WhatsApp Chat'}</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('+9779851000000');
                      notify(lang === 'ne' ? 'व्हाट्सएप नम्बर कपी गरियो!' : 'WhatsApp number copied!');
                    }}
                    className="h-10 px-4 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'नम्बर कपी' : 'Copy Number'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeFooterModal === 'ai' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { ne: 'शान्तिको बाइबल पद', en: 'Bible verse for peace' },
                    { ne: 'यूहन्ना ३:१६ को अर्थ', en: 'Meaning of John 3:16' },
                    { ne: 'बिहानको छोटो प्रार्थना', en: 'Short morning prayer' },
                  ].map((chip) => (
                    <button
                      key={chip.en}
                      onClick={() => handleAskAiAssistant(lang === 'ne' ? chip.ne : chip.en)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-800 hover:text-white transition-colors"
                    >
                      {lang === 'ne' ? chip.ne : chip.en}
                    </button>
                  ))}
                </div>

                <div className="h-64 overflow-y-auto p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-3">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl whitespace-pre-line leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-red-800 text-white ml-8'
                          : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 mr-4'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-500 animate-pulse">
                      {lang === 'ne' ? 'वचन खोजिँदैछ...' : 'Searching Scripture...'}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAiAssistant();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={
                      lang === 'ne'
                        ? 'बाइबल वा प्रार्थनासम्बन्धी प्रश्न सोध्नुहोस्...'
                        : 'Ask a Bible, devotional, or prayer question...'
                    }
                    className="flex-1 h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-red-800"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="h-10 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'पठाउनुहोस्' : 'Ask'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOBAL SEARCH MODAL (Section 15)
         ===================================================================== */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-red-800 dark:text-amber-400" />
              <input
                type="text"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder={lang === 'ne' ? 'बाइबल पद, समाचार, लेख वा मण्डली खोज्नुहोस्...' : 'Search Bible verses, news, study guides, or churches...'}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!globalSearchQuery.trim() ? (
              <div className="py-6 text-center text-xs text-slate-500">
                {lang === 'ne'
                  ? 'खोज्नका लागि शब्द टाइप गर्नुहोस् (उदा: प्रेम, यूहन्ना, पोखरा, गोठालो, प्रार्थना)'
                  : 'Type a keyword to search across Bible verses, Christian News, Study Guides, and Churches.'}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-4 pr-1 text-xs">
                {globalSearchResults.verses.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-red-800 dark:text-amber-400">
                      Holy Bible Verses ({globalSearchResults.verses.length})
                    </p>
                    {globalSearchResults.verses.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setActiveSection('bible');
                          setShowSearchModal(false);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 cursor-pointer hover:border-red-800 border border-transparent"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          {v.bookNameNe} {v.chapter}:{v.verse} ({v.bookNameEn})
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{v.textNe}</p>
                      </div>
                    ))}
                  </div>
                )}

                {globalSearchResults.news.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-red-800 dark:text-amber-400">
                      Christian News ({globalSearchResults.news.length})
                    </p>
                    {globalSearchResults.news.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setActiveSection('news');
                          setShowSearchModal(false);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 cursor-pointer"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">{n.titleNe}</p>
                        <p className="text-slate-500">{n.titleEn}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          USER ACCOUNT & AUTHENTICATION MODAL (Section 13)
         ===================================================================== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {userSession
                  ? lang === 'ne' ? 'प्रयोगकर्ता प्रोफाइल (User Profile)' : 'Member Account Profile'
                  : authMode === 'login'
                  ? lang === 'ne' ? 'सुसमाचार खातामा लगइन गर्नुहोस्' : 'Sign In to Susamachar'
                  : authMode === 'register'
                  ? lang === 'ne' ? 'नयाँ खाता दर्ता गर्नुहोस्' : 'Create Member Account'
                  : lang === 'ne' ? 'पासवर्ड रिसेट गर्नुहोस्' : 'Reset Password'}
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userSession ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950 space-y-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{userSession.fullName}</p>
                  <p className="text-slate-500">{userSession.email}</p>
                  <p className="text-red-800 dark:text-amber-400 font-semibold">
                    Fellowship: {userSession.churchName}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{bookmarks.length}</div>
                    <div className="text-[11px] text-slate-500">Saved Verses</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{savedNewsIds.length}</div>
                    <div className="text-[11px] text-slate-500">Saved News</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-950">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{favoriteStationIds.length}</div>
                    <div className="text-[11px] text-slate-500">Fav Radio</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUserSession(null);
                    setShowAccountModal(false);
                    notify(lang === 'ne' ? 'लगआउट गरियो।' : 'Logged out.');
                  }}
                  className="w-full h-10 rounded-xl bg-stone-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  {lang === 'ne' ? 'लगआउट (Logout)' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleUserAuthSubmit} className="space-y-3 text-xs">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="आशिष गुरुङ (Ashish Gurung)"
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Local Church / Fellowship</label>
                      <input
                        type="text"
                        value={authChurch}
                        onChange={(e) => setAuthChurch(e.target.value)}
                        placeholder="Patan Koinonia Church"
                        className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Email or Admin Username</label>
                  <input
                    type="text"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="member@susamachar.org or superadmin"
                    className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                  />
                </div>

                {authMode !== 'reset' && (
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold"
                >
                  {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>

                <div className="flex items-center justify-between pt-2 text-slate-500">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="hover:underline font-semibold text-red-800 dark:text-amber-400"
                  >
                    {authMode === 'login' ? 'Create new account' : 'Back to Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PUSH NOTIFICATIONS PREFERENCES MODAL (Section 14)
         ===================================================================== */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'ne' ? 'पुश सूचना सेटिङ (Push Notifications)' : 'Push Notification Categories'}
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'ne'
                ? 'तपाईंले प्राप्त गर्न चाहनुहुने सूचनाका विधाहरू छान्नुहोस्:'
                : 'Enable or disable push notification categories for your device:'}
            </p>
            <div className="divide-y divide-stone-200 dark:divide-slate-800 text-xs">
              {[
                { key: 'dailyVerse', ne: 'दैनिक बाइबल पद (Daily Bible Verse)', en: 'Daily Bible Verse (6:00 AM)' },
                { key: 'prayerReminders', ne: 'प्रार्थना रिमाइन्डर (Prayer Reminders)', en: 'Prayer Wall & Personal Reminders' },
                { key: 'christianNews', ne: 'नयाँ इसाई समाचार (New Christian News)', en: 'Breaking Christian News Nepal' },
                { key: 'upcomingEvents', ne: 'आगामी कार्यक्रम (Upcoming Events)', en: 'Upcoming Conferences & Seminars' },
                { key: 'radioPrograms', ne: 'रेडियो कार्यक्रम (Radio Programs)', en: 'Live FM Radio Broadcast Alerts' },
                { key: 'christianFestivals', ne: 'इसाई पर्व र बिदा (Christian Festivals)', en: 'Nepali Calendar & Festival Alerts' },
              ].map((item) => {
                const enabled = notifPrefs[item.key as keyof typeof notifPrefs];
                return (
                  <div key={item.key} className="py-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'ne' ? item.ne : item.en}
                    </span>
                    <button
                      onClick={() =>
                        setNotifPrefs((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifPrefs],
                        }))
                      }
                      className={`px-3 py-1 rounded-lg font-bold ${
                        enabled ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowNotificationsModal(false);
                notify(lang === 'ne' ? 'सूचना प्राथमिकता सुरक्षित गरियो!' : 'Notification preferences saved!');
              }}
              className="w-full h-10 rounded-xl bg-red-800 text-white text-xs font-bold"
            >
              {lang === 'ne' ? 'सुरक्षित गर्नुहोस् (Save Preferences)' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Install Instructions Modal */}
      {showIOSInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-3 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Install Susamachar on iPhone / iPad
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in your Safari toolbar.<br />
              2. Scroll down and select <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSInstallModal(false)}
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Share Daily Verse as Image Modal */}
      <VerseImageShareModal
        verse={shareHomeVerse}
        lang={lang}
        onClose={() => setShareHomeVerse(null)}
        onNotify={notify}
      />

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
