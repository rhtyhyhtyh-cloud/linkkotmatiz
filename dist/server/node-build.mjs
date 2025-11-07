import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import fs from "fs";
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
  const userState = {};
  const getMainMenu = () => ({
    inline_keyboard: [
      [{ text: "📋 Показать все ссылки", callback_data: "action_list" }],
      [{ text: "⚙️ Управление ссылками", callback_data: "action_manage" }],
      [{ text: "🗑 Удалить платформу", callback_data: "action_delete" }],
      [{ text: "🎰 Список платформ", callback_data: "action_platforms" }]
    ]
  });
  const getPlatformKeyboard = (action) => {
    const keyboard = [];
    for (let i = 0; i < PLATFORMS.length; i += 3) {
      const row = PLATFORMS.slice(i, i + 3).map((platform) => ({
        text: platform,
        callback_data: `${action}_${platform}`
      }));
      keyboard.push(row);
    }
    keyboard.push([{ text: "◀️ Назад", callback_data: "back_main" }]);
    return { inline_keyboard: keyboard };
  };
  const getPlatformEditMenu = (platform) => {
    const links = readPlatformLinks();
    links[platform] || {};
    return {
      inline_keyboard: [
        [{ text: "🌐 Установить Web", callback_data: `edit_web_${platform}` }],
        [{ text: "🍎 Установить iOS", callback_data: `edit_ios_${platform}` }],
        [{ text: "🤖 Установить Android APK", callback_data: `edit_android_${platform}` }],
        [{ text: "📋 Показать текущие", callback_data: `show_${platform}` }],
        [{ text: "◀️ Назад", callback_data: "action_manage" }]
      ]
    };
  };
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;
    let message = "👋 *Добро пожаловать в LinkZone Admin Bot!*\n\n";
    if (isAdmin(userId)) {
      message += "🔐 Вы авторизованы как администратор.\n\nВыберите действие:";
      bot.sendMessage(chatId, message, { parse_mode: "Markdown", reply_markup: getMainMenu() });
    } else {
      message += "⚠️ У вас нет прав администратора.";
      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
  });
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "👋 Используйте /start для начала работы", { reply_markup: getMainMenu() });
  });
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const messageId = query.message.message_id;
    if (!isAdmin(userId)) {
      bot.answerCallbackQuery(query.id, { text: "⛔ Доступ запрещен", show_alert: true });
      return;
    }
    if (data === "action_list") {
      const links = readPlatformLinks();
      let message = "📋 *Текущие ссылки платформ:*\n\n";
      if (Object.keys(links).length === 0) {
        message = "📭 Нет установленных ссылок.";
      } else {
        for (const [platform, urls] of Object.entries(links)) {
          message += `*${platform.toUpperCase()}*
`;
          message += `🌐 Web: ${urls.web || "❌"}
`;
          message += `🍎 iOS: ${urls.ios || "❌"}
`;
          message += `🤖 Android: ${urls.android || "❌"}

`;
        }
      }
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "back_main" }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_platforms") {
      let message = "🎰 *Доступные платформы:*\n\n";
      PLATFORMS.forEach((p, i) => message += `${i + 1}. ${p}
`);
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "back_main" }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_manage") {
      bot.editMessageText("⚙️ *Управление ссылками*\n\nВыберите платформу:", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformKeyboard("manage")
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "action_delete") {
      bot.editMessageText("🗑 *Удалить платформу*\n\nВыберите:", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformKeyboard("delete")
      });
      bot.answerCallbackQuery(query.id);
    } else if (data === "back_main") {
      delete userState[userId];
      bot.editMessageText("*LinkZone Admin Bot*\n\nВыберите действие:", {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getMainMenu()
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("manage_")) {
      const platform = data.replace("manage_", "");
      const links = readPlatformLinks();
      const pl = links[platform] || { web: "", ios: "", android: "" };
      let message = `⚙️ *Управление: ${platform.toUpperCase()}*

`;
      message += `🌐 Web: ${pl.web || "❌ не установлено"}
`;
      message += `🍎 iOS: ${pl.ios || "❌ не установлено"}
`;
      message += `🤖 Android: ${pl.android || "❌ не установлено"}

`;
      message += "Выберите что установить:";
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getPlatformEditMenu(platform)
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("show_")) {
      const platform = data.replace("show_", "");
      const links = readPlatformLinks();
      const pl = links[platform] || { web: "", ios: "", android: "" };
      let message = `📋 *${platform.toUpperCase()} - Текущие ссылки:*

`;
      message += `🌐 Web:
\`${pl.web || "не установлено"}\`

`;
      message += `🍎 iOS:
\`${pl.ios || "не установлено"}\`

`;
      message += `🤖 Android:
\`${pl.android || "не установлено"}\``;
      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_web_")) {
      const platform = data.replace("edit_web_", "");
      userState[userId] = { platform, editType: "web" };
      bot.editMessageText(`🌐 *Web ссылка для ${platform.toUpperCase()}*

Отправьте ссылку:`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "❌ Отмена", callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_ios_")) {
      const platform = data.replace("edit_ios_", "");
      userState[userId] = { platform, editType: "ios" };
      bot.editMessageText(`🍎 *iOS ссылка для ${platform.toUpperCase()}*

Отправьте ссылку:`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "❌ Отмена", callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("edit_android_")) {
      const platform = data.replace("edit_android_", "");
      userState[userId] = { platform, editType: "android" };
      bot.editMessageText(`🤖 *Android APK для ${platform.toUpperCase()}*

Отправьте ссылку на APK:`, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "❌ Отмена", callback_data: `manage_${platform}` }]] }
      });
      bot.answerCallbackQuery(query.id);
    } else if (data.startsWith("delete_")) {
      const platform = data.replace("delete_", "");
      const links = readPlatformLinks();
      if (links[platform]) {
        delete links[platform];
        if (writePlatformLinks(links)) {
          bot.editMessageText(`✅ Платформа *${platform}* удалена!`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "back_main" }]] }
          });
        } else {
          bot.answerCallbackQuery(query.id, { text: "❌ Ошибка", show_alert: true });
        }
      } else {
        bot.answerCallbackQuery(query.id, { text: `⚠️ Не найдена`, show_alert: true });
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
        bot.sendMessage(chatId, `📥 Файл получен: ${msg.document.file_name}
🔗 Ссылка: \`${fileLink}\``, { parse_mode: "Markdown" });
      } catch (error) {
        bot.sendMessage(chatId, "❌ Ошибка при получении файла. Попробуйте отправить ссылку вместо файла.");
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
        `✅ *${names[state.editType]} для ${state.platform} сохранена!*

\`${linkToSave}\``,
        { parse_mode: "Markdown", reply_markup: getPlatformEditMenu(state.platform) }
      );
    } else {
      bot.sendMessage(chatId, "❌ Ошибка при сохранении.");
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
