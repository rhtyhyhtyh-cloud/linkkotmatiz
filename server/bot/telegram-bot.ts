import TelegramBot from 'node-telegram-bot-api';
import { readPlatformLinks, updatePlatformLink, deletePlatform, type PlatformLinks } from '../lib/platform-data';

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_USERS = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(id => parseInt(id.trim()));

// Check if user is admin
function isAdmin(userId: number): boolean {
  return ADMIN_USERS.includes(userId);
}

// Platform names
const PLATFORMS = [
  '1xbet', 'melbet', 'linebet', '888starz', '1xcasino', 'dbbet',
  'winwin', 'mostbet', 'xparibet', 'betwinner', 'megapari', 'coldbet',
  'ultrapari', 'fastpari', 'spinbetter', 'yohohobet', 'luckypari'
];

// Translations
const translations = {
  ru: {
    welcome: '👋 *Добро пожаловать в LinkZone Admin Bot!*\n\nВыберите язык:',
    welcomeAdmin: '🔐 Вы авторизованы как администратор.\n\nВыберите действие:',
    noAccess: '⚠️ У вас нет прав администратора.',
    chooseAction: '*LinkZone Admin Bot*\n\nВыберите действие:',
    showAll: '📋 Показать все ссылки',
    manage: '⚙️ Управление ссылками',
    delete: '🗑 Удалить платформу',
    platforms: '🎰 Список платформ',
    language: '🌐 Язык',
    back: '◀️ Назад',
    currentLinks: '📋 *Текущие ссылки платформ:*\n\n',
    noLinks: '📭 Нет установленных ссылок.',
    availablePlatforms: '🎰 *Доступные платформы:*\n\n',
    manageLinks: '⚙️ *Управление ссылками*\n\nВыберите платформу:',
    deletePlatform: '🗑 *Удалить платформу*\n\nВыберите:',
    setWeb: '🌐 Установить Web',
    setIos: '🍎 Установить iOS',
    setAndroid: '🤖 Установить Android APK',
    showCurrent: '📋 Показать текущие',
    sendWebLink: '🌐 *Web ссылка для {platform}*\n\nОтправьте ссылку:',
    sendIosLink: '🍎 *iOS ссылка для {platform}*\n\nОтправьте ссылку:',
    sendAndroidLink: '🤖 *Android APK для {platform}*\n\nОтправьте ссылку на APK:',
    cancel: '❌ Отмена',
    platformDeleted: '✅ Платформа *{platform}* удалена!',
    fileReceived: '📥 Файл получен: {filename}\n🔗 Ссылка: `{link}`',
    fileError: '❌ Ошибка при получении файла. Попробуйте отправить ссылку вместо файла.',
    linkSaved: '✅ *{type} для {platform} сохранена!*\n\n`{link}`',
    saveError: '❌ Ошибка при сохранении.',
    notSet: '❌ не установлено',
    accessDenied: '⛔ Доступ запрещен',
    languageChanged: '✅ Язык изменен на Русский'
  },
  uz: {
    welcome: '👋 *LinkZone Admin Botiga xush kelibsiz!*\n\nTilni tanlang:',
    welcomeAdmin: '🔐 Siz administrator sifatida avtorizatsiya qilindingiz.\n\nAmalni tanlang:',
    noAccess: '⚠️ Sizda administrator huquqlari yo\'q.',
    chooseAction: '*LinkZone Admin Bot*\n\nAmalni tanlang:',
    showAll: '📋 Barcha havolalarni ko\'rsatish',
    manage: '⚙️ Havolalarni boshqarish',
    delete: '🗑 Platformani o\'chirish',
    platforms: '🎰 Platformalar ro\'yxati',
    language: '🌐 Til',
    back: '◀️ Orqaga',
    currentLinks: '📋 *Joriy platform havolalari:*\n\n',
    noLinks: '📭 O\'rnatilgan havolalar yo\'q.',
    availablePlatforms: '🎰 *Mavjud platformalar:*\n\n',
    manageLinks: '⚙️ *Havolalarni boshqarish*\n\nPlatformani tanlang:',
    deletePlatform: '🗑 *Platformani o\'chirish*\n\nTanlang:',
    setWeb: '🌐 Web o\'rnatish',
    setIos: '🍎 iOS o\'rnatish',
    setAndroid: '🤖 Android APK o\'rnatish',
    showCurrent: '📋 Joriy ko\'rsatish',
    sendWebLink: '🌐 *{platform} uchun Web havola*\n\nHavolani yuboring:',
    sendIosLink: '🍎 *{platform} uchun iOS havola*\n\nHavolani yuboring:',
    sendAndroidLink: '🤖 *{platform} uchun Android APK*\n\nAPK havolasini yuboring:',
    cancel: '❌ Bekor qilish',
    platformDeleted: '✅ *{platform}* platformasi o\'chirildi!',
    fileReceived: '📥 Fayl qabul qilindi: {filename}\n🔗 Havola: `{link}`',
    fileError: '❌ Faylni olishda xatolik. Havola yuborishga harakat qiling.',
    linkSaved: '✅ *{platform} uchun {type} saqlandi!*\n\n`{link}`',
    saveError: '❌ Saqlashda xatolik.',
    notSet: '❌ o\'rnatilmagan',
    accessDenied: '⛔ Kirish taqiqlangan',
    languageChanged: '✅ Til O\'zbekchaga o\'zgartirildi'
  }
};

type Language = 'ru' | 'uz';

// User language preferences
const userLanguages: Record<number, Language> = {};

// Global bot instance to prevent duplicates
let botInstance: TelegramBot | null = null;

export function stopTelegramBot() {
  if (botInstance) {
    botInstance.stopPolling();
    botInstance = null;
    console.log('Telegram bot stopped');
  }
}

export function startTelegramBot() {
  if (botInstance) {
    console.log('Telegram bot already running, skipping initialization');
    return botInstance;
  }

  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_NEW_BOT_TOKEN_HERE' || BOT_TOKEN.length < 20) {
    console.warn('WARNING: Telegram bot disabled - Invalid or missing token');
    console.warn('   Get a new token from @BotFather and update .env file');
    return null;
  }

  const bot = new TelegramBot(BOT_TOKEN, { polling: false });

  bot.deleteWebHook().then(() => {
    console.log('Webhook deleted, starting polling...');
    bot.startPolling({ restart: true });
    botInstance = bot;
    console.log('Telegram bot started successfully!');
  }).catch(err => {
    console.error('Error deleting webhook:', err);
    bot.startPolling({ restart: true });
    botInstance = bot;
  });

  bot.on('polling_error', (error: any) => {
    console.error('Polling error:', error.code);
    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
      console.log('Conflict detected, stopping old instance...');
      setTimeout(() => {
        bot.stopPolling();
        setTimeout(() => bot.startPolling({ restart: true }), 2000);
      }, 1000);
    }
  });

  // Helper function to get user language
  const getLang = (userId: number): Language => userLanguages[userId] || 'ru';

  // Helper function to translate text
  const t = (userId: number, key: keyof typeof translations.ru, params?: Record<string, string>): string => {
    const lang = getLang(userId);
    let text = translations[lang][key];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  };

  // ИСПРАВЛЕНИЕ #1: Каждый админ теперь имеет свое собственное состояние
  // Это решает проблему конфликта при одновременной работе нескольких админов
  type UserState = {
    platform?: string;
    editType?: 'web' | 'ios' | 'android';
    messageId?: number;
    chatId?: number;
  };

  const userStates = new Map<number, UserState>();

  const getUserState = (userId: number): UserState => {
    if (!userStates.has(userId)) {
      userStates.set(userId, {});
    }
    return userStates.get(userId)!;
  };

  const setUserState = (userId: number, state: Partial<UserState>) => {
    const current = getUserState(userId);
    userStates.set(userId, { ...current, ...state });
  };

  const clearUserState = (userId: number) => {
    userStates.delete(userId);
  };

  const getLanguageMenu = () => ({
    inline_keyboard: [
      [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
      [{ text: '🇺🇿 O\'zbekcha', callback_data: 'lang_uz' }],
    ]
  });

  const getMainMenu = (userId: number) => ({
    inline_keyboard: [
      [{ text: t(userId, 'showAll'), callback_data: 'action_list' }],
      [{ text: t(userId, 'manage'), callback_data: 'action_manage' }],
      [{ text: t(userId, 'delete'), callback_data: 'action_delete' }],
      [{ text: t(userId, 'platforms'), callback_data: 'action_platforms' }],
      [{ text: t(userId, 'language'), callback_data: 'action_language' }],
    ]
  });

  const getPlatformKeyboard = (action: string, userId: number) => {
    const keyboard: any[][] = [];
    for (let i = 0; i < PLATFORMS.length; i += 3) {
      const row = PLATFORMS.slice(i, i + 3).map(platform => ({
        text: platform,
        callback_data: `${action}_${platform}`
      }));
      keyboard.push(row);
    }
    keyboard.push([{ text: t(userId, 'back'), callback_data: 'back_main' }]);
    return { inline_keyboard: keyboard };
  };

  const getPlatformEditMenu = (platform: string, userId: number) => {
    return {
      inline_keyboard: [
        [{ text: t(userId, 'setWeb'), callback_data: `edit_web_${platform}` }],
        [{ text: t(userId, 'setIos'), callback_data: `edit_ios_${platform}` }],
        [{ text: t(userId, 'setAndroid'), callback_data: `edit_android_${platform}` }],
        [{ text: t(userId, 'showCurrent'), callback_data: `show_${platform}` }],
        [{ text: t(userId, 'back'), callback_data: 'action_manage' }],
      ]
    };
  };

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;

    if (!isAdmin(userId)) {
      bot.sendMessage(chatId, t(userId, 'welcome'), {
        parse_mode: 'Markdown',
        reply_markup: getLanguageMenu()
      });
      return;
    }

    if (!userLanguages[userId]) {
      bot.sendMessage(chatId, t(userId, 'welcome'), {
        parse_mode: 'Markdown',
        reply_markup: getLanguageMenu()
      });
    } else {
      bot.sendMessage(chatId, t(userId, 'welcomeAdmin'), {
        parse_mode: 'Markdown',
        reply_markup: getMainMenu(userId)
      });
    }
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const userId = query.from.id;
    const data = query.data!;
    const messageId = query.message!.message_id;

    // Language selection
    if (data.startsWith('lang_')) {
      const lang = data.replace('lang_', '') as Language;
      userLanguages[userId] = lang;

      if (!isAdmin(userId)) {
        bot.editMessageText(t(userId, 'noAccess'), {
          chat_id: chatId, message_id: messageId, parse_mode: 'Markdown'
        });
        bot.answerCallbackQuery(query.id);
        return;
      }

      bot.editMessageText(t(userId, 'welcomeAdmin'), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getMainMenu(userId)
      });
      bot.answerCallbackQuery(query.id, { text: t(userId, 'languageChanged') });
      return;
    }

    if (!isAdmin(userId)) {
      bot.answerCallbackQuery(query.id, { text: t(userId, 'accessDenied'), show_alert: true });
      return;
    }

    if (data === 'action_language') {
      bot.editMessageText(t(userId, 'welcome'), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getLanguageMenu()
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data === 'action_list') {
      const links = readPlatformLinks();
      let message = t(userId, 'currentLinks');
      if (Object.keys(links).length === 0) {
        message = t(userId, 'noLinks');
      } else {
        for (const [platform, urls] of Object.entries(links)) {
          message += `*${platform.toUpperCase()}*\n`;
          message += `🌐 Web: ${urls.web || t(userId, 'notSet')}\n`;
          message += `🍎 iOS: ${urls.ios || t(userId, 'notSet')}\n`;
          message += `🤖 Android: ${urls.android || t(userId, 'notSet')}\n\n`;
        }
      }
      bot.editMessageText(message, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'back'), callback_data: 'back_main' }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data === 'action_platforms') {
      let message = t(userId, 'availablePlatforms');
      PLATFORMS.forEach((p, i) => message += `${i + 1}. ${p}\n`);
      bot.editMessageText(message, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'back'), callback_data: 'back_main' }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data === 'action_manage') {
      bot.editMessageText(t(userId, 'manageLinks'), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getPlatformKeyboard('manage', userId)
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data === 'action_delete') {
      bot.editMessageText(t(userId, 'deletePlatform'), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getPlatformKeyboard('delete', userId)
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data === 'back_main') {
      clearUserState(userId);
      bot.editMessageText(t(userId, 'chooseAction'), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getMainMenu(userId)
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('manage_')) {
      const platform = data.replace('manage_', '');
      const links = readPlatformLinks();
      const pl = links[platform] || { web: '', ios: '', android: '' };

      let message = `⚙️ *${t(userId, 'manage')}: ${platform.toUpperCase()}*\n\n`;
      message += `🌐 Web: ${pl.web || t(userId, 'notSet')}\n`;
      message += `🍎 iOS: ${pl.ios || t(userId, 'notSet')}\n`;
      message += `🤖 Android: ${pl.android || t(userId, 'notSet')}\n`;

      // Сохраняем состояние для текущего админа
      setUserState(userId, { platform, chatId, messageId });

      bot.editMessageText(message, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: getPlatformEditMenu(platform, userId)
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('show_')) {
      const platform = data.replace('show_', '');
      const links = readPlatformLinks();
      const pl = links[platform] || { web: '', ios: '', android: '' };

      let message = `📋 *${platform.toUpperCase()}*\n\n`;
      message += `🌐 Web:\n\`${pl.web || t(userId, 'notSet')}\`\n\n`;
      message += `🍎 iOS:\n\`${pl.ios || t(userId, 'notSet')}\`\n\n`;
      message += `🤖 Android:\n\`${pl.android || t(userId, 'notSet')}\``;

      bot.editMessageText(message, {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'back'), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('edit_web_')) {
      const platform = data.replace('edit_web_', '');
      setUserState(userId, { platform, editType: 'web', chatId, messageId });
      bot.editMessageText(t(userId, 'sendWebLink', { platform: platform.toUpperCase() }), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'cancel'), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('edit_ios_')) {
      const platform = data.replace('edit_ios_', '');
      setUserState(userId, { platform, editType: 'ios', chatId, messageId });
      bot.editMessageText(t(userId, 'sendIosLink', { platform: platform.toUpperCase() }), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'cancel'), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('edit_android_')) {
      const platform = data.replace('edit_android_', '');
      setUserState(userId, { platform, editType: 'android', chatId, messageId });
      bot.editMessageText(t(userId, 'sendAndroidLink', { platform: platform.toUpperCase() }), {
        chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t(userId, 'cancel'), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    }

    else if (data.startsWith('delete_')) {
      const platform = data.replace('delete_', '');
      if (deletePlatform(platform)) {
        bot.editMessageText(t(userId, 'platformDeleted', { platform }), {
          chat_id: chatId, message_id: messageId, parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [[{ text: t(userId, 'back'), callback_data: 'back_main' }]] }
        });
      }
      bot.answerCallbackQuery(query.id);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;
    const text = msg.text || '';

    if (text.startsWith('/')) return;

    const state = getUserState(userId);
    if (!state || !state.platform || !state.editType) return;

    let linkToSave = '';
    let fileName = '';

    if (msg.document) {
      try {
        const fileLink = await bot.getFileLink(msg.document.file_id);
        linkToSave = fileLink;
        fileName = msg.document.file_name || '';
        bot.sendMessage(chatId, t(userId, 'fileReceived', { filename: msg.document.file_name || '', link: fileLink }), { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, t(userId, 'fileError'));
        return;
      }
    } else if (text) {
      linkToSave = text;
    } else {
      return;
    }

    // Используем новую функцию для обновления
    const success = updatePlatformLink(state.platform, state.editType, linkToSave, fileName);

    if (success) {
      const names = { web: 'Web', ios: 'iOS', android: 'Android APK' };
      bot.sendMessage(chatId,
        t(userId, 'linkSaved', { type: names[state.editType], platform: state.platform, link: linkToSave }),
        { parse_mode: 'Markdown', reply_markup: getPlatformEditMenu(state.platform, userId) }
      );
    } else {
      bot.sendMessage(chatId, t(userId, 'saveError'));
    }

    clearUserState(userId);
  });

  return bot;
}
