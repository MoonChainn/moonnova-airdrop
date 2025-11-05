// src/utils/telegram.js
import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Kiểm tra user đã join Telegram group/channel chưa
 * @param {string|number} telegramId - Telegram user ID
 * @param {string|number} chatId - Telegram group/channel ID
 * @returns {Promise<boolean>} - true nếu user đã join
 */
export const isUserInGroup = async (telegramId, chatId) => {
  try {
    const res = await axios.get(`${TELEGRAM_API_URL}/getChatMember`, {
      params: {
        chat_id: chatId,
        user_id: telegramId,
      },
    });

    const status = res.data.result.status;
    return ["member", "creator", "administrator"].includes(status);
  } catch (err) {
    console.error(
      "Telegram verification error:",
      err.response?.data || err.message
    );
    return false;
  }
};
