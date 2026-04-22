export const therapists = [];


export const cities = [
  'Tümü',
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

export const specialtyList = [
  'Anksiyete',
  'Depresyon',
  'Travma & TSSB',
  'İlişki & Çift Terapisi',
  'Aile Terapisi',
  'Çocuk & Ergen',
  'Yeme Bozuklukları',
  'Bağımlılık',
  'Yas & Kayıp',
  'Kariyer & Burnout',
  'OKB',
  'Cinsel Terapi',
  'Stres Yönetimi',
  'Öfke Kontrolü',
  'Özgüven & Kimlik',
];

export const approachList = [
  'Bilişsel Davranışçı Terapi',
  'Psikodinamik Terapi',
  'EMDR',
  'Schema Terapi',
  'DBT',
  'ACT',
  'Gestalt Terapi',
  'Varoluşçu Terapi',
  'Oyun Terapisi',
  'Sistemik Terapi',
  'Çözüm Odaklı Terapi',
];

// AI keyword matching — maps Turkish user phrases to therapist aiTags
const keywordMap = {
  kaygı: ['anksiyete', 'panik', 'kaygı'],
  anksiyete: ['anksiyete', 'kaygı', 'panik'],
  panik: ['panik', 'anksiyete', 'kaygı'],
  korku: ['fobi', 'anksiyete', 'kaygı', 'korku'],
  fobi: ['fobi', 'anksiyete', 'korku'],
  depresyon: ['depresyon', 'mutsuzluk'],
  üzgün: ['depresyon', 'yas'],
  üzüntü: ['depresyon', 'yas'],
  mutsuz: ['depresyon', 'yas'],
  hüzün: ['depresyon', 'yas', 'kayıp'],
  ağlamak: ['depresyon', 'yas'],
  umutsuz: ['depresyon'],
  uyku: ['anksiyete', 'depresyon', 'uyku'],
  uyuyamıyorum: ['anksiyete', 'depresyon', 'uyku'],
  ilişki: ['ilişki', 'çift', 'aile'],
  sevgili: ['ilişki', 'çift'],
  evlilik: ['çift', 'aile', 'ilişki', 'evlilik'],
  eş: ['çift', 'aile', 'evlilik'],
  boşanma: ['boşanma', 'yas', 'aile'],
  aile: ['aile', 'çift', 'ebeveyn'],
  çocuk: ['çocuk', 'ergen', 'aile', 'ebeveyn'],
  ergen: ['ergen', 'çocuk', 'okul'],
  okul: ['okul', 'ergen', 'çocuk'],
  travma: ['travma', 'TSSB'],
  şiddet: ['travma', 'TSSB', 'şiddet'],
  kaza: ['travma', 'TSSB'],
  öfke: ['öfke', 'stres'],
  sinir: ['öfke', 'stres'],
  stres: ['stres', 'burnout', 'anksiyete'],
  iş: ['iş', 'kariyer', 'burnout', 'stres'],
  kariyer: ['kariyer', 'burnout', 'iş'],
  yorgunluk: ['burnout', 'stres', 'depresyon'],
  tükenmişlik: ['burnout', 'stres'],
  burnout: ['burnout', 'stres', 'iş'],
  bağımlılık: ['bağımlılık', 'alkol', 'madde'],
  alkol: ['alkol', 'bağımlılık'],
  madde: ['madde', 'bağımlılık'],
  yeme: ['yeme', 'kilo', 'beden'],
  kilo: ['kilo', 'yeme', 'beden'],
  beden: ['beden', 'özgüven', 'kimlik'],
  özgüven: ['özgüven', 'kimlik'],
  yalnızlık: ['yalnızlık', 'depresyon', 'sosyal'],
  utangaç: ['sosyal fobi', 'utangaçlık', 'anksiyete'],
  sosyal: ['sosyal fobi', 'utangaçlık'],
  yas: ['yas', 'kayıp', 'ölüm'],
  kayıp: ['kayıp', 'yas', 'depresyon'],
  ölüm: ['ölüm', 'yas', 'varoluş', 'anlam'],
  anlam: ['anlam', 'varoluş'],
  varoluş: ['varoluş', 'anlam'],
  bellek: ['bellek', 'dikkat', 'konsantrasyon'],
  dikkat: ['dikkat', 'DEHB', 'konsantrasyon', 'bellek'],
  unutkanlık: ['bellek', 'alzheimer', 'dikkat'],
  cinsel: ['cinsel'],
  lgbtq: ['LGBTQ', 'kimlik', 'cinsel'],
};

export function aiMatchTherapists(query, therapistList) {
  if (!query || query.trim().length < 2) return therapistList;

  const words = query
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(/\s+/);

  const scores = therapistList.map((t) => {
    let score = 0;
    const tags = t.aiTags.map((tag) => tag.toLowerCase());

    words.forEach((word) => {
      // Direct tag match
      tags.forEach((tag) => {
        if (tag.includes(word) || word.includes(tag)) score += 3;
      });

      // Keyword map match
      Object.entries(keywordMap).forEach(([keyword, mappedTags]) => {
        if (word.includes(keyword) || keyword.includes(word)) {
          mappedTags.forEach((mapped) => {
            tags.forEach((tag) => {
              if (tag.includes(mapped) || mapped.includes(tag)) score += 2;
            });
          });
        }
      });

      // Specialty match
      t.specialties.forEach((spec) => {
        const specLower = spec.toLowerCase();
        if (specLower.includes(word) || word.includes(specLower.split(' ')[0])) score += 2;
      });
    });

    return { therapist: t, score };
  });

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => ({ ...s.therapist, matchScore: Math.min(99, 60 + s.score * 4) }));
}
