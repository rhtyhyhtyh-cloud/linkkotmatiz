// Telegram WebApp types
interface TelegramWebApp {
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  ready(): void;
  close(): void;
  expand(): void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
