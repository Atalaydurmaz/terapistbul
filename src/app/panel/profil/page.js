'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { therapists } from '../../../data/therapists';

function stripPrefix(name) {
  return name.replace(/^(Prof\. Dr\.|Doç\. Dr\.|Dr\.|Uzm\. Psk\.|Uzm\.|Psk\.)\s*/i, '').trim();
}

const specialties = [
  'Klinik Psikoloji',
  'Adli Psikoloji',
  'Spor Psikolojisi',
  'Gelişim Psikolojisi',
  'Sosyal Psikoloji',
  'Nöropsikoloji',
  'Eğitim Psikolojisi',
  'Endüstri & Örgüt Psikolojisi',
  'Sağlık Psikolojisi',
  'Psikiyatri',
  'Çocuk & Ergen Psikolojisi',
  'Aile & Çift Terapisi',
  'Travma Psikolojisi',
  'Bağımlılık Psikolojisi',
  'Nöropsikolojik Rehabilitasyon',
];

const approaches = [
  'Bilişsel Davranışçı Terapi (BDT)', 'EMDR', 'Psikanalitik Terapi',
  'Gestalt Terapi', 'Çözüm Odaklı Terapi', 'Mindfulness Temelli Terapi',
  'Şema Terapi', 'Kabul ve Kararlılık Terapisi (ACT)',
  'Diyalektik Davranış Terapisi (DBT)', 'Hipnoterapi',
];

const languages = ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Arapça'];

const sehirIlceler = {
  'Adana': ['Aladağ','Ceyhan','Çukurova','Feke','İmamoğlu','Karaisalı','Karataş','Kozan','Pozantı','Saimbeyli','Sarıçam','Seyhan','Tufanbeyli','Yumurtalık','Yüreğir'],
  'Ankara': ['Akyurt','Altındağ','Ayaş','Bala','Beypazarı','Çamlıdere','Çankaya','Çubuk','Elmadağ','Etimesgut','Evren','Gölbaşı','Güdül','Haymana','Kahramankazan','Kalecik','Keçiören','Kızılcahamam','Mamak','Nallıhan','Polatlı','Pursaklar','Sincan','Şereflikoçhisar','Yenimahalle'],
  'İstanbul': ['Adalar','Arnavutköy','Ataşehir','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş','Beykoz','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Çekmeköy','Esenler','Esenyurt','Eyüpsultan','Fatih','Gaziosmanpaşa','Güngören','Kadıköy','Kağıthane','Kartal','Küçükçekmece','Maltepe','Pendik','Sancaktepe','Sarıyer','Silivri','Sultanbeyli','Sultangazi','Şile','Şişli','Tuzla','Ümraniye','Üsküdar','Zeytinburnu'],
  'İzmir': ['Aliağa','Balçova','Bayındır','Bayraklı','Bergama','Beydağ','Bornova','Buca','Çeşme','Çiğli','Dikili','Foça','Gaziemir','Güzelbahçe','Karabağlar','Karaburun','Karşıyaka','Kemalpaşa','Kınık','Kiraz','Konak','Menderes','Menemen','Narlıdere','Ödemiş','Seferihisar','Selçuk','Tire','Torbalı','Urla'],
  'Bursa': ['Büyükorhan','Gemlik','Gürsu','Harmancık','İnegöl','İznik','Karacabey','Keles','Kestel','Mudanya','Mustafakemalpaşa','Nilüfer','Orhaneli','Orhangazi','Osmangazi','Yenişehir','Yıldırım'],
  'Antalya': ['Akseki','Aksu','Alanya','Demre','Döşemealtı','Elmalı','Finike','Gazipaşa','Gündoğmuş','İbradı','Kaş','Kemer','Kepez','Konyaaltı','Korkuteli','Kumluca','Manavgat','Muratpaşa','Serik'],
  'Adıyaman': ['Besni','Çelikhan','Gerger','Gölbaşı','Kahta','Merkez','Samsat','Sincik','Tut'],
  'Afyonkarahisar': ['Başmakçı','Bayat','Bolvadin','Çay','Çobanlar','Dazkırı','Dinar','Emirdağ','Evciler','Hocalar','İhsaniye','İscehisar','Kızılören','Merkez','Sandıklı','Sinanpaşa','Sultandağı','Şuhut'],
  'Ağrı': ['Diyadin','Doğubayazıt','Eleşkirt','Hamur','Merkez','Patnos','Taşlıçay','Tutak'],
  'Aksaray': ['Ağaçören','Eskil','Gülağaç','Güzelyurt','Merkez','Ortaköy','Sarıyahşi'],
  'Amasya': ['Göynücek','Gümüşhacıköy','Hamamözü','Merkez','Merzifon','Suluova','Taşova'],
  'Ardahan': ['Çıldır','Damal','Göle','Hanak','Merkez','Posof'],
  'Artvin': ['Ardanuç','Arhavi','Borçka','Hopa','Kemalpaşa','Merkez','Murgul','Şavşat','Yusufeli'],
  'Aydın': ['Bozdoğan','Buharkent','Çine','Didim','Efeler','Germencik','İncirliova','Karacasu','Karpuzlu','Koçarlı','Köşk','Kuşadası','Kuyucak','Nazilli','Söke','Sultanhisar','Yenipazar'],
  'Balıkesir': ['Altıeylül','Ayvalık','Balya','Bandırma','Bigadiç','Burhaniye','Dursunbey','Edremit','Erdek','Gömeç','Gönen','Havran','İvrindi','Karesi','Kepsut','Manyas','Marmara','Savaştepe','Sındırgı','Susurluk'],
  'Bartın': ['Amasra','Kurucaşile','Merkez','Ulus'],
  'Batman': ['Beşiri','Gercüş','Hasankeyf','Kozluk','Merkez','Sason'],
  'Bayburt': ['Aydıntepe','Demirözü','Merkez'],
  'Bilecik': ['Bozüyük','Gölpazarı','İnhisar','Merkez','Osmaneli','Pazaryeri','Söğüt','Yenipazar'],
  'Bingöl': ['Adaklı','Genç','Karlıova','Kiğı','Merkez','Solhan','Yayladere','Yedisu'],
  'Bitlis': ['Adilcevaz','Ahlat','Güroymak','Hizan','Merkez','Mutki','Tatvan'],
  'Bolu': ['Dörtdivan','Gerede','Göynük','Kıbrıscık','Mengen','Merkez','Mudurnu','Seben','Yeniçağa'],
  'Burdur': ['Ağlasun','Altınyayla','Bucak','Çavdır','Çeltikçi','Gölhisar','Kemer','Merkez','Tefenni','Yeşilova'],
  'Çanakkale': ['Ayvacık','Bayramiç','Biga','Bozcaada','Çan','Eceabat','Ezine','Gelibolu','Gökçeada','Lapseki','Merkez','Yenice'],
  'Çankırı': ['Atkaracalar','Bayramören','Çerkeş','Eldivan','Ilgaz','Khanköy','Korgun','Kurşunlu','Merkez','Orta','Şabanözü','Yapraklı'],
  'Çorum': ['Alaca','Bayat','Boğazkale','Dodurga','İskilip','Kargı','Laçin','Mecitözü','Merkez','Oğuzlar','Ortaköy','Osmancık','Sungurlu','Uğurludağ'],
  'Denizli': ['Acıpayam','Babadağ','Baklan','Bekilli','Beyağaç','Bozkurt','Buldan','Çal','Çameli','Çardak','Çivril','Güney','Honaz','Kale','Merkezefendi','Pamukkale','Sarayköy','Serinhisar','Tavas'],
  'Diyarbakır': ['Bağlar','Bismil','Çermik','Çınar','Çüngüş','Dicle','Eğil','Ergani','Hani','Hazro','Kayapınar','Kocaköy','Kulp','Lice','Silvan','Sur','Yenişehir'],
  'Düzce': ['Akçakoca','Cumayeri','Çilimli','Gümüşova','Gölyaka','Kaynaşlı','Merkez','Yığılca'],
  'Edirne': ['Enez','Havsa','İpsala','Keşan','Lalapaşa','Meriç','Merkez','Süloğlu','Uzunköprü'],
  'Elazığ': ['Ağın','Alacakaya','Arıcak','Baskil','Karakoçan','Keban','Kovancılar','Maden','Merkez','Palu','Sivrice'],
  'Erzincan': ['Çayırlı','İliç','Kemah','Kemaliye','Merkez','Otlukbeli','Refahiye','Tercan','Üzümlü'],
  'Erzurum': ['Aşkale','Aziziye','Çat','Hınıs','Horasan','İspir','Karaçoban','Karayazı','Köprüköy','Merkez','Narman','Oltu','Olur','Palandöken','Pasinler','Pazaryolu','Şenkaya','Tekman','Tortum','Uzundere','Yakutiye'],
  'Eskişehir': ['Alpu','Beylikova','Çifteler','Günyüzü','Han','İnönü','Mahmudiye','Mihalgazi','Mihalıççık','Odunpazarı','Sarıcakaya','Seyitgazi','Sivrihisar','Tepebaşı'],
  'Gaziantep': ['Araban','İslahiye','Karkamış','Nurdağı','Oğuzeli','Şahinbey','Şehitkamil','Yavuzeli'],
  'Giresun': ['Alucra','Bulancak','Çamoluk','Çanakçı','Dereli','Doğankent','Espiye','Eynesil','Görele','Güce','Keşap','Merkez','Piraziz','Şebinkarahisar','Tirebolu','Yağlıdere'],
  'Gümüşhane': ['Kelkit','Köse','Kürtün','Merkez','Şiran','Torul'],
  'Hakkari': ['Çukurca','Derecik','Merkez','Şemdinli','Yüksekova'],
  'Hatay': ['Altınözü','Antakya','Arsuz','Belen','Defne','Dörtyol','Erzin','Hassa','İskenderun','Kırıkhan','Kumlu','Payas','Reyhanlı','Samandağ','Yayladağı'],
  'Iğdır': ['Aralık','Karakoyunlu','Merkez','Tuzluca'],
  'Isparta': ['Aksu','Atabey','Eğirdir','Gelendost','Gönen','Keçiborlu','Merkez','Senirkent','Sütçüler','Şarkikaraağaç','Uluborlu','Yalvaç','Yenişarbademli'],
  'Kahramanmaraş': ['Afşin','Andırın','Çağlayancerit','Dulkadiroğlu','Ekinözü','Elbistan','Göksun','Nurhak','Onikişubat','Pazarcık','Türkoğlu'],
  'Karabük': ['Eflani','Eskipazar','Merkez','Ovacık','Safranbolu','Yenice'],
  'Karaman': ['Ayrancı','Başyayla','Ermenek','Kazımkarabekir','Merkez','Sarıveliler'],
  'Kars': ['Akyaka','Arpaçay','Digor','Kağızman','Merkez','Sarıkamış','Selim','Susuz'],
  'Kastamonu': ['Abana','Ağlı','Araç','Azdavay','Bozkurt','Cide','Çatalzeytin','Daday','Devrekani','Doğanyurt','Hanönü','İhsangazi','İnebolu','Küre','Merkez','Pınarbaşı','Seydiler','Şenpazar','Taşköprü','Tosya'],
  'Kayseri': ['Akkışla','Bünyan','Develi','Felahiye','Hacılar','İncesu','Kocasinan','Melikgazi','Özvatan','Pınarbaşı','Sarıoğlan','Sarız','Talas','Tomarza','Yahyalı','Yeşilhisar'],
  'Kilis': ['Elbeyli','Merkez','Musabeyli','Polateli'],
  'Kırıkkale': ['Bahşili','Balışeyh','Çelebi','Delice','Karakeçili','Keskin','Merkez','Sulakyurt','Yahşihan'],
  'Kırklareli': ['Babaeski','Demirköy','Kofçaz','Lüleburgaz','Merkez','Pehlivanköy','Pınarhisar','Vize'],
  'Kırşehir': ['Akçakent','Akpınar','Boztepe','Çiçekdağı','Kaman','Merkez','Mucur'],
  'Kocaeli': ['Başiskele','Çayırova','Darıca','Derince','Dilovası','Gebze','Gölcük','İzmit','Kandıra','Karamürsel','Kartepe','Körfez'],
  'Konya': ['Ahırlı','Akören','Akşehir','Altınekin','Beyşehir','Bozkır','Cihanbeyli','Çeltik','Çumra','Derbent','Derebucak','Doğanhisar','Emirgazi','Ereğli','Güneysınır','Hadim','Halkapınar','Hüyük','Ilgın','Kadınhanı','Karapınar','Karatay','Kulu','Meram','Sarayönü','Selçuklu','Seydişehir','Taşkent','Tuzlukçu','Yalıhüyük','Yunak'],
  'Kütahya': ['Altıntaş','Aslanapa','Çavdarhisar','Domaniç','Dumlupınar','Emet','Gediz','Hisarcık','Merkez','Pazarlar','Simav','Şaphane','Tavşanlı'],
  'Malatya': ['Akçadağ','Arapgir','Arguvan','Battalgazi','Darende','Doğanşehir','Doğanyol','Hekimhan','Kale','Kuluncak','Pütürge','Yazıhan','Yeşilyurt'],
  'Manisa': ['Ahmetli','Akhisar','Alaşehir','Demirci','Gölmarmara','Gördes','Kırkağaç','Köprübaşı','Kula','Salihli','Sarıgöl','Saruhanlı','Selendi','Soma','Şehzadeler','Turgutlu','Yunusemre'],
  'Mardin': ['Artuklu','Dargeçit','Derik','Kızıltepe','Mazıdağı','Midyat','Nusaybin','Ömerli','Savur','Yeşilli'],
  'Mersin': ['Akdeniz','Anamur','Aydıncık','Bozyazı','Çamlıyayla','Erdemli','Gülnar','Mezitli','Mut','Silifke','Tarsus','Toroslar','Yenişehir'],
  'Muğla': ['Bodrum','Dalaman','Datça','Fethiye','Kavaklıdere','Köyceğiz','Marmaris','Menteşe','Milas','Ortaca','Seydikemer','Ula','Yatağan'],
  'Muş': ['Bulanık','Hasköy','Korkut','Malazgirt','Merkez','Varto'],
  'Nevşehir': ['Acıgöl','Avanos','Derinkuyu','Gülşehir','Hacıbektaş','Kozaklı','Merkez','Ürgüp'],
  'Niğde': ['Altunhisar','Bor','Çamardı','Çiftlik','Merkez','Ulukışla'],
  'Ordu': ['Akkuş','Altınordu','Aybastı','Çamaş','Çatalpınar','Çaybaşı','Fatsa','Gölköy','Gülyalı','Gürgentepe','İkizce','Kabadüz','Kabataş','Korgan','Kumru','Mesudiye','Perşembe','Ulubey','Ünye'],
  'Osmaniye': ['Bahçe','Düziçi','Hasanbeyli','Kadirli','Merkez','Sumbas','Toprakkale'],
  'Rize': ['Ardeşen','Çamlıhemşin','Çayeli','Derepazarı','Fındıklı','Güneysu','Hemşin','İkizdere','İyidere','Kalkandere','Merkez','Pazar'],
  'Sakarya': ['Adapazarı','Akyazı','Arifiye','Erenler','Ferizli','Geyve','Hendek','Karapürçek','Karasu','Kaynarca','Kocaali','Mithatpaşa','Pamukova','Sapanca','Serdivan','Söğütlü','Taraklı'],
  'Samsun': ['Alaçam','Asarcık','Atakum','Ayvacık','Bafra','Canik','Çarşamba','Havza','İlkadım','Kavak','Ladik','Ondokuzmayıs','Salıpazarı','Tekkeköy','Terme','Vezirköprü','Yakakent'],
  'Siirt': ['Baykan','Eruh','Kurtalan','Merkez','Pervari','Şirvan','Tillo'],
  'Sinop': ['Ayancık','Boyabat','Dikmen','Durağan','Erfelek','Gerze','Merkez','Saraydüzü','Türkeli'],
  'Sivas': ['Akıncılar','Altınyayla','Divriği','Doğanşar','Gemerek','Gölova','Gürün','Hafik','İmranlı','Kangal','Koyulhisar','Merkez','Suşehri','Şarkışla','Ulaş','Yıldızeli','Zara'],
  'Şanlıurfa': ['Akçakale','Birecik','Bozova','Ceylanpınar','Eyyübiye','Halfeti','Haliliye','Harran','Hilvan','Karaköprü','Siverek','Suruç','Viranşehir'],
  'Şırnak': ['Beytüşşebap','Cizre','Güçlükonak','İdil','Merkez','Silopi','Uludere'],
  'Tekirdağ': ['Çerkezköy','Çorlu','Ergene','Hayrabolu','Kapaklı','Malkara','Marmara Ereğlisi','Muratlı','Saray','Süleymanpaşa','Şarköy'],
  'Tokat': ['Almus','Artova','Başçiftlik','Erbaa','Merkez','Niksar','Pazar','Reşadiye','Sulusaray','Turhal','Yeşilyurt','Zile'],
  'Trabzon': ['Akçaabat','Araklı','Arsin','Beşikdüzü','Çarşıbaşı','Çaykara','Dernekpazarı','Düzköy','Hayrat','Köprübaşı','Maçka','Of','Ortahisar','Sürmene','Şalpazarı','Tonya','Vakfıkebir','Yomra'],
  'Tunceli': ['Çemişgezek','Hozat','Mazgirt','Merkez','Nazımiye','Ovacık','Pertek','Pülümür'],
  'Uşak': ['Banaz','Eşme','Karahallı','Merkez','Sivaslı','Ulubey'],
  'Van': ['Bahçesaray','Başkale','Çaldıran','Çatak','Edremit','Erciş','Gevaş','Gürpınar','İpekyolu','Merkez','Muradiye','Özalp','Saray','Tuşba'],
  'Yalova': ['Altınova','Armutlu','Çınarcık','Çiftlikköy','Merkez','Termal'],
  'Yozgat': ['Akdağmadeni','Aydıncık','Boğazlıyan','Çandır','Çayıralan','Çekerek','Kadışehri','Merkez','Saraykent','Sarıkaya','Şefaatli','Sorgun','Yenifakılı','Yerköy'],
  'Zonguldak': ['Alaplı','Çaycuma','Devrek','Ereğli','Gökçebey','Kilimli','Kozlu','Merkez'],
};
const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const durations = [30, 45, 50, 60, 90];

/* ── Takvim yardımcıları ─────────────────────────────── */
const trMonths = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const trDaysFull = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

function getCalDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Pazartesi=0
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateTr(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${trMonths[m - 1]} ${trDaysFull[date.getDay()]}`;
}

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState('kisisel');
  const [showToast, setShowToast] = useState(false);

  // Kişisel bilgiler state
  const [formData, setFormData] = useState({
    adSoyad: '',
    unvan: '',
    sehir: '',
    ilce: '',
    telefon: '',
    email: '',
    diller: ['Türkçe'],
  });

  // Uzmanlık state
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedApproaches, setSelectedApproaches] = useState([]);

  // Takvim state
  const [availableDays, setAvailableDays] = useState([]);
  const [dayHours, setDayHours] = useState({});
  const allHours = ['00:00','00:30','01:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

  // Takvim gezinme state'i
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [expandedDate, setExpandedDate] = useState(null);

  // Bugünün geçmiş saatlerini hesapla — terapist geçmiş saate müsait olamasın.
  // TR saat dilimi için toISOString değil getFullYear/Month/Date kullanıyoruz.
  const _pNow = new Date();
  const _pToday = new Date(_pNow); _pToday.setHours(0,0,0,0);
  const profTodayStr = `${_pToday.getFullYear()}-${String(_pToday.getMonth()+1).padStart(2,'0')}-${String(_pToday.getDate()).padStart(2,'0')}`;
  const profNowMinutes = _pNow.getHours() * 60 + _pNow.getMinutes();
  const isPastProfSlot = (day, hour) => {
    if (!day || !hour || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    if (day > profTodayStr) return false;
    if (day < profTodayStr) return true;
    const [hh, mm] = String(hour).split(':').map(Number);
    return hh * 60 + mm <= profNowMinutes;
  };

  const toggleHour = (day, hour) => {
    if (isPastProfSlot(day, hour)) return; // geçmiş saat eklenemez
    setDayHours(prev => {
      const current = prev[day] || [];
      return {
        ...prev,
        [day]: current.includes(hour)
          ? current.filter(h => h !== hour)
          : [...current, hour].sort(),
      };
    });
  };

  const toggleDate = (ds) => {
    const willSelect = !availableDays.includes(ds);
    setAvailableDays(prev => willSelect ? [...prev, ds] : prev.filter(d => d !== ds));
    if (willSelect) setExpandedDate(ds);
    else setExpandedDate(prev => prev === ds ? null : prev);
  };

  const prevCalMonth = () => {
    setCalMonth(m => {
      if (m === 0) { setCalYear(y => y - 1); return 11; }
      return m - 1;
    });
  };

  const nextCalMonth = () => {
    setCalMonth(m => {
      if (m === 11) { setCalYear(y => y + 1); return 0; }
      return m + 1;
    });
  };

  const [price, setPrice] = useState(1800);
  const [duration, setDuration] = useState(50);
  const [isOnline, setIsOnline] = useState(true);
  const [isFaceToFace, setIsFaceToFace] = useState(true);

  // Hakkında state
  const [about, setAbout] = useState('');
  const [education, setEducation] = useState('');

  const toggleCheckbox = (list, setList, val) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const [savedData, setSavedData] = useState({
    adSoyad: '',
    unvan: '',
    sehir: '',
    ilce: '',
  });
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [initials, setInitials] = useState('NC');
  const photoInputRef = useRef(null);

  // Galeri & Video state
  const [galleryPhotos, setGalleryPhotos] = useState([]); // max 6, base64
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const galleryInputRef = useRef(null);

  // Video yükleme state
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoIsUploading, setVideoIsUploading] = useState(false);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const videoFileInputRef = useRef(null);
  const videoXhrRef = useRef(null);

  useEffect(() => {
    const id = localStorage.getItem('panel_therapist_id');
    if (!id) return;
    const t = therapists.find((t) => t.id === id);

    const applyData = (source, savedForm) => {
      const cleanName = stripPrefix(source.name || '');
      const initials = (source.name || '').split(' ').filter(w => /^[A-ZÇĞİÖŞÜa-zçğışöşü]/.test(w)).map(w => w[0].toUpperCase()).slice(0, 2).join('');
      setInitials(initials || 'TP');

      const defaultForm = {
        adSoyad: cleanName,
        unvan: source.title || '',
        sehir: source.city || '',
        ilce: source.district || '',
        email: source.email || '',
        telefon: source.phone || '',
        diller: ['Türkçe'],
      };
      const defaultSaved = { adSoyad: cleanName, unvan: source.title || '', sehir: source.city || '', ilce: source.district || '' };

      const stored = savedForm || localStorage.getItem(`panel_profil_${id}`);
      if (stored) {
        try {
          const s = JSON.parse(stored);
          if (s.formData) {
            setFormData({ ...defaultForm, ...s.formData });
            setSavedData({
              adSoyad: s.formData.adSoyad ?? defaultSaved.adSoyad,
              unvan: s.formData.unvan ?? defaultSaved.unvan,
              sehir: s.formData.sehir ?? defaultSaved.sehir,
              ilce: s.formData.ilce ?? defaultSaved.ilce,
            });
          } else {
            setFormData(defaultForm);
            setSavedData(defaultSaved);
          }
          if (s.about !== undefined) setAbout(s.about);
          else if (source.about) setAbout(source.about);
          if (s.education !== undefined) setEducation(s.education);
          else if (source.education) setEducation(source.education);
          if (s.price !== undefined) setPrice(s.price);
          else if (source.price) setPrice(source.price);
          if (s.duration !== undefined) setDuration(s.duration);
          if (s.isOnline !== undefined) setIsOnline(s.isOnline);
          else if (source.online !== undefined) setIsOnline(source.online);
          if (s.isFaceToFace !== undefined) setIsFaceToFace(s.isFaceToFace);
          else if (source.in_person !== undefined) setIsFaceToFace(source.in_person);
          else if (source.inPerson !== undefined) setIsFaceToFace(source.inPerson);
          if (s.availableDays !== undefined) setAvailableDays(s.availableDays);
          if (s.dayHours !== undefined) setDayHours(s.dayHours);
          if (s.selectedSpecialties !== undefined) setSelectedSpecialties(s.selectedSpecialties);
          else if (source.specialties?.length) setSelectedSpecialties(source.specialties.filter(sp => specialties.includes(sp)));
          if (s.selectedApproaches !== undefined) setSelectedApproaches(s.selectedApproaches);
          else if (source.approaches?.length) setSelectedApproaches(source.approaches.filter(ap => approaches.includes(ap)));
          if (s.savedAt) setLastSavedAt(new Date(s.savedAt));
          if (s.photoPreview) setPhotoPreview(s.photoPreview);
          if (s.galleryPhotos) setGalleryPhotos(s.galleryPhotos);
          if (s.introVideoUrl !== undefined) setIntroVideoUrl(s.introVideoUrl);
        } catch {
          setFormData(defaultForm);
          setSavedData(defaultSaved);
          if (source.about) setAbout(source.about);
          if (source.education) setEducation(source.education);
          if (source.price) setPrice(source.price);
          if (source.online !== undefined) setIsOnline(source.online);
          if (source.in_person !== undefined) setIsFaceToFace(source.in_person);
          if (source.specialties?.length) setSelectedSpecialties(source.specialties.filter(sp => specialties.includes(sp)));
          if (source.approaches?.length) setSelectedApproaches(source.approaches.filter(ap => approaches.includes(ap)));
        }
      } else {
        setFormData(defaultForm);
        setSavedData(defaultSaved);
        if (source.about) setAbout(source.about);
        if (source.education) setEducation(source.education);
        if (source.price) setPrice(source.price);
        if (source.online !== undefined) setIsOnline(source.online);
        if (source.in_person !== undefined) setIsFaceToFace(source.in_person);
        if (source.specialties?.length) setSelectedSpecialties(source.specialties.filter(sp => specialties.includes(sp)));
        if (source.approaches?.length) setSelectedApproaches(source.approaches.filter(ap => approaches.includes(ap)));
      }
    };

    // Supabase'den profil verisini çek (therapist_profiles)
    fetch(`/api/panel/profil?id=${id}`)
      .then((r) => r.json())
      .then((db) => {
        if (db && db.panel_id) {
          if (db.available_days?.length) setAvailableDays(db.available_days);
          if (db.day_hours && Object.keys(db.day_hours).length) setDayHours(db.day_hours);
          if (db.price) setPrice(db.price);
          if (db.duration) setDuration(db.duration);
          if (db.is_online !== undefined) setIsOnline(db.is_online);
          if (db.is_face_to_face !== undefined) setIsFaceToFace(db.is_face_to_face);
          if (db.about) setAbout(db.about);
          if (db.education) setEducation(db.education);
          if (db.photo_url) setPhotoPreview(db.photo_url);
          if (db.gallery_photos?.length) setGalleryPhotos(db.gallery_photos);
          if (db.intro_video_url) setIntroVideoUrl(db.intro_video_url);
        }
      })
      .catch(() => {});

    if (t) {
      // Statik terapist
      applyData({ ...t, email: `${t.initials.toLowerCase()}@terapistbul.com` }, null);
    } else {
      // UUID tabanlı terapist — Supabase'den çek
      fetch(`/api/terapistler-db/${id}`)
        .then((r) => r.json())
        .then((db) => { if (db && db.name) applyData(db, null); })
        .catch(() => {});
      return; // localStorage check yapılacak ama defaultForm yok henüz
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const resizeImage = (file, maxW = 900) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const scale = img.width > maxW ? maxW / img.width : 1;
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Profil fotoğrafını 400px'e küçült, JPEG %85 — ~20-40KB olur
    const resized = await resizeImage(file, 400);
    setPhotoPreview(resized);
  };

  const handleSave = () => {
    const now = new Date();
    const id = localStorage.getItem('panel_therapist_id');
    if (!id) return;
    const payload = {
      formData,
      about,
      education,
      price,
      duration,
      isOnline,
      isFaceToFace,
      availableDays,
      dayHours,
      selectedSpecialties,
      selectedApproaches,
      introVideoUrl,
      savedAt: now.toISOString(),
    };
    // Profil fotoğrafını kaydet (resize edildiği için küçük)
    if (photoPreview) {
      payload.photoPreview = photoPreview;
    }
    // Galeri fotoğraflarını kaydet
    if (galleryPhotos.length > 0) {
      payload.galleryPhotos = galleryPhotos;
    }

    // Supabase'e kaydet (tüm cihazlarda görünsün)
    fetch('/api/panel/profil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        panel_id: id,
        name: formData.adSoyad,
        title: formData.unvan,
        city: formData.sehir,
        specialties: selectedSpecialties,
        approaches: selectedApproaches,
        available_days: availableDays,
        day_hours: dayHours,
        price,
        duration,
        is_online: isOnline,
        is_face_to_face: isFaceToFace,
        about,
        education,
        gallery_photos: galleryPhotos,
        intro_video_url: introVideoUrl || null,
        photo_url: photoPreview || null,
      }),
    }).catch(() => {});
    try {
      localStorage.setItem(`panel_profil_${id}`, JSON.stringify(payload));
    } catch {
      // Profil fotoğrafını çıkar, tekrar dene
      delete payload.photoPreview;
      try {
        localStorage.setItem(`panel_profil_${id}`, JSON.stringify(payload));
      } catch {
        // Galeri fotoğraflarını da çıkar, tekrar dene
        delete payload.galleryPhotos;
        try {
          localStorage.setItem(`panel_profil_${id}`, JSON.stringify(payload));
        } catch {
          return;
        }
      }
    }
    setSavedData({
      adSoyad: formData.adSoyad,
      unvan: formData.unvan,
      sehir: formData.sehir,
      ilce: formData.ilce,
    });
    setLastSavedAt(now);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const tabs = [
    { id: 'kisisel', label: 'Kişisel Bilgiler' },
    { id: 'uzmanlik', label: 'Uzmanlık & Yaklaşımlar' },
    { id: 'takvim', label: 'Takvim & Fiyat' },
    { id: 'hakkinda', label: 'Hakkında' },
    { id: 'medya', label: 'Galeri & Video' },
  ];

  const handleGalleryAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 6 - galleryPhotos.length;
    const toProcess = files.slice(0, remaining);
    const resized = await Promise.all(toProcess.map((f) => resizeImage(f)));
    setGalleryPhotos((prev) => {
      const combined = [...prev, ...resized];
      return combined.slice(0, 6);
    });
    e.target.value = '';
  };

  const handleGalleryRemove = (idx) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Lütfen bir video dosyası seçin.');
      return;
    }

    const panelId = localStorage.getItem('panel_therapist_id') || 'unknown';

    setVideoIsUploading(true);
    setVideoUploadProgress(0);

    // 1. Sunucudan imzalı yükleme URL'i al
    let signedUrl, publicUrl;
    try {
      const res = await fetch('/api/panel/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel_id: panelId, filename: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVideoIsUploading(false);
        alert(data.error || 'Yükleme başarısız oldu.');
        return;
      }
      signedUrl = data.signedUrl;
      publicUrl = data.publicUrl;
    } catch {
      setVideoIsUploading(false);
      alert('Sunucuya bağlanılamadı.');
      return;
    }

    // 2. Doğrudan Supabase Storage'a yükle (boyut sınırı yok)
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      videoXhrRef.current = null;
      setVideoIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setIntroVideoUrl(publicUrl);
      } else {
        alert('Yükleme başarısız oldu. Lütfen tekrar deneyin.');
      }
    });
    xhr.addEventListener('error', () => {
      videoXhrRef.current = null;
      setVideoIsUploading(false);
      alert('Yükleme sırasında bir hata oluştu.');
    });
    xhr.addEventListener('abort', () => {
      videoXhrRef.current = null;
      setVideoIsUploading(false);
      setVideoUploadProgress(0);
    });
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    videoXhrRef.current = xhr;
    xhr.send(file);
  };

  const handleVideoCancelUpload = () => {
    if (videoXhrRef.current) {
      videoXhrRef.current.abort();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profil başarıyla kaydedildi!
        </div>
      )}

      {/* Photo upload + action buttons */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profil"
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {initials}
              </div>
            )}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{savedData.unvan} {savedData.adSoyad}</h2>
            <p className="text-slate-500 text-sm">{savedData.unvan} • {savedData.sehir}, {savedData.ilce}</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => photoInputRef.current?.click()}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
                Fotoğraf Değiştir
              </button>
              {photoPreview && (
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="text-sm text-red-400 hover:text-red-500 font-medium hover:underline"
                >
                  Kaldır
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <Link
              href="/terapist/13"
              className="px-4 py-2 border border-teal-200 text-teal-600 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
            >
              Önizleme
            </Link>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Kişisel Bilgiler */}
          {activeTab === 'kisisel' && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { label: 'Ad Soyad', key: 'adSoyad', type: 'text' },
                  { label: 'Unvan', key: 'unvan', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Şehir</label>
                  <select
                    value={formData.sehir}
                    onChange={(e) => setFormData({ ...formData, sehir: e.target.value, ilce: '' })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                  >
                    <option value="">Şehir seçin</option>
                    {Object.keys(sehirIlceler).sort().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">İlçe</label>
                  <select
                    value={formData.ilce}
                    onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                    disabled={!formData.sehir}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{formData.sehir ? 'İlçe seçin' : 'Önce şehir seçin'}</option>
                    {(sehirIlceler[formData.sehir] || []).map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                {[
                  { label: 'Telefon', key: 'telefon', type: 'tel' },
                  { label: 'E-posta', key: 'email', type: 'email' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Uzmanlık */}
          {activeTab === 'uzmanlik' && (
            <div className="space-y-7">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Uzmanlık Alanları</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {specialties.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                        selectedSpecialties.includes(s)
                          ? 'bg-teal-50 border-teal-200 text-teal-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(s)}
                        onChange={() => toggleCheckbox(selectedSpecialties, setSelectedSpecialties, s)}
                        className="w-4 h-4 accent-teal-600 flex-shrink-0"
                      />
                      <span className="leading-snug">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Terapötik Yaklaşımlar</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {approaches.map((a) => (
                    <label
                      key={a}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                        selectedApproaches.includes(a)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedApproaches.includes(a)}
                        onChange={() => toggleCheckbox(selectedApproaches, setSelectedApproaches, a)}
                        className="w-4 h-4 accent-blue-600 flex-shrink-0"
                      />
                      <span className="leading-snug">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Takvim & Fiyat */}
          {activeTab === 'takvim' && (
            <div className="space-y-7">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Müsait Günler & Saatler</h4>

                {/* ── Aylık Takvim ── */}
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm max-w-xs">
                  {/* Ay / Yıl başlığı */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={prevCalMonth}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <span className="text-xs font-bold text-slate-700">{trMonths[calMonth]} {calYear}</span>
                    <button
                      type="button"
                      onClick={nextCalMonth}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-200 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Gün başlıkları */}
                  <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
                    {['Pt','Sa','Ça','Pe','Cu','Ct','Pa'].map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                    ))}
                  </div>

                  {/* Takvim ızgarası */}
                  <div className="grid grid-cols-7 p-1 gap-0.5">
                    {getCalDays(calYear, calMonth).map((day, i) => {
                      if (!day) return <div key={`e-${i}`} />;
                      const ds = toDateStr(calYear, calMonth, day);
                      const cellDate = new Date(calYear, calMonth, day);
                      const calToday = new Date(); calToday.setHours(0,0,0,0);
                      const isPast = cellDate < calToday;
                      const isToday = cellDate.getTime() === calToday.getTime();
                      const isSelected = availableDays.includes(ds);
                      return (
                        <button
                          key={ds}
                          type="button"
                          disabled={isPast}
                          onClick={() => toggleDate(ds)}
                          className={[
                            'aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                            isPast ? 'text-slate-200 cursor-not-allowed' : '',
                            isSelected ? 'bg-teal-600 text-white shadow-sm' : '',
                            isToday && !isSelected ? 'ring-2 ring-teal-400 text-teal-700 font-bold' : '',
                            !isPast && !isSelected ? 'hover:bg-teal-50 hover:text-teal-700 text-slate-700' : '',
                          ].join(' ')}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seçili tarihler — saat belirleme */}
                {availableDays.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      {availableDays.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).length} gün seçildi — saatleri belirleyin:
                    </p>
                    {[...availableDays.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))].sort().map(ds => {
                      const isExpanded = expandedDate === ds;
                      return (
                        <div key={ds} className={`rounded-2xl border transition-all ${isExpanded ? 'border-teal-200 bg-teal-50/40' : 'border-slate-100 bg-slate-50'}`}>
                          <div className="flex items-center justify-between px-4 py-2.5">
                            <button
                              type="button"
                              onClick={() => setExpandedDate(isExpanded ? null : ds)}
                              className="flex-1 text-left flex items-center gap-2"
                            >
                              <span className="text-sm font-semibold text-teal-700">{formatDateTr(ds)}</span>
                              {(dayHours[ds] || []).length > 0 && (
                                <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">
                                  {(dayHours[ds] || []).length} saat
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleDate(ds)}
                              title="Günü kaldır"
                              className="ml-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-3">
                              <p className="text-xs text-slate-400 mb-2">Müsait saatleri seçin:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {allHours.map(hour => {
                                  const selected = (dayHours[ds] || []).includes(hour);
                                  const past = isPastProfSlot(ds, hour);
                                  return (
                                    <button
                                      key={hour}
                                      type="button"
                                      disabled={past}
                                      onClick={() => toggleHour(ds, hour)}
                                      title={past ? 'Geçmiş saat' : undefined}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                        past
                                          ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                                          : selected
                                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                          : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                                      }`}
                                    >
                                      {hour}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">
                  Seans Ücreti: <span className="text-teal-600">₺{price.toLocaleString('tr-TR')}</span>
                </h4>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-slate-400">₺1.000</span>
                  <input
                    type="range"
                    min={1000}
                    max={6000}
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="flex-1 accent-teal-600 h-2"
                  />
                  <span className="text-xs text-slate-400">₺6.000</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Seans Süresi</h4>
                <div className="flex gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        duration === d
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {d} dk
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Seans Türleri</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Online Seans', value: isOnline, setter: setIsOnline },
                    { label: 'Yüz Yüze Seans', value: isFaceToFace, setter: setIsFaceToFace },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      <button
                        onClick={() => item.setter(!item.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-teal-600' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hakkında */}
          {activeTab === 'hakkinda' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hakkımda Metni
                  <span className="text-slate-400 font-normal ml-2">({about.length}/1000 karakter)</span>
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  maxLength={1000}
                  rows={6}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Eğitim & Sertifikalar</label>
                <textarea
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Galeri & Video */}
          {activeTab === 'medya' && (
            <div className="space-y-8">

              {/* Galeri */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Fotoğraf Galerisi</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Muayenehaneniz veya çalışma ortamınızdan fotoğraflar ekleyin (en fazla 6)</p>
                  </div>
                  {galleryPhotos.length < 6 && (
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-medium hover:bg-teal-700 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Fotoğraf Ekle
                    </button>
                  )}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryAdd}
                  />
                </div>

                {galleryPhotos.length === 0 ? (
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center transition-colors">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-500 group-hover:text-teal-600">Fotoğraf yüklemek için tıklayın</p>
                      <p className="text-xs text-slate-400 mt-0.5">JPG, PNG · En fazla 6 fotoğraf</p>
                    </div>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryPhotos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleGalleryRemove(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium">{i + 1} / {galleryPhotos.length}</p>
                        </div>
                      </div>
                    ))}
                    {galleryPhotos.length < 6 && (
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span className="text-xs text-slate-400 group-hover:text-teal-600">Ekle</span>
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">{galleryPhotos.length}/6 fotoğraf yüklendi</p>
              </div>

              {/* Tanıtım Videosu */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">Tanıtım Videosu</h4>
                <p className="text-xs text-slate-400 mb-3">Danışanlarınızın sizi daha iyi tanıyabilmesi için kısa bir tanıtım videosu yükleyin.</p>

                {introVideoUrl ? (
                  /* ── 3. Tamamlandı: Video Player ── */
                  <div>
                    <div
                      className="relative rounded-xl overflow-hidden bg-slate-900 group"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <video
                        src={introVideoUrl}
                        controls
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-end justify-start p-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-xs text-teal-700 font-medium flex-1">Video yüklendi ve profilinizde gösterilecek.</span>
                      <button
                        type="button"
                        onClick={() => setIntroVideoUrl('')}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Kaldır
                      </button>
                    </div>
                  </div>
                ) : videoIsUploading ? (
                  /* ── 2. Yükleniyor: Progress Bar ── */
                  <div className="rounded-xl border-2 border-teal-200 bg-teal-50/40 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">Yükleniyor...</p>
                        <p className="text-xs text-slate-400 mt-0.5">Lütfen sayfadan ayrılmayın</p>
                      </div>
                      <span className="text-lg font-bold text-teal-600">{videoUploadProgress}%</span>
                      <button
                        type="button"
                        onClick={handleVideoCancelUpload}
                        className="ml-2 text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 flex-shrink-0"
                        title="Yüklemeyi durdur"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                        Durdur
                      </button>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  /* ── 1. Boş: Drag & Drop Zone ── */
                  <>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/*"
                      className="hidden"
                      onChange={(e) => handleVideoUpload(e.target.files?.[0])}
                    />
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        setVideoDragOver(false);
                        handleVideoUpload(e.dataTransfer.files?.[0]);
                      }}
                      onDragOver={(e) => { e.preventDefault(); setVideoDragOver(true); }}
                      onDragLeave={() => setVideoDragOver(false)}
                      onClick={() => videoFileInputRef.current?.click()}
                      className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none ${
                        videoDragOver
                          ? 'border-teal-500 bg-teal-50 scale-[1.01]'
                          : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50/30'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Videoyu buraya sürükleyin</p>
                      <p className="text-xs text-slate-400 mb-4">ya da tıklayarak dosya seçin</p>
                      <span className="inline-block bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors">
                        Dosya Seç
                      </span>
                      <p className="text-xs text-slate-300 mt-4">Maksimum 50MB · MP4 formatında</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 flex items-center justify-between pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              {lastSavedAt
                ? `Son güncelleme: ${lastSavedAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} ${lastSavedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Henüz kaydedilmedi'}
            </p>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

