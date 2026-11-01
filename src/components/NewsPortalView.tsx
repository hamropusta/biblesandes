import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Newspaper,
  Search,
  Share2,
} from 'lucide-react';
import { NEWS_CATEGORIES, NewsArticle } from '../data/susamacharDatabase';
import { toNepaliDigits } from '../utils/nepaliDateEngine';

interface NewsPortalViewProps {
  lang: 'ne' | 'en';
  articles: NewsArticle[];
  savedNewsIds: number[];
  onToggleSaveNews: (id: number) => void;
  onNotify: (msg: string) => void;
}

export const NewsPortalView: React.FC<NewsPortalViewProps> = ({
  lang,
  articles,
  savedNewsIds,
  onToggleSaveNews,
  onNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'featured' | 'trending' | 'saved'>('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published');
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((a) => {
      if (selectedCategory !== 'all' && a.categorySlug !== selectedCategory) return false;
      if (filterMode === 'featured' && !a.isFeatured) return false;
      if (filterMode === 'trending' && !a.isTrending) return false;
      if (filterMode === 'saved' && !savedNewsIds.includes(a.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.titleEn.toLowerCase().includes(q) ||
          a.titleNe.includes(q) ||
          a.summaryEn.toLowerCase().includes(q) ||
          a.summaryNe.includes(q)
        );
      }
      return true;
    });
  }, [publishedArticles, selectedCategory, filterMode, savedNewsIds, searchQuery]);

  const handleShareNews = async (art: NewsArticle) => {
    const shareText = `${art.titleNe} | ${art.titleEn}\n${art.summaryNe}\n— Susamachar Christian News Portal`;
    if (navigator.share) {
      try {
        await navigator.share({ title: art.titleEn, text: shareText });
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard?.writeText(shareText);
    onNotify(lang === 'ne' ? 'समाचार लिंक र विवरण कपी गरियो!' : 'News article link copied to clipboard!');
  };

  // Full Article Reader View
  if (activeArticle) {
    const relatedArticles = publishedArticles
      .filter((a) => a.id !== activeArticle.id)
      .slice(0, 3);
    const isSaved = savedNewsIds.includes(activeArticle.id);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveArticle(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-800 dark:hover:text-amber-400 transition-colors min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ne' ? 'सबै समाचारमा फर्कनुहोस् (Back to News Portal)' : 'Back to Christian News Portal'}</span>
        </button>

        <article className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
            <img
              src={activeArticle.featuredImage}
              alt={activeArticle.titleEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-medium">
                <span>{lang === 'ne' ? activeArticle.categoryNameNe : activeArticle.categoryNameEn}</span>
                <span aria-hidden="true">·</span>
                <span>{activeArticle.publishedAtBs} ({activeArticle.publishedAtAd})</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {lang === 'ne' ? `${toNepaliDigits(activeArticle.viewsCount)} पाठक` : `${activeArticle.viewsCount.toLocaleString()} views`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
                {lang === 'ne' ? activeArticle.titleNe : activeArticle.titleEn}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Author & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? activeArticle.authorNameNe : activeArticle.authorNameEn}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeArticle.authorRoleEn} · SEO URL: <span className="font-mono">/news/{activeArticle.slug}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleSaveNews(activeArticle.id)}
                  className={`h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'bg-red-50 dark:bg-slate-800 border-red-800 text-red-800 dark:text-amber-400'
                      : 'border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? (lang === 'ne' ? 'सुरक्षित' : 'Saved') : lang === 'ne' ? 'बुकमार्क' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={() => handleShareNews(activeArticle)}
                  className="h-10 px-3.5 rounded-xl bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-red-900 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'सेयर गर्नुहोस्' : 'Share Article'}</span>
                </button>
              </div>
            </div>

            {/* Bilingual Summary Lead */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {activeArticle.summaryNe}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeArticle.summaryEn}
              </p>
            </div>

            {/* Full Content in Nepali & English */}
            <div className="space-y-4 text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
              <p>{activeArticle.contentNe}</p>
              <hr className="border-stone-200 dark:border-slate-800 my-4" />
              <p className="text-slate-600 dark:text-slate-300">{activeArticle.contentEn}</p>
            </div>
          </div>
        </article>

        {/* Related News */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'ne' ? 'सम्बन्धित समाचारहरू (Related Christian News)' : 'Related Christian News'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => setActiveArticle(rel)}
                className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-red-800 transition-colors space-y-2"
              >
                <p className="text-xs text-red-800 dark:text-amber-400 font-medium">
                  {lang === 'ne' ? rel.categoryNameNe : rel.categoryNameEn} · {rel.publishedAtBs}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {lang === 'ne' ? rel.titleNe : rel.titleEn}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-medium text-red-800 dark:text-amber-400">
            {lang === 'ne' ? 'सुसमाचार राष्ट्रिय तथा विश्व इसाई समाचार पोर्टल' : 'Susamachar National & Global Christian News Portal'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {lang === 'ne' ? 'इसाई समाचार र गतिविधिहरू' : 'Christian News, Mission & Community'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ne' ? 'समाचार खोज्नुहोस्...' : 'Search Christian news...'}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center p-1 bg-stone-200/80 dark:bg-slate-900 rounded-xl">
            {(['all', 'featured', 'trending', 'saved'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filterMode === m ? 'bg-red-800 text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {m === 'all'
                  ? lang === 'ne' ? 'ताजा' : 'Latest'
                  : m === 'featured'
                  ? lang === 'ne' ? 'प्रमुख' : 'Featured'
                  : m === 'trending'
                  ? lang === 'ne' ? 'चर्चित' : 'Trending'
                  : lang === 'ne' ? `सुरक्षित (${savedNewsIds.length})` : `Saved (${savedNewsIds.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Category Filter Bar (10 Categories) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat.slug
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-stone-400'
            }`}
          >
            {lang === 'ne' ? cat.nameNe : cat.nameEn}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'ne' ? 'यस विधामा कुनै समाचार भेटिएन।' : 'No matching news articles found.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setFilterMode('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-red-800 dark:text-amber-400 hover:underline"
          >
            {lang === 'ne' ? 'सबै समाचार हेर्नुहोस्' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isSaved = savedNewsIds.includes(art.id);
            return (
              <article
                key={art.id}
                className="bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-stone-400 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div
                    onClick={() => setActiveArticle(art)}
                    className="h-48 bg-slate-900 overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={art.featuredImage}
                      alt={art.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 space-y-2.5">
                    {/* Clean unboxed metadata per Zero-Pill rule */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-red-800 dark:text-amber-400">
                        {lang === 'ne' ? art.categoryNameNe : art.categoryNameEn}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{art.publishedAtBs}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Eye className="w-3 h-3" />
                        {lang === 'ne' ? toNepaliDigits(art.viewsCount) : art.viewsCount}
                      </span>
                    </div>

                    <h2
                      onClick={() => setActiveArticle(art)}
                      className="text-lg font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-red-800 dark:hover:text-amber-400 transition-colors"
                    >
                      {lang === 'ne' ? art.titleNe : art.titleEn}
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {lang === 'ne' ? art.summaryNe : art.summaryEn}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                    {lang === 'ne' ? art.authorNameNe : art.authorNameEn}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSaveNews(art.id)}
                      className={`p-1.5 rounded-lg ${
                        isSaved ? 'text-red-800 dark:text-amber-400' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleShareNews(art)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveArticle(art)}
                      className="font-semibold text-red-800 dark:text-amber-400 hover:underline ml-1 whitespace-nowrap shrink-0"
                    >
                      {lang === 'ne' ? 'पूरा पढ्नुहोस् →' : 'Read Full →'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
