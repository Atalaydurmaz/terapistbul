import { Resend } from 'resend';

// Lazy singleton. Module-level instantiation patlatıyor çünkü
// Resend constructor'ı API key yoksa fırlatıyor ve Next.js build
// sırasında route modülünü import ederken collect-page-data
// aşaması patlıyor. Bunun yerine ilk gerçek kullanımda oluştur.
let _resend = null;

export function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Env yoksa null dön — çağıran taraf skip edebilsin.
    // Build sırasında hata fırlatmıyoruz; runtime'da key eksikse
    // mail gönderilmez ama API 500 yerine kontrollü 200 dönebilir.
    return null;
  }
  _resend = new Resend(key);
  return _resend;
}
