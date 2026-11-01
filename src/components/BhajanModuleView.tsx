import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Copy,
  Heart,
  Music,
  Pause,
  Play,
  Search,
  Share2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { toNepaliDigits } from '../utils/nepaliDateEngine';
import { sacredRadioEngine, SacredMelodyPreset } from '../utils/sacredAudioSynthesizer';

export interface BhajanItem {
  id: number;
  number: number;
  category: 'worship' | 'praise' | 'salvation' | 'comfort' | 'chorus';
  categoryNameNe: string;
  categoryNameEn: string;
  titleNe: string;
  titleEn: string;
  scale: string;
  rhythm: string;
  authorNe: string;
  authorEn: string;
  melodyPreset: SacredMelodyPreset;
  chords: string;
  lyricsNe: string[];
  lyricsEn: string[];
}

export const NEPALI_CHRISTIAN_BHAJANS: BhajanItem[] = [
  {
    id: 1,
    number: 1,
    category: 'worship',
    categoryNameNe: 'आराधना भजन',
    categoryNameEn: 'Worship Hymn',
    titleNe: 'उचालौं नाम येशूको, गाऔं जयजयकार',
    titleEn: 'Uchalaun Naam Yeshuko (Exalt the Name of Jesus)',
    scale: 'G Major',
    rhythm: 'Keherwa (8 Beats) · 4/4',
    authorNe: 'ख्रीष्टिय भजन संग्रह',
    authorEn: 'Nepali Khristiya Bhajan',
    melodyPreset: 'hymn_grace',
    chords: 'G  Em  C  D7  G',
    lyricsNe: [
      'को. उचालौं नाम येशूको, गाऔं जयजयकार,',
      '    मुक्तिदाता प्रभुलाई, चढाऔं धन्यवाद।',
      '',
      '१. अन्धकारको संसारमा ज्योति भई आउनुभो,',
      '   पापीहरूको उद्धार गर्न क्रूसैमा मर्नुभो,',
      '   अनमोल रगत बगाएर हामीलाई बचाउनुभो।',
      '',
      '२. स्वर्ग र पृथ्वीका सारा सृष्टिले गाउँदछन्,',
      '   राजाहरूका राजा येशूलाई दण्डवत् गर्दछन्,',
      '   अनन्त जीवन दिने प्रभुको महिमा गर्दछन्।',
    ],
    lyricsEn: [
      'Chorus: Let us exalt the name of Jesus and sing praise,',
      '        Let us offer thanksgiving to our Savior and Lord.',
      '',
      '1. Into a world of darkness He came as the true Light,',
      '   To rescue sinners He gave His life upon the Cross,',
      '   By shedding His precious blood He redeemed us all.',
      '',
      '2. All creation in heaven and on earth sings out,',
      '   Bowing down before Jesus, the King of kings,',
      '   Glorifying the Lord who grants eternal life.',
    ],
  },
  {
    id: 2,
    number: 24,
    category: 'salvation',
    categoryNameNe: 'क्रूस र उद्धार',
    categoryNameEn: 'Cross & Salvation',
    titleNe: 'कस्तो अचम्मको प्रेम येशूको',
    titleEn: 'Kasto Achammako Prem Yeshuko (Amazing Love of Jesus)',
    scale: 'D Major',
    rhythm: 'Dadra (6 Beats) · 3/4',
    authorNe: 'ख्रीष्टिय भजन संग्रह',
    authorEn: 'Nepali Khristiya Bhajan',
    melodyPreset: 'peace_river',
    chords: 'D  G  A7  Bm  D',
    lyricsNe: [
      'को. कस्तो अचम्मको प्रेम येशूको,',
      '    मेरो निम्ति कलवरीमा बग्यो रगत उहाँको।',
      '',
      '१. म त थिएँ हराएको पापी यस संसारमा,',
      '   खोज्दै आउनुभो येशू मलाई आफ्नो अँगालोमा,',
      '   क्षमा गरी सबै पाप नया जीवन दिनुभो।',
      '',
      '२. काँडाको मुकुट पहिरिई सहनुभो सारा दुःख,',
      '   मेरो जीवनमा भरिदिन स्वर्गीय शान्ति र सुख,',
      '   सधैंभरि गाउनेछु म येशूको त्यो मधुर प्रेम।',
    ],
    lyricsEn: [
      'Chorus: How marvelous is the love of Jesus,',
      '        For my sake His blood flowed at Calvary.',
      '',
      '1. I was a lost sinner wandering in this world,',
      '   Jesus came seeking me and held me in His embrace,',
      '   Forgiving all my sins, He gave me brand new life.',
      '',
      '2. Wearing a crown of thorns He bore every sorrow,',
      '   To fill my life with heavenly peace and joy,',
      '   Forevermore I will sing of Jesus’ tender love.',
    ],
  },
  {
    id: 3,
    number: 58,
    category: 'comfort',
    categoryNameNe: 'सान्त्वना र भरोसा',
    categoryNameEn: 'Comfort & Trust',
    titleNe: 'परमप्रभु मेरो गोठाला हुनुहुन्छ',
    titleEn: 'Paramprabhu Mero Gothala (The Lord is My Shepherd)',
    scale: 'C Major',
    rhythm: 'Slow Worship · 4/4',
    authorNe: 'भजनसंग्रह २३ आधारित',
    authorEn: 'Based on Psalm 23',
    melodyPreset: 'morning_psalm',
    chords: 'C  Am  F  G  C',
    lyricsNe: [
      'को. परमप्रभु मेरो गोठाला हुनुहुन्छ,',
      '    मलाई केहीको खाँचो हुँदैन।',
      '',
      '१. हरियो खर्कमा उहाँले मलाई चराउनुहुन्छ,',
      '   शान्त पानीको छेउमा मलाई डोऱ्याउनुहुन्छ,',
      '   मेरो प्राणलाई उहाँले पुनर्जीवित पार्नुहुन्छ।',
      '',
      '२. मृत्युको अन्धकारमय उपत्यका भएर हिँड्दा पनि,',
      '   म कुनै खराबीको डर मान्नेछैनँ,',
      '   किनकि प्रभु तपाईं सधैं मेरो साथमा हुनुहुन्छ।',
    ],
    lyricsEn: [
      'Chorus: The Lord is my Shepherd,',
      '        I shall not be in want.',
      '',
      '1. He makes me lie down in green pastures,',
      '   He leads me beside quiet waters,',
      '   He restores and refreshes my soul.',
      '',
      '2. Even though I walk through the valley of the shadow of death,',
      '   I will fear no evil,',
      '   For You, O Lord, are always by my side.',
    ],
  },
  {
    id: 4,
    number: 105,
    category: 'praise',
    categoryNameNe: 'स्तुति र धन्यवाद',
    categoryNameEn: 'Praise & Thanksgiving',
    titleNe: 'धन्यवाद चढाउँछौं हृदय खोलेर',
    titleEn: 'Dhanyabad Chadhaunchhaun (We Offer Thanksgiving)',
    scale: 'E Major',
    rhythm: 'Madal Folk Praise · 6/8',
    authorNe: 'नेपाली मण्डली स्तुति',
    authorEn: 'Nepali Church Praise',
    melodyPreset: 'himalayan_worship',
    chords: 'E  A  B7  C#m  E',
    lyricsNe: [
      'को. धन्यवाद चढाउँछौं हृदय खोलेर,',
      '    तपाईंको भलाइ र कृपा सम्झेर।',
      '',
      '१. बिहानीको घामसँगै तपाईंको करूणा नयाँ छ,',
      '   हिमाल, पहाड, तराईभरि तपाईंको महिमा छ,',
      '   हाम्रो जीवनको प्रत्येक श्वासमा येशूको अनुग्रह छ।',
      '',
      '२. संकष्टमा शरणस्थान, बिरामीमा चङ्गाइ दिने,',
      '   आँसु सबै पुछिदिई आनन्दको तेल खन्याउने,',
      '   हल्लिलूयाह गाऔं सारा मण्डली मिलेर।',
    ],
    lyricsEn: [
      'Chorus: We offer thanksgiving with open hearts,',
      '        Remembering Your goodness and unfailing grace.',
      '',
      '1. With the morning sun Your mercies are new every day,',
      '   Across the Himalayas, hills, and plains Your glory shines,',
      '   In every breath of our lives is the grace of Jesus.',
      '',
      '2. Our refuge in trouble, our Healer in sickness,',
      '   Wiping every tear away and pouring the oil of joy,',
      '   Let the whole church unite and sing Hallelujah!',
    ],
  },
  {
    id: 5,
    number: 142,
    category: 'chorus',
    categoryNameNe: 'आत्मिक कोरस',
    categoryNameEn: 'Spiritual Chorus',
    titleNe: 'पवित्र आत्मा आउनुहोस्, हामीलाई भर्नुहोस्',
    titleEn: 'Pabitra Aatma Aaunuhos (Come Holy Spirit Fill Us)',
    scale: 'F Major',
    rhythm: 'Devotional Ballad · 4/4',
    authorNe: 'नेपाली आराधना कोरस',
    authorEn: 'Nepali Worship Chorus',
    melodyPreset: 'evening_prayer',
    chords: 'F  Bb  Gm  C7  F',
    lyricsNe: [
      'को. पवित्र आत्मा आउनुहोस्, हामीलाई भर्नुहोस्,',
      '    स्वर्गीय आगोले आज हृदय प्रज्वलित पार्नुहोस्।',
      '',
      '१. सुक्खा भूमिझैं प्यासी छ हाम्रो यो आत्मा,',
      '   बगाउनुहोस् जीवनको नदी हाम्रो मण्डलीमा,',
      '   प्रेम, शान्ति र सामर्थ्यले डोऱ्याउनुहोस् एकतामा।',
    ],
    lyricsEn: [
      'Chorus: Come, Holy Spirit, fill us anew,',
      '        Ignite our hearts today with heavenly fire.',
      '',
      '1. Like dry ground our souls thirst for You,',
      '   Let the river of life flow through our church,',
      '   Lead us in unity with love, peace, and power.',
    ],
  },
  {
    id: 6,
    number: 210,
    category: 'praise',
    categoryNameNe: 'स्तुति र सुसमाचार',
    categoryNameEn: 'Gospel & Praise',
    titleNe: 'येशू नै बाटो, सत्य र जीवन हुन्',
    titleEn: 'Yeshu Nai Bato Satya Ra Jiban (Jesus is the Way, Truth & Life)',
    scale: 'A Major',
    rhythm: 'UpbeatKeherwa · 4/4',
    authorNe: 'सुसमाचार भजन मण्डल',
    authorEn: 'Susamachar Hymnal',
    melodyPreset: 'hymn_grace',
    chords: 'A  D  E  F#m  A',
    lyricsNe: [
      'को. येशू नै बाटो, सत्य र जीवन हुन्,',
      '    उहाँबिना पिताकहाँ जाने अरू बाटो छैन।',
      '',
      '१. पूर्वदेखि पश्चिमसम्म सुसमाचार सुनाऔं,',
      '   अँध्यारोमा बसेकालाई मुक्तिको ज्योति देखाऔं,',
      '   ख्रीष्टको प्रेममा एक भई सेवामा अघि बढौं।',
    ],
    lyricsEn: [
      'Chorus: Jesus Himself is the Way, the Truth, and the Life,',
      '        No one comes to the Father except through Him.',
      '',
      '1. From East to West let us proclaim the Good News,',
      '   Let us show the Light of salvation to those in darkness,',
      '   United in the love of Christ, let us press forward in service.',
    ],
  },
];

interface BhajanModuleViewProps {
  lang: 'ne' | 'en';
  onNotify: (msg: string) => void;
}

export const BhajanModuleView: React.FC<BhajanModuleViewProps> = ({ lang, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBhajan, setSelectedBhajan] = useState<BhajanItem>(NEPALI_CHRISTIAN_BHAJANS[0]);
  const [fontSize, setFontSize] = useState<number>(18);
  const [showChords, setShowChords] = useState<boolean>(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1, 3]);
  const [playingBhajanId, setPlayingBhajanId] = useState<number | null>(null);

  const categories = [
    { id: 'all', ne: 'सबै भजन (All)', en: 'All Bhajans' },
    { id: 'worship', ne: 'आराधना (Worship)', en: 'Worship' },
    { id: 'praise', ne: 'स्तुति (Praise)', en: 'Praise' },
    { id: 'salvation', ne: 'क्रूस र उद्धार (Salvation)', en: 'Salvation' },
    { id: 'comfort', ne: 'सान्त्वना (Comfort)', en: 'Comfort' },
    { id: 'chorus', ne: 'कोरस (Chorus)', en: 'Chorus' },
  ];

  const filteredBhajans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return NEPALI_CHRISTIAN_BHAJANS.filter((b) => {
      const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        !q ||
        String(b.number).includes(q) ||
        b.titleNe.toLowerCase().includes(q) ||
        b.titleEn.toLowerCase().includes(q) ||
        b.lyricsNe.join(' ').toLowerCase().includes(q) ||
        b.lyricsEn.join(' ').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleTogglePlayMelody = (bhajan: BhajanItem) => {
    if (playingBhajanId === bhajan.id) {
      sacredRadioEngine.stop();
      setPlayingBhajanId(null);
      onNotify(lang === 'ne' ? 'भजन धुन रोकियो।' : 'Bhajan instrumental stopped.');
    } else {
      sacredRadioEngine.play(bhajan.melodyPreset, 0.7);
      setPlayingBhajanId(bhajan.id);
      onNotify(
        lang === 'ne'
          ? `भजन #${toNepaliDigits(bhajan.number)} को आराधना धुन बज्दैछ...`
          : `Playing worship accompaniment for Bhajan #${bhajan.number}...`
      );
    }
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    onNotify(lang === 'ne' ? 'मनपर्ने भजन सूची अपडेट गरियो।' : 'Favorite Bhajans updated.');
  };

  const handleCopyBhajan = (bhajan: BhajanItem) => {
    const text = `भजन नं. ${toNepaliDigits(bhajan.number)} — ${bhajan.titleNe} (${bhajan.titleEn})\nScale: ${bhajan.scale} | Chords: ${bhajan.chords}\n\n${bhajan.lyricsNe.join('\n')}\n\n${bhajan.lyricsEn.join('\n')}\n— Susamachar Christian App`;
    navigator.clipboard?.writeText(text);
    onNotify(lang === 'ne' ? 'भजनको शब्द र कर्ड कपी गरियो!' : 'Bhajan lyrics & chords copied!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Music className="w-4 h-4" />
            <span>
              {lang === 'ne'
                ? 'ख्रीष्टिय भजन तथा आराधना संग्रह (Nepali Christian Hymnal & Chords)'
                : 'Nepali Khristiya Bhajan, Worship Lyrics & Guitar Chords'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {lang === 'ne' ? 'नेपाली ख्रीष्टिय भजन र कोरस' : 'Nepali Christian Bhajan & Choruses'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-2xl">
            {lang === 'ne'
              ? 'भजन नम्बर, शीर्षक वा शब्दद्वारा खोज्नुहोस्। गितार कर्ड, स्केल र वाद्यवादन धुनसहित आराधना गर्नुहोस्।'
              : 'Search by Bhajan number or title. Sing along with Nepali Devanagari lyrics, English translations, guitar chords, and worship accompaniment.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowChords((c) => !c)}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-colors ${
              showChords ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {lang === 'ne' ? (showChords ? 'कर्ड देखाउनुहोस्: ON' : 'कर्ड: OFF') : showChords ? 'Guitar Chords: ON' : 'Chords: OFF'}
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setFontSize((f) => Math.max(14, f - 2))}
              className="px-2.5 py-1 text-xs font-bold hover:bg-white/15 rounded-lg"
            >
              A-
            </button>
            <span className="px-2 text-xs font-mono">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(26, f + 2))}
              className="px-2.5 py-1 text-xs font-bold hover:bg-white/15 rounded-lg"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ne'
                ? 'भजन नम्बर वा बोल खोज्नुहोस् (उदा: १, २४, उचालौं, गोठाला, प्रेम)...'
                : 'Search Bhajan number, title, or lyrics (e.g. 1, 24, Shepherd, Love)...'
            }
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-red-800 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-stone-200 dark:border-slate-800 hover:border-red-800'
              }`}
            >
              {lang === 'ne' ? cat.ne : cat.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Left Bhajan Index List | Right Bhajan Lyrics & Chords Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Bhajan List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredBhajans.map((bhajan) => {
            const isSelected = selectedBhajan.id === bhajan.id;
            const isPlaying = playingBhajanId === bhajan.id;
            const isFav = favoriteIds.includes(bhajan.id);
            return (
              <div
                key={bhajan.id}
                onClick={() => setSelectedBhajan(bhajan)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-red-50/90 dark:bg-red-950/30 border-red-800 dark:border-amber-400 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 hover:border-red-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-red-800 text-amber-300 font-mono font-bold text-xs flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] uppercase opacity-75">भजन</span>
                      <span>{lang === 'ne' ? toNepaliDigits(bhajan.number) : bhajan.number}</span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {bhajan.titleNe}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {bhajan.titleEn}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-mono text-red-800 dark:text-amber-400">
                        <span>{bhajan.scale}</span>
                        <span>·</span>
                        <span>{lang === 'ne' ? bhajan.categoryNameNe : bhajan.categoryNameEn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlayMelody(bhajan);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPlaying
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                      title="Play Worship Melody"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(bhajan.id);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isFav ? 'text-red-700 dark:text-amber-400' : 'text-slate-400'
                      }`}
                      title="Save Favorite Bhajan"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Columns: Selected Bhajan Full Lyrics, Chords & Audio Player */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-amber-400">
                <span>
                  {lang === 'ne'
                    ? `भजन नं. ${toNepaliDigits(selectedBhajan.number)}`
                    : `Bhajan No. ${selectedBhajan.number}`}
                </span>
                <span>•</span>
                <span>{lang === 'ne' ? selectedBhajan.categoryNameNe : selectedBhajan.categoryNameEn}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {selectedBhajan.titleNe}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {selectedBhajan.titleEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTogglePlayMelody(selectedBhajan)}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  playingBhajanId === selectedBhajan.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-red-800 hover:bg-red-900 text-white'
                }`}
              >
                {playingBhajanId === selectedBhajan.id ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'धुन रोक्नुहोस्' : 'Stop Melody'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ne' ? 'धुन बजाउनुहोस्' : 'Play Melody'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyBhajan(selectedBhajan)}
                className="h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'कपी' : 'Copy'}</span>
              </button>

              <button
                onClick={() => {
                  handleCopyBhajan(selectedBhajan);
                  onNotify(lang === 'ne' ? 'भजन सेयरको लागि तयार गरियो!' : 'Bhajan copied for sharing!');
                }}
                className="h-9 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-200"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'सेयर' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Musical Scale, Rhythm & Guitar Chords Bar */}
          {showChords && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Scale / Key: </span>
                <strong className="font-mono text-slate-900 dark:text-white">{selectedBhajan.scale}</strong>
                <span className="mx-2 text-slate-400">•</span>
                <span className="text-slate-500 dark:text-slate-400">Rhythm / Taal: </span>
                <strong className="text-slate-900 dark:text-white">{selectedBhajan.rhythm}</strong>
              </div>
              <div className="font-mono font-bold text-red-900 dark:text-amber-300 bg-white dark:bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/30">
                Chords: {selectedBhajan.chords}
              </div>
            </div>
          )}

          {/* Nepali & English Lyrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-amber-400">
                नेपाली शब्द (Nepali Lyrics)
              </p>
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800 font-serif leading-relaxed text-slate-900 dark:text-slate-100 space-y-1.5"
              >
                {selectedBhajan.lyricsNe.map((line, i) => (
                  <p key={i} className={line.startsWith('को.') ? 'font-bold text-red-900 dark:text-amber-300' : ''}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                English Translation
              </p>
              <div
                style={{ fontSize: `${Math.max(14, fontSize - 2)}px` }}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 space-y-1.5"
              >
                {selectedBhajan.lyricsEn.map((line, i) => (
                  <p key={i} className={line.startsWith('Chorus:') ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
