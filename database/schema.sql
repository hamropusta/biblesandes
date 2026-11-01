-- =============================================================================
-- SUSAMACHAR CHRISTIAN APP (सुसमाचार – इसाई संजाल)
-- Complete MySQL 8.0+ Database Schema, Foreign Keys, Indexes & Seed Data
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `preferred_language` ENUM('ne', 'en') NOT NULL DEFAULT 'ne',
  `church_name` VARCHAR(160) DEFAULT NULL,
  `district` VARCHAR(80) DEFAULT NULL,
  `notification_preferences` JSON DEFAULT NULL,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ADMINS TABLE
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `account_status` ENUM('active', 'locked', 'disabled') NOT NULL DEFAULT 'active',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ROLES TABLE (8 Specialized Multi-Admin Roles)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_key` VARCHAR(60) NOT NULL UNIQUE,
  `role_name_en` VARCHAR(100) NOT NULL,
  `role_name_ne` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perm_key` VARCHAR(80) NOT NULL UNIQUE,
  `module` VARCHAR(60) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ADMIN_ROLES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `admin_id` INT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`admin_id`, `role_id`),
  CONSTRAINT `fk_ar_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ar_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. NEWS CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ne` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. NEWS AUTHORS TABLE
CREATE TABLE IF NOT EXISTS `news_authors` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_en` VARCHAR(120) NOT NULL,
  `name_ne` VARCHAR(120) NOT NULL,
  `title_en` VARCHAR(120) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. NEWS TABLE
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(180) NOT NULL UNIQUE,
  `category_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `title_ne` VARCHAR(255) NOT NULL,
  `summary_en` TEXT NOT NULL,
  `summary_ne` TEXT NOT NULL,
  `content_en` LONGTEXT NOT NULL,
  `content_ne` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(255) DEFAULT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_trending` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published', 'scheduled') NOT NULL DEFAULT 'published',
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_news_slug` (`slug`),
  INDEX `idx_news_category` (`category_id`),
  INDEX `idx_news_status_pub` (`status`, `published_at`),
  CONSTRAINT `fk_news_cat` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`author_id`) REFERENCES `news_authors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BIBLE TRANSLATIONS TABLE
CREATE TABLE IF NOT EXISTS `bible_translations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name_en` VARCHAR(120) NOT NULL,
  `name_ne` VARCHAR(120) NOT NULL,
  `language` ENUM('ne', 'en') NOT NULL,
  `license_info` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BIBLE BOOKS TABLE
CREATE TABLE IF NOT EXISTS `bible_books` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `book_number` TINYINT UNSIGNED NOT NULL UNIQUE,
  `testament` ENUM('OT', 'NT') NOT NULL,
  `name_en` VARCHAR(80) NOT NULL,
  `name_ne` VARCHAR(80) NOT NULL,
  `chapters_count` SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_bible_books_testament` (`testament`, `book_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BIBLE VERSES TABLE
CREATE TABLE IF NOT EXISTS `bible_verses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `book_id` INT UNSIGNED NOT NULL,
  `chapter` SMALLINT UNSIGNED NOT NULL,
  `verse` SMALLINT UNSIGNED NOT NULL,
  `text_ne` TEXT NOT NULL,
  `text_en` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_book_chap_verse` (`book_id`, `chapter`, `verse`),
  FULLTEXT KEY `ft_bible_text` (`text_ne`, `text_en`),
  CONSTRAINT `fk_bv_book` FOREIGN KEY (`book_id`) REFERENCES `bible_books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BIBLE BOOKMARKS & HIGHLIGHTS TABLE
CREATE TABLE IF NOT EXISTS `bible_bookmarks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `verse_id` INT UNSIGNED NOT NULL,
  `highlight_color` VARCHAR(24) DEFAULT 'gold',
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bb_verse` FOREIGN KEY (`verse_id`) REFERENCES `bible_verses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PRAYER REQUESTS TABLE
CREATE TABLE IF NOT EXISTS `prayer_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `requester_name` VARCHAR(120) NOT NULL,
  `category` ENUM('healing', 'family', 'church', 'nation', 'youth', 'thanksgiving') NOT NULL DEFAULT 'healing',
  `title` VARCHAR(180) NOT NULL,
  `request_text` TEXT NOT NULL,
  `visibility` ENUM('public', 'private') NOT NULL DEFAULT 'public',
  `moderation_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `prayer_status` ENUM('active', 'answered') NOT NULL DEFAULT 'active',
  `prayed_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_prayer_mod_vis` (`moderation_status`, `visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bs_year` SMALLINT UNSIGNED NOT NULL,
  `bs_month` TINYINT UNSIGNED NOT NULL,
  `bs_day` TINYINT UNSIGNED NOT NULL,
  `ad_date` DATE NOT NULL,
  `title_en` VARCHAR(160) NOT NULL,
  `title_ne` VARCHAR(160) NOT NULL,
  `event_type` ENUM('christian_festival', 'national_holiday', 'church_event') NOT NULL,
  `is_public_holiday` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_cal_bs` (`bs_year`, `bs_month`, `bs_day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. CALENDAR HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS `calendar_holidays` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bs_month` TINYINT UNSIGNED NOT NULL,
  `bs_day` TINYINT UNSIGNED NOT NULL,
  `name_en` VARCHAR(160) NOT NULL,
  `name_ne` VARCHAR(160) NOT NULL,
  `category` VARCHAR(60) NOT NULL DEFAULT 'public',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. RADIO STATIONS TABLE
CREATE TABLE IF NOT EXISTS `radio_stations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_en` VARCHAR(140) NOT NULL,
  `name_ne` VARCHAR(140) NOT NULL,
  `frequency` VARCHAR(30) NOT NULL,
  `location_en` VARCHAR(120) NOT NULL,
  `location_ne` VARCHAR(120) NOT NULL,
  `stream_url` VARCHAR(255) NOT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `description_en` TEXT NOT NULL,
  `description_ne` TEXT NOT NULL,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. GOLD AND SILVER RATES TABLE
CREATE TABLE IF NOT EXISTS `gold_silver_rates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rate_date_ad` DATE NOT NULL,
  `rate_date_bs` VARCHAR(30) NOT NULL,
  `fine_gold_tola` DECIMAL(12,2) NOT NULL,
  `tejabi_gold_tola` DECIMAL(12,2) NOT NULL,
  `silver_tola` DECIMAL(12,2) NOT NULL,
  `fine_gold_10g` DECIMAL(12,2) NOT NULL,
  `tejabi_gold_10g` DECIMAL(12,2) NOT NULL,
  `silver_10g` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'NPR',
  `source_name` VARCHAR(160) NOT NULL DEFAULT 'FENEGOSIDA (Federation of Nepal Gold & Silver Dealers Association)',
  `updated_by_admin_id` INT UNSIGNED DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rate_date` (`rate_date_ad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. GOLD AND SILVER HISTORY TABLE
CREATE TABLE IF NOT EXISTS `gold_silver_history` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rate_date_ad` DATE NOT NULL,
  `rate_date_bs` VARCHAR(30) NOT NULL,
  `fine_gold_tola` DECIMAL(12,2) NOT NULL,
  `silver_tola` DECIMAL(12,2) NOT NULL,
  `change_gold_npr` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `change_silver_npr` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `source_name` VARCHAR(160) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. GALLERY ALBUMS TABLE
CREATE TABLE IF NOT EXISTS `gallery_albums` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_en` VARCHAR(180) NOT NULL,
  `title_ne` VARCHAR(180) NOT NULL,
  `category` ENUM('church_events', 'worship', 'youth_programs', 'christian_camps', 'mission', 'seminars') NOT NULL,
  `cover_image` VARCHAR(255) NOT NULL,
  `description_en` TEXT NOT NULL,
  `description_ne` TEXT NOT NULL,
  `location` VARCHAR(120) NOT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `album_id` INT UNSIGNED NOT NULL,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `media_url` VARCHAR(255) NOT NULL,
  `caption_en` VARCHAR(255) NOT NULL,
  `caption_ne` VARCHAR(255) NOT NULL,
  `allow_download` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gi_album` FOREIGN KEY (`album_id`) REFERENCES `gallery_albums` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. CHRISTIAN EVENTS TABLE
CREATE TABLE IF NOT EXISTS `christian_events` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_en` VARCHAR(180) NOT NULL,
  `title_ne` VARCHAR(180) NOT NULL,
  `category` ENUM('conference', 'worship', 'youth', 'seminar', 'prayer_meeting', 'festival', 'bible_study') NOT NULL,
  `event_date_ad` DATE NOT NULL,
  `event_date_bs` VARCHAR(40) NOT NULL,
  `event_time` VARCHAR(60) NOT NULL,
  `location_en` VARCHAR(180) NOT NULL,
  `location_ne` VARCHAR(180) NOT NULL,
  `organizer_en` VARCHAR(160) NOT NULL,
  `organizer_ne` VARCHAR(160) NOT NULL,
  `description_en` TEXT NOT NULL,
  `description_ne` TEXT NOT NULL,
  `banner_image` VARCHAR(255) DEFAULT NULL,
  `registration_link` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` ENUM('daily_verse', 'prayer_reminder', 'news', 'events', 'radio', 'festival') NOT NULL,
  `title_en` VARCHAR(180) NOT NULL,
  `title_ne` VARCHAR(180) NOT NULL,
  `body_en` TEXT NOT NULL,
  `body_ne` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. APP SETTINGS & AUDIT LOGS TABLES
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` INT UNSIGNED DEFAULT NULL,
  `admin_name` VARCHAR(120) NOT NULL,
  `role_name` VARCHAR(80) NOT NULL,
  `action` VARCHAR(120) NOT NULL,
  `target_module` VARCHAR(60) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA FOR ROLES & INITIAL CONFIGURATION
-- =============================================================================
INSERT IGNORE INTO `roles` (`id`, `role_key`, `role_name_en`, `role_name_ne`, `description`) VALUES
(1, 'SUPER_ADMIN', 'Super Admin', 'सुपर एडमिन', 'Full system access, role assignment, settings, and audit logs'),
(2, 'NEWS_ADMIN', 'News Admin', 'समाचार एडमिन', 'Manage news articles, categories, authors, and comments'),
(3, 'BIBLE_ADMIN', 'Bible Admin', 'बाइबल एडमिन', 'Manage Bible translations, study articles, and daily verses'),
(4, 'RADIO_ADMIN', 'Radio Admin', 'रेडियो एडमिन', 'Manage Christian FM stations, streaming URLs, and logos'),
(5, 'CALENDAR_ADMIN', 'Calendar Admin', 'पात्रो एडमिन', 'Manage BS/AD calendar events, festivals, and public holidays'),
(6, 'FINANCE_ADMIN', 'Finance Content Admin', 'सुनचाँदी दर एडमिन', 'Manage daily gold & silver prices, sources, and history'),
(7, 'GALLERY_ADMIN', 'Gallery Admin', 'ग्यालरी एडमिन', 'Manage Christian photo albums, images, and videos'),
(8, 'PRAYER_ADMIN', 'Prayer Admin', 'प्रार्थना एडमिन', 'Moderate public prayer requests and manage prayer wall');

SET FOREIGN_KEY_CHECKS = 1;
