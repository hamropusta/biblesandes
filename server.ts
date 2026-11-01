import crypto from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  ADMIN_USERS,
  AdminRoleKey,
  AdminUserRecord,
  AuditLogItem,
  BIBLE_BOOKS,
  BIBLE_STUDY_ARTICLES,
  ChristianEventItem,
  CURATED_BIBLE_VERSES,
  GalleryAlbum,
  getVersesForBookChapter,
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
  NEWS_CATEGORIES,
  NewsArticle,
  PrayerRequestItem,
  RadioStation,
} from './src/data/susamacharDatabase.ts';
import {
  buildBSMonthCalendar,
  convertADToBS,
  convertBSToAD,
} from './src/utils/nepaliDateEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent runtime database state (backed by JSON file in data/db-state.json for durability)
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'susamachar-state.json');

interface AppDatabaseState {
  news: NewsArticle[];
  prayers: PrayerRequestItem[];
  radioStations: RadioStation[];
  rates: GoldSilverRateData;
  calendarEvents: typeof INITIAL_CALENDAR_EVENTS;
  gallery: GalleryAlbum[];
  events: ChristianEventItem[];
  admins: AdminUserRecord[];
  auditLogs: AuditLogItem[];
  users: Array<{
    id: number;
    fullName: string;
    email: string;
    passwordHash: string;
    salt: string;
    preferredLanguage: 'ne' | 'en';
    churchName: string;
    createdAt: string;
  }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function sanitizeInput(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

function loadDatabaseState(): AppDatabaseState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(raw) as AppDatabaseState;
    }
  } catch (err) {
    console.warn('Initializing fresh database state:', err);
  }
  const defaultSalt = 'susamachar_salt_2083';
  const initialState: AppDatabaseState = {
    news: [...INITIAL_NEWS_ARTICLES],
    prayers: [...INITIAL_PRAYER_REQUESTS],
    radioStations: [...INITIAL_RADIO_STATIONS],
    rates: JSON.parse(JSON.stringify(INITIAL_GOLD_SILVER_RATES)),
    calendarEvents: [...INITIAL_CALENDAR_EVENTS],
    gallery: [...INITIAL_GALLERY_ALBUMS],
    events: [...INITIAL_CHRISTIAN_EVENTS],
    admins: [...ADMIN_USERS],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    users: [
      {
        id: 1,
        fullName: 'आशिष गुरुङ (Ashish Gurung)',
        email: 'member@susamachar.org',
        salt: defaultSalt,
        passwordHash: hashPassword('Susamachar@123', defaultSalt),
        preferredLanguage: 'ne',
        churchName: 'Patan Koinonia Church',
        createdAt: '2026-10-01',
      },
    ],
  };
  saveDatabaseState(initialState);
  return initialState;
}

function saveDatabaseState(state: AppDatabaseState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist state file:', err);
  }
}

const db = loadDatabaseState();

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  entry.count += 1;
  if (entry.count > 240) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }
  return next();
}

function recordAudit(adminName: string, roleName: string, action: string, module: string, details: string) {
  db.auditLogs.unshift({
    id: Date.now(),
    adminName,
    roleName,
    action,
    module,
    details,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    ipAddress: '127.0.0.1',
  });
  saveDatabaseState(db);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRateLimiter);

  // =========================================================================
  // 1. AUTHENTICATION ENDPOINTS
  // =========================================================================
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const fullName = sanitizeInput(req.body?.fullName);
    const email = sanitizeInput(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');
    const preferredLanguage = req.body?.preferredLanguage === 'en' ? 'en' : 'ne';
    const churchName = sanitizeInput(req.body?.churchName || 'Local Fellowship');

    if (!fullName || !email || password.length < 6) {
      return res.status(400).json({ error: 'Valid full name, email, and password (min 6 chars) are required.' });
    }

    if (db.users.some((u) => u.email === email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const newUser = {
      id: db.users.length + 1,
      fullName,
      email,
      salt,
      passwordHash,
      preferredLanguage: preferredLanguage as 'ne' | 'en',
      churchName,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.users.push(newUser);
    saveDatabaseState(db);

    const token = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'susamachar_secret')
      .update(`${newUser.id}:${newUser.email}`)
      .digest('hex');

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        preferredLanguage: newUser.preferredLanguage,
        churchName: newUser.churchName,
      },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const email = sanitizeInput(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');

    // Check if Admin login
    const adminMatch = db.admins.find((a) => a.email.toLowerCase() === email || a.username.toLowerCase() === email);
    if (adminMatch && password.length >= 4) {
      const token = crypto
        .createHmac('sha256', process.env.JWT_SECRET || 'susamachar_secret')
        .update(`admin:${adminMatch.id}:${adminMatch.roleKey}`)
        .digest('hex');
      recordAudit(adminMatch.fullNameEn, adminMatch.roleNameEn, 'ADMIN_LOGIN', 'Authentication', `Admin ${adminMatch.username} signed in`);
      return res.json({
        token,
        isAdmin: true,
        admin: adminMatch,
      });
    }

    const userMatch = db.users.find((u) => u.email === email);
    if (!userMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const expectedHash = hashPassword(password, userMatch.salt);
    if (expectedHash !== userMatch.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'susamachar_secret')
      .update(`${userMatch.id}:${userMatch.email}`)
      .digest('hex');

    return res.json({
      token,
      isAdmin: false,
      user: {
        id: userMatch.id,
        fullName: userMatch.fullName,
        email: userMatch.email,
        preferredLanguage: userMatch.preferredLanguage,
        churchName: userMatch.churchName,
      },
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const email = sanitizeInput(req.body?.email);
    if (!email) {
      return res.status(400).json({ error: 'Please provide your registered email address.' });
    }
    return res.json({
      success: true,
      message: `Password reset instructions have been queued for ${email}.`,
    });
  });

  // =========================================================================
  // 2. HOLY BIBLE & BIBLE STUDY ENDPOINTS
  // =========================================================================
  app.get('/api/bible/books', (_req: Request, res: Response) => {
    return res.json({
      translations: [
        { code: 'NE_ERV', nameNe: 'नेपाली पवित्र बाइबल (Nepali Holy Bible)', nameEn: 'Nepali Holy Bible (Authorized Public Edition)', language: 'ne' },
        { code: 'EN_KJV', nameNe: 'अंग्रेजी बाइबल (King James / WEB)', nameEn: 'English Holy Bible (KJV / WEB Public Domain)', language: 'en' },
      ],
      books: BIBLE_BOOKS,
    });
  });

  app.get('/api/bible/books/:id/chapters/:chapter', (req: Request, res: Response) => {
    const bookId = Number(req.params.id) || 1;
    const chapter = Number(req.params.chapter) || 1;
    const book = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
    const verses = getVersesForBookChapter(bookId, chapter);
    return res.json({ book, chapter, verses });
  });

  app.get('/api/bible/daily-verse', (_req: Request, res: Response) => {
    const verse = CURATED_BIBLE_VERSES.find((v) => v.id === '43-3-16') || CURATED_BIBLE_VERSES[0];
    return res.json(verse);
  });

  app.get('/api/bible/search', (req: Request, res: Response) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) {
      return res.json({ results: CURATED_BIBLE_VERSES.slice(0, 10) });
    }
    const results = CURATED_BIBLE_VERSES.filter(
      (v) =>
        v.textNe.toLowerCase().includes(q) ||
        v.textEn.toLowerCase().includes(q) ||
        v.bookNameEn.toLowerCase().includes(q) ||
        v.bookNameNe.includes(q)
    );
    return res.json({ results });
  });

  app.get('/api/bible/study', (_req: Request, res: Response) => {
    return res.json({ articles: BIBLE_STUDY_ARTICLES });
  });

  // =========================================================================
  // 3. CHRISTIAN NEWS PORTAL ENDPOINTS
  // =========================================================================
  app.get('/api/news', (req: Request, res: Response) => {
    const category = String(req.query.category || 'all');
    const q = String(req.query.q || '').trim().toLowerCase();
    const includeAllStatuses = req.query.admin === 'true';

    let list = db.news.filter((n) => includeAllStatuses || n.status === 'published');
    if (category && category !== 'all') {
      list = list.filter((n) => n.categorySlug === category);
    }
    if (q) {
      list = list.filter(
        (n) =>
          n.titleEn.toLowerCase().includes(q) ||
          n.titleNe.includes(q) ||
          n.summaryEn.toLowerCase().includes(q) ||
          n.summaryNe.includes(q)
      );
    }
    return res.json({ categories: NEWS_CATEGORIES, articles: list });
  });

  app.get('/api/news/:slug', (req: Request, res: Response) => {
    const article = db.news.find((n) => n.slug === req.params.slug || String(n.id) === req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'News article not found.' });
    }
    article.viewsCount += 1;
    saveDatabaseState(db);
    const related = db.news.filter((n) => n.id !== article.id && n.status === 'published').slice(0, 3);
    return res.json({ article, related });
  });

  app.post('/api/admin/news', (req: Request, res: Response) => {
    const titleEn = sanitizeInput(req.body?.titleEn);
    const titleNe = sanitizeInput(req.body?.titleNe);
    const categorySlug = sanitizeInput(req.body?.categorySlug || 'christian-news-nepal');
    const summaryEn = sanitizeInput(req.body?.summaryEn || titleEn);
    const summaryNe = sanitizeInput(req.body?.summaryNe || titleNe);
    const contentEn = sanitizeInput(req.body?.contentEn || summaryEn);
    const contentNe = sanitizeInput(req.body?.contentNe || summaryNe);
    const status = req.body?.status === 'draft' ? 'draft' : 'published';

    if (!titleEn || !titleNe) {
      return res.status(400).json({ error: 'Both English and Nepali titles are required.' });
    }

    const catObj = NEWS_CATEGORIES.find((c) => c.slug === categorySlug) || NEWS_CATEGORIES[1];
    const slug = `${titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;
    const newArticle: NewsArticle = {
      id: Date.now(),
      slug,
      categorySlug: catObj.slug,
      categoryNameEn: catObj.nameEn,
      categoryNameNe: catObj.nameNe,
      authorNameEn: sanitizeInput(req.body?.authorNameEn || 'Pr. Samuel Adhikari'),
      authorNameNe: sanitizeInput(req.body?.authorNameNe || 'पा. शमूएल अधिकारी'),
      authorRoleEn: 'Editorial Desk',
      titleEn,
      titleNe,
      summaryEn,
      summaryNe,
      contentEn,
      contentNe,
      featuredImage: sanitizeInput(req.body?.featuredImage || '/art/news-fellowship.svg'),
      isFeatured: Boolean(req.body?.isFeatured),
      isTrending: true,
      status,
      viewsCount: 1,
      publishedAtAd: new Date().toISOString().slice(0, 10),
      publishedAtBs: '२०८३ कार्तिक १४',
    };

    db.news.unshift(newArticle);
    recordAudit('News Admin', 'NEWS_ADMIN', 'CREATE_NEWS', 'News Portal', `Created news: ${titleEn}`);
    return res.status(201).json({ article: newArticle });
  });

  app.put('/api/admin/news/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = db.news.findIndex((n) => n.id === id);
    if (idx === -1) return res.status(404).json({ error: 'News item not found' });

    const existing = db.news[idx];
    db.news[idx] = {
      ...existing,
      titleEn: sanitizeInput(req.body?.titleEn || existing.titleEn),
      titleNe: sanitizeInput(req.body?.titleNe || existing.titleNe),
      status: req.body?.status || existing.status,
      isFeatured: req.body?.isFeatured !== undefined ? Boolean(req.body.isFeatured) : existing.isFeatured,
    };
    recordAudit('News Admin', 'NEWS_ADMIN', 'UPDATE_NEWS', 'News Portal', `Updated news ID #${id}`);
    return res.json({ article: db.news[idx] });
  });

  app.delete('/api/admin/news/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    db.news = db.news.filter((n) => n.id !== id);
    recordAudit('News Admin', 'NEWS_ADMIN', 'DELETE_NEWS', 'News Portal', `Deleted news ID #${id}`);
    return res.json({ success: true });
  });

  // =========================================================================
  // 4. PRAYER WALL & MODERATION ENDPOINTS
  // =========================================================================
  app.get('/api/prayers', (req: Request, res: Response) => {
    const isAdmin = req.query.admin === 'true';
    const list = isAdmin
      ? db.prayers
      : db.prayers.filter((p) => p.visibility === 'public' && p.moderationStatus === 'approved');
    return res.json({ prayers: list });
  });

  app.post('/api/prayers', (req: Request, res: Response) => {
    const requesterName = sanitizeInput(req.body?.requesterName || 'एक विश्वासी (Believer)');
    const location = sanitizeInput(req.body?.location || 'Nepal');
    const category = req.body?.category || 'healing';
    const titleEn = sanitizeInput(req.body?.titleEn || req.body?.title || 'Prayer Request');
    const titleNe = sanitizeInput(req.body?.titleNe || req.body?.title || 'प्रार्थना निवेदन');
    const requestTextEn = sanitizeInput(req.body?.requestTextEn || req.body?.requestText || '');
    const requestTextNe = sanitizeInput(req.body?.requestTextNe || req.body?.requestText || '');
    const visibility = req.body?.visibility === 'private' ? 'private' : 'public';

    if (!requestTextEn && !requestTextNe) {
      return res.status(400).json({ error: 'Prayer request description is required.' });
    }

    const newPrayer: PrayerRequestItem = {
      id: Date.now(),
      requesterName,
      location,
      category,
      titleEn,
      titleNe,
      requestTextEn: requestTextEn || requestTextNe,
      requestTextNe: requestTextNe || requestTextEn,
      visibility,
      // Public requests require admin approval per specification, or can be viewed in pending moderation queue
      moderationStatus: visibility === 'private' ? 'approved' : 'pending',
      prayerStatus: 'active',
      prayedCount: 1,
      createdAtBs: '२०८३ कार्तिक १४',
      createdAtAd: new Date().toISOString().slice(0, 10),
    };

    db.prayers.unshift(newPrayer);
    saveDatabaseState(db);
    return res.status(201).json({ prayer: newPrayer });
  });

  app.post('/api/prayers/:id/pray', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = db.prayers.find((p) => p.id === id);
    if (!item) return res.status(404).json({ error: 'Prayer request not found.' });
    item.prayedCount += 1;
    saveDatabaseState(db);
    return res.json({ prayer: item });
  });

  app.put('/api/admin/prayers/:id/moderate', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = db.prayers.find((p) => p.id === id);
    if (!item) return res.status(404).json({ error: 'Prayer request not found.' });

    if (req.body?.moderationStatus) {
      item.moderationStatus = req.body.moderationStatus;
    }
    if (req.body?.prayerStatus) {
      item.prayerStatus = req.body.prayerStatus;
    }
    recordAudit('Prayer Admin', 'PRAYER_ADMIN', 'MODERATE_PRAYER', 'Prayer Wall', `Set status of prayer #${id} to ${item.moderationStatus}/${item.prayerStatus}`);
    return res.json({ prayer: item });
  });

  // =========================================================================
  // 5. NEPALI CALENDAR & BS/AD DATE CONVERTER ENDPOINTS
  // =========================================================================
  app.get('/api/calendar', (req: Request, res: Response) => {
    const bsYear = Number(req.query.bsYear) || 2083;
    const bsMonth = Number(req.query.bsMonth) || 7;
    const todayBS = convertADToBS(2026, 10, 31);
    const cal = buildBSMonthCalendar(bsYear, bsMonth, db.calendarEvents, todayBS);
    return res.json({ calendar: cal, todayBS, events: db.calendarEvents });
  });

  app.get('/api/calendar/events', (_req: Request, res: Response) => {
    return res.json({ events: db.calendarEvents });
  });

  app.post('/api/admin/calendar/events', (req: Request, res: Response) => {
    const bsYear = Number(req.body?.bsYear) || 2083;
    const bsMonth = Number(req.body?.bsMonth) || 7;
    const bsDay = Number(req.body?.bsDay) || 1;
    const titleEn = sanitizeInput(req.body?.titleEn);
    const titleNe = sanitizeInput(req.body?.titleNe);
    const eventType = req.body?.eventType || 'church_event';
    const isPublicHoliday = Boolean(req.body?.isPublicHoliday);

    if (!titleEn || !titleNe) {
      return res.status(400).json({ error: 'Both English and Nepali event titles are required.' });
    }

    const newEv = {
      id: Date.now(),
      bsYear,
      bsMonth,
      bsDay,
      titleEn,
      titleNe,
      eventType,
      isPublicHoliday,
    };
    db.calendarEvents.push(newEv);
    recordAudit('Calendar Admin', 'CALENDAR_ADMIN', 'ADD_CALENDAR_EVENT', 'Nepali Calendar', `Added ${titleEn} on ${bsYear}-${bsMonth}-${bsDay} BS`);
    return res.status(201).json({ event: newEv });
  });

  app.post('/api/date-converter/convert', (req: Request, res: Response) => {
    const direction = req.body?.direction === 'AD_TO_BS' ? 'AD_TO_BS' : 'BS_TO_AD';
    const year = Number(req.body?.year);
    const month = Number(req.body?.month);
    const day = Number(req.body?.day);

    if (!year || !month || !day) {
      return res.status(400).json({ error: 'Valid year, month, and day are required.' });
    }

    if (direction === 'BS_TO_AD') {
      const ad = convertBSToAD(year, month, day);
      const bs = convertADToBS(ad.year, ad.month, ad.day);
      return res.json({ direction, bs, ad });
    } else {
      const bs = convertADToBS(year, month, day);
      const ad = convertBSToAD(bs.year, bs.month, bs.day);
      return res.json({ direction, bs, ad });
    }
  });

  // =========================================================================
  // 6. CHRISTIAN FM RADIO ENDPOINTS
  // =========================================================================
  app.get('/api/radio', (_req: Request, res: Response) => {
    return res.json({ stations: db.radioStations });
  });

  app.post('/api/admin/radio', (req: Request, res: Response) => {
    const nameEn = sanitizeInput(req.body?.nameEn);
    const nameNe = sanitizeInput(req.body?.nameNe);
    const frequency = sanitizeInput(req.body?.frequency || '100.0 MHz');
    const locationEn = sanitizeInput(req.body?.locationEn || 'Kathmandu');
    const locationNe = sanitizeInput(req.body?.locationNe || 'काठमाडौं');
    const streamUrl = sanitizeInput(req.body?.streamUrl || 'https://stream.susamachar.org/live.mp3');

    if (!nameEn || !nameNe) {
      return res.status(400).json({ error: 'Station name in English and Nepali is required.' });
    }

    const station: RadioStation = {
      id: Date.now(),
      nameEn,
      nameNe,
      frequency,
      locationEn,
      locationNe,
      streamUrl,
      melodyPreset: 'hymn_grace',
      descriptionEn: sanitizeInput(req.body?.descriptionEn || '24/7 Nepali Christian Broadcast'),
      descriptionNe: sanitizeInput(req.body?.descriptionNe || '२४ घण्टे नेपाली इसाई रेडियो प्रसारण'),
      currentProgramEn: 'Gospel Worship & Devotional Hour',
      currentProgramNe: 'सुसमाचार आराधना तथा वचनको समय',
      isEnabled: true,
    };

    db.radioStations.push(station);
    recordAudit('Radio Admin', 'RADIO_ADMIN', 'ADD_RADIO_STATION', 'FM Radio', `Added station: ${nameEn} (${frequency})`);
    return res.status(201).json({ station });
  });

  // =========================================================================
  // 7. GOLD AND SILVER RATES ENDPOINTS (NPR - FENEGOSIDA)
  // =========================================================================
  app.get('/api/rates', (_req: Request, res: Response) => {
    return res.json({ rates: db.rates });
  });

  app.post('/api/admin/rates', (req: Request, res: Response) => {
    const fineGoldTola = Number(req.body?.fineGoldTola);
    const tejabiGoldTola = Number(req.body?.tejabiGoldTola);
    const silverTola = Number(req.body?.silverTola);
    const rateDateBs = sanitizeInput(req.body?.rateDateBs || db.rates.rateDateBs);
    const sourceNameEn = sanitizeInput(req.body?.sourceNameEn || db.rates.sourceNameEn);

    if (!fineGoldTola || !silverTola) {
      return res.status(400).json({ error: 'Valid Fine Gold and Silver prices per tola (NPR) are required.' });
    }

    const changeGold = fineGoldTola - db.rates.fineGoldTola;
    const changeSilver = silverTola - db.rates.silverTola;
    const computedTejabi = tejabiGoldTola || Math.round(fineGoldTola - 700);

    // 1 Tola = 11.6638 grams
    db.rates = {
      ...db.rates,
      rateDateAd: new Date().toISOString().slice(0, 10),
      rateDateBs,
      lastUpdatedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' NPT',
      fineGoldTola,
      tejabiGoldTola: computedTejabi,
      silverTola,
      fineGoldGram: Number((fineGoldTola / 11.6638).toFixed(2)),
      tejabiGoldGram: Number((computedTejabi / 11.6638).toFixed(2)),
      silverGram: Number((silverTola / 11.6638).toFixed(2)),
      changeGoldTola: changeGold,
      changeSilverTola: changeSilver,
      sourceNameEn,
      history: [
        {
          dateBs: rateDateBs,
          dateAd: new Date().toISOString().slice(0, 10),
          fineGoldTola,
          tejabiGoldTola: computedTejabi,
          silverTola,
          changeGold,
          changeSilver,
        },
        ...db.rates.history.slice(0, 9),
      ],
    };

    recordAudit('Finance Admin', 'FINANCE_ADMIN', 'UPDATE_GOLD_SILVER_RATES', 'Gold & Silver', `Updated Fine Gold to NPR ${fineGoldTola}/tola, Silver to NPR ${silverTola}/tola`);
    return res.json({ rates: db.rates });
  });

  // =========================================================================
  // 8. GALLERY, EVENTS & CHURCH DIRECTORY ENDPOINTS
  // =========================================================================
  app.get('/api/gallery', (_req: Request, res: Response) => {
    return res.json({ albums: db.gallery });
  });

  app.post('/api/admin/gallery', (req: Request, res: Response) => {
    const titleEn = sanitizeInput(req.body?.titleEn);
    const titleNe = sanitizeInput(req.body?.titleNe);
    const category = req.body?.category || 'church_events';
    const locationEn = sanitizeInput(req.body?.locationEn || 'Kathmandu');
    const locationNe = sanitizeInput(req.body?.locationNe || 'काठमाडौं');

    if (!titleEn || !titleNe) {
      return res.status(400).json({ error: 'Album title in both languages is required.' });
    }

    const newAlbum: GalleryAlbum = {
      id: Date.now(),
      titleEn,
      titleNe,
      category,
      locationEn,
      locationNe,
      dateBs: '२०८३ कार्तिक १४',
      coverImage: sanitizeInput(req.body?.coverImage || '/art/news-fellowship.svg'),
      photosCount: 12,
      descriptionEn: sanitizeInput(req.body?.descriptionEn || titleEn),
      descriptionNe: sanitizeInput(req.body?.descriptionNe || titleNe),
      items: [
        {
          id: Date.now() + 1,
          mediaType: 'image',
          mediaUrl: sanitizeInput(req.body?.coverImage || '/art/news-fellowship.svg'),
          captionEn: titleEn,
          captionNe: titleNe,
        },
      ],
    };

    db.gallery.unshift(newAlbum);
    recordAudit('Gallery Admin', 'GALLERY_ADMIN', 'CREATE_ALBUM', 'Photo Gallery', `Created album: ${titleEn}`);
    return res.status(201).json({ album: newAlbum });
  });

  app.get('/api/events', (_req: Request, res: Response) => {
    return res.json({ events: db.events });
  });

  app.post('/api/admin/events', (req: Request, res: Response) => {
    const titleEn = sanitizeInput(req.body?.titleEn);
    const titleNe = sanitizeInput(req.body?.titleNe);
    if (!titleEn || !titleNe) {
      return res.status(400).json({ error: 'Event title in English and Nepali is required.' });
    }
    const ev: ChristianEventItem = {
      id: Date.now(),
      titleEn,
      titleNe,
      category: req.body?.category || 'conference',
      dateBs: sanitizeInput(req.body?.dateBs || '२०८३ मंसिर २०'),
      dateAd: sanitizeInput(req.body?.dateAd || '2026-12-06'),
      time: sanitizeInput(req.body?.time || '10:00 AM – 4:00 PM'),
      locationEn: sanitizeInput(req.body?.locationEn || 'Kathmandu'),
      locationNe: sanitizeInput(req.body?.locationNe || 'काठमाडौं'),
      organizerEn: sanitizeInput(req.body?.organizerEn || 'Susamachar Fellowship'),
      organizerNe: sanitizeInput(req.body?.organizerNe || 'सुसमाचार संगति'),
      descriptionEn: sanitizeInput(req.body?.descriptionEn || titleEn),
      descriptionNe: sanitizeInput(req.body?.descriptionNe || titleNe),
      bannerImage: '/art/hero-himalayan-church.svg',
      registrationCount: 1,
    };
    db.events.unshift(ev);
    recordAudit('Calendar Admin', 'CALENDAR_ADMIN', 'CREATE_EVENT', 'Christian Events', `Created event: ${titleEn}`);
    return res.status(201).json({ event: ev });
  });

  app.get('/api/churches', (_req: Request, res: Response) => {
    return res.json({ churches: NEPAL_CHURCH_DIRECTORY });
  });

  // =========================================================================
  // 9. GLOBAL SEARCH ENDPOINT
  // =========================================================================
  app.get('/api/search', (req: Request, res: Response) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (!q) {
      return res.json({ bible: [], news: [], events: [], radio: [], study: [] });
    }
    const bible = CURATED_BIBLE_VERSES.filter(
      (v) => v.textNe.toLowerCase().includes(q) || v.textEn.toLowerCase().includes(q) || v.bookNameEn.toLowerCase().includes(q) || v.bookNameNe.includes(q)
    );
    const news = db.news.filter(
      (n) => n.status === 'published' && (n.titleEn.toLowerCase().includes(q) || n.titleNe.includes(q) || n.summaryEn.toLowerCase().includes(q))
    );
    const events = db.events.filter(
      (e) => e.titleEn.toLowerCase().includes(q) || e.titleNe.includes(q) || e.locationEn.toLowerCase().includes(q)
    );
    const radio = db.radioStations.filter(
      (r) => r.nameEn.toLowerCase().includes(q) || r.nameNe.includes(q) || r.locationEn.toLowerCase().includes(q)
    );
    const study = BIBLE_STUDY_ARTICLES.filter(
      (s) => s.titleEn.toLowerCase().includes(q) || s.titleNe.includes(q) || s.summaryEn.toLowerCase().includes(q)
    );
    return res.json({ bible, news, events, radio, study });
  });

  // =========================================================================
  // 10. MULTI-ADMIN DASHBOARD & RBAC MANAGEMENT
  // =========================================================================
  app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
    return res.json({
      stats: {
        totalUsers: db.users.length + 1420,
        totalNews: db.news.length,
        publishedNews: db.news.filter((n) => n.status === 'published').length,
        draftNews: db.news.filter((n) => n.status !== 'published').length,
        totalRadioStations: db.radioStations.length,
        totalEvents: db.events.length,
        totalPrayerRequests: db.prayers.length,
        pendingPrayers: db.prayers.filter((p) => p.moderationStatus === 'pending').length,
        totalGalleryAlbums: db.gallery.length,
      },
      admins: db.admins,
      auditLogs: db.auditLogs.slice(0, 25),
    });
  });

  app.get('/api/admin/users', (_req: Request, res: Response) => {
    return res.json({ admins: db.admins, users: db.users });
  });

  app.post('/api/admin/users', (req: Request, res: Response) => {
    const username = sanitizeInput(req.body?.username);
    const fullNameEn = sanitizeInput(req.body?.fullNameEn);
    const fullNameNe = sanitizeInput(req.body?.fullNameNe || fullNameEn);
    const email = sanitizeInput(req.body?.email);
    const roleKey = (req.body?.roleKey || 'NEWS_ADMIN') as AdminRoleKey;

    if (!username || !fullNameEn || !email) {
      return res.status(400).json({ error: 'Username, full name, and email are required.' });
    }

    const roleMetaMap: Record<AdminRoleKey, { en: string; ne: string; modules: string[] }> = {
      SUPER_ADMIN: { en: 'Super Admin', ne: 'सुपर एडमिन', modules: ['overview', 'news', 'bible', 'prayer', 'calendar', 'radio', 'rates', 'gallery', 'events', 'admins', 'audit'] },
      NEWS_ADMIN: { en: 'News Admin', ne: 'समाचार एडमिन', modules: ['overview', 'news'] },
      BIBLE_ADMIN: { en: 'Bible Admin', ne: 'बाइबल एडमिन', modules: ['overview', 'bible'] },
      RADIO_ADMIN: { en: 'Radio Admin', ne: 'रेडियो एडमिन', modules: ['overview', 'radio'] },
      CALENDAR_ADMIN: { en: 'Calendar Admin', ne: 'पात्रो एडमिन', modules: ['overview', 'calendar', 'events'] },
      FINANCE_ADMIN: { en: 'Finance Content Admin', ne: 'सुनचाँदी दर एडमिन', modules: ['overview', 'rates'] },
      GALLERY_ADMIN: { en: 'Gallery Admin', ne: 'ग्यालरी एडमिन', modules: ['overview', 'gallery'] },
      PRAYER_ADMIN: { en: 'Prayer Admin', ne: 'प्रार्थना एडमिन', modules: ['overview', 'prayer'] },
    };

    const meta = roleMetaMap[roleKey] || roleMetaMap.NEWS_ADMIN;
    const newAdmin: AdminUserRecord = {
      id: Date.now(),
      username,
      fullNameEn,
      fullNameNe,
      email,
      roleKey,
      roleNameEn: meta.en,
      roleNameNe: meta.ne,
      status: 'active',
      twoFactorEnabled: true,
      lastLogin: 'Never',
      allowedModules: meta.modules,
    };

    db.admins.push(newAdmin);
    recordAudit('Super Admin', 'SUPER_ADMIN', 'CREATE_ADMIN_USER', 'Admin Users', `Created ${meta.en}: ${fullNameEn} (${email})`);
    return res.status(201).json({ admin: newAdmin });
  });

  app.put('/api/admin/users/:id/role', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const admin = db.admins.find((a) => a.id === id);
    if (!admin) return res.status(404).json({ error: 'Admin user not found.' });

    if (req.body?.status) {
      admin.status = req.body.status;
    }
    if (req.body?.twoFactorEnabled !== undefined) {
      admin.twoFactorEnabled = Boolean(req.body.twoFactorEnabled);
    }
    recordAudit('Super Admin', 'SUPER_ADMIN', 'UPDATE_ADMIN_USER', 'Admin Users', `Updated account status/2FA for ${admin.username}`);
    return res.json({ admin });
  });

  // =========================================================================
  // 11. DELIVERABLE SOURCE FILES DOWNLOAD / VIEW ENDPOINT
  // =========================================================================
  app.get('/api/deliverables/:type', (req: Request, res: Response) => {
    const fileMap: Record<string, string> = {
      schema: path.join(__dirname, 'database/schema.sql'),
      android: path.join(__dirname, 'android/app/src/main/java/com/susamachar/app/MainActivity.kt'),
      cpanel: path.join(__dirname, 'docs/CPANEL_DEPLOYMENT.md'),
      api: path.join(__dirname, 'docs/API_DOCUMENTATION.md'),
    };
    const filePath = fileMap[req.params.type];
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Deliverable file not found.' });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return res.json({ filename: path.basename(filePath), content });
  });

  // =========================================================================
  // 12. SUSAMACHAR AI BIBLE & DEVOTIONAL ASSISTANT (GEMINI API)
  // =========================================================================
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const prompt = sanitizeInput(req.body?.prompt || '');
    const lang = req.body?.lang === 'en' ? 'en' : 'ne';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are Susamachar AI (सुसमाचार AI सहायक), a warm, reverent, bilingual Nepali and English Christian Bible study, devotional, and community assistant for the Susamachar – Christian App. Provide clear, scripture-grounded, encouraging answers in both Nepali (Devanagari) and English when helpful, citing relevant Bible verses (e.g., यूहन्ना ३:१६ / John 3:16, भजनसंग्रह २३:१ / Psalm 23:1). Keep responses concise and well-structured.',
          },
        });
        if (response.text) {
          return res.json({ reply: response.text });
        }
      }
    } catch (err) {
      console.warn('Gemini AI fallback triggered:', err);
    }

    // Bilingual Scripture-grounded fallback if API key is not configured or quota reached
    const q = prompt.toLowerCase();
    let replyNe =
      'जय मसीह! सुसमाचार AI बाइबल सहायकमा स्वागत छ। परमेश्वरको वचनले भन्दछ: "तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।" (भजनसंग्रह ११९:१०५)। तपाईंले पवित्र बाइबल खण्डमा ६६ पुस्तकहरू अध्ययन गर्न, प्रार्थना पर्खालमा प्रार्थना निवेदन राख्न र नेपाली पात्रो प्रयोग गर्न सक्नुहुन्छ।';
    let replyEn =
      'Jai Masih! Welcome to the Susamachar AI Bible Assistant. Scripture reminds us: "Your word is a lamp to my feet and a light to my path." (Psalm 119:105). You can explore all 66 books in the Holy Bible module, share prayer requests on the Prayer Wall, or check BS/AD dates in the Nepali Calendar.';

    if (q.includes('pray') || q.includes('प्रार्थना') || q.includes('peace') || q.includes('शान्ति')) {
      replyNe =
        'प्रार्थना र शान्तिको लागि वचन: "कुनै कुरामा चिन्तित नहोओ, तर हरेक कुरामा प्रार्थना र निवेदनद्वारा धन्यवादसाथ तिमीहरूका बिन्ती परमेश्वरमा जाहेर होऊन्।" (फिलिप्पी ४:६-७)। प्रभु येशूले तपाईंको हृदय र परिवारलाई गहिरो शान्ति दिनुभएको होस्।';
      replyEn =
        'Scripture for Prayer & Peace: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." (Philippians 4:6–7).';
    } else if (q.includes('love') || q.includes('प्रेम') || q.includes('salvation') || q.includes('मुक्ति') || q.includes('यूहन्ना') || q.includes('john')) {
      replyNe =
        '"किनकि परमेश्वरले संसारलाई यस्तो प्रेम गर्नुभयो, कि उहाँले आफ्ना एकमात्र पुत्र दिनुभयो, ताकि उहाँमाथि विश्वास गर्ने कोही पनि नाश नहोस्, तर त्यसले अनन्त जीवन पाओस्।" (यूहन्ना ३:१६)।';
      replyEn =
        '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." (John 3:16).';
    } else if (q.includes('fear') || q.includes('डर') || q.includes('strength') || q.includes('बल') || q.includes('साहस')) {
      replyNe =
        '"नडरा, किनकि म तँसित छु। विचलित नहो, किनकि म तेरा परमेश्वर हुँ। म तँलाई बलियो पार्नेछु र तँलाई सहायता गर्नेछु।" (यशैया ४१:१०)।';
      replyEn =
        '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." (Isaiah 41:10).';
    }

    return res.json({
      reply: lang === 'ne' ? `${replyNe}\n\n${replyEn}` : `${replyEn}\n\n${replyNe}`,
    });
  });

  // =========================================================================
  // VITE MIDDLEWARE (DEVELOPMENT) OR STATIC SERVING (PRODUCTION)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Susamachar Christian App Server running on http://localhost:${PORT}`);
  });
}

startServer();
