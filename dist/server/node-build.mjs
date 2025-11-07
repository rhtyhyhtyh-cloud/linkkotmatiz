import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import TelegramBot from "node-telegram-bot-api";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const router = Router();
const DATA_FILE$1 = path.join(process.cwd(), "data", "platform-links.json");
function ensureDataDir$1() {
  const dataDir = path.dirname(DATA_FILE$1);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
function readPlatformLinks$1() {
  ensureDataDir$1();
  try {
    if (fs.existsSync(DATA_FILE$1)) {
      const data = fs.readFileSync(DATA_FILE$1, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading platform links:", error);
  }
  return {};
}
function writePlatformLinks$1(data) {
  ensureDataDir$1();
  try {
    fs.writeFileSync(DATA_FILE$1, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing platform links:", error);
    return false;
  }
}
router.get("/api/platform-links", (req, res) => {
  const links = readPlatformLinks$1();
  res.json(links);
});
router.get("/api/platform-links/:platformId", (req, res) => {
  const links = readPlatformLinks$1();
  const platformLinks = links[req.params.platformId];
  if (platformLinks) {
    res.json(platformLinks);
  } else {
    res.status(404).json({ error: "Platform not found" });
  }
});
router.post("/api/platform-links/:platformId", (req, res) => {
  const { platformId } = req.params;
  const { web, ios, android, adminKey } = req.body;
  const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-in-production";
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const links = readPlatformLinks$1();
  links[platformId] = { web, ios, android };
  if (writePlatformLinks$1(links)) {
    res.json({ success: true, platformId, links: links[platformId] });
  } else {
    res.status(500).json({ error: "Failed to update platform links" });
  }
});
router.delete("/api/platform-links/:platformId", (req, res) => {
  const { platformId } = req.params;
  const { adminKey } = req.body;
  const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-in-production";
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const links = readPlatformLinks$1();
  if (links[platformId]) {
    delete links[platformId];
    if (writePlatformLinks$1(links)) {
      res.json({ success: true, platformId });
    } else {
      res.status(500).json({ error: "Failed to delete platform links" });
    }
  } else {
    res.status(404).json({ error: "Platform not found" });
  }
});
router.get("/api/download-apk/:platformId", (req, res) => {
  const { platformId } = req.params;
  const links = readPlatformLinks$1();
  const platformData = links[platformId];
  if (!platformData || !platformData.android) {
    return res.status(404).json({ error: "APK not found" });
  }
  const apkUrl = platformData.android;
  const fileName = platformData.androidFileName || `${platformId}.apk`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  https.get(apkUrl, (fileStream) => {
    fileStream.pipe(res);
  }).on("error", (error) => {
    console.error("Error downloading APK:", error);
    res.status(500).json({ error: "Failed to download APK" });
  });
});
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ADMIN_USERS = (process.env.TELEGRAM_ADMIN_IDS || "").split(",").map((id) => parseInt(id.trim()));
const DATA_FILE = path.join(process.cwd(), "data", "platform-links.json");
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
function readPlatformLinks() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading platform links:", error);
  }
  return {};
}
function writePlatformLinks(data) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing platform links:", error);
    return false;
  }
}
function isAdmin(userId) {
  return ADMIN_USERS.includes(userId);
}
const PLATFORMS = [
  "1xbet",
  "melbet",
  "linebet",
  "888starz",
  "1xcasino",
  "dbbet",
  "winwin",
  "mostbet",
  "xparibet",
  "betwinner",
  "megapari",
  "coldbet",
  "ultrapari",
  "fastpari",
  "spinbetter",
  "yohohobet",
  "luckypari"
];
const translations = {
  ru: {
    welcome: "👋 *Добро пожаловать в LinkZone Admin Bot!*\n\nВыберите язык:",
    welcomeAdmin: "🔐 Вы авторизованы как администратор.\n\nВыберите действие:",
    noAccess: "⚠️ У вас нет прав администратора.",
    chooseAction: "*LinkZone Admin Bot*\n\nВыберите действие:",
    showAll: "📋 Показать все ссылки",
    manage: "⚙️ Управление ссылками",
    delete: "🗑 Удалить платформу",
    platforms: "🎰 Список платформ",
    language: "🌐 Язык",
    back: "◀️ Назад",
    currentLinks: "📋 *Текущие ссылки платформ:*\n\n",
    noLinks: "📭 Нет установленных ссылок.",
    availablePlatforms: "🎰 *Доступные платформы:*\n\n",
    manageLinks: "⚙️ *Управление ссылками*\n\nВыберите платформу:",
    deletePlatform: "🗑 *Удалить платформу*\n\nВыберите:",
    setWeb: "🌐 Установить Web",
    setIos: "🍎 Установить iOS",
    setAndroid: "🤖 Установить Android APK",
    showCurrent: "📋 Показать текущие",
    sendWebLink: "🌐 *Web ссылка для {platform}*\n\nОтправьте ссылку:",
    sendIosLink: "🍎 *iOS ссылка для {platform}*\n\nОтправьте ссылку:",
    sendAndroidLink: "🤖 *Android APK для {platform}*\n\nОтправьте ссылку на APK:",
    cancel: "❌ Отмена",
    platformDeleted: "✅ Платформа *{platform}* удалена!",
    fileReceived: "📥 Файл получен: {filename}\n🔗 Ссылка: `{link}`",
    fileError: "❌ Ошибка при получении файла. Попробуйте отправить ссылку вместо файла.",
    linkSaved: "✅ *{type} для {platform} сохранена!*\n\n`{link}`",
    saveError: "❌ Ошибка при сохранении.",
    notSet: "❌ не установлено",
    accessDenied: "⛔ Доступ запрещен",
    languageChanged: "✅ Язык изменен на Русский"
  },
  uz: {
    welcome: "👋 *LinkZone Admin Botiga xush kelibsiz!*\n\nTilni tanlang:",
    welcomeAdmin: "🔐 Siz administrator sifatida avtorizatsiya qilindingiz.\n\nAmalni tanlang:",
    noAccess: "⚠️ Sizda administrator huquqlari yo'q.",
    chooseAction: "*LinkZone Admin Bot*\n\nAmalni tanlang:",
    showAll: "📋 Barcha havolalarni ko'rsatish",
    manage: "⚙️ Havolalarni boshqarish",
    delete: "🗑 Platformani o'chirish",
    platforms: "🎰 Platformalar ro'yxati",
    language: "🌐 Til",
    back: "◀️ Orqaga",
    currentLinks: "📋 *Joriy platform havolalari:*\n\n",
    noLinks: "📭 O'rnatilgan havolalar yo'q.",
    availablePlatforms: "🎰 *Mavjud platformalar:*\n\n",
    manageLinks: "⚙️ *Havolalarni boshqarish*\n\nPlatformani tanlang:",
    deletePlatform: "🗑 *Platformani o'chirish*\n\nTanlang:",
    setWeb: "🌐 Web o'rnatish",
    setIos: "🍎 iOS o'rnatish",
    setAndroid: "🤖 Android APK o'rnatish",
    showCurrent: "📋 Joriy ko'rsatish",
    sendWebLink: "🌐 *{platform} uchun Web havola*\n\nHavolani yuboring:",
    sendIosLink: "🍎 *{platform} uchun iOS havola*\n\nHavolani yuboring:",
    sendAndroidLink: "🤖 *{platform} uchun Android APK*\n\nAPK havolasini yuboring:",
    cancel: "❌ Bekor qilish",
    platformDeleted: "✅ *{platform}* platformasi o'chirildi!",
    fileReceived: "📥 Fayl qabul qilindi: {filename}\n🔗 Havola: `{link}`",
    fileError: "❌ Faylni olishda xatolik. Havola yuborishga harakat qiling.",
    linkSaved: "✅ *{platform} uchun {type} saqlandi!*\n\n`{link}`",
    saveError: "❌ Saqlashda xatolik.",
    notSet: "❌ o'rnatilmagan",
    accessDenied: "⛔ Kirish taqiqlangan",
    languageChanged: "✅ Til O'zbekchaga o'zgartirildi"
  }
};
const userLanguages = {};
let botInstance = null;
function startTelegramBot() {
  if (botInstance) {
    console.log("Telegram bot already running, skipping initialization");
    return botInstance;
  }
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_NEW_BOT_TOKEN_HERE" || BOT_TOKEN.length < 20) {
    console.warn("WARNING: Telegram bot disabled - Invalid or missing token");
    console.warn("   Get a new token from @BotFather and update .env file");
    return null;
  }
  const bot = new TelegramBot(BOT_TOKEN, { polling: false });
  bot.deleteWebHook().then(() => {
    console.log("Webhook deleted, starting polling...");
    bot.startPolling({ restart: true });
    botInstance = bot;
    console.log("Telegram bot started successfully!");
  }).catch((err) => {
    console.error("Error deleting webhook:", err);
    bot.startPolling({ restart: true });
    botInstance = bot;
  });
  bot.on("polling_error", (error) => {
    console.error("Polling error:", error.code);
    if (error.code === "ETELEGRAM" && error.message.includes("409")) {
      console.log("Conflict detected, stopping old instance...");
      setTimeout(() => {
        bot.stopPolling();
        setTimeout(() => bot.startPolling({ restart: true }), 2e3);
      }, 1e3);
    }
  });
  const getLang = (userId) => userLanguages[userId] || "ru";
  const t = (userId, key, params) => {
    const lang = getLang(userId);
    let text = translations[lang][key];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }
    return text;
  };
  const userState = {};
  const getLanguageMenu = () => ({
    inline_keyboard: [
      [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
      [{ text: "🇺🇿 O'zbekcha", callback_data: "lang_uz" }]
    ]
  });
  const getMainMenu = (userId) => ({
    inline_keyboard: [
      [{ text: t(userId, "showAll"), callback_data: "action_list" }],
      [{ text: t(userId, "manage"), callback_data: "action_manage" }],
      [{ text: t(userId, "delete"), callback_data: "action_delete" }],
      [{ text: t(userId, "platforms"), callback_data: "action_platforms" }],
      [{ text: t(userId, "language"), callback_data: "action_language" }]
    ]
  });
  const getPlatformKeyboard = (action, userId) => {
    const keyboard = [];
    for (let i = 0; i < PLATFORMS.length; i += 3) {
      const row = PLATFORMS.slice(i, i + 3).map((platform) => ({
        text: platform,
        callback_data: `${action}_${platform}`
      }));
      keyboard.push(row);
    }
    keyboard.push([{ text: t(userId, "back"), callback_data: "back_main" }]);
    return { inline_keyboard: keyboard };
  };
  const getPlatformEditMenu = (platform, userId) => {
    return {
      inline_keyboard: [
        [{ text: t(userId, "setWeb"), callback_data: `edit_web_${platform}` }],
        [{ text: t(userId, "setIos"), callback_data: `edit_ios_${platform}` }],
        [{ text: t(userId, "setAndroid"), callback_data: `edit_android_${platform}` }],
        [{ text: t(userId, "showCurrent"), callback_data: `show_${platform}` }],
        [{ text: t(userId, "back"), callback_data: "action_manage" }]
      ]
    };
  };
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;
    if (!isAdmin(userId)) {
      bot.sendMessage(chatId, t(userId, "welcome"), {
        parse_mode: "Markdown",
        reply_markup: getLanguageMenu()
      });
      return;
    }
    if (!userLanguages[userId]) {
      bot.sendMessage(chatId, t(userId, "welcome"), {
        parse_mode: "Markdown",
        reply_markup: getLanguageMenu()
      });
    } else {
      bot.sendMessage(chatId, t(userId, "welcomeAdmin"), {
        parse_mode: "Markdown",
        reply_markup: getMainMenu(userId)
      });
    }
  });
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const messageId = query.message.message_id;
    if (data.startsWith("lang_")) {
      const lang = data.replace("lang_", "");
      userLanguages[userId] = lang;
      if (!isAdmin(userId)) {
        bot.editMessageText(t(userId, "noAccess"), {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown"
        });
        bot.answerCallbackQuery(query.id);
        return;
      }
      bot.editMessageText(t(userId, "welcomeAdmin"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getMainMenu(userId)
      });
      bot.answerCallbackQuery(query.id, { text: t(userId, "languageChanged") });
      return;
    }
    if (!isAdmin(userId)) {
      bot.answerCallbackQuery(query.id, { text: t(userId, "accessDenied"), show_alert: true });
      return;
    }
    if (data === "action_language") {
      bot.editMessageText(t(userId, "welcome"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getLanguageMenu()
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_list") {
      const links = readPlatformLinks();
      let message = t(userId, "currentLinks");
      if (Object.keys(links).length === 0) {
        message = t(userId, "noLinks");
      } else {
        for (const [platform, urls] of Object.entries(links)) {
          message += `*${platform.toUpperCase()}*
`;
          message += `🌐 Web: ${urls.web || t(userId, "notSet")}
`;
          message += `🍎 iOS: ${urls.ios || t(userId, "notSet")}
`;
          message += `🤖 Android: ${urls.android || t(userId, "notSet")}

`;
        }
      }
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "back"), callback_data: "back_main" }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_platforms") {
      let message = t(userId, "availablePlatforms");
      PLATFORMS.forEach((p, i) => message += `${i + 1}. ${p}
`);
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "back"), callback_data: "back_main" }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_manage") {
      bot.editMessageText(t(userId, "manageLinks"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformKeyboard("manage", userId)
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_delete") {
      bot.editMessageText(t(userId, "deletePlatform"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformKeyboard("delete", userId)
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "back_main") {
      delete userState[userId];
      bot.editMessageText(t(userId, "chooseAction"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getMainMenu(userId)
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("manage_")) {
      const platform = data.replace("manage_", "");
      const links = readPlatformLinks();
      const pl = links[platform] || { web: "", ios: "", android: "" };
      let message = `⚙️ *${t(userId, "manage")}: ${platform.toUpperCase()}*

`;
      message += `🌐 Web: ${pl.web || t(userId, "notSet")}
`;
      message += `🍎 iOS: ${pl.ios || t(userId, "notSet")}
`;
      message += `🤖 Android: ${pl.android || t(userId, "notSet")}
`;
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformEditMenu(platform, userId)
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("show_")) {
      const platform = data.replace("show_", "");
      const links = readPlatformLinks();
      const pl = links[platform] || { web: "", ios: "", android: "" };
      let message = `📋 *${platform.toUpperCase()}*

`;
      message += `🌐 Web:
\`${pl.web || t(userId, "notSet")}\`

`;
      message += `🍎 iOS:
\`${pl.ios || t(userId, "notSet")}\`

`;
      message += `🤖 Android:
\`${pl.android || t(userId, "notSet")}\``;
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "back"), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_web_")) {
      const platform = data.replace("edit_web_", "");
      userState[userId] = { platform, editType: "web" };
      bot.editMessageText(t(userId, "sendWebLink", { platform: platform.toUpperCase() }), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "cancel"), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_ios_")) {
      const platform = data.replace("edit_ios_", "");
      userState[userId] = { platform, editType: "ios" };
      bot.editMessageText(t(userId, "sendIosLink", { platform: platform.toUpperCase() }), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "cancel"), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_android_")) {
      const platform = data.replace("edit_android_", "");
      userState[userId] = { platform, editType: "android" };
      bot.editMessageText(t(userId, "sendAndroidLink", { platform: platform.toUpperCase() }), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: t(userId, "cancel"), callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("delete_")) {
      const platform = data.replace("delete_", "");
      const links = readPlatformLinks();
      if (links[platform]) {
        delete links[platform];
        if (writePlatformLinks(links)) {
          bot.editMessageText(t(userId, "platformDeleted", { platform }), {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: t(userId, "back"), callback_data: "back_main" }]] }
          });
        }
      }
      bot.answerCallbackQuery(query.id);
    }
  });
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;
    const text = msg.text || "";
    if (text.startsWith("/")) return;
    const state = userState[userId];
    if (!state || !state.platform || !state.editType) return;
    let linkToSave = "";
    let fileName = "";
    if (msg.document) {
      try {
        const fileLink = await bot.getFileLink(msg.document.file_id);
        linkToSave = fileLink;
        fileName = msg.document.file_name || "";
        bot.sendMessage(chatId, t(userId, "fileReceived", { filename: msg.document.file_name || "", link: fileLink }), { parse_mode: "Markdown" });
      } catch (error) {
        bot.sendMessage(chatId, t(userId, "fileError"));
        return;
      }
    } else if (text) {
      linkToSave = text;
    } else {
      return;
    }
    const links = readPlatformLinks();
    if (!links[state.platform]) {
      links[state.platform] = { web: "", ios: "", android: "" };
    }
    links[state.platform][state.editType] = linkToSave;
    if (state.editType === "android" && fileName) {
      links[state.platform].androidFileName = fileName;
    }
    if (writePlatformLinks(links)) {
      const names = { web: "Web", ios: "iOS", android: "Android APK" };
      bot.sendMessage(
        chatId,
        t(userId, "linkSaved", { type: names[state.editType], platform: state.platform, link: linkToSave }),
        { parse_mode: "Markdown", reply_markup: getPlatformEditMenu(state.platform, userId) }
      );
    } else {
      bot.sendMessage(chatId, t(userId, "saveError"));
    }
    delete userState[userId];
  });
  return bot;
}
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.use(router);
  try {
    startTelegramBot();
    console.log("✅ Telegram bot initialization complete");
  } catch (error) {
    console.error("❌ Failed to start Telegram bot:", error);
  }
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.use((req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
