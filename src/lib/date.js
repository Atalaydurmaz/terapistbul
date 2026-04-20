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
