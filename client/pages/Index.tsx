import { useEffect, useState } from "react";

type Language = "uz" | "ru";

const translations = {
  uz: {
    title: "Eng Ishonchli Bukmeker Havolalari - Bir Joyda",
    subtitle: "LinkZone Orqali Rasmiy Platformalarga Xavfsiz Kirish.",
    enter: "KIRISH",
    whyTitle: "NEGA LINKZONE?",
    feature1: "Rasmiy Havolalar",
    feature2: "Har Kun Yangilanish",
    feature3: "Mobil Telefon uchun Mos Interfeys",
    officialLinks: "Rasmiy havolalar",
    dailyUpdate: "Har kun yangilanish",
    mobileText: "Mobil telefon uchun mos",
    interfaceText: "Interfeys",
    disclaimer: "Disklamer",
    disclaimerText: "EST 2025 LINKZONE Barcha huquqlar himoyalangan. Bu Sayt Axborot Yunaltirish Maqsadida Ishlaydi. Bu Sayt Hech kimni Qimor O`yinlariga Davat Qilmaydi !",
    copyright: "© 2025. LNKZone. Barcha huquqlar himoya qilingan jcl-ota.jch-ota.gov",
  },
  ru: {
    title: "Самые Надежные Ссылки Букмекеров - В Одном Месте",
    subtitle: "Безопасный Доступ к Официальным Платформам Через LinkZone.",
    enter: "ВОЙТИ",
    whyTitle: "ПОЧЕМУ LINKZONE?",
    feature1: "Официальные Ссылки",
    feature2: "Ежедневные Обновления",
    feature3: "Адаптивный Интерфейс для Мобильных",
    officialLinks: "Официальные ссылки",
    dailyUpdate: "Ежедневные обновления",
    mobileText: "Мобильный",
    interfaceText: "Интерфейс",
    disclaimer: "Дисклеймер",
    disclaimerText: "EST 2025 LINKZONE Все права защищены. Этот Сайт Работает в Информационных Целях. Этот Сайт Не Призывает Никого к Азартным Играм !",
    copyright: "© 2025. LNKZone. Все права защищены jcl-ota.jch-ota.gov",
  },
};

type PlatformLinks = {
  web: string;
  ios: string;
  android: string;
  androidFileName?: string;
};

const DEFAULT_PLATFORMS = [
  {
    id: "1xbet",
    name: "1XBET",
    logoUrl: "/logos/1xbet.png",
    color: "cyan",
  },
  {
    id: "melbet",
    name: "MELBET",
    logoUrl: "/logos/melbet.png",
    color: "green",
  },
  {
    id: "linebet",
    name: "LINEBET",
    logoUrl: "/logos/linebet.png",
    color: "cyan",
  },
  {
    id: "888starz",
    name: "888STARZ",
    logoUrl: "/logos/888starz.png",
    color: "green",
  },
  {
    id: "1xcasino",
    name: "1XCASINO",
    logoUrl: "/logos/1xcasino.png",
    color: "cyan",
  },
  {
    id: "dbbet",
    name: "DBBET",
    logoUrl: "/logos/dbbet.png",
    color: "green",
  },
  {
    id: "winwin",
    name: "WINWIN",
    logoUrl: "/logos/winwin.png",
    color: "cyan",
  },
  {
    id: "mostbet",
    name: "MOSTBET",
    logoUrl: "/logos/mostbet.png",
    color: "green",
  },
  {
    id: "xparibet",
    name: "XPARIBET",
    logoUrl: "/logos/xparibet.png",
    color: "cyan",
  },
  {
    id: "betwinner",
    name: "BETWINNER",
    logoUrl: "/logos/betwinner.png",
    color: "green",
  },
  {
    id: "megapari",
    name: "MEGAPARI",
    logoUrl: "/logos/megapari.png",
    color: "cyan",
  },
  {
    id: "coldbet",
    name: "COLDBET",
    logoUrl: "/logos/coldbet.png",
    color: "green",
  },
  {
    id: "ultrapari",
    name: "ULTRAPARI",
    logoUrl: "/logos/ultrapari.png",
    color: "cyan",
  },
  {
    id: "fastpari",
    name: "FASTPARI",
    logoUrl: "/logos/fastpari.png",
    color: "green",
  },
  {
    id: "spinbetter",
    name: "SPINBETTER",
    logoUrl: "/logos/spinbetter.png",
    color: "cyan",
  },
  {
    id: "yohohobet",
    name: "YOHOHOBET",
    logoUrl: "/logos/yohohobet.png",
    color: "green",
  },
  {
    id: "luckypari",
    name: "LUCKYPARI",
    logoUrl: "/logos/luckypari.png",
    color: "cyan",
  },
];

export default function Index() {
  const [language, setLanguage] = useState<Language>("uz");
  const [platformLinks, setPlatformLinks] = useState<Record<string, PlatformLinks>>({});

  const t = translations[language];
  const PLATFORMS = DEFAULT_PLATFORMS;

  // Load platform links from API
  useEffect(() => {
    fetch('/api/platform-links')
      .then(res => res.json())
      .then(data => setPlatformLinks(data))
      .catch(() => {
        // Use empty object if API fails
        console.log('Using default empty links');
      });
  }, []);

  // ИСПРАВЛЕНИЕ #3: Улучшенная обработка открытия ссылок для всех платформ
  const handlePlatformClick = (platformId: string, type: 'web' | 'ios' | 'android') => {
    const links = platformLinks[platformId];
    if (!links) return;

    const url = links[type];
    if (!url) return;

    if (type === 'android') {
      // Use proxy endpoint for APK download with cache-busting timestamp
      const timestamp = Date.now();
      window.location.href = `/api/download-apk/${platformId}?t=${timestamp}`;
    } else {
      // ИСПРАВЛЕНИЕ #4 + #5: Обход блокировок через proxy редирект
      const isAndroid = /Android/i.test(window.navigator.userAgent);
      const isTelegram = window.navigator.userAgent.includes('Telegram');
      const isIOS = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

      // Используем proxy редирект для обхода блокировок Telegram/провайдера
      // Вместо прямой ссылки открываем через наш сервер
      const proxyUrl = `/api/redirect/${platformId}/${type}`;

      // Для Android - открываем через proxy
      if (isAndroid) {
        window.location.href = proxyUrl;
      }
      // Для iOS в Telegram - также используем proxy для надежности
      else if (isIOS && isTelegram) {
        // В Telegram на iOS тоже могут быть блокировки
        window.location.href = proxyUrl;
      }
      // Для остальных случаев (iOS Safari, Desktop) - можно напрямую
      else {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.focus();
        } else {
          // Если window.open заблокирован - используем proxy
          window.location.href = proxyUrl;
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white overflow-x-hidden relative">
      {/* Neon background effect */}
      <div className="fixed inset-0 bg-[#0A0F1C] -z-20" />
      <div className="fixed top-0 left-0 w-[1000px] h-[1000px] bg-[#00D9FF] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.12] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-0 right-0 w-[1000px] h-[1000px] bg-[#00FF88] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.15] -z-10 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3A6BFF] rounded-full mix-blend-screen filter blur-[220px] opacity-[0.08] -z-10 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

      {/* Header */}
      <header className="bg-[#0A0F1C]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F2e90389cee1447daa5812cbe2311f2b3%2F9d09d04b41e04ead8da677f680a252f7?format=webp&width=800"
                alt="LINKZONE"
                className="h-32 sm:h-36 md:h-40 lg:h-48 w-auto object-contain filter brightness(1.1) saturate(1.2) animate-logo-pulse"
              />
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2 bg-[#0a1520]/80 rounded-lg p-1 border border-[#00d9ff]/30">
              <button
                onClick={() => setLanguage("uz")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  language === "uz"
                    ? "bg-[#00d9ff] text-black"
                    : "text-[#B8C2CC] hover:text-white"
                }`}
              >
                <span className="text-base">🇺🇿</span> UZ
              </button>
              <button
                onClick={() => setLanguage("ru")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  language === "ru"
                    ? "bg-[#00d9ff] text-black"
                    : "text-[#B8C2CC] hover:text-white"
                }`}
              >
                <span className="text-base">🇷🇺</span> RU
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Hero Section */}
            <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold neon-cyan leading-tight">
                {t.title}
              </h1>
              <p className="text-[#B8C2CC] text-xs sm:text-sm leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Platform Cards - Small */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className={`relative p-4 sm:p-6 rounded-2xl card-hover-effect cursor-pointer group ${
                    platform.color === 'green'
                      ? 'card-glow-green bg-[#0A0F1C]/30 backdrop-blur-md border-2 border-[#00FF88] shadow-[0_0_40px_rgba(0,255,136,0.7),0_0_70px_rgba(0,255,136,0.4),0_0_120px_rgba(0,255,136,0.2),inset_0_0_40px_rgba(0,255,136,0.1)] hover:shadow-[0_0_60px_rgba(0,255,136,1),0_0_100px_rgba(0,255,136,0.6),0_0_150px_rgba(0,255,136,0.3),inset_0_0_60px_rgba(0,255,136,0.15)]'
                      : 'card-glow-cyan bg-[#0A0F1C]/30 backdrop-blur-md border-2 border-[#00d9ff] shadow-[0_0_40px_rgba(0,217,255,0.7),0_0_70px_rgba(0,217,255,0.4),0_0_120px_rgba(0,217,255,0.2),inset_0_0_40px_rgba(0,217,255,0.1)] hover:shadow-[0_0_60px_rgba(0,217,255,1),0_0_100px_rgba(0,217,255,0.6),0_0_150px_rgba(0,217,255,0.3),inset_0_0_60px_rgba(0,217,255,0.15)]'
                  }`}
                >
                  {/* Platform Name */}
                  <h3 className={`text-center font-bold text-lg sm:text-xl mb-3 ${
                    platform.color === 'green' ? 'text-[#00FF88]' : 'text-[#00d9ff]'
                  }`}>
                    {platform.name}
                  </h3>

                  {/* Logo */}
                  <img
                    src={platform.logoUrl}
                    alt={platform.name}
                    className="w-full h-16 sm:h-20 object-contain mb-4 sm:mb-5 transition-all duration-300 filter brightness-110 group-hover:brightness-125 group-hover:scale-105"
                  />

                  {/* Main Button */}
                  <button
                    onClick={() => handlePlatformClick(platform.id, 'web')}
                    className={`button-glow relative w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wide transition-all duration-500 transform hover:scale-[1.03] ${
                      platform.color === 'green'
                        ? 'bg-[#00FF88] text-black hover:bg-[#33FFaa] shadow-[0_0_10px_rgba(0,255,136,0.3),0_4px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(0,255,136,0.5),0_6px_15px_rgba(0,0,0,0.3)]'
                        : 'bg-[#00d9ff] text-[#0A0F1C] hover:bg-[#40e0ff] shadow-[0_0_10px_rgba(0,217,255,0.3),0_4px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(0,217,255,0.5),0_6px_15px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    <span className="relative z-10">{t.enter}</span>
                  </button>

                  {/* Platform Buttons */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                    <button
                      onClick={() => handlePlatformClick(platform.id, 'ios')}
                      className={`flex flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm uppercase transition-all duration-300 transform hover:scale-105 ${
                        platform.color === 'green'
                          ? 'bg-transparent border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/20'
                          : 'bg-transparent border-2 border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/20'
                      }`}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                      </svg>
                      iOS
                    </button>
                    <button
                      onClick={() => handlePlatformClick(platform.id, 'android')}
                      className={`flex flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm uppercase transition-all duration-300 transform hover:scale-105 ${
                        platform.color === 'green'
                          ? 'bg-transparent border-2 border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/20'
                          : 'bg-transparent border-2 border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/20'
                      }`}
                    >
                      <svg className="w-9 h-9 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                      </svg>
                      Android
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Why LinkZone Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 neon-cyan text-center">
              NEGA LINKZONE?
            </h2>
            <div className="max-w-xl mx-auto space-y-5">
              {/* Feature 1 - Checkmark */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full">
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" fill="#00FF88" fillOpacity="0.1"/>
                    <path d="M6 12l4 4L18 8" stroke="#00FF88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-normal text-gray-400">{language === 'uz' ? 'Rasmiy havolalar' : 'Официальные ссылки'}</h3>
              </div>

              {/* Feature 2 - Checkmark */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full">
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" fill="#00FF88" fillOpacity="0.1"/>
                    <path d="M6 12l4 4L18 8" stroke="#00FF88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-normal text-gray-400">{language === 'uz' ? 'Har kun yangilanish' : 'Ежедневные обновления'}</h3>
              </div>

              {/* Feature 3 - Phone Icon */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl">
                  <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="48" height="48" rx="8" fill="#00d9ff" fillOpacity="0.1"/>
                    <rect x="19" y="13" width="18" height="30" rx="2" stroke="#00d9ff" strokeWidth="2.5"/>
                    <line x1="19" y1="18" x2="37" y2="18" stroke="#00d9ff" strokeWidth="2.5"/>
                    <line x1="19" y1="38" x2="37" y2="38" stroke="#00d9ff" strokeWidth="2.5"/>
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-normal text-gray-400">{language === 'uz' ? 'Mobil telefon uchun mos interfeys' : 'Мобильный интерфейс'}</h3>
              </div>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="border-t border-[#1a2d4d] pt-4 sm:pt-6">
            <div className="text-center space-y-2 sm:space-y-3">
              <h4 className="text-gray-400 font-semibold text-xs sm:text-sm">{t.disclaimer}</h4>
              <p className="text-gray-500 text-xs leading-relaxed max-w-3xl mx-auto px-2">
                {t.disclaimerText} <span className="text-red-400 font-bold">( 18+ )</span>
              </p>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed pt-2">
                {t.copyright}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
