import { LanguageOption } from '../types';

export interface LanguageCategory {
  id: 'all' | 'indian' | 'popular' | 'world';
  label: string;
  count: number;
}

export const ALL_LANGUAGES_CATALOG: LanguageOption[] = [
  // ================= 1. ALL 22 OFFICIAL INDIAN SCHEDULED LANGUAGES + NEPALI =================
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India (National)', isIndian: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', region: 'Nepal & India (Sikkim/WB)', isIndian: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'West Bengal & Tripura', isIndian: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Andhra Pradesh & Telangana', isIndian: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Maharashtra & Goa', isIndian: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu & Puducherry', isIndian: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', region: 'India & South Asia', isIndian: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Gujarat', isIndian: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka', isIndian: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Kerala & Lakshadweep', isIndian: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', region: 'Odisha', isIndian: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Punjab & Delhi', isIndian: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', region: 'Assam', isIndian: true },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳', region: 'Bihar & Mithila', isIndian: true },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳', region: 'Jharkhand, Odisha & WB', isIndian: true },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / كٲشُر', flag: '🇮🇳', region: 'Jammu & Kashmir', isIndian: true },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', flag: '🇮🇳', region: 'India', isIndian: true },
  { code: 'dgo', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳', region: 'Jammu & Kashmir', isIndian: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳', region: 'Goa & Konkan Coast', isIndian: true },
  { code: 'brx', name: 'Bodo', nativeName: 'बर\'', flag: '🇮🇳', region: 'Assam & Bodoland', isIndian: true },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳', region: 'Classical India', isIndian: true },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', flag: '🇮🇳', region: 'Manipur', isIndian: true },

  // ================= 2. POPULAR INDIAN REGIONAL LANGUAGES & DIALECTS =================
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳', region: 'Bihar & UP', isIndian: true },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', flag: '🇮🇳', region: 'Rajasthan', isIndian: true },
  { code: 'mwr', name: 'Marwari', nativeName: 'मारवाड़ी', flag: '🇮🇳', region: 'Rajasthan & Gujarat', isIndian: true },
  { code: 'bgc', name: 'Haryanvi', nativeName: 'हरियाणवी', flag: '🇮🇳', region: 'Haryana & Delhi NCR', isIndian: true },
  { code: 'hne', name: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी', flag: '🇮🇳', region: 'Chhattisgarh', isIndian: true },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', flag: '🇮🇳', region: 'Bihar & Jharkhand', isIndian: true },
  { code: 'tcy', name: 'Tulu', nativeName: 'ತುಳು', flag: '🇮🇳', region: 'Karnataka & Kerala Coast', isIndian: true },
  { code: 'kfa', name: 'Kodava', nativeName: 'ಕೊಡವ ತಕ್ಕ್', flag: '🇮🇳', region: 'Coorg / Kodagu', isIndian: true },
  { code: 'gbm', name: 'Garhwali', nativeName: 'गढ़वाली', flag: '🇮🇳', region: 'Uttarakhand', isIndian: true },
  { code: 'kfy', name: 'Kumaoni', nativeName: 'कुमाऊँनी', flag: '🇮🇳', region: 'Uttarakhand', isIndian: true },
  { code: 'lbj', name: 'Ladakhi', nativeName: 'ལ་དྭགས་སྐད', flag: '🇮🇳', region: 'Ladakh', isIndian: true },

  // ================= 3. POPULAR GLOBAL & WORLD LANGUAGES (100+ TOTAL) =================
  { code: 'en', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸', region: 'North America / Global' },
  { code: 'en-gb', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧', region: 'United Kingdom / Europe' },
  { code: 'en-in', name: 'English (India)', nativeName: 'English (India)', flag: '🇮🇳', region: 'India / South Asia', isIndian: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain & Latin America' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France, Canada & Africa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany, Austria & Switzerland' },
  { code: 'zh', name: 'Mandarin Chinese (Simplified)', nativeName: '中文 (简体)', flag: '🇨🇳', region: 'China & Singapore' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', flag: '🇹🇼', region: 'Taiwan & Hong Kong' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & North Africa' },
  { code: 'pt', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', region: 'Brazil & Portugal' },
  { code: 'pt-pt', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹', region: 'Portugal & Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Eastern Europe & Eurasia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Italy & Switzerland' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Turkey & Cyprus' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Thailand' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Netherlands & Belgium' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Poland' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Sweden & Finland' },
  { code: 'tl', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino', flag: '🇵🇭', region: 'Philippines' },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', flag: '🇮🇷', region: 'Iran & Central Asia' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Ukraine' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Greece & Cyprus' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Israel' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Czech Republic' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', region: 'Romania & Moldova' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', region: 'Hungary' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Denmark' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Finland' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Norway' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Malaysia & Brunei' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', flag: '🇲🇲', region: 'Myanmar' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', region: 'Cambodia' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', region: 'Sri Lanka' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿', region: 'Uzbekistan' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿', region: 'Kazakhstan' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan dili', flag: '🇦🇿', region: 'Azerbaijan' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', region: 'Georgia' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', region: 'Armenia' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол хэл', flag: '🇲🇳', region: 'Mongolia' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', region: 'Serbia & Balkans' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', region: 'Croatia' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', region: 'Bulgaria' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', region: 'Slovakia' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', region: 'Lithuania' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', region: 'Latvia' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', region: 'Estonia' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', region: 'Slovenia' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', region: 'Albania & Kosovo' },
  { code: 'ga', name: 'Irish (Gaeilge)', nativeName: 'Gaeilge', flag: '🇮🇪', region: 'Ireland' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', region: 'Iceland' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹', region: 'Malta' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸', region: 'Basque Country' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇦🇩', region: 'Catalonia & Andorra' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸', region: 'Galicia' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', region: 'Wales' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', region: 'South Africa & Namibia' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', region: 'South Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', region: 'South Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'Ethiopia' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬', region: 'Nigeria & West Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Ásụ̀sụ́ Ìgbò', flag: '🇳🇬', region: 'Nigeria' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬', region: 'West & Central Africa' },
  { code: 'so', name: 'Somali', nativeName: 'Af Soomaali', flag: '🇸🇴', region: 'Somalia & Horn of Africa' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', flag: '🇮🇩', region: 'Java, Indonesia' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', flag: '🇮🇩', region: 'Western Java' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Bisaya / Sinugboanon', flag: '🇵🇭', region: 'Philippines' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Fiteny Malagasy', flag: '🇲🇬', region: 'Madagascar' },
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', flag: '🌐', region: 'International Auxiliary' },
  { code: 'la', name: 'Latin', nativeName: 'Latina', flag: '🏛️', region: 'Classical & Scholarly' },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', flag: '🇧🇹', region: 'Bhutan & Himalayas' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', region: 'Afghanistan & Pakistan' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî / کوردی', flag: '☀️', region: 'Middle East' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', flag: '🇧🇾', region: 'Belarus' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', region: 'North Macedonia' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', flag: '🇧🇦', region: 'Bosnia & Herzegovina' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', flag: '🇱🇺', region: 'Luxembourg' },
  { code: 'fo', name: 'Faroese', nativeName: 'Føroyskt', flag: '🇫🇴', region: 'Faroe Islands' },
  { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'Scotland' },
  { code: 'br', name: 'Breton', nativeName: 'Brezhoneg', flag: '🇫🇷', region: 'Brittany, France' },
  { code: 'oc', name: 'Occitan', nativeName: 'Occitan', flag: '🇫🇷', region: 'Southern France' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu', flag: '🇫🇷', region: 'Corsica' },
  { code: 'fy', name: 'Western Frisian', nativeName: 'Frysk', flag: '🇳🇱', region: 'Netherlands' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', flag: '✡️', region: 'Global Jewish Diaspora' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯', region: 'Tajikistan' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', flag: '🇰🇬', region: 'Kyrgyzstan' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', flag: '🇹🇲', region: 'Turkmenistan' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татар теле', flag: '🇷🇺', region: 'Tatarstan & Russia' },
  { code: 'ba', name: 'Bashkir', nativeName: 'Башҡорт теле', flag: '🇷🇺', region: 'Bashkortostan' },
  { code: 'cv', name: 'Chuvash', nativeName: 'Чӑвашла', flag: '🇷🇺', region: 'Chuvashia' },
  { code: 'mo', name: 'Moldavian', nativeName: 'Moldovenească', flag: '🇲🇩', region: 'Moldova' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: '🇱🇦', region: 'Laos' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', flag: '🌺', region: 'Hawaii, USA' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', flag: '🇳🇿', region: 'New Zealand' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', flag: '🇼🇸', region: 'Samoa & Polynesia' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea Faka-Tonga', flag: '🇹🇴', region: 'Tonga' },
  { code: 'fj', name: 'Fijian', nativeName: 'Na Vosa Vakaviti', flag: '🇫🇯', region: 'Fiji' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', flag: '🇿🇼', region: 'Zimbabwe' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', flag: '🇱🇸', region: 'Lesotho & South Africa' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇧🇼', region: 'Botswana & South Africa' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', region: 'Rwanda' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', flag: '🇧🇮', region: 'Burundi' },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', flag: '🇺🇬', region: 'Uganda' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', flag: '🇲🇼', region: 'Malawi & Zambia' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', flag: '🇸🇳', region: 'Senegal & Gambia' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', flag: '🇲🇱', region: 'Mali' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷', region: 'Eritrea & Ethiopia' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹', region: 'Ethiopia & Kenya' },
];

/**
 * Filter helpers for Languages UI
 */
export function getIndianLanguages(): LanguageOption[] {
  return ALL_LANGUAGES_CATALOG.filter((l) => l.isIndian || l.code === 'ne');
}

export function getPopularLanguages(): LanguageOption[] {
  const topCodes = ['en', 'hi', 'ne', 'mai', 'bho', 'pa', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'ru', 'pt'];
  return ALL_LANGUAGES_CATALOG.filter((l) => topCodes.includes(l.code));
}

export function searchLanguages(query: string): LanguageOption[] {
  if (!query || !query.trim()) return ALL_LANGUAGES_CATALOG;
  const q = query.toLowerCase().trim();
  return ALL_LANGUAGES_CATALOG.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      (l.region && l.region.toLowerCase().includes(q))
  );
}
