const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

export function fmtDateTr(ds) {
  if (!ds) return '';
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(String(ds));
  if (!iso) return ds;
  const [y, m, d] = iso[0].split('-').map(Number);
  return `${d} ${TR_MONTHS[m - 1]} ${y}`;
}

export function fmtDateTrWithDay(ds) {
  if (!ds) return '';
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(String(ds));
  if (!iso) return ds;
  const [y, m, d] = iso[0].split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${TR_MONTHS[m - 1]} ${y} ${TR_DAYS[date.getDay()]}`;
}

/**
 * Combines a YYYY-MM-DD day string and an HH:MM hour string into a Date object
 * (local time). Returns null if either input is missing/invalid.
 */
export function parseSessionStart(selectedDay, selectedHour) {
  if (!selectedDay || !selectedHour) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(selectedDay));
  if (!iso) return null;
  const timeMatch = /(\d{1,2}):(\d{2})/.exec(String(selectedHour));
  if (!timeMatch) return null;
  const [, y, mo, d] = iso;
  const [, hh, mm] = timeMatch;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), 0, 0);
}

/**
 * Session join window logic.
 *   - opens 10 minutes before the start time
 *   - closes 90 minutes after the start time
 * Returns { canJoin, minutesUntilOpen, isExpired, start }
 */
export function getJoinWindow(selectedDay, selectedHour, now = new Date()) {
  const start = parseSessionStart(selectedDay, selectedHour);
  if (!start) return { canJoin: false, minutesUntilOpen: null, isExpired: false, start: null };
  const openAt = start.getTime() - 10 * 60 * 1000;
  const closeAt = start.getTime() + 90 * 60 * 1000;
  const nowMs = now.getTime();
  const canJoin = nowMs >= openAt && nowMs <= closeAt;
  const isExpired = nowMs > closeAt;
  const minutesUntilOpen = nowMs < openAt ? Math.ceil((openAt - nowMs) / 60000) : 0;
  return { canJoin, minutesUntilOpen, isExpired, start };
}
