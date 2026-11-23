import React, { useEffect, useState } from 'react';
import { Clock, CalendarDays } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const REFRESH_INTERVAL_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 10 * 1000;
const MAX_AGE_MS = 3 * 60 * 1000;

function showTime(value) {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
function showHours(item) {
  if (item.status === 'closed') return 'Closed';
  if (item.status !== 'open') return 'Hours unconfirmed';
  return `${showTime(item.opens)} – ${showTime(item.closes)}`;
}
function showDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}

export default function HoursSection({ className = '' }) {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let controller;
    let expiresAt = 0;
    let expirationTimer;

    function discardExpired() {
      if (expiresAt && Date.now() >= expiresAt) {
        expiresAt = 0;
        setHours(null);
      }
    }

    async function refresh() {
      if (!active) return;
      // Timers may be suspended while the page is hidden or the device sleeps.
      discardExpired();
      if (inFlight) return;
      inFlight = true;
      controller = new AbortController();
      let timeout;
      try {
        const data = await Promise.race([
          (async () => {
            const response = await fetch('/api/hours', { cache: 'no-store', signal: controller.signal });
            if (!response.ok) throw new Error('unavailable');
            const result = await response.json();
            if (!Array.isArray(result.regular) || !Array.isArray(result.exceptions)) throw new Error('invalid response');
            return result;
          })(),
          new Promise((_, reject) => {
            timeout = window.setTimeout(() => {
              controller.abort();
              reject(new Error('Hours request timed out'));
            }, FETCH_TIMEOUT_MS);
          }),
        ]);
        if (active) {
          expiresAt = Date.now() + MAX_AGE_MS;
          window.clearTimeout(expirationTimer);
          expirationTimer = window.setTimeout(() => {
            if (active) { expiresAt = 0; setHours(null); }
          }, MAX_AGE_MS);
          setHours(data);
        }
      } catch {
        // Do not claim potentially outdated defaults if the persistent store cannot be read.
        if (active) {
          expiresAt = 0;
          window.clearTimeout(expirationTimer);
          setHours(null);
        }
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
        if (active) setLoading(false);
      }
    }
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') refresh();
    }
    refresh();
    const timer = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      window.clearTimeout(expirationTimer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const todaySpecial = hours?.exceptions.find((item) => item.date === hours.today);

  return (
    <section className={`rounded-sm border border-luxury-gold/25 bg-luxury-charcoal/50 p-5 sm:p-6 ${className}`} aria-labelledby="store-hours-heading">
      <div className="flex items-center gap-2 text-luxury-gold">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <h3 id="store-hours-heading" className="text-xs font-semibold uppercase tracking-[0.2em]">Regular hours</h3>
      </div>
      {loading ? <p className="mt-4 text-sm text-luxury-muted">Loading store hours…</p> : !hours ? (
        <p className="mt-4 text-sm leading-relaxed text-luxury-muted">Hours are temporarily unavailable. Please call <a className="text-luxury-gold underline" href="tel:+16786911692">(678) 691-1692</a> before visiting.</p>
      ) : (
        <>
          {todaySpecial && <p className="mt-4 border border-luxury-gold/40 bg-luxury-black p-3 text-sm text-luxury-ivory"><strong className="text-luxury-gold">Today's special hours:</strong> {todaySpecial.label} · {showHours(todaySpecial)}</p>}
          <dl className="mt-4 space-y-2 text-sm">
            {DAY_ORDER.map((day) => {
              const item = hours.regular.find((entry) => entry.day === day);
              return item ? <div key={day} className="flex justify-between gap-4"><dt className="text-luxury-muted">{DAY_NAMES[day]}</dt><dd className="text-right text-luxury-ivory">{showHours(item)}</dd></div> : null;
            })}
          </dl>
          {hours.exceptions.length > 0 && (
            <div className="mt-5 border-t border-luxury-gold/20 pt-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold"><CalendarDays className="h-4 w-4" aria-hidden="true" /> Special Hours</h3>
              <p className="mt-2 text-xs text-luxury-muted">These hours replace the regular schedule on the dates listed.</p>
              <ul className="mt-3 space-y-3">
                {hours.exceptions.map((item) => <li key={item.date} className="text-sm"><span className="block text-luxury-ivory">{item.label} · {showDate(item.date)}</span><span className="text-luxury-muted">{showHours(item)}</span></li>)}
              </ul>
            </div>
          )}
          <p className="mt-4 text-xs text-luxury-muted">All times Eastern. Please call to confirm.</p>
        </>
      )}
    </section>
  );
}
