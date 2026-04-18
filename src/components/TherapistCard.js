import Link from 'next/link';
import Image from 'next/image';

function Avatar({ initials, color, photo, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
  if (photo) {
    const isBase64 = photo.startsWith('data:');
    return (
      <div className={`${sizeClass} rounded-2xl overflow-hidden flex-shrink-0`}>
        {isBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <Image src={photo} alt="" width={56} height={56} className="w-full h-full object-cover object-top" />
        )}
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    teal: 'bg-teal-50 text-teal-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export default function TherapistCard({ therapist, showMatchScore = false }) {
  const {
    id, name, title, city, district, online, inPerson,
    price, specialties, approaches, experience, rating,
    reviewCount, verified, initials, color, photo, matchScore,
    languages, freeConsultation,
  } = therapist;

  return (
    <Link href={`/terapist/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm card-hover group-hover:border-teal-200 transition-all">
        {/* Match score banner */}
        {showMatchScore && matchScore && (
          <div className="mb-4 flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
            <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                <path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-teal-800">
              %{matchScore} Eşleşme
            </span>
            <div className="flex-1 bg-teal-200 rounded-full h-1.5 ml-1">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="relative">
            <Avatar initials={initials} color={color} photo={photo} />
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-teal-700 transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-900">{price.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-slate-400">/ seans</p>
                {freeConsultation && (
                  <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                    Ücretsiz ön görüşme
                  </span>
                )}
              </div>
            </div>

            {/* Location & mode */}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {city}, {district}
              </span>
              <div className="flex gap-1">
                {online && <Badge variant="teal">Online</Badge>}
                {inPerson && <Badge variant="default">Yüz yüze</Badge>}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <StarRating rating={rating} />
              <span className="text-xs font-semibold text-slate-700">{rating}</span>
              <span className="text-xs text-slate-400">({reviewCount} yorum)</span>
              {experience && (
                <>
                  <span className="text-slate-200 text-xs">·</span>
                  <span className="text-xs text-slate-400">{experience} yıl deneyim</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Specialties */}
        {specialties?.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Uzmanlık Alanı</p>
            <div className="flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="teal">{spec}</Badge>
              ))}
              {specialties.length > 3 && (
                <Badge variant="default">+{specialties.length - 3}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Approaches */}
        {approaches?.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Terapi Yaklaşımı</p>
            <div className="flex flex-wrap gap-1.5">
              {approaches.slice(0, 2).map((app) => (
                <Badge key={app} variant="violet">{app}</Badge>
              ))}
            </div>
          </div>
        )}

      </div>
    </Link>
  );
}
