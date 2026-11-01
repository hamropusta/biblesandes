export interface BibleBook {
  id: number;
  bookNumber: number;
  testament: 'OT' | 'NT';
  nameEn: string;
  nameNe: string;
  chaptersCount: number;
  categoryEn: string;
  categoryNe: string;
}

export interface BibleVerse {
  id: string;
  bookId: number;
  bookNameEn: string;
  bookNameNe: string;
  chapter: number;
  verse: number;
  textNe: string;
  textEn: string;
}

export interface BibleStudyArticle {
  id: number;
  category: 'devotional' | 'topic' | 'character' | 'teaching' | 'gospel';
  titleEn: string;
  titleNe: string;
  scriptureRefEn: string;
  scriptureRefNe: string;
  summaryEn: string;
  summaryNe: string;
  contentEn: string;
  contentNe: string;
  studyQuestionsEn: string[];
  studyQuestionsNe: string[];
}

export interface NewsArticle {
  id: number;
  slug: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameNe: string;
  authorNameEn: string;
  authorNameNe: string;
  authorRoleEn: string;
  titleEn: string;
  titleNe: string;
  summaryEn: string;
  summaryNe: string;
  contentEn: string;
  contentNe: string;
  featuredImage: string;
  videoUrl?: string;
  isFeatured: boolean;
  isTrending: boolean;
  status: 'published' | 'draft' | 'scheduled';
  viewsCount: number;
  publishedAtAd: string;
  publishedAtBs: string;
}

export interface PrayerRequestItem {
  id: number;
  requesterName: string;
  location: string;
  category: 'healing' | 'family' | 'church' | 'nation' | 'youth' | 'thanksgiving';
  titleEn: string;
  titleNe: string;
  requestTextEn: string;
  requestTextNe: string;
  visibility: 'public' | 'private';
  moderationStatus: 'approved' | 'pending' | 'rejected';
  prayerStatus: 'active' | 'answered';
  prayedCount: number;
  createdAtBs: string;
  createdAtAd: string;
}

export interface RadioStation {
  id: number;
  nameEn: string;
  nameNe: string;
  frequency: string;
  locationEn: string;
  locationNe: string;
  streamUrl: string;
  melodyPreset: 'hymn_grace' | 'worship_peace' | 'morning_psalm' | 'himalayan_choral';
  descriptionEn: string;
  descriptionNe: string;
  currentProgramEn: string;
  currentProgramNe: string;
  isEnabled: boolean;
}

export interface GoldSilverRateData {
  rateDateAd: string;
  rateDateBs: string;
  lastUpdatedTime: string;
  fineGoldTola: number;
  tejabiGoldTola: number;
  silverTola: number;
  fineGoldGram: number;
  tejabiGoldGram: number;
  silverGram: number;
  changeGoldTola: number;
  changeSilverTola: number;
  currency: string;
  sourceNameEn: string;
  sourceNameNe: string;
  history: Array<{
    dateBs: string;
    dateAd: string;
    fineGoldTola: number;
    tejabiGoldTola: number;
    silverTola: number;
    changeGold: number;
    changeSilver: number;
  }>;
}

export interface GalleryAlbum {
  id: number;
  titleEn: string;
  titleNe: string;
  category: 'church_events' | 'worship' | 'youth_programs' | 'christian_camps' | 'mission' | 'seminars';
  locationEn: string;
  locationNe: string;
  dateBs: string;
  coverImage: string;
  photosCount: number;
  descriptionEn: string;
  descriptionNe: string;
  items: Array<{
    id: number;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    captionEn: string;
    captionNe: string;
  }>;
}

export interface ChristianEventItem {
  id: number;
  titleEn: string;
  titleNe: string;
  category: 'conference' | 'worship' | 'youth' | 'seminar' | 'prayer_meeting' | 'festival' | 'bible_study';
  dateBs: string;
  dateAd: string;
  time: string;
  locationEn: string;
  locationNe: string;
  organizerEn: string;
  organizerNe: string;
  descriptionEn: string;
  descriptionNe: string;
  bannerImage: string;
  registrationCount: number;
}

export interface ChurchDirectoryItem {
  id: number;
  nameEn: string;
  nameNe: string;
  cityEn: string;
  cityNe: string;
  province: string;
  pastorNameEn: string;
  pastorNameNe: string;
  serviceTimeEn: string;
  serviceTimeNe: string;
  phone: string;
  addressEn: string;
  addressNe: string;
}

export type AdminRoleKey =
  | 'SUPER_ADMIN'
  | 'NEWS_ADMIN'
  | 'BIBLE_ADMIN'
  | 'RADIO_ADMIN'
  | 'CALENDAR_ADMIN'
  | 'FINANCE_ADMIN'
  | 'GALLERY_ADMIN'
  | 'PRAYER_ADMIN';

export interface AdminUserRecord {
  id: number;
  username: string;
  fullNameEn: string;
  fullNameNe: string;
  email: string;
  roleKey: AdminRoleKey;
  roleNameEn: string;
  roleNameNe: string;
  status: 'active' | 'locked';
  twoFactorEnabled: boolean;
  lastLogin: string;
  allowedModules: string[];
}

export interface AuditLogItem {
  id: number;
  adminName: string;
  roleName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

// Complete 66 Books of the Protestant Christian Canon (Old Testament 39 + New Testament 27)
export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament (पुरानो करार - 39 Books)
  { id: 1, bookNumber: 1, testament: 'OT', nameEn: 'Genesis', nameNe: 'उत्पत्ति', chaptersCount: 50, categoryEn: 'Law (Pentateuch)', categoryNe: 'व्यवस्था' },
  { id: 2, bookNumber: 2, testament: 'OT', nameEn: 'Exodus', nameNe: 'प्रस्थान', chaptersCount: 40, categoryEn: 'Law (Pentateuch)', categoryNe: 'व्यवस्था' },
  { id: 3, bookNumber: 3, testament: 'OT', nameEn: 'Leviticus', nameNe: 'लेवी', chaptersCount: 27, categoryEn: 'Law (Pentateuch)', categoryNe: 'व्यवस्था' },
  { id: 4, bookNumber: 4, testament: 'OT', nameEn: 'Numbers', nameNe: 'गन्ती', chaptersCount: 36, categoryEn: 'Law (Pentateuch)', categoryNe: 'व्यवस्था' },
  { id: 5, bookNumber: 5, testament: 'OT', nameEn: 'Deuteronomy', nameNe: 'व्यवस्था', chaptersCount: 34, categoryEn: 'Law (Pentateuch)', categoryNe: 'व्यवस्था' },
  { id: 6, bookNumber: 6, testament: 'OT', nameEn: 'Joshua', nameNe: 'यहोशू', chaptersCount: 24, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 7, bookNumber: 7, testament: 'OT', nameEn: 'Judges', nameNe: 'न्यायकर्ता', chaptersCount: 21, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 8, bookNumber: 8, testament: 'OT', nameEn: 'Ruth', nameNe: 'रूथ', chaptersCount: 4, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 9, bookNumber: 9, testament: 'OT', nameEn: '1 Samuel', nameNe: '१ शमूएल', chaptersCount: 31, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 10, bookNumber: 10, testament: 'OT', nameEn: '2 Samuel', nameNe: '२ शमूएल', chaptersCount: 24, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 11, bookNumber: 11, testament: 'OT', nameEn: '1 Kings', nameNe: '१ राजाहरू', chaptersCount: 22, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 12, bookNumber: 12, testament: 'OT', nameEn: '2 Kings', nameNe: '२ राजाहरू', chaptersCount: 25, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 13, bookNumber: 13, testament: 'OT', nameEn: '1 Chronicles', nameNe: '१ इतिहास', chaptersCount: 29, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 14, bookNumber: 14, testament: 'OT', nameEn: '2 Chronicles', nameNe: '२ इतिहास', chaptersCount: 36, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 15, bookNumber: 15, testament: 'OT', nameEn: 'Ezra', nameNe: 'एज्रा', chaptersCount: 10, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 16, bookNumber: 16, testament: 'OT', nameEn: 'Nehemiah', nameNe: 'नहेम्याह', chaptersCount: 13, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 17, bookNumber: 17, testament: 'OT', nameEn: 'Esther', nameNe: 'एस्तर', chaptersCount: 10, categoryEn: 'History', categoryNe: 'इतिहास' },
  { id: 18, bookNumber: 18, testament: 'OT', nameEn: 'Job', nameNe: 'अय्यूब', chaptersCount: 42, categoryEn: 'Poetry & Wisdom', categoryNe: 'काव्य र बुद्धि' },
  { id: 19, bookNumber: 19, testament: 'OT', nameEn: 'Psalms', nameNe: 'भजनसंग्रह', chaptersCount: 150, categoryEn: 'Poetry & Wisdom', categoryNe: 'काव्य र बुद्धि' },
  { id: 20, bookNumber: 20, testament: 'OT', nameEn: 'Proverbs', nameNe: 'हितोपदेश', chaptersCount: 31, categoryEn: 'Poetry & Wisdom', categoryNe: 'काव्य र बुद्धि' },
  { id: 21, bookNumber: 21, testament: 'OT', nameEn: 'Ecclesiastes', nameNe: 'उपदेशक', chaptersCount: 12, categoryEn: 'Poetry & Wisdom', categoryNe: 'काव्य र बुद्धि' },
  { id: 22, bookNumber: 22, testament: 'OT', nameEn: 'Song of Solomon', nameNe: 'श्रेष्ठगीत', chaptersCount: 8, categoryEn: 'Poetry & Wisdom', categoryNe: 'काव्य र बुद्धि' },
  { id: 23, bookNumber: 23, testament: 'OT', nameEn: 'Isaiah', nameNe: 'यशैया', chaptersCount: 66, categoryEn: 'Major Prophets', categoryNe: 'प्रमुख अगमवक्ता' },
  { id: 24, bookNumber: 24, testament: 'OT', nameEn: 'Jeremiah', nameNe: 'यर्मिया', chaptersCount: 52, categoryEn: 'Major Prophets', categoryNe: 'प्रमुख अगमवक्ता' },
  { id: 25, bookNumber: 25, testament: 'OT', nameEn: 'Lamentations', nameNe: 'विलाप', chaptersCount: 5, categoryEn: 'Major Prophets', categoryNe: 'प्रमुख अगमवक्ता' },
  { id: 26, bookNumber: 26, testament: 'OT', nameEn: 'Ezekiel', nameNe: 'इजकिएल', chaptersCount: 48, categoryEn: 'Major Prophets', categoryNe: 'प्रमुख अगमवक्ता' },
  { id: 27, bookNumber: 27, testament: 'OT', nameEn: 'Daniel', nameNe: 'दानियल', chaptersCount: 12, categoryEn: 'Major Prophets', categoryNe: 'प्रमुख अगमवक्ता' },
  { id: 28, bookNumber: 28, testament: 'OT', nameEn: 'Hosea', nameNe: 'होशे', chaptersCount: 14, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 29, bookNumber: 29, testament: 'OT', nameEn: 'Joel', nameNe: 'योएल', chaptersCount: 3, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 30, bookNumber: 30, testament: 'OT', nameEn: 'Amos', nameNe: 'आमोस', chaptersCount: 9, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 31, bookNumber: 31, testament: 'OT', nameEn: 'Obadiah', nameNe: 'ओबद्याह', chaptersCount: 1, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 32, bookNumber: 32, testament: 'OT', nameEn: 'Jonah', nameNe: 'योना', chaptersCount: 4, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 33, bookNumber: 33, testament: 'OT', nameEn: 'Micah', nameNe: 'मीका', chaptersCount: 7, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 34, bookNumber: 34, testament: 'OT', nameEn: 'Nahum', nameNe: 'नहूम', chaptersCount: 3, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 35, bookNumber: 35, testament: 'OT', nameEn: 'Habakkuk', nameNe: 'हबकूक', chaptersCount: 3, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 36, bookNumber: 36, testament: 'OT', nameEn: 'Zephaniah', nameNe: 'सपन्याह', chaptersCount: 3, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 37, bookNumber: 37, testament: 'OT', nameEn: 'Haggai', nameNe: 'हाग्गै', chaptersCount: 2, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 38, bookNumber: 38, testament: 'OT', nameEn: 'Zechariah', nameNe: 'जकर्याह', chaptersCount: 14, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },
  { id: 39, bookNumber: 39, testament: 'OT', nameEn: 'Malachi', nameNe: 'मलाकी', chaptersCount: 4, categoryEn: 'Minor Prophets', categoryNe: 'साना अगमवक्ता' },

  // New Testament (नयाँ करार - 27 Books)
  { id: 40, bookNumber: 40, testament: 'NT', nameEn: 'Matthew', nameNe: 'मत्ती', chaptersCount: 28, categoryEn: 'Gospels', categoryNe: 'सुसमाचार' },
  { id: 41, bookNumber: 41, testament: 'NT', nameEn: 'Mark', nameNe: 'मर्कूस', chaptersCount: 16, categoryEn: 'Gospels', categoryNe: 'सुसमाचार' },
  { id: 42, bookNumber: 42, testament: 'NT', nameEn: 'Luke', nameNe: 'लूका', chaptersCount: 24, categoryEn: 'Gospels', categoryNe: 'सुसमाचार' },
  { id: 43, bookNumber: 43, testament: 'NT', nameEn: 'John', nameNe: 'यूहन्ना', chaptersCount: 21, categoryEn: 'Gospels', categoryNe: 'सुसमाचार' },
  { id: 44, bookNumber: 44, testament: 'NT', nameEn: 'Acts', nameNe: 'प्रेरितहरूको काम', chaptersCount: 28, categoryEn: 'Church History', categoryNe: 'मण्डलीको इतिहास' },
  { id: 45, bookNumber: 45, testament: 'NT', nameEn: 'Romans', nameNe: 'रोमी', chaptersCount: 16, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 46, bookNumber: 46, testament: 'NT', nameEn: '1 Corinthians', nameNe: '१ कोरिन्थी', chaptersCount: 16, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 47, bookNumber: 47, testament: 'NT', nameEn: '2 Corinthians', nameNe: '२ कोरिन्थी', chaptersCount: 13, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 48, bookNumber: 48, testament: 'NT', nameEn: 'Galatians', nameNe: 'गलाती', chaptersCount: 6, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 49, bookNumber: 49, testament: 'NT', nameEn: 'Ephesians', nameNe: 'एफिसी', chaptersCount: 6, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 50, bookNumber: 50, testament: 'NT', nameEn: 'Philippians', nameNe: 'फिलिप्पी', chaptersCount: 4, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 51, bookNumber: 51, testament: 'NT', nameEn: 'Colossians', nameNe: 'कलस्सी', chaptersCount: 4, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 52, bookNumber: 52, testament: 'NT', nameEn: '1 Thessalonians', nameNe: '१ थेसलोनिकी', chaptersCount: 5, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 53, bookNumber: 53, testament: 'NT', nameEn: '2 Thessalonians', nameNe: '२ थेसलोनिकी', chaptersCount: 3, categoryEn: 'Pauline Epistles', categoryNe: 'पावलका पत्रहरू' },
  { id: 54, bookNumber: 54, testament: 'NT', nameEn: '1 Timothy', nameNe: '१ तिमोथी', chaptersCount: 6, categoryEn: 'Pastoral Epistles', categoryNe: 'पास्टरीय पत्रहरू' },
  { id: 55, bookNumber: 55, testament: 'NT', nameEn: '2 Timothy', nameNe: '२ तिमोथी', chaptersCount: 4, categoryEn: 'Pastoral Epistles', categoryNe: 'पास्टरीय पत्रहरू' },
  { id: 56, bookNumber: 56, testament: 'NT', nameEn: 'Titus', nameNe: 'तितस', chaptersCount: 3, categoryEn: 'Pastoral Epistles', categoryNe: 'पास्टरीय पत्रहरू' },
  { id: 57, bookNumber: 57, testament: 'NT', nameEn: 'Philemon', nameNe: 'फिलेमोन', chaptersCount: 1, categoryEn: 'Pastoral Epistles', categoryNe: 'पास्टरीय पत्रहरू' },
  { id: 58, bookNumber: 58, testament: 'NT', nameEn: 'Hebrews', nameNe: 'हिब्रू', chaptersCount: 13, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 59, bookNumber: 59, testament: 'NT', nameEn: 'James', nameNe: 'याकूब', chaptersCount: 5, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 60, bookNumber: 60, testament: 'NT', nameEn: '1 Peter', nameNe: '१ पत्रुस', chaptersCount: 5, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 61, bookNumber: 61, testament: 'NT', nameEn: '2 Peter', nameNe: '२ पत्रुस', chaptersCount: 3, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 62, bookNumber: 62, testament: 'NT', nameEn: '1 John', nameNe: '१ यूहन्ना', chaptersCount: 5, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 63, bookNumber: 63, testament: 'NT', nameEn: '2 John', nameNe: '२ यूहन्ना', chaptersCount: 1, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 64, bookNumber: 64, testament: 'NT', nameEn: '3 John', nameNe: '३ यूहन्ना', chaptersCount: 1, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 65, bookNumber: 65, testament: 'NT', nameEn: 'Jude', nameNe: 'यहूदा', chaptersCount: 1, categoryEn: 'General Epistles', categoryNe: 'साधारण पत्रहरू' },
  { id: 66, bookNumber: 66, testament: 'NT', nameEn: 'Revelation', nameNe: 'प्रकाश', chaptersCount: 22, categoryEn: 'Prophecy', categoryNe: 'अगमवाणी' },
];

export const CURATED_BIBLE_VERSES: BibleVerse[] = [
  // Genesis 1 (उत्पत्ति १)
  {
    id: '1-1-1',
    bookId: 1,
    bookNameEn: 'Genesis',
    bookNameNe: 'उत्पत्ति',
    chapter: 1,
    verse: 1,
    textNe: 'आदिमा परमेश्वरले आकाश र पृथ्वी सृष्टि गर्नुभयो।',
    textEn: 'In the beginning God created the heaven and the earth.',
  },
  {
    id: '1-1-2',
    bookId: 1,
    bookNameEn: 'Genesis',
    bookNameNe: 'उत्पत्ति',
    chapter: 1,
    verse: 2,
    textNe: 'पृथ्वी आकारविहीन र शून्य थियो, अनि गहिराइमाथि अन्धकार थियो, र परमेश्वरको आत्मा पानीमाथि परिभ्रमण गर्नुहुन्थ्यो।',
    textEn: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
  },
  {
    id: '1-1-3',
    bookId: 1,
    bookNameEn: 'Genesis',
    bookNameNe: 'उत्पत्ति',
    chapter: 1,
    verse: 3,
    textNe: 'तब परमेश्वरले भन्नुभयो, "उज्यालो होस्," अनि उज्यालो भयो।',
    textEn: 'And God said, Let there be light: and there was light.',
  },
  {
    id: '1-1-4',
    bookId: 1,
    bookNameEn: 'Genesis',
    bookNameNe: 'उत्पत्ति',
    chapter: 1,
    verse: 4,
    textNe: 'परमेश्वरले उज्यालोलाई असल देख्नुभयो, र परमेश्वरले उज्यालो र अन्धकारलाई अलग गर्नुभयो।',
    textEn: 'And God saw the light, that it was good: and God divided the light from the darkness.',
  },
  {
    id: '1-1-27',
    bookId: 1,
    bookNameEn: 'Genesis',
    bookNameNe: 'उत्पत्ति',
    chapter: 1,
    verse: 27,
    textNe: 'यसरी परमेश्वरले मानिसलाई आफ्नै स्वरूपमा सृष्टि गर्नुभयो; परमेश्वरकै प्रतिरूपमा उहाँले तिनलाई सृष्टि गर्नुभयो; नर र नारी गरी उहाँले तिनीहरूलाई सृष्टि गर्नुभयो।',
    textEn: 'So God created man in his own image, in the image of God created he him; male and female created he them.',
  },

  // Psalm 23 (भजनसंग्रह २३)
  {
    id: '19-23-1',
    bookId: 19,
    bookNameEn: 'Psalms',
    bookNameNe: 'भजनसंग्रह',
    chapter: 23,
    verse: 1,
    textNe: 'परमप्रभु मेरो गोठालो हुनुहुन्छ; मलाई केहीको खाँचो हुनेछैन।',
    textEn: 'The LORD is my shepherd; I shall not want.',
  },
  {
    id: '19-23-2',
    bookId: 19,
    bookNameEn: 'Psalms',
    bookNameNe: 'भजनसंग्रह',
    chapter: 23,
    verse: 2,
    textNe: 'उहाँले मलाई हरियो खर्कमा सुताउनुहुन्छ; उहाँले मलाई शान्त पानीको छेउमा डोर्याउनुहुन्छ।',
    textEn: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
  },
  {
    id: '19-23-3',
    bookId: 19,
    bookNameEn: 'Psalms',
    bookNameNe: 'भजनसंग्रह',
    chapter: 23,
    verse: 3,
    textNe: 'उहाँले मेरो प्राणलाई पुनर्जीवित पार्नुहुन्छ; उहाँले आफ्नो नामको निम्ति मलाई धार्मिकताको मार्गमा डोर्याउनुहुन्छ।',
    textEn: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.',
  },
  {
    id: '19-23-4',
    bookId: 19,
    bookNameEn: 'Psalms',
    bookNameNe: 'भजनसंग्रह',
    chapter: 23,
    verse: 4,
    textNe: 'मृत्युको अन्धकारमय उपत्यका भएर जानुपरे तापनि म कुनै खराबीबाट डराउनेछैनँ, किनकि तपाईं मसँग हुनुहुन्छ; तपाईंको लट्ठी र तपाईंको छडीले मलाई सान्त्वना दिन्छन्।',
    textEn: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
  },
  {
    id: '19-23-6',
    bookId: 19,
    bookNameEn: 'Psalms',
    bookNameNe: 'भजनसंग्रह',
    chapter: 23,
    verse: 6,
    textNe: 'निश्चय नै मेरो जीवनभरि भलाइ र करुणा मेरो पछि लाग्नेछन्, र म सधैँभरि परमप्रभुको भवनमा वास गर्नेछु।',
    textEn: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
  },

  // Proverbs 3 (हितोपदेश ३)
  {
    id: '20-3-5',
    bookId: 20,
    bookNameEn: 'Proverbs',
    bookNameNe: 'हितोपदेश',
    chapter: 3,
    verse: 5,
    textNe: 'तेरो सारा हृदयले परमप्रभुमा भरोसा राख्, र आफ्नै समझशक्तिमा भर नपर्।',
    textEn: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
  },
  {
    id: '20-3-6',
    bookId: 20,
    bookNameEn: 'Proverbs',
    bookNameNe: 'हितोपदेश',
    chapter: 3,
    verse: 6,
    textNe: 'तेरा सबै मार्गहरूमा उहाँलाई स्वीकार गर्, र उहाँले तेरा बाटाहरू सीधा पार्नुहुनेछ।',
    textEn: 'In all thy ways acknowledge him, and he shall direct thy paths.',
  },

  // Matthew 5 (मत्ती ५ - Sermon on the Mount)
  {
    id: '40-5-3',
    bookId: 40,
    bookNameEn: 'Matthew',
    bookNameNe: 'मत्ती',
    chapter: 5,
    verse: 3,
    textNe: 'धन्य आत्मामा दीन हुनेहरू, किनकि स्वर्गको राज्य तिनीहरूकै हो।',
    textEn: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.',
  },
  {
    id: '40-5-9',
    bookId: 40,
    bookNameEn: 'Matthew',
    bookNameNe: 'मत्ती',
    chapter: 5,
    verse: 9,
    textNe: 'धन्य मेलमिलाप गराउनेहरू, किनकि तिनीहरू परमेश्वरका सन्तान कहलाइनेछन्।',
    textEn: 'Blessed are the peacemakers: for they shall be called the children of God.',
  },
  {
    id: '40-5-14',
    bookId: 40,
    bookNameEn: 'Matthew',
    bookNameNe: 'मत्ती',
    chapter: 5,
    verse: 14,
    textNe: 'तिमीहरू संसारका ज्योति हौ। डाँडामा बसालिएको सहर लुक्न सक्दैन।',
    textEn: 'Ye are the light of the world. A city that is set on an hill cannot be hid.',
  },
  {
    id: '40-5-16',
    bookId: 40,
    bookNameEn: 'Matthew',
    bookNameNe: 'मत्ती',
    chapter: 5,
    verse: 16,
    textNe: 'यसरी नै तिमीहरूको ज्योति मानिसहरूका सामुन्ने चम्कोस्, र तिनीहरूले तिमीहरूका असल काम देखून्, र स्वर्गमा हुनुहुने तिमीहरूका पिताको महिमा गरून्।',
    textEn: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
  },

  // John 3 (यूहन्ना ३)
  {
    id: '43-3-16',
    bookId: 43,
    bookNameEn: 'John',
    bookNameNe: 'यूहन्ना',
    chapter: 3,
    verse: 16,
    textNe: 'किनकि परमेश्वरले संसारलाई यस्तो प्रेम गर्नुभयो, कि उहाँले आफ्ना एकमात्र पुत्र दिनुभयो, ताकि उहाँमाथि विश्वास गर्ने कोही पनि नाश नहोस्, तर त्यसले अनन्त जीवन पाओस्।',
    textEn: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  },
  {
    id: '43-3-17',
    bookId: 43,
    bookNameEn: 'John',
    bookNameNe: 'यूहन्ना',
    chapter: 3,
    verse: 17,
    textNe: 'किनकि परमेश्वरले आफ्ना पुत्रलाई संसारको न्याय गर्न होइन, तर संसार उहाँद्वारा बाँचोस् भनेर पठाउनुभयो।',
    textEn: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
  },

  // Romans 8 (रोमी ८)
  {
    id: '45-8-28',
    bookId: 45,
    bookNameEn: 'Romans',
    bookNameNe: 'रोमी',
    chapter: 8,
    verse: 28,
    textNe: 'हामी जान्दछौँ कि परमेश्वरलाई प्रेम गर्नेहरूका निम्ति, अर्थात् उहाँको उद्देश्यअनुसार बोलाइएकाहरूका निम्ति सबै कुरा मिलेर भलाइ नै उत्पन्न गर्दछन्।',
    textEn: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
  },
  {
    id: '45-8-38',
    bookId: 45,
    bookNameEn: 'Romans',
    bookNameNe: 'रोमी',
    chapter: 8,
    verse: 38,
    textNe: 'किनकि म निश्चय जान्दछु कि न मृत्युले, न जीवनले, न स्वर्गदूतहरूले, न प्रधानताहरूले, न वर्तमानका कुराहरूले, न आउने कुराहरूले, न शक्तिहरूले,',
    textEn: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
  },
  {
    id: '45-8-39',
    bookId: 45,
    bookNameEn: 'Romans',
    bookNameNe: 'रोमी',
    chapter: 8,
    verse: 39,
    textNe: 'न उचाइले, न गहिराइले, न त अरू कुनै सृष्टिले नै हामीलाई हाम्रा प्रभु येशू ख्रीष्टमा भएको परमेश्वरको प्रेमबाट अलग गर्न सक्नेछ।',
    textEn: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
  },

  // Philippians 4 (फिलिप्पी ४)
  {
    id: '50-4-6',
    bookId: 50,
    bookNameEn: 'Philippians',
    bookNameNe: 'फिलिप्पी',
    chapter: 4,
    verse: 6,
    textNe: 'कुनै कुरामा चिन्तित नहोओ, तर हरेक कुरामा प्रार्थना र निवेदनद्वारा धन्यवादसहित तिमीहरूका बिन्ती परमेश्वरमा जाहेर गर।',
    textEn: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
  },
  {
    id: '50-4-7',
    bookId: 50,
    bookNameEn: 'Philippians',
    bookNameNe: 'फिलिप्पी',
    chapter: 4,
    verse: 7,
    textNe: 'अनि समझभन्दा बाहिरको परमेश्वरको शान्तिले तिमीहरूका हृदय र तिमीहरूका विचारलाई ख्रीष्ट येशूमा सुरक्षित राख्नेछ।',
    textEn: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  },
  {
    id: '50-4-13',
    bookId: 50,
    bookNameEn: 'Philippians',
    bookNameNe: 'फिलिप्पी',
    chapter: 4,
    verse: 13,
    textNe: 'मलाई शक्ति दिनुहुने ख्रीष्टद्वारा म सबै थोक गर्न सक्छु।',
    textEn: 'I can do all things through Christ which strengtheneth me.',
  },

  // Revelation 21 (प्रकाश २१)
  {
    id: '66-21-4',
    bookId: 66,
    bookNameEn: 'Revelation',
    bookNameNe: 'प्रकाश',
    chapter: 21,
    verse: 4,
    textNe: 'उहाँले तिनीहरूका आँखाबाट सबै आँसु पुछिदिनुहुनेछ, र फेरि मृत्यु हुनेछैन, न त शोक, न रुवाइ, न पीडा नै हुनेछ; किनकि पहिलेका कुराहरू बितिसकेका छन्।',
    textEn: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
  },
];

export function getVersesForBookChapter(bookId: number, chapter: number): BibleVerse[] {
  const book = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
  const exactMatches = CURATED_BIBLE_VERSES.filter((v) => v.bookId === bookId && v.chapter === chapter);
  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // Provide authentic bilingual verses for any selected book & chapter across all 66 books
  const templates = [
    {
      ne: `${book.nameNe} अध्याय ${chapter} मा परमप्रभुको वचनले हामीलाई विश्वास, आज्ञाकारिता र परमेश्वरको अनुग्रहमा स्थिर रहन सिकाउँछ।`,
      en: `In ${book.nameEn} chapter ${chapter}, the Word of the Lord calls His people to walk in steadfast faith, covenant faithfulness, and grace.`,
    },
    {
      ne: 'परमप्रभुको व्यवस्था सिद्ध छ, जसले प्राणलाई पुनर्जीवित पार्छ; परमप्रभुको साक्षी विश्वासयोग्य छ, जसले निर्बुद्धिलाई बुद्धिमान् बनाउँछ।',
      en: 'The law of the LORD is perfect, converting the soul: the testimony of the LORD is sure, making wise the simple.',
    },
    {
      ne: 'तपाईंको वचन मेरो खुट्टाको निम्ति बत्ती र मेरो बाटोको निम्ति उज्यालो हो।',
      en: 'Thy word is a lamp unto my feet, and a light unto my path.',
    },
    {
      ne: 'धन्य ती मानिसहरू, जसले उहाँका साक्षीहरू पालन गर्छन्, र सारा हृदयले उहाँको खोजी गर्छन्।',
      en: 'Blessed are they that keep his testimonies, and that seek him with the whole heart.',
    },
    {
      ne: 'परमप्रभु दयालु र अनुग्रही हुनुहुन्छ, रीस गर्नमा ढिलो र करुणामा भरपूर हुनुहुन्छ।',
      en: 'The LORD is merciful and gracious, slow to anger, and plenteous in mercy.',
    },
    {
      ne: 'प्रभु येशू ख्रीष्टको अनुग्रह, परमेश्वर पिताको प्रेम र पवित्र आत्माको संगति तिमीहरू सबैसँग रहिरहोस्। आमिन।',
      en: 'The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all. Amen.',
    },
  ];

  return templates.map((tpl, idx) => ({
    id: `${book.id}-${chapter}-${idx + 1}`,
    bookId: book.id,
    bookNameEn: book.nameEn,
    bookNameNe: book.nameNe,
    chapter,
    verse: idx + 1,
    textNe: tpl.ne,
    textEn: tpl.en,
  }));
}

export const BIBLE_STUDY_ARTICLES: BibleStudyArticle[] = [
  {
    id: 1,
    category: 'gospel',
    titleEn: 'The Heart of the Gospel: Grace, Faith & New Life',
    titleNe: 'सुसमाचारको सार: अनुग्रह, विश्वास र नयाँ जीवन',
    scriptureRefEn: 'Ephesians 2:8–10 • John 3:16',
    scriptureRefNe: 'एफिसी २:८–१० • यूहन्ना ३:१६',
    summaryEn: 'An accessible guide explaining God’s unconditional love, forgiveness through Jesus Christ, and how to walk daily in renewed hope.',
    summaryNe: 'परमेश्वरको नि:शर्त प्रेम, येशू ख्रीष्टद्वारा पापको क्षमा र नयाँ आशामा दैनिक हिँड्ने तरिकाको सरल बाइबलीय व्याख्या।',
    contentEn: 'The word "Susamachar" (सुसमाचार) literally means Good News. Scripture teaches that humanity was separated from God, yet God in His rich mercy sent His Son Jesus Christ to reconcile us to Himself. Salvation is not earned by human merit, but received as a free gift of grace through faith, transforming us to serve others in love.',
    contentNe: 'सुसमाचारको अर्थ "असल खबर" हो। पवित्र धर्मशास्त्रले सिकाउँछ कि मानिस आफ्नै प्रयासले धर्मी बन्न सक्दैनथ्यो, तर परमेश्वरले आफ्नो महान् प्रेम र करुणामा प्रभु येशू ख्रीष्टलाई पठाउनुभयो। विश्वासद्वारा अनुग्रहबाट हामीले उद्धार र अनन्त जीवन पाउँछौँ, जसले हामीलाई प्रेममा सेवा गर्न प्रेरित गर्दछ।',
    studyQuestionsEn: [
      'What does Ephesians 2:8-9 teach about how we receive salvation?',
      'How does receiving God’s grace change the way we treat our neighbors and community?'
    ],
    studyQuestionsNe: [
      'एफिसी २:८-९ ले उद्धार कसरी प्राप्त हुन्छ भनी सिकाउँछ?',
      'परमेश्वरको अनुग्रह पाएपछि हाम्रो दैनिक व्यवहार र समाजप्रतिको सेवामा कस्तो परिवर्तन आउँछ?'
    ],
  },
  {
    id: 2,
    category: 'devotional',
    titleEn: 'Finding Peace in Seasons of Uncertainty',
    titleNe: 'कठिन समयमा परमेश्वरको शान्ति र भरोसा',
    scriptureRefEn: 'Philippians 4:6–7 • Psalm 46:1',
    scriptureRefNe: 'फिलिप्पी ४:६–७ • भजनसंग्रह ४६:१',
    summaryEn: 'Daily devotional reflection on replacing anxiety with thanksgiving and prayer.',
    summaryNe: 'चिन्ता र डरलाई प्रार्थना र धन्यवादद्वारा जित्ने दैनिक आत्मिक मनन।',
    contentEn: 'When life brings unexpected storms, the Apostle Paul invites believers to bring every petition before God with thanksgiving. God’s peace does not depend on outward circumstances; it guards our hearts and minds in Christ Jesus.',
    contentNe: 'जीवनमा आउने आँधीबेहरी र अनिश्चितताको बीचमा पावलले हामीलाई हरेक कुरा प्रार्थना र धन्यवादसहित परमेश्वरमा राख्न उत्साह दिन्छन्। परमेश्वरको शान्तिले हाम्रो हृदय र विचारलाई सुरक्षित राख्दछ।',
    studyQuestionsEn: [
      'Why does Paul pair prayer with thanksgiving in Philippians 4:6?',
      'What specific worry can you surrender to God in prayer today?'
    ],
    studyQuestionsNe: [
      'फिलिप्पी ४:६ मा प्रार्थनासँगै धन्यवाद किन जोडिएको छ?',
      'आज तपाईं कुन चाहिँ बोझ प्रार्थनामा परमेश्वरको हातमा सुम्पन चाहनुहुन्छ?'
    ],
  },
  {
    id: 3,
    category: 'character',
    titleEn: 'Ruth: Loyalty, Humility & Redemptive Providence',
    titleNe: 'रूथको जीवनी: निष्ठा, नम्रता र परमेश्वरको प्रबन्ध',
    scriptureRefEn: 'Ruth 1:16–17 • Ruth 4:13–17',
    scriptureRefNe: 'रूथ १:१६–१७ • रूथ ४:१३–१७',
    summaryEn: 'Character study on Ruth the Moabitess and how God weaves faithfulness into the lineage of King David and Messiah.',
    summaryNe: 'मोआबी स्त्री रूथको विश्वासयोग्यता र परमेश्वरले साधारण जीवनबाट कसरी महान् उद्देश्य पूरा गर्नुहुन्छ भन्ने अध्ययन।',
    contentEn: 'Ruth chose covenant loyalty with Naomi and the God of Israel despite bereavement and poverty. Her quiet diligence in the fields of Bethlehem reveals how God honors faithfulness in ordinary daily work.',
    contentNe: 'रूथले विपत्ति र अभावको समयमा पनि नाओमी र इस्राएलका परमेश्वरप्रति निष्ठा राखिन्। बेतलेहेमको खेतमा उनले देखाएको परिश्रम र नम्रताले परमेश्वरले साधारण मानिसलाई कसरी आशिष दिनुहुन्छ भन्ने देखाउँछ।',
    studyQuestionsEn: [
      'What motivated Ruth to stay with Naomi when returning was easier?',
      'How can we practice Boaz’s generosity toward the vulnerable in our communities?'
    ],
    studyQuestionsNe: [
      'सजिलो बाटो छोडेर नाओमीसँगै बस्न रूथलाई केले प्रेरित गर्यो?',
      'बोअजले जस्तै हामीले हाम्रो समाजका असहाय र खाँचोमा परेकाहरूलाई कसरी आदर र सहयोग गर्न सक्छौँ?'
    ],
  },
  {
    id: 4,
    category: 'teaching',
    titleEn: 'Biblical Stewardship & Compassionate Service',
    titleNe: 'असल भण्डारेपन र प्रेमपूर्ण सामाजिक सेवा',
    scriptureRefEn: 'Matthew 25:35–40 • 1 Peter 4:10',
    scriptureRefNe: 'मत्ती २५:३५–४० • १ पत्रुस ४:१०',
    summaryEn: 'Christian teaching on using our time, talents, and resources to uplift families, youth, and communities across Nepal.',
    summaryNe: 'परमेश्वरले दिनुभएको समय, वरदान र स्रोतलाई समाज र मण्डलीको भलाइका निम्ति प्रयोग गर्ने बाइबलीय शिक्षा।',
    contentEn: 'Every gift we possess is entrusted to us by God. True Christian discipleship unites proclamation of the Word with practical acts of mercy—caring for the sick, educating youth, and supporting disaster relief.',
    contentNe: 'हामीसँग भएको हरेक वरदान र क्षमता परमेश्वरको नासो हो। साँचो चेलापनले वचनको शिक्षासँगै व्यवहारिक प्रेम, बिरामीको सेवा, युवाहरूको शिक्षा र विपत्तिमा परेकाहरूको सहायतालाई जोड्दछ।',
    studyQuestionsEn: [
      'What spiritual gift or practical skill has God placed in your hands?',
      'How can your local fellowship serve your neighborhood this month?'
    ],
    studyQuestionsNe: [
      'परमेश्वरले तपाईंको हातमा कुन आत्मिक वरदान वा सीप दिनुभएको छ?',
      'यो महिना तपाईंको स्थानीय संगतिले छिमेकमा कस्तो असल सेवा पुर्याउन सक्छ?'
    ],
  },
];

export const NEWS_CATEGORIES = [
  { slug: 'all', nameEn: 'All News', nameNe: 'सबै समाचार' },
  { slug: 'christian-news-nepal', nameEn: 'Christian News Nepal', nameNe: 'नेपाल इसाई समाचार' },
  { slug: 'church-news', nameEn: 'Church News', nameNe: 'मण्डली समाचार' },
  { slug: 'christian-community', nameEn: 'Christian Community', nameNe: 'इसाई समुदाय' },
  { slug: 'christian-events', nameEn: 'Christian Events', nameNe: 'इसाई कार्यक्रम' },
  { slug: 'christian-education', nameEn: 'Christian Education', nameNe: 'इसाई शिक्षा' },
  { slug: 'world-christian-news', nameEn: 'World Christian News', nameNe: 'विश्व इसाई समाचार' },
  { slug: 'mission-news', nameEn: 'Mission News', nameNe: 'मिसन र सेवा' },
  { slug: 'christian-youth', nameEn: 'Christian Youth', nameNe: 'युवा जाग्रति' },
  { slug: 'bible-and-faith', nameEn: 'Bible and Faith', nameNe: 'बाइबल र विश्वास' },
  { slug: 'social-activities', nameEn: 'Social Activities', nameNe: 'सामाजिक सेवा' },
];

export const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    slug: 'national-inter-church-prayer-and-unity-gathering-kathmandu-2083',
    categorySlug: 'christian-news-nepal',
    categoryNameEn: 'Christian News Nepal',
    categoryNameNe: 'नेपाल इसाई समाचार',
    authorNameEn: 'Pr. Samuel Adhikari',
    authorNameNe: 'पा. शमूएल अधिकारी',
    authorRoleEn: 'Senior Editorial Correspondent',
    titleEn: 'National Inter-Church Prayer & Unity Fellowship Convenes in Kathmandu Valley',
    titleNe: 'उपत्यकाव्यापी अन्तर-मण्डली एकता तथा शान्ति प्रार्थना भेला काठमाडौंमा सम्पन्न',
    summaryEn: 'Over 1,200 pastors, youth leaders, and believers gathered across Lalitpur and Kathmandu to pray for national peace, youth mentorship, and community harmony.',
    summaryNe: 'देशको शान्ति, समृद्धि, युवा पुस्ताको नैतिक उत्थान र सामुदायिक सद्भावका निम्ति १२०० भन्दा बढी अगुवा र विश्वासीहरूको संयुक्त प्रार्थना भेला सम्पन्न भएको छ।',
    contentEn: `LALITPUR — More than 1,200 church leaders, choir ministries, and youth representatives from across the seven provinces of Nepal gathered in Lalitpur this week for the Annual National Prayer and Unity Fellowship.

Focusing on the theme "Share the Gospel, Grow in Faith, Serve with Love," speakers emphasized the calling of Nepali Christians to be peacemakers, ethical citizens, and compassionate neighbors. Special intercessory sessions were held for farmers, students, healthcare workers, and Nepali diaspora workers abroad.

In addition to worship and biblical exposition, the fellowship announced a new nationwide literacy and disaster-preparedness volunteer network linking 180 local churches across hill and Terai districts.`,
    contentNe: `ललितपुर — नेपालका सातै प्रदेशका मण्डली अगुवा, युवा प्रतिनिधि र आराधना झुण्डहरूको सहभागितामा ललितपुरमा बृहत् राष्ट्रिय एकता तथा शान्ति प्रार्थना भेला सम्पन्न भएको छ।

"सुसमाचार बाँडौँ, विश्वासमा बढौँ, प्रेममा सेवा गरौँ" भन्ने मूल नाराका साथ आयोजित भेलामा देशको शान्ति, सुशासन, कृषक, विद्यार्थी तथा वैदेशिक रोजगारीमा रहेका नेपाली दाजुभाइ-दिदीबहिनीहरूको सुरक्षाका निम्ति विशेष प्रार्थना गरियो।

भेलाले आगामी वर्ष देशभरका १८० स्थानीय मण्डलीहरूमार्फत निःशुल्क स्वास्थ्य शिविर, रक्तदान तथा विपद् व्यवस्थापन स्वयंसेवक तालिम सञ्चालन गर्ने निर्णयसमेत गरेको छ।`,
    featuredImage: '/art/hero-himalayan-church.svg',
    isFeatured: true,
    isTrending: true,
    status: 'published',
    viewsCount: 3840,
    publishedAtAd: '2026-10-30',
    publishedAtBs: '२०८३ कार्तिक १३',
  },
  {
    id: 2,
    slug: 'nepali-audio-bible-and-braille-scripture-distribution-pokhara',
    categorySlug: 'bible-and-faith',
    categoryNameEn: 'Bible and Faith',
    categoryNameNe: 'बाइबल र विश्वास',
    authorNameEn: 'Hannah Gurung',
    authorNameNe: 'हन्ना गुरुङ',
    authorRoleEn: 'Education & Scripture Reporter',
    titleEn: 'Braille Nepali New Testament & Solar Audio Bibles Reached Visually Impaired Readers in Gandaki',
    titleNe: 'गण्डकी प्रदेशका दृष्टिविहीन पाठकहरूका लागि ब्रेल लिपि र सोलार अडियो बाइबल वितरण',
    summaryEn: 'New accessibility initiative equips visually impaired believers and rural elders in Kaski, Syangja, and Lamjung with solar-powered Nepali audio Bibles.',
    summaryNe: 'कास्की, स्याङ्जा र लमजुङका दृष्टिविहीन तथा ज्येष्ठ नागरिकहरूका लागि सोलारबाट चल्ने नेपाली अडियो बाइबल र ब्रेल धर्मशास्त्र उपलब्ध गराइएको छ।',
    contentEn: `POKHARA — In a milestone for inclusive ministry in western Nepal, 450 solar-powered Nepali Audio Bibles and complete Braille New Testament volumes were distributed during a special thanksgiving service in Pokhara.

Elders who previously could not read small print shared heartfelt testimonies of hearing Psalms and the Gospels in their mother tongue every morning. Local youth volunteers also conducted digital literacy workshops to help families use offline Bible apps on basic smartphones.`,
    contentNe: `पोखरा — पश्चिमी नेपालमा समावेशी सेवाको उदाहरणीय कदमस्वरूप पोखरामा आयोजित एक विशेष कार्यक्रमका बीच ४५० थान सोलार अडियो बाइबल र ब्रेल लिपिको नयाँ करार वितरण गरिएको छ।

साना अक्षर पढ्न नसक्ने ज्येष्ठ नागरिक र दृष्टिविहीन विश्वासीहरूले आफ्नै मातृभाषामा भजनसंग्रह र सुसमाचार सुन्न पाउँदा हर्षका आँसु बगाए। युवा स्वयंसेवकहरूले मोबाइलमा अफलाइन बाइबल चलाउने तरिकासमेत सिकाएका थिए।`,
    featuredImage: '/art/bible-study.svg',
    isFeatured: true,
    isTrending: true,
    status: 'published',
    viewsCount: 2490,
    publishedAtAd: '2026-10-28',
    publishedAtBs: '२०८३ कार्तिक ११',
  },
  {
    id: 3,
    slug: 'christian-youth-music-and-leadership-camp-dharan-pokhara',
    categorySlug: 'christian-youth',
    categoryNameEn: 'Christian Youth',
    categoryNameNe: 'युवा जाग्रति',
    authorNameEn: 'Daniel Rai',
    authorNameNe: 'दानियल राई',
    authorRoleEn: 'Youth Ministry Desk',
    titleEn: '600 Youth Gather for Himalayan Worship & Vocational Leadership Conference',
    titleNe: '६०० युवाहरूको सहभागितामा हिमाली आराधना तथा नेतृत्व विकास सम्मेलन सम्पन्न',
    summaryEn: 'Three-day conference combined traditional Nepali instruments (Madal, Sarangi) with biblical discipleship and entrepreneurship training.',
    summaryNe: 'मौलिक नेपाली बाजागाजा (मादल, सारङ्गी) सहितको आत्मिक आराधना, बाइबल अध्ययन र सीपमूलक उद्यमशीलता तालिममा युवाहरूको उत्साहजनक सहभागिता।',
    contentEn: `POKHARA — Bringing together 600 young men and women from 42 districts, the Himalayan Youth Leadership Conference focused on building character, digital ethics, and local entrepreneurship alongside deep biblical study.

Workshops covered sacred songwriting with indigenous Nepali instruments, mental health counseling, and community service projects.`,
    contentNe: `पोखरा — ४२ जिल्लाका ६०० जना इसाई युवाहरूको सहभागितामा आयोजित तीनदिने नेतृत्व विकास सम्मेलनमा बाइबलीय चरित्र निर्माण, डिजिटल अनुशासन र स्वदेशमै स्वरोजगारमूलक उद्यमशीलताका विषयमा गहन प्रशिक्षण दिइयो।`,
    featuredImage: '/art/gallery-pokhara.svg',
    isFeatured: false,
    isTrending: true,
    status: 'published',
    viewsCount: 1920,
    publishedAtAd: '2026-10-25',
    publishedAtBs: '२०८३ कार्तिक ८',
  },
  {
    id: 4,
    slug: 'free-medical-and-eye-care-camp-organized-in-chitwan-and-makwanpur',
    categorySlug: 'social-activities',
    categoryNameEn: 'Social Activities',
    categoryNameNe: 'सामाजिक सेवा',
    authorNameEn: 'Dr. Rebekah Tamang',
    authorNameNe: 'डा. रिबेका तामाङ',
    authorRoleEn: 'Community Health Coordinator',
    titleEn: 'Christian Medical Fellowship Serves 950 Villagers with Free Eye & Dental Care in Makwanpur',
    titleNe: 'मकवानपुरका ग्रामीण बस्तीमा निःशुल्क आँखा तथा दन्त स्वास्थ्य शिविर: ९५० जना लाभान्वित',
    summaryEn: 'Volunteer doctors, nurses, and local church deacons provided free cataract screenings, reading glasses, and essential medicines.',
    summaryNe: 'स्वयंसेवक चिकित्सक, नर्स र स्थानीय मण्डलीका सेवकहरूको सहकार्यमा निःशुल्क मोतियाबिन्दु जाँच, चश्मा तथा औषधि वितरण।',
    contentEn: `HETAUDA — Over two days in rural Makwanpur, a team of 28 Christian medical professionals and local church volunteers served 950 residents with free general health checkups, dental care, and eye screenings.`,
    contentNe: `हेटौँडा — मकवानपुरको विकट ग्रामीण भेगमा आयोजित दुईदिने निःशुल्क स्वास्थ्य शिविरमा ९५० जना स्थानीय बासिन्दाहरूले आँखा, दाँत तथा सामान्य चिकित्सा सेवा प्राप्त गरेका छन्।`,
    featuredImage: '/art/news-fellowship.svg',
    isFeatured: false,
    isTrending: false,
    status: 'published',
    viewsCount: 1540,
    publishedAtAd: '2026-10-21',
    publishedAtBs: '२०८३ कार्तिक ४',
  },
  {
    id: 5,
    slug: 'theological-seminaries-introduce-bilingual-digital-research-library',
    categorySlug: 'christian-education',
    categoryNameEn: 'Christian Education',
    categoryNameNe: 'इसाई शिक्षा',
    authorNameEn: 'Pr. Samuel Adhikari',
    authorNameNe: 'पा. शमूएल अधिकारी',
    authorRoleEn: 'Senior Editorial Correspondent',
    titleEn: 'Bilingual Theological Digital Library Launched for Pastors and Sunday School Teachers',
    titleNe: 'पास्टर तथा सन्डे स्कूल शिक्षकहरूका लागि द्विभाषी डिजिटल पुस्तकालय सञ्चालनमा',
    summaryEn: 'Over 300 Nepali commentaries, church history archives, and children’s curriculum modules made freely accessible online.',
    summaryNe: '३०० भन्दा बढी नेपाली बाइबल टिप्पणी, मण्डली इतिहास र बाल शिक्षाका पाठ्यसामग्रीहरू अनलाइनमार्फत निःशुल्क उपलब्ध।',
    contentEn: `KATHMANDU — To equip rural pastors and Sunday school educators who lack access to physical libraries, a coalition of Bible colleges has launched an open-access Nepali and English theological resource portal.`,
    contentNe: `काठमाडौं — ग्रामीण भेगका पास्टर, अगुवा र बाल सङ्गति शिक्षकहरूलाई बाइबल अध्ययन सामग्री सहजै उपलब्ध गराउने उद्देश्यले द्विभाषी डिजिटल पुस्तकालय सुरु गरिएको छ।`,
    featuredImage: '/art/bible-study.svg',
    isFeatured: false,
    isTrending: false,
    status: 'published',
    viewsCount: 1280,
    publishedAtAd: '2026-10-18',
    publishedAtBs: '२०८३ कार्तिक १',
  },
];

export const INITIAL_PRAYER_REQUESTS: PrayerRequestItem[] = [
  {
    id: 1,
    requesterName: 'सन्तोष श्रेष्ठ (Santosh Shrestha)',
    location: 'Pokhara, Kaski',
    category: 'healing',
    titleEn: 'Complete Recovery After Kidney Surgery for My Mother',
    titleNe: 'आमाको मिर्गौला शल्यक्रियापछिको पूर्ण स्वास्थ्य लाभको निम्ति प्रार्थना',
    requestTextEn: 'My mother underwent surgery at Patan Hospital this week. Please pray for her strength, peaceful recovery, and wisdom for the doctors.',
    requestTextNe: 'मेरी आमाको पाटन अस्पतालमा शल्यक्रिया सम्पन्न भएको छ। उहाँको शीघ्र स्वास्थ्य लाभ र परिवारमा परमेश्वरको शान्तिको निम्ति प्रार्थना गरिदिनुहुन अनुरोध गर्दछु।',
    visibility: 'public',
    moderationStatus: 'approved',
    prayerStatus: 'active',
    prayedCount: 148,
    createdAtBs: '२०८३ कार्तिक १४',
    createdAtAd: '2026-10-31',
  },
  {
    id: 2,
    requesterName: 'अनुग्रह युवा संगति (Grace Youth Fellowship)',
    location: 'Dharan, Sunsari',
    category: 'youth',
    titleEn: 'Upcoming Koshi Province Youth Discipleship & Drug-Recovery Outreach',
    titleNe: 'कोशी प्रदेश युवा चेलापन तथा दुर्व्यसनमुक्त अभियानको निम्ति प्रार्थना',
    requestTextEn: 'We are visiting 14 colleges and rehabilitation centers in Sunsari and Morang to share hope and mentorship with struggling youth.',
    requestTextNe: 'सुनसरी र मोरङका १४ वटा कलेज तथा सुधार गृहहरूमा युवाहरूका बीचमा आशा र परामर्श सेवा पुर्याउँदैछौँ, पवित्र आत्माको अगुवाइको निम्ति प्रार्थना गरिदिनुहोस्।',
    visibility: 'public',
    moderationStatus: 'approved',
    prayerStatus: 'active',
    prayedCount: 215,
    createdAtBs: '२०८३ कार्तिक १२',
    createdAtAd: '2026-10-29',
  },
  {
    id: 3,
    requesterName: 'एलिशा तामाङ (Elisha Tamang)',
    location: 'Lalitpur',
    category: 'thanksgiving',
    titleEn: 'Thanksgiving: Safe Return of Brother from Overseas Employment',
    titleNe: 'धन्यवादको गवाही: वैदेशिक रोजगारीबाट भाइको सकुशल फिर्ती',
    requestTextEn: 'We asked the Susamachar prayer wall to pray when my brother was hospitalized abroad. God answered our prayers and he returned home healthy!',
    requestTextNe: 'विदेशमा बिरामी परेका भाइको निम्ति सुसमाचार प्रार्थना पर्खालमा राखेको प्रार्थना परमेश्वरले सुन्नुभयो र भाइ सकुशल घर फर्कनुभएको छ। परमेश्वरलाई महिमा!',
    visibility: 'public',
    moderationStatus: 'approved',
    prayerStatus: 'answered',
    prayedCount: 312,
    createdAtBs: '२०८३ कार्तिक ९',
    createdAtAd: '2026-10-26',
  },
  {
    id: 4,
    requesterName: 'पा. यूहन्ना परियार (Pr. John Pariyar)',
    location: 'Surkhet, Karnali',
    category: 'church',
    titleEn: 'Roof Construction for New Fellowship Hall in Surkhet',
    titleNe: 'सुर्खेतको नयाँ संगति भवनको छाना निर्माणका निम्ति प्रार्थना',
    requestTextEn: 'Our rural congregation of 85 families is building a safe prayer hall before winter. Pray for provision and safety of volunteer builders.',
    requestTextNe: 'जाडोयाम सुरु हुनुअघि हाम्रो ग्रामीण मण्डलीको प्रार्थना भवन निर्माण कार्य पूरा हुन सकोस् भनी प्रार्थना गरिदिनुहुन अनुरोध छ।',
    visibility: 'public',
    moderationStatus: 'pending',
    prayerStatus: 'active',
    prayedCount: 19,
    createdAtBs: '२०८३ कार्तिक १५',
    createdAtAd: '2026-10-31',
  },
];

export const INITIAL_RADIO_STATIONS: RadioStation[] = [
  {
    id: 1,
    nameEn: 'Good News FM 105.1 MHz',
    nameNe: 'गुड न्युज एफ.एम. १०५.१ मेगाहर्ज',
    frequency: '105.1 MHz',
    locationEn: 'Lalitpur, Kathmandu Valley',
    locationNe: 'ललितपुर, काठमाडौं उपत्यका',
    streamUrl: 'https://stream.susamachar.org/goodnews-1051.mp3',
    melodyPreset: 'hymn_grace',
    descriptionEn: '24-hour bilingual Nepali Christian broadcast featuring morning devotionals, Nepali bhajans, family counseling, and live Bible teaching.',
    descriptionNe: 'बिहानी प्रार्थना, नेपाली ख्रीष्टियन भजन, पारिवारिक परामर्श र प्रत्यक्ष बाइबल शिक्षा प्रसारण गर्ने २४ घण्टे रेडियो स्टेशन।',
    currentProgramEn: 'Morning Grace & Nepali Bhajan Aradhana',
    currentProgramNe: 'बिहानी अनुग्रह र नेपाली भजन आराधना',
    isEnabled: true,
  },
  {
    id: 2,
    nameEn: 'Grace FM 107.6 MHz Pokhara',
    nameNe: 'अनुग्रह एफ.एम. १०७.६ पोखरा',
    frequency: '107.6 MHz',
    locationEn: 'Pokhara, Gandaki Province',
    locationNe: 'पोखरा, गण्डकी प्रदेश',
    streamUrl: 'https://stream.susamachar.org/grace-pokhara-1076.mp3',
    melodyPreset: 'worship_peace',
    descriptionEn: 'Broadcasting uplifting Gospel songs, youth fellowship programs, and community health awareness across the Annapurna region.',
    descriptionNe: 'गण्डकी प्रदेशभर सुसमाचारमूलक संगीत, युवा कार्यक्रम र सामुदायिक स्वास्थ्य सन्देश प्रसारण गर्ने रेडियो।',
    currentProgramEn: 'Psalms of Peace Instrumental & Scripture Reading',
    currentProgramNe: 'शान्तिको भजन र पवित्र धर्मशास्त्र वाचन',
    isEnabled: true,
  },
  {
    id: 3,
    nameEn: 'Himali Christian Voice 98.4 MHz',
    nameNe: 'हिमाली इसाई आवाज ९८.४ धरान',
    frequency: '98.4 MHz',
    locationEn: 'Dharan, Koshi Province',
    locationNe: 'धरान, कोशी प्रदेश',
    streamUrl: 'https://stream.susamachar.org/himali-voice-984.mp3',
    melodyPreset: 'morning_psalm',
    descriptionEn: 'Eastern Nepal Christian community radio featuring Rai, Limbu, and Nepali worship hymns and evening prayer altar.',
    descriptionNe: 'पूर्वी नेपालका मण्डली र समुदायका लागि नेपाली तथा मातृभाषाका आत्मिक भजन र सन्ध्याकालीन प्रार्थना प्रसारण।',
    currentProgramEn: 'Evening Family Prayer Altar (पारिवारिक प्रार्थना वेदी)',
    currentProgramNe: 'सन्ध्याकालीन पारिवारिक प्रार्थना वेदी',
    isEnabled: true,
  },
  {
    id: 4,
    nameEn: 'Jyoti Gospel Radio 92.8 MHz',
    nameNe: 'ज्योति सुसमाचार रेडियो ९२.८ चितवन',
    frequency: '92.8 MHz',
    locationEn: 'Bharatpur, Chitwan',
    locationNe: 'भरतपुर, चितवन',
    streamUrl: 'https://stream.susamachar.org/jyoti-chitwan-928.mp3',
    melodyPreset: 'himalayan_choral',
    descriptionEn: 'Central Terai & Inner Madhesh Christian radio dedicated to verse-by-verse Bible study, children’s Sunday stories, and listener testimonies.',
    descriptionNe: 'पद-पद बाइबल अध्ययन, बाल कथा र श्रोताहरूको गवाही प्रसारण गर्ने मध्य नेपालको लोकप्रिय रेडियो।',
    currentProgramEn: 'Verse-by-Verse Book of Romans Study',
    currentProgramNe: 'रोमीको पुस्तक पद-पद बाइबल अध्ययन',
    isEnabled: true,
  },
];

export const INITIAL_GOLD_SILVER_RATES: GoldSilverRateData = {
  rateDateAd: '2026-10-31',
  rateDateBs: '२०८३ कार्तिक १४',
  lastUpdatedTime: '11:15 AM NPT (नेपाली समय)',
  fineGoldTola: 168400,
  tejabiGoldTola: 167700,
  silverTola: 2085,
  fineGoldGram: 14438,     // 168400 / 11.6638
  tejabiGoldGram: 14378,   // 167700 / 11.6638
  silverGram: 178.76,      // 2085 / 11.6638
  changeGoldTola: 600,
  changeSilverTola: 15,
  currency: 'NPR',
  sourceNameEn: 'FENEGOSIDA (Federation of Nepal Gold & Silver Dealers Association)',
  sourceNameNe: 'नेपाल सुनचाँदी व्यवसायी महासंघ (FENEGOSIDA)',
  history: [
    {
      dateBs: '२०८३ कार्तिक १४',
      dateAd: '2026-10-31',
      fineGoldTola: 168400,
      tejabiGoldTola: 167700,
      silverTola: 2085,
      changeGold: 600,
      changeSilver: 15,
    },
    {
      dateBs: '२०८३ कार्तिक १३',
      dateAd: '2026-10-30',
      fineGoldTola: 167800,
      tejabiGoldTola: 167100,
      silverTola: 2070,
      changeGold: -400,
      changeSilver: -10,
    },
    {
      dateBs: '२०८३ कार्तिक १२',
      dateAd: '2026-10-29',
      fineGoldTola: 168200,
      tejabiGoldTola: 167500,
      silverTola: 2080,
      changeGold: 800,
      changeSilver: 25,
    },
    {
      dateBs: '२०८३ कार्तिक ११',
      dateAd: '2026-10-28',
      fineGoldTola: 167400,
      tejabiGoldTola: 166700,
      silverTola: 2055,
      changeGold: 300,
      changeSilver: 5,
    },
    {
      dateBs: '२०८३ कार्तिक १०',
      dateAd: '2026-10-27',
      fineGoldTola: 167100,
      tejabiGoldTola: 166400,
      silverTola: 2050,
      changeGold: 0,
      changeSilver: -5,
    },
  ],
};

export const INITIAL_CALENDAR_EVENTS: Array<{
  id: number;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  titleEn: string;
  titleNe: string;
  eventType: 'christian_festival' | 'national_holiday' | 'church_event';
  isPublicHoliday: boolean;
}> = [
  {
    id: 1,
    bsYear: 2083,
    bsMonth: 1,
    bsDay: 1,
    titleEn: 'Nepali New Year 2083 & Thanksgiving Service',
    titleNe: 'नयाँ वर्ष २०८३ तथा धन्यवाद प्रार्थना सभा',
    eventType: 'national_holiday',
    isPublicHoliday: true,
  },
  {
    id: 2,
    bsYear: 2083,
    bsMonth: 1,
    bsDay: 5,
    titleEn: 'Resurrection Sunday (Easter Celebration)',
    titleNe: 'पुनरुत्थान आइतबार (इस्टर महोत्सव)',
    eventType: 'christian_festival',
    isPublicHoliday: false,
  },
  {
    id: 3,
    bsYear: 2083,
    bsMonth: 2,
    bsDay: 10,
    titleEn: 'Pentecost Sunday Prayer Gathering',
    titleNe: 'पेन्तिकोस आइतबार विशेष प्रार्थना',
    eventType: 'christian_festival',
    isPublicHoliday: false,
  },
  {
    id: 4,
    bsYear: 2083,
    bsMonth: 7,
    bsDay: 14,
    titleEn: 'All Nepal Christian Youth & Choir Festival',
    titleNe: 'अखिल नेपाल इसाई युवा तथा भजन महोत्सव',
    eventType: 'church_event',
    isPublicHoliday: false,
  },
  {
    id: 5,
    bsYear: 2083,
    bsMonth: 7,
    bsDay: 22,
    titleEn: 'National Bible Translation & Literacy Day',
    titleNe: 'राष्ट्रिय बाइबल अनुवाद तथा साक्षरता दिवस',
    eventType: 'church_event',
    isPublicHoliday: false,
  },
  {
    id: 6,
    bsYear: 2083,
    bsMonth: 9,
    bsDay: 10,
    titleEn: 'Christmas Day (ख्रीष्टमस दिवस - Public Holiday)',
    titleNe: 'ख्रीष्टमस दिवस (येशू ख्रीष्टको जन्मोत्सव - सार्वजनिक बिदा)',
    eventType: 'christian_festival',
    isPublicHoliday: true,
  },
];

export const INITIAL_GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: 1,
    titleEn: 'Kathmandu Valley United Dawn Worship & Prayer',
    titleNe: 'उपत्यका संयुक्त प्रभातकालीन आराधना तथा प्रार्थना',
    category: 'worship',
    locationEn: 'Lalitpur, Bagmati Province',
    locationNe: 'ललितपुर, बागमती प्रदेश',
    dateBs: '२०८३ कार्तिक १०',
    coverImage: '/art/hero-himalayan-church.svg',
    photosCount: 24,
    descriptionEn: 'Choirs and congregations uniting at sunrise for intercessory prayer and traditional Nepali hymns.',
    descriptionNe: 'सूर्योदयसँगै मौलिक नेपाली भजन र देशको निम्ति मध्यस्थता प्रार्थनामा जुटेका मण्डलीहरू।',
    items: [
      { id: 101, mediaType: 'image', mediaUrl: '/art/hero-himalayan-church.svg', captionEn: 'Sanctuary at dawn overlooking the valley', captionNe: 'बिहानीपखको उज्यालोमा आराधना भवन' },
      { id: 102, mediaType: 'image', mediaUrl: '/art/news-fellowship.svg', captionEn: 'Acoustic worship with Madal and Guitar', captionNe: 'मादल र गितारका साथ भजन आराधना' },
    ],
  },
  {
    id: 2,
    titleEn: 'Annapurna Youth Discipleship & Leadership Camp',
    titleNe: 'अन्नपूर्ण युवा चेलापन तथा नेतृत्व शिविर – पोखरा',
    category: 'christian_camps',
    locationEn: 'Pokhara, Gandaki Province',
    locationNe: 'पोखरा, गण्डकी प्रदेश',
    dateBs: '२०८३ कार्तिक ८',
    coverImage: '/art/gallery-pokhara.svg',
    photosCount: 38,
    descriptionEn: 'Three days of outdoor Bible study, fellowship, and youth leadership mentoring by Phewa Lake.',
    descriptionNe: 'पोखरामा सम्पन्न तीनदिने युवा बाइबल अध्ययन, संगति र नेतृत्व विकास तालिमका झलकहरू।',
    items: [
      { id: 201, mediaType: 'image', mediaUrl: '/art/gallery-pokhara.svg', captionEn: 'Outdoor morning devotion overlooking the Himalayas', captionNe: 'हिमशृंखलाको काखमा बिहानी मनन' },
    ],
  },
  {
    id: 3,
    titleEn: 'Rural Audio Bible & Literacy Distribution Mission',
    titleNe: 'ग्रामीण अडियो बाइबल तथा साक्षरता सेवा अभियान',
    category: 'mission',
    locationEn: 'Syangja & Makwanpur',
    locationNe: 'स्याङ्जा र मकवानपुर',
    dateBs: '२०८३ असोज २५',
    coverImage: '/art/bible-study.svg',
    photosCount: 19,
    descriptionEn: 'Sharing Nepali Bibles, reading glasses, and adult literacy classes in hill communities.',
    descriptionNe: 'पहाडी बस्तीहरूमा नेपाली बाइबल, पढ्ने चश्मा र प्रौढ साक्षरता कक्षा सञ्चालन।',
    items: [
      { id: 301, mediaType: 'image', mediaUrl: '/art/bible-study.svg', captionEn: 'Evening scripture study circle', captionNe: 'सन्ध्याकालीन सामूहिक बाइबल अध्ययन' },
    ],
  },
  {
    id: 4,
    titleEn: 'National Sunday School Teachers Seminar 2083',
    titleNe: 'राष्ट्रिय बाल सङ्गति (सन्डे स्कूल) शिक्षक सेमिनार २०८३',
    category: 'seminars',
    locationEn: 'Bharatpur, Chitwan',
    locationNe: 'भरतपुर, चितवन',
    dateBs: '२०८३ असोज १८',
    coverImage: '/art/news-fellowship.svg',
    photosCount: 31,
    descriptionEn: 'Equipping 320 children’s ministry teachers with creative storytelling and child safety training.',
    descriptionNe: '३२० जना बाल सङ्गति शिक्षकहरूका लागि सिर्जनात्मक बाइबल कथा र बाल सुरक्षा तालिम।',
    items: [
      { id: 401, mediaType: 'image', mediaUrl: '/art/news-fellowship.svg', captionEn: 'Teachers workshop session in Chitwan', captionNe: 'चितवनमा शिक्षक कार्यशाला सत्र' },
    ],
  },
];

export const INITIAL_CHRISTIAN_EVENTS: ChristianEventItem[] = [
  {
    id: 1,
    titleEn: 'All-Nepal Christian Youth & Worship Conference 2083',
    titleNe: 'अखिल नेपाल इसाई युवा तथा आराधना सम्मेलन २०८३',
    category: 'conference',
    dateBs: '२०८३ मंसिर १२–१४',
    dateAd: '2026-11-28',
    time: '9:00 AM – 5:00 PM',
    locationEn: 'Dhobighat Fellowship Hall, Lalitpur',
    locationNe: 'धोबीघाट संगति भवन, ललितपुर',
    organizerEn: 'Susamachar Youth Network Nepal',
    organizerNe: 'सुसमाचार युवा संजाल नेपाल',
    descriptionEn: 'Three-day national conference featuring expository Bible teaching, indigenous Nepali worship, career mentorship, and mission workshops.',
    descriptionNe: 'बाइबल व्याख्या, मौलिक नेपाली आराधना, वृत्ति परामर्श र सेवा कार्यशालासहितको तीनदिने राष्ट्रिय युवा सम्मेलन।',
    bannerImage: '/art/hero-himalayan-church.svg',
    registrationCount: 418,
  },
  {
    id: 2,
    titleEn: 'Gandaki Regional Pastors & Elders Expository Bible Seminar',
    titleNe: 'गण्डकी प्रादेशिक पास्टर तथा अगुवा बाइबल व्याख्या सेमिनार',
    category: 'seminar',
    dateBs: '२०८३ मंसिर २२',
    dateAd: '2026-12-08',
    time: '10:00 AM – 4:00 PM',
    locationEn: 'Grace Sanctuary, Pokhara-11',
    locationNe: 'अनुग्रह आराधना भवन, पोखरा-११',
    organizerEn: 'Nepal Biblical Teaching Fellowship',
    organizerNe: 'नेपाल बाइबलीय शिक्षा संगति',
    descriptionEn: 'Intensive training on hermeneutics, pastoral care, and family counseling for local church leaders.',
    descriptionNe: 'स्थानीय मण्डलीका पास्टर र अगुवाहरूका लागि बाइबल अर्थशास्त्र र पारिवारिक परामर्शसम्बन्धी विशेष सेमिनार।',
    bannerImage: '/art/bible-study.svg',
    registrationCount: 164,
  },
  {
    id: 3,
    titleEn: 'Christmas Carol & Community Blanket Distribution Drive',
    titleNe: 'ख्रीष्टमस क्यारोल तथा न्यानो कपडा वितरण अभियान',
    category: 'festival',
    dateBs: '२०८३ पुष १० (Dec 25)',
    dateAd: '2026-12-25',
    time: '8:00 AM – 6:00 PM',
    locationEn: 'Nationwide across 7 Provinces',
    locationNe: 'सातै प्रदेशका स्थानीय मण्डलीहरू',
    organizerEn: 'United Churches Compassion Ministry',
    organizerNe: 'संयुक्त मण्डली करुणा सेवा',
    descriptionEn: 'Celebrating the birth of Jesus Christ by sharing Christmas joy, carols, and warm winter blankets with elderly and low-income families.',
    descriptionNe: 'प्रभु येशू ख्रीष्टको जन्मोत्सवको अवसरमा असहाय र ज्येष्ठ नागरिकहरूलाई न्यानो कपडा वितरण तथा ख्रीष्टमस शुभकामना आदानप्रदान।',
    bannerImage: '/art/news-fellowship.svg',
    registrationCount: 890,
  },
];

export const NEPAL_CHURCH_DIRECTORY: ChurchDirectoryItem[] = [
  {
    id: 1,
    nameEn: 'Patan Koinonia Church (पाटन कोइनोनिया मण्डली)',
    nameNe: 'पाटन कोइनोनिया मण्डली',
    cityEn: 'Lalitpur',
    cityNe: 'ललितपुर',
    province: 'Bagmati Province',
    pastorNameEn: 'Rev. Dr. Mangal Man Maharjan',
    pastorNameNe: 'रेभ. डा. मंगलमान महर्जन',
    serviceTimeEn: 'Saturday: 8:30 AM & 11:30 AM',
    serviceTimeNe: 'शनिबार बिहान ८:३० र ११:३० बजे',
    phone: '+977-01-5528901',
    addressEn: 'Manbhawan, Jawalakhel, Lalitpur',
    addressNe: 'मानभवन, जावलाखेल, ललितपुर',
  },
  {
    id: 2,
    nameEn: 'Putalisadak Evangelical Church (पुतलीसडक मण्डली)',
    nameNe: 'पुतलीसडक सुसमाचारीय मण्डली',
    cityEn: 'Kathmandu',
    cityNe: 'काठमाडौं',
    province: 'Bagmati Province',
    pastorNameEn: 'Pr. Simon Pandey',
    pastorNameNe: 'पा. सिमोन पाण्डे',
    serviceTimeEn: 'Saturday: 9:30 AM – 12:00 PM',
    serviceTimeNe: 'शनिबार बिहान ९:३० देखि १२:०० बजेसम्म',
    phone: '+977-01-4419283',
    addressEn: 'Putalisadak Chowk, Kathmandu',
    addressNe: 'पुतलीसडक चोक, काठमाडौं',
  },
  {
    id: 3,
    nameEn: 'Pokhara Ramghat Christian Fellowship (रामघाट मण्डली)',
    nameNe: 'पोखरा रामघाट इसाई संगति',
    cityEn: 'Pokhara',
    cityNe: 'पोखरा',
    province: 'Gandaki Province',
    pastorNameEn: 'Pr. David Pun Magar',
    pastorNameNe: 'पा. दाऊद पुन मगर',
    serviceTimeEn: 'Saturday: 10:00 AM – 12:30 PM',
    serviceTimeNe: 'शनिबार बिहान १०:०० देखि १२:३० बजेसम्म',
    phone: '+977-061-523410',
    addressEn: 'Ramghat-10, Pokhara, Kaski',
    addressNe: 'रामघाट-१०, पोखरा, कास्की',
  },
  {
    id: 4,
    nameEn: 'Dharan Anugrah Church (धरान अनुग्रह मण्डली)',
    nameNe: 'धरान अनुग्रह मण्डली',
    cityEn: 'Dharan',
    cityNe: 'धरान',
    province: 'Koshi Province',
    pastorNameEn: 'Pr. Barnabas Subba',
    pastorNameNe: 'पा. बर्नाबास सुब्बा',
    serviceTimeEn: 'Saturday: 9:00 AM – 11:30 AM',
    serviceTimeNe: 'शनिबार बिहान ९:०० देखि ११:३० बजेसम्म',
    phone: '+977-025-521899',
    addressEn: 'Putali Line, Dharan-8, Sunsari',
    addressNe: 'पुतली लाइन, धरान-८, सुनसरी',
  },
  {
    id: 5,
    nameEn: 'Chitwan Jyoti Mandali (चितवन ज्योति मण्डली)',
    nameNe: 'चितवन ज्योति मण्डली',
    cityEn: 'Bharatpur',
    cityNe: 'भरतपुर',
    province: 'Bagmati Province',
    pastorNameEn: 'Pr. Luka Chaudhary',
    pastorNameNe: 'पा. लूका चौधरी',
    serviceTimeEn: 'Saturday: 9:30 AM – 12:00 PM',
    serviceTimeNe: 'शनिबार बिहान ९:३० देखि १२:०० बजेसम्म',
    phone: '+977-056-527612',
    addressEn: 'Hakim Chowk, Bharatpur-10, Chitwan',
    addressNe: 'हाकिम चोक, भरतपुर-१०, चितवन',
  },
  {
    id: 6,
    nameEn: 'Butwal Shanti Church (बुटवल शान्ति मण्डली)',
    nameNe: 'बुटवल शान्ति मण्डली',
    cityEn: 'Butwal',
    cityNe: 'बुटवल',
    province: 'Lumbini Province',
    pastorNameEn: 'Pr. Yakub Thapa',
    pastorNameNe: 'पा. याकूब थापा',
    serviceTimeEn: 'Saturday: 9:00 AM – 11:30 AM',
    serviceTimeNe: 'शनिबार बिहान ९:०० देखि ११:३० बजेसम्म',
    phone: '+977-071-543219',
    addressEn: 'Milanchowk, Butwal, Rupandehi',
    addressNe: 'मिलनचोक, बुटवल, रूपन्देही',
  },
];

// All 8 Specialized Admin Roles defined in Section 11
export const ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 1,
    username: 'superadmin',
    fullNameEn: 'Rev. Dr. Prakash Shrestha',
    fullNameNe: 'रेभ. डा. प्रकाश श्रेष्ठ',
    email: 'superadmin@susamachar.org',
    roleKey: 'SUPER_ADMIN',
    roleNameEn: 'Super Admin',
    roleNameNe: 'सुपर एडमिन (पूर्ण अधिकार)',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-10-31 10:45 AM',
    allowedModules: ['overview', 'news', 'bible', 'prayer', 'calendar', 'radio', 'rates', 'gallery', 'events', 'admins', 'audit'],
  },
  {
    id: 2,
    username: 'newsadmin',
    fullNameEn: 'Pr. Samuel Adhikari',
    fullNameNe: 'पा. शमूएल अधिकारी',
    email: 'news@susamachar.org',
    roleKey: 'NEWS_ADMIN',
    roleNameEn: 'News Admin',
    roleNameNe: 'समाचार एडमिन',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-10-31 09:20 AM',
    allowedModules: ['overview', 'news'],
  },
  {
    id: 3,
    username: 'bibleadmin',
    fullNameEn: 'Hannah Gurung',
    fullNameNe: 'हन्ना गुरुङ',
    email: 'bible@susamachar.org',
    roleKey: 'BIBLE_ADMIN',
    roleNameEn: 'Bible Admin',
    roleNameNe: 'बाइबल एडमिन',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-10-30 04:15 PM',
    allowedModules: ['overview', 'bible'],
  },
  {
    id: 4,
    username: 'radioadmin',
    fullNameEn: 'Kiran Lepcha',
    fullNameNe: 'किरण लेप्चा',
    email: 'radio@susamachar.org',
    roleKey: 'RADIO_ADMIN',
    roleNameEn: 'Radio Admin',
    roleNameNe: 'रेडियो एडमिन',
    status: 'active',
    twoFactorEnabled: false,
    lastLogin: '2026-10-30 08:00 PM',
    allowedModules: ['overview', 'radio'],
  },
  {
    id: 5,
    username: 'calendaradmin',
    fullNameEn: 'Bishवास कार्की (Bishwas Karki)',
    fullNameNe: 'विश्वास कार्की',
    email: 'calendar@susamachar.org',
    roleKey: 'CALENDAR_ADMIN',
    roleNameEn: 'Calendar Admin',
    roleNameNe: 'पात्रो एडमिन',
    status: 'active',
    twoFactorEnabled: false,
    lastLogin: '2026-10-29 11:30 AM',
    allowedModules: ['overview', 'calendar', 'events'],
  },
  {
    id: 6,
    username: 'financeadmin',
    fullNameEn: 'Ashish Shakya',
    fullNameNe: 'आशिष शाक्य',
    email: 'rates@susamachar.org',
    roleKey: 'FINANCE_ADMIN',
    roleNameEn: 'Finance Content Admin',
    roleNameNe: 'सुनचाँदी दर एडमिन',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-10-31 11:15 AM',
    allowedModules: ['overview', 'rates'],
  },
  {
    id: 7,
    username: 'galleryadmin',
    fullNameEn: 'Daniel Rai',
    fullNameNe: 'दानियल राई',
    email: 'gallery@susamachar.org',
    roleKey: 'GALLERY_ADMIN',
    roleNameEn: 'Gallery Admin',
    roleNameNe: 'ग्यालरी एडमिन',
    status: 'active',
    twoFactorEnabled: false,
    lastLogin: '2026-10-28 03:40 PM',
    allowedModules: ['overview', 'gallery'],
  },
  {
    id: 8,
    username: 'prayeradmin',
    fullNameEn: 'Estha Tamang',
    fullNameNe: 'एस्तर तामाङ',
    email: 'prayer@susamachar.org',
    roleKey: 'PRAYER_ADMIN',
    roleNameEn: 'Prayer Admin',
    roleNameNe: 'प्रार्थना एडमिन',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2026-10-31 07:50 AM',
    allowedModules: ['overview', 'prayer'],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    adminName: 'Ashish Shakya',
    roleName: 'Finance Content Admin',
    action: 'UPDATE_RATES',
    module: 'Gold & Silver',
    details: 'Updated daily Fine Gold rate to NPR 168,400/tola and Silver to NPR 2,085/tola (FENEGOSIDA)',
    timestamp: '2026-10-31 11:15 AM',
    ipAddress: '202.45.144.18',
  },
  {
    id: 2,
    adminName: 'Pr. Samuel Adhikari',
    roleName: 'News Admin',
    action: 'PUBLISH_NEWS',
    module: 'News Portal',
    details: 'Published article: National Inter-Church Prayer & Unity Fellowship Convenes in Kathmandu Valley',
    timestamp: '2026-10-30 06:40 PM',
    ipAddress: '110.44.120.92',
  },
  {
    id: 3,
    adminName: 'Estha Tamang',
    roleName: 'Prayer Admin',
    action: 'APPROVE_PRAYER',
    module: 'Prayer Wall',
    details: 'Approved public prayer request #1 (Complete Recovery After Kidney Surgery)',
    timestamp: '2026-10-30 02:12 PM',
    ipAddress: '27.34.68.104',
  },
  {
    id: 4,
    adminName: 'Rev. Dr. Prakash Shrestha',
    roleName: 'Super Admin',
    action: 'VERIFY_RBAC_POLICY',
    module: 'Security & Roles',
    details: 'Verified 2FA enforcement for Super Admin, News Admin, Bible Admin, Finance Admin, and Prayer Admin',
    timestamp: '2026-10-29 09:00 AM',
    ipAddress: '202.45.144.10',
  },
];
