import mysql from 'mysql2/promise';
import { DEFAULT_REGULAR_HOURS, STORE_TIME_ZONE, storeDate, validateRegular, validateException } from './hours.js';

let pool;
let initialization;
let nextRetry = 0;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
    // mysql2 reads the managed DSN's ssl option; certificate validation remains enabled.
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

export async function ensureDatabase() {
  if (!initialization && Date.now() >= nextRetry) {
    initialization = (async () => {
      const db = getPool();
      await db.query(`CREATE TABLE IF NOT EXISTS pawn_hours_settings (
        id TINYINT PRIMARY KEY, regular_json JSON NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS pawn_hours_exceptions (
        date_key CHAR(10) PRIMARY KEY, label VARCHAR(120) NOT NULL,
        status VARCHAR(16) NOT NULL, opens CHAR(5) NULL, closes CHAR(5) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS pawn_hours_oauth_nonces (
        nonce_hash CHAR(64) PRIMARY KEY, redirect_uri VARCHAR(2048) NOT NULL,
        expires_at BIGINT NOT NULL
      )`);
      // Operators explicitly provision each origin; requests must never add entries.
      await db.query(`CREATE TABLE IF NOT EXISTS pawn_hours_trusted_origins (
        origin VARCHAR(512) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS pawn_hours_revoked_sessions (
        token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
        expires_at BIGINT NOT NULL,
        INDEX pawn_hours_revoked_expiry (expires_at)
      )`);
      // This insert is intentionally a no-op if settings already exist.
      await db.execute('INSERT IGNORE INTO pawn_hours_settings (id, regular_json) VALUES (1, ?)', [JSON.stringify(DEFAULT_REGULAR_HOURS)]);
      return db;
    })().catch((error) => {
      console.error('Hours database initialization failed:', error.message);
      initialization = undefined;
      nextRetry = Date.now() + 5000;
      throw error;
    });
  }
  if (!initialization) throw new Error('Hours database is temporarily unavailable');
  return initialization;
}

export async function getHours({ allExceptions = false } = {}) {
  const db = await ensureDatabase();
  const [[settings]] = await db.execute('SELECT regular_json FROM pawn_hours_settings WHERE id = 1');
  if (!settings) throw new Error('Hours settings are unavailable');
  const value = typeof settings.regular_json === 'string' ? JSON.parse(settings.regular_json) : settings.regular_json;
  const regular = validateRegular(value);
  const today = storeDate();
  const [rows] = allExceptions
    ? await db.execute('SELECT date_key, label, status, opens, closes FROM pawn_hours_exceptions ORDER BY date_key')
    : await db.execute('SELECT date_key, label, status, opens, closes FROM pawn_hours_exceptions WHERE date_key >= ? ORDER BY date_key', [today]);
  return {
    timeZone: STORE_TIME_ZONE, today, regular,
    exceptions: rows.map(({ date_key, label, status, opens, closes }) => validateException(date_key, { label, status, opens, closes })),
  };
}
