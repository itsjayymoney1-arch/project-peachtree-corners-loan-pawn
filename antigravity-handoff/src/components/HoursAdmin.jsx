import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, LogOut, ShieldCheck } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const blankException = () => ({ date: '', label: '', status: 'closed', opens: '10:00', closes: '18:00' });
const inputClass = 'w-full rounded-sm border border-luxury-gold/30 bg-luxury-black px-3 py-2 text-sm text-luxury-ivory focus:outline-none focus:border-luxury-gold';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-sm bg-luxury-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-luxury-black hover:brightness-110 disabled:opacity-50';
const secondaryClass = 'inline-flex items-center justify-center gap-2 rounded-sm border border-luxury-gold/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold hover:bg-luxury-gold/10 disabled:opacity-50';

async function request(url, options = {}, timeoutMs = 0) {
  const controller = timeoutMs ? new AbortController() : null;
  let timeout;
  try {
    const operation = (async () => {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options, ...(controller ? { signal: controller.signal } : {}) });
      let result = {};
      try { result = await response.json(); } catch { /* use a generic error below */ }
      if (!response.ok) {
        const error = new Error(result.error || 'The request could not be completed.');
        error.status = response.status;
        throw error;
      }
      return result;
    })();
    if (!timeoutMs) return await operation;
    return await Promise.race([operation, new Promise((_, reject) => {
      timeout = window.setTimeout(() => {
        controller.abort();
        reject(new Error('The request timed out.'));
      }, timeoutMs);
    })]);
  } finally {
    window.clearTimeout(timeout);
  }
}
function displayTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}
function displayHours(item) {
  if (item.status === 'closed') return 'Closed';
  if (item.status === 'unconfirmed') return 'Hours unconfirmed';
  return `${displayTime(item.opens)} – ${displayTime(item.closes)}`;
}
function displayDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export default function HoursAdmin() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [regular, setRegular] = useState([]);
  const [exception, setException] = useState(blankException);
  const [editingDate, setEditingDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadHours = useCallback(async (initializeRegular = false) => {
    const result = await request('/api/admin/hours', {}, 10000);
    if (!Array.isArray(result.regular) || !Array.isArray(result.exceptions)) throw new Error('Invalid hours response.');
    setData(result);
    // Only initialize the form on first load; exception refreshes must not erase a weekly draft.
    if (initializeRegular) setRegular(result.regular);
  }, []);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const current = await request('/api/auth/session');
      setSession(current);
      if (current.isOwner) await loadHours(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [loadHours]);

  useEffect(() => { loadSession(); }, [loadSession]);

  async function login() {
    setError(''); setBusy(true);
    try {
      const result = await request('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origin: window.location.origin }),
      });
      window.location.assign(result.authorizationUrl);
    } catch (err) { setError(err.message); setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try {
      await request('/api/auth/logout', { method: 'POST', headers: { 'X-Hours-CSRF': session.csrfToken } });
      setSession(null); setData(null); setRegular([]); setMessage('Signed out.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function changeDay(day, field, value) {
    setRegular((rows) => rows.map((row) => {
      if (row.day !== day) return row;
      if (field === 'status' && value === 'open') return { ...row, status: value, opens: row.opens || '10:00', closes: row.closes || '18:00' };
      return { ...row, [field]: value };
    }));
  }
  async function refreshAfterWrite() {
    try { await loadHours(); }
    catch {
      setError('Your change was saved, but saved hours could not be refreshed. The list may be out of date; use Refresh saved hours to retry. Your weekly draft is preserved.');
    }
  }
  async function refreshSavedHours() {
    setError(''); setMessage(''); setBusy(true);
    try { await loadHours(); setMessage('Saved hours refreshed. Your weekly draft was preserved.'); }
    catch { setError('Saved hours could not be refreshed. Please try again; your weekly draft is preserved.'); }
    finally { setBusy(false); }
  }
  async function saveRegular(event) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const saved = await request('/api/admin/hours/regular', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Hours-CSRF': session.csrfToken }, body: JSON.stringify({ regular }) });
      if (Array.isArray(saved.regular)) setData((current) => current && { ...current, regular: saved.regular });
      setMessage('Regular hours saved. Any changes made after saving remain a draft.');
      await refreshAfterWrite();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function saveException(event) {
    event.preventDefault(); setError(''); setMessage('');
    const existing = data.exceptions.find((item) => item.date === exception.date);
    let replace = !!editingDate;
    if (!replace && existing) {
      if (!window.confirm(`Special hours already exist for ${displayDate(existing.date)} (${existing.label}). Replace them?`)) return;
      replace = true;
    }
    setBusy(true);
    const url = `/api/admin/hours/exceptions/${encodeURIComponent(exception.date)}`;
    const options = { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Hours-CSRF': session.csrfToken }, body: JSON.stringify(exception) };
    try {
      let saved;
      try {
        saved = await request(`${url}${replace ? '?replace=1' : ''}`, options);
      } catch (err) {
        if (err.status !== 409 || replace) throw err;
        if (!window.confirm(`Special hours for ${displayDate(exception.date)} were added or changed since the list was loaded. Replace them?`)) {
          setError('No special hours were changed. Your form has been kept.');
          return;
        }
        saved = await request(`${url}?replace=1`, options);
      }
      if (saved.exception) setData((current) => current && {
        ...current,
        exceptions: [...current.exceptions.filter((item) => item.date !== saved.exception.date), saved.exception].sort((a, b) => a.date.localeCompare(b.date)),
      });
      setException(blankException()); setEditingDate(null); setMessage('Special hours saved.');
      await refreshAfterWrite();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function deleteException(item) {
    if (!window.confirm(`Remove special hours for ${item.label} on ${displayDate(item.date)}?`)) return;
    setError(''); setMessage(''); setBusy(true);
    try {
      await request(`/api/admin/hours/exceptions/${encodeURIComponent(item.date)}`, { method: 'DELETE', headers: { 'X-Hours-CSRF': session.csrfToken } });
      setData((current) => current && { ...current, exceptions: current.exceptions.filter((entry) => entry.date !== item.date) });
      if (exception.date === item.date) { setException(blankException()); setEditingDate(null); }
      setMessage('Special hours removed.');
      await refreshAfterWrite();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-10 text-luxury-ivory sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-luxury-gold/20 pb-7">
          <div><a href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-luxury-gold">Peachtree Corners Loan &amp; Pawn</a><h1 className="mt-3 font-serif text-3xl sm:text-4xl">Store hours</h1><p className="mt-2 text-sm text-luxury-muted">Owner access · All times Eastern</p></div>
          {session?.authenticated && <button className={secondaryClass} onClick={logout} disabled={busy}><LogOut className="h-4 w-4" /> Sign out</button>}
        </header>
        {error && <p role="alert" className="rounded-sm border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200">{error}</p>}
        {message && <p role="status" className="rounded-sm border border-luxury-gold/30 bg-luxury-charcoal p-4 text-sm text-luxury-gold">{message}</p>}
        {loading ? <p className="text-sm text-luxury-muted">Checking your access…</p> : !session?.authenticated ? (
          <div className="max-w-xl rounded-sm border border-luxury-gold/20 bg-luxury-charcoal/50 p-6 sm:p-8">
            <ShieldCheck className="h-7 w-7 text-luxury-gold" /><h2 className="mt-4 font-serif text-2xl">Owner sign in</h2><p className="mt-3 text-sm leading-relaxed text-luxury-muted">Sign in with your Manus account. Only the explicitly authorized store owner can change hours.</p>
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === 'failed' && <p className="mt-3 text-sm text-red-200">Sign in could not be completed. Please try again.</p>}
            <button className={`${buttonClass} mt-6`} onClick={login} disabled={busy}>Sign in with Manus</button>
          </div>
        ) : !session.isOwner ? (
          <div className="max-w-2xl rounded-sm border border-luxury-gold/20 bg-luxury-charcoal/50 p-6 sm:p-8">
            <ShieldCheck className="h-7 w-7 text-luxury-gold" /><h2 className="mt-4 font-serif text-2xl">Owner authorization required</h2>
            <p className="mt-3 text-sm leading-relaxed text-luxury-muted">You are signed in{session.name ? ` as ${session.name}` : ''}, but this identity is not authorized to edit hours. The owner must verify their own Manus identity and have it configured securely by the project administrator.</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-luxury-gold">Your authenticated Manus OpenID</p><code className="mt-2 block break-all rounded-sm border border-luxury-gold/20 bg-luxury-black p-3 text-sm text-luxury-ivory">{session.openId}</code>
            <p className="mt-3 text-xs leading-relaxed text-luxury-muted">Do not authorize an identity merely because it signed in first. The value must be verified and approved by the actual owner.</p>
          </div>
        ) : !data ? (
          <div><p className="text-sm text-luxury-muted">Hours are temporarily unavailable.</p><button className={`${secondaryClass} mt-4`} onClick={loadSession}>Try again</button></div>
        ) : (
          <>
            <form onSubmit={saveRegular} className="rounded-sm border border-luxury-gold/20 bg-luxury-charcoal/50 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-luxury-gold"><Clock className="h-4 w-4" /><h2 className="text-xs font-semibold uppercase tracking-[0.2em]">Regular weekly hours</h2></div>
              <p className="mt-2 text-sm text-luxury-muted">Set each day to open, closed, or unconfirmed. Overnight ranges are not supported.</p>
              <div className="mt-5 space-y-3">
                {DAY_ORDER.map((day) => {
                  const row = regular.find((entry) => entry.day === day);
                  if (!row) return null;
                  return <div key={day} className="grid grid-cols-1 items-end gap-3 border-t border-luxury-gold/10 pt-3 sm:grid-cols-[1fr_1fr_1fr_1fr]">
                    <span className="self-center text-sm font-medium">{DAY_NAMES[day]}</span>
                    <label className="text-xs text-luxury-muted">Status<select aria-label={`${DAY_NAMES[day]} status`} className={`${inputClass} mt-1`} value={row.status} onChange={(e) => changeDay(day, 'status', e.target.value)}><option value="open">Open</option><option value="closed">Closed</option><option value="unconfirmed">Unconfirmed</option></select></label>
                    <label className="text-xs text-luxury-muted">Opens<input aria-label={`${DAY_NAMES[day]} opening time`} className={`${inputClass} mt-1`} type="time" value={row.opens || ''} onChange={(e) => changeDay(day, 'opens', e.target.value)} disabled={row.status !== 'open'} required={row.status === 'open'} /></label>
                    <label className="text-xs text-luxury-muted">Closes<input aria-label={`${DAY_NAMES[day]} closing time`} className={`${inputClass} mt-1`} type="time" value={row.closes || ''} onChange={(e) => changeDay(day, 'closes', e.target.value)} disabled={row.status !== 'open'} required={row.status === 'open'} /></label>
                  </div>;
                })}
              </div>
              <button type="submit" className={`${buttonClass} mt-6`} disabled={busy}>Save regular hours</button>
            </form>
            <section className="rounded-sm border border-luxury-gold/20 bg-luxury-charcoal/50 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-luxury-gold"><CalendarDays className="h-4 w-4" /><h2 className="text-xs font-semibold uppercase tracking-[0.2em]">Holiday &amp; special hours</h2></div>
              <p className="mt-2 text-sm text-luxury-muted">A dated exception overrides the weekly schedule for that date. It remains visible to customers through the end of that day in Eastern time.</p>
              <form onSubmit={saveException} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs text-luxury-muted">Date{editingDate ? ' (fixed while editing)' : ''}<input className={`${inputClass} mt-1`} type="date" value={exception.date} onChange={(e) => setException({ ...exception, date: e.target.value })} disabled={busy || !!editingDate} required /></label>
                <label className="text-xs text-luxury-muted">Label<input className={`${inputClass} mt-1`} value={exception.label} onChange={(e) => setException({ ...exception, label: e.target.value })} disabled={busy} maxLength={120} placeholder="e.g. Thanksgiving" required /></label>
                <label className="text-xs text-luxury-muted">Status<select className={`${inputClass} mt-1`} value={exception.status} onChange={(e) => setException({ ...exception, status: e.target.value })} disabled={busy}><option value="closed">Closed</option><option value="open">Open</option><option value="unconfirmed">Unconfirmed</option></select></label>
                <label className="text-xs text-luxury-muted">Opens<input className={`${inputClass} mt-1`} type="time" value={exception.opens || ''} onChange={(e) => setException({ ...exception, opens: e.target.value })} disabled={busy || exception.status !== 'open'} required={exception.status === 'open'} /></label>
                <label className="text-xs text-luxury-muted">Closes<input className={`${inputClass} mt-1`} type="time" value={exception.closes || ''} onChange={(e) => setException({ ...exception, closes: e.target.value })} disabled={busy || exception.status !== 'open'} required={exception.status === 'open'} /></label>
                <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5"><button type="submit" className={buttonClass} disabled={busy}>Save special hours</button><button type="button" className={secondaryClass} onClick={() => { setException(blankException()); setEditingDate(null); }} disabled={busy}>Clear form</button></div>
              </form>
              <div className="mt-6 border-t border-luxury-gold/15 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-luxury-gold">Saved exceptions</h3><button type="button" className={secondaryClass} onClick={refreshSavedHours} disabled={busy}>Refresh saved hours</button></div>
                {data.exceptions.length === 0 ? <p className="mt-3 text-sm text-luxury-muted">No special hours saved.</p> : <ul className="mt-3 divide-y divide-luxury-gold/10">{data.exceptions.map((item) => <li key={item.date} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="text-sm"><span className="text-luxury-ivory">{item.label} · {displayDate(item.date)}</span><span className="ml-2 text-luxury-muted">{displayHours(item)}{item.date < data.today ? ' (past)' : ''}</span></div><div className="flex gap-2"><button type="button" className={secondaryClass} onClick={() => { setException({ ...item, opens: item.opens || '10:00', closes: item.closes || '18:00' }); setEditingDate(item.date); }} disabled={busy}>Edit</button><button type="button" className={secondaryClass} onClick={() => deleteException(item)} disabled={busy}>Remove</button></div></li>)}</ul>}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
