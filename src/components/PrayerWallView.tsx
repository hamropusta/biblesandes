import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { PrayerRequestItem } from '../data/susamacharDatabase';
import { toNepaliDigits } from '../utils/nepaliDateEngine';

interface PrayerWallViewProps {
  lang: 'ne' | 'en';
  prayers: PrayerRequestItem[];
  onSubmitPrayer: (data: {
    requesterName: string;
    location: string;
    category: PrayerRequestItem['category'];
    title: string;
    requestText: string;
    visibility: 'public' | 'private';
  }) => Promise<void>;
  onPrayForRequest: (id: number) => void;
  onNotify: (msg: string) => void;
}

export const PrayerWallView: React.FC<PrayerWallViewProps> = ({
  lang,
  prayers,
  onSubmitPrayer,
  onPrayForRequest,
  onNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [prayedIds, setPrayedIds] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState<string>('06:30');
  const [reminderActive, setReminderActive] = useState<boolean>(true);

  // Form states
  const [requesterName, setRequesterName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<PrayerRequestItem['category']>('healing');
  const [title, setTitle] = useState('');
  const [requestText, setRequestText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { key: 'all', ne: 'सबै प्रार्थना', en: 'All Prayers' },
    { key: 'healing', ne: 'निको र स्वास्थ्य (Healing)', en: 'Healing & Health' },
    { key: 'family', ne: 'परिवार र शान्ति (Family)', en: 'Family & Marriage' },
    { key: 'church', ne: 'मण्डली र सेवा (Church)', en: 'Church & Ministry' },
    { key: 'youth', ne: 'युवा र शिक्षा (Youth)', en: 'Youth & Education' },
    { key: 'nation', ne: 'राष्ट्र र समाज (Nation)', en: 'Nation & Peace' },
    { key: 'thanksgiving', ne: 'धन्यवादको गवाही (Thanksgiving)', en: 'Thanksgiving & Answered' },
  ];

  const approvedPublicPrayers = useMemo(() => {
    return prayers.filter((p) => {
      if (p.visibility !== 'public' || p.moderationStatus !== 'approved') return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [prayers, selectedCategory]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requestText.trim()) {
      onNotify(lang === 'ne' ? 'कृपया प्रार्थनाको शीर्षक र विवरण लेख्नुहोस्।' : 'Please enter prayer title and details.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitPrayer({
        requesterName: requesterName.trim() || (lang === 'ne' ? 'एक विश्वासी' : 'A Believer'),
        location: location.trim() || 'Nepal',
        category,
        title: title.trim(),
        requestText: requestText.trim(),
        visibility,
      });
      setTitle('');
      setRequestText('');
      onNotify(
        visibility === 'private'
          ? lang === 'ne'
            ? 'तपाईंको गोप्य प्रार्थना निवेदन पास्टर/प्रार्थना टोलीमा सुरक्षित पठाइयो।'
            : 'Your private prayer request has been securely sent to the pastoral prayer team.'
          : lang === 'ne'
          ? 'प्रार्थना निवेदन प्राप्त भयो! एडमिन स्वीकृतिपछि सार्वजनिक पर्खालमा प्रकाशित हुनेछ।'
          : 'Prayer request submitted! Public requests appear on the Prayer Wall after admin moderation.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-medium text-red-800 dark:text-amber-400">
            {lang === 'ne'
              ? '"एउटाले अर्काको निम्ति प्रार्थना गर, र तिमीहरू निको हुनेछौ।" — याकूब ५:१६'
              : '"Pray one for another, that ye may be healed." — James 5:16'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {lang === 'ne' ? 'प्रार्थना पर्खाल र मध्यस्थता (Prayer Wall)' : 'Community Prayer Wall & Intercession'}
          </h1>
        </div>

        {/* Daily Prayer Reminder Widget */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
          <Bell className="w-4 h-4 text-red-800 dark:text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 dark:text-white block">
              {lang === 'ne' ? 'दैनिक प्रार्थना रिमाइन्डर' : 'Daily Prayer Reminder'}
            </span>
            <span className="text-slate-500">
              {reminderActive ? `${reminderTime} AM` : lang === 'ne' ? 'बन्द छ' : 'Paused'}
            </span>
          </div>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="h-8 px-2 rounded-lg bg-stone-100 dark:bg-slate-800 text-xs font-mono tabular-nums"
          />
          <button
            onClick={() => {
              setReminderActive((v) => !v);
              onNotify(
                lang === 'ne'
                  ? 'प्रार्थना रिमाइन्डर समय अपडेट गरियो।'
                  : 'Prayer reminder schedule updated.'
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              reminderActive ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-slate-700'
            }`}
          >
            {reminderActive ? (lang === 'ne' ? 'सक्रिय' : 'Active') : lang === 'ne' ? 'खोल्नुहोस्' : 'Enable'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submit Prayer Request Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'ne' ? 'प्रार्थना निवेदन पठाउनुहोस्' : 'Submit a Prayer Request'}
            </h2>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'ne'
              ? 'गोपनीयताको पूर्ण सम्मान गरिन्छ। सार्वजनिक प्रार्थना निवेदनहरू एडमिनले स्वीकृत गरेपछि मात्र प्रकाशित हुन्छन्। व्यक्तिगत/संवेदनशील विषयका लागि "गोप्य (Private)" छान्नुहोस्।'
              : 'Your privacy is strictly respected. Public requests are moderated by a Prayer Admin before publishing. Choose "Private" for sensitive pastoral requests.'}
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'ne' ? 'तपाईंको नाम (Name)' : 'Your Name (or Anonymous)'}
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder={lang === 'ne' ? 'उदा: सन्तोष श्रेष्ठ' : 'e.g. Santosh Shrestha'}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'ne' ? 'स्थान / जिल्ला (Location)' : 'City / District'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={lang === 'ne' ? 'उदा: पोखरा, कास्की' : 'e.g. Pokhara, Kaski'}
                  className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ne' ? 'प्रार्थनाको विषय (Category)' : 'Prayer Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PrayerRequestItem['category'])}
                className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs font-semibold"
              >
                {categories.slice(1).map((c) => (
                  <option key={c.key} value={c.key}>
                    {lang === 'ne' ? c.ne : c.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ne' ? 'प्रार्थनाको शीर्षक (Title)' : 'Prayer Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'ne' ? 'उदा: आमाको शीघ्र स्वास्थ्य लाभको निम्ति' : 'e.g. Complete healing after surgery'}
                className="w-full h-10 px-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ne' ? 'प्रार्थना विवरण (Prayer Details)' : 'Prayer Request Description'}
              </label>
              <textarea
                rows={4}
                required
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder={lang === 'ne' ? 'तपाईंको प्रार्थनाको विषय यहाँ विस्तृतमा लेख्नुहोस्...' : 'Share your prayer burden or thanksgiving testimony...'}
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 text-xs"
              />
            </div>

            {/* Public vs Private Toggle */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  visibility === 'public'
                    ? 'border-red-800 bg-red-50/50 dark:bg-red-950/30 text-slate-900 dark:text-white'
                    : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">
                  {lang === 'ne' ? 'सार्वजनिक (Public Wall)' : 'Public Prayer Wall'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {lang === 'ne' ? 'एडमिन स्वीकृतिपछि देखिने' : 'Moderated before display'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  visibility === 'private'
                    ? 'border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-slate-900 dark:text-white'
                    : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{lang === 'ne' ? 'गोप्य (Private Only)' : 'Private Pastoral'}</span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {lang === 'ne' ? 'प्रार्थना टोलीले मात्र हेर्ने' : 'Confidential prayer team'}
                </div>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition-colors"
            >
              {submitting
                ? lang === 'ne' ? 'पठाउँदै...' : 'Submitting...'
                : lang === 'ne' ? 'प्रार्थना निवेदन दर्ता गर्नुहोस्' : 'Submit Prayer Request'}
            </button>
          </form>
        </div>

        {/* Right Column: Approved Public Prayer Wall */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.key
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                    : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lang === 'ne' ? cat.ne : cat.en}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {approvedPublicPrayers.map((p) => {
              const hasPrayed = prayedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{p.requesterName}</span>
                      <span> · {p.location} · {p.createdAtBs}</span>
                    </div>
                    <span className="font-semibold text-red-800 dark:text-amber-400">
                      {p.prayerStatus === 'answered'
                        ? lang === 'ne' ? '✓ उत्तर प्राप्त गवाही (Answered Prayer)' : '✓ Answered Prayer Testimony'
                        : lang === 'ne' ? 'निरन्तर प्रार्थनामा' : 'Active Intercession'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {lang === 'ne' ? p.titleNe : p.titleEn}
                  </h3>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lang === 'ne' ? p.requestTextNe : p.requestTextEn}
                  </p>

                  <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        if (!hasPrayed) {
                          setPrayedIds((prev) => [...prev, p.id]);
                          onPrayForRequest(p.id);
                          onNotify(lang === 'ne' ? 'तपाईंको प्रार्थनाको निम्ति धन्यवाद!' : 'Thank you for praying!');
                        }
                      }}
                      className={`h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        hasPrayed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-800 hover:bg-red-900 text-white'
                      }`}
                    >
                      {hasPrayed ? <CheckCircle2 className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                      <span className="font-mono tabular-nums">
                        {lang === 'ne'
                          ? `मैले प्रार्थना गरें (${toNepaliDigits(p.prayedCount)})`
                          : `I Prayed (${p.prayedCount})`}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`${p.titleNe}: ${p.requestTextNe} — Susamachar Prayer Wall`);
                        onNotify(lang === 'ne' ? 'प्रार्थना निवेदन सेयरका लागि कपी गरियो।' : 'Prayer request copied to share.');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'सेयर' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
