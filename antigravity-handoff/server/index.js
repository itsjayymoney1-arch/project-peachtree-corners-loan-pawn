import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDatabase, getHours } from './db.js';
import { validateRegular, validateException, validDate } from './hours.js';
import { registerAuth, requireOwner } from './auth.js';

const app = express();
app.disable('x-powered-by');
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
registerAuth(app);

app.get('/api/health', async (req, res) => {
  try { const db = await ensureDatabase(); await db.query('SELECT 1'); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});
app.get('/api/hours', async (req, res) => {
  try { res.json(await getHours()); }
  catch (error) { console.error('Public hours read failed:', error.message); res.status(503).json({ error: 'Store hours are temporarily unavailable. Please call the store.' }); }
});
app.get('/api/admin/hours', requireOwner, async (req, res) => {
  try { res.json(await getHours({ allExceptions: true })); }
  catch (error) { console.error('Hours admin read failed:', error.message); res.status(503).json({ error: 'Store hours are temporarily unavailable.' }); }
});
app.put('/api/admin/hours/regular', requireOwner, async (req, res) => {
  let regular;
  try { regular = validateRegular(req.body?.regular); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const db = await ensureDatabase();
    const [result] = await db.execute('UPDATE pawn_hours_settings SET regular_json = ? WHERE id = 1', [JSON.stringify(regular)]);
    if (result.affectedRows !== 1) throw new Error('Hours settings row is missing');
    return res.json({ regular });
  } catch (error) { console.error('Regular hours update failed:', error.message); return res.status(503).json({ error: 'Could not save hours. Please try again.' }); }
});
app.put('/api/admin/hours/exceptions/:date', requireOwner, async (req, res) => {
  let exception;
  try { exception = validateException(req.params.date, req.body); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const db = await ensureDatabase();
    // The primary key makes create-if-absent atomic, even for concurrent writers.
    const replace = req.query.replace === '1';
    await db.execute(`INSERT INTO pawn_hours_exceptions (date_key, label, status, opens, closes) VALUES (?, ?, ?, ?, ?)
      ${replace ? 'ON DUPLICATE KEY UPDATE label = VALUES(label), status = VALUES(status), opens = VALUES(opens), closes = VALUES(closes)' : ''}`,
    [exception.date, exception.label, exception.status, exception.opens, exception.closes]);
    return res.json({ exception });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) return res.status(409).json({ error: 'Special hours already exist for this date. Use replace=1 to replace them.' });
    console.error('Special hours update failed:', error.message); return res.status(503).json({ error: 'Could not save special hours. Please try again.' });
  }
});
app.delete('/api/admin/hours/exceptions/:date', requireOwner, async (req, res) => {
  if (!validDate(req.params.date)) return res.status(400).json({ error: 'Enter a valid calendar date.' });
  try {
    const db = await ensureDatabase();
    await db.execute('DELETE FROM pawn_hours_exceptions WHERE date_key = ?', [req.params.date]);
    return res.json({ ok: true });
  } catch (error) { console.error('Special hours deletion failed:', error.message); return res.status(503).json({ error: 'Could not delete special hours. Please try again.' }); }
});
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError || error.type === 'entity.too.large') return res.status(400).json({ error: 'Invalid request body.' });
  console.error('Unexpected server error:', error.message);
  return res.status(500).json({ error: 'Request failed.' });
});

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use('/staff-hours', (req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });
app.use(express.static(root, { index: false }));
app.get('*', (req, res) => res.sendFile(path.join(root, 'index.html')));
const port = Number(process.env.PORT || 3000);
export const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Hours server listening on ${port}`);
  // Bind before initialization so the platform can observe readiness during retries.
  ensureDatabase().catch(() => {});
});
