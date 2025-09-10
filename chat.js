// общий чат
// Экспортируем функцию, которая принимает server (HTTP/HTTPS сервер) и Model (для работы с базой)
module.exports = function (server, Model) {

  const {Server} = require('socket.io');
  const axios = require('axios');

  const io = new Server(server);

  const BOT_TOKEN = "8374020291:AAEnNaFy5BkHg3AHrbkRhDaiFcq9EsDHLiU";
  const CHAT_ID = "8486586095"; // можно ID группы или лички




  async function sendToTelegram(text, from, socket) {
    try {
      // Получаем IP пользователя
      let ip = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
      if (ip && ip.includes(",")) {
        ip = ip.split(",")[0].trim(); // первый IP в списке
      }

      let location = "";

      if (ip) {
        if (ip === "::1" || ip.startsWith("127.") || ip === '185.39.73.154') {
          // локальный адрес
          location = `🌍 Localhost (IP: ${ip})`;
          return;
        } else {
          try {
            const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,city,query`);
            if (res.data && res.data.status === "success") {
              location = `🌍 ${res.data.country}, ${res.data.city} (IP: ${res.data.query})`;
            }
          } catch (geoErr) {
            console.error("Ошибка получения гео:", geoErr.message);
          }
        }
      }

      const now = new Date();
      const day   = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year  = now.getFullYear();
      const hours   = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const message = `💬 Сообщение от ${from}:\n${text}\n${location}\n🕒 ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;


      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message,
      });
    } catch (err) {
      console.error("Ошибка отправки в Telegram:", err.message);
    }
  }



  io.on('connection', (socket) => {

    const ip = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;

    sendToTelegram('На сервере', 'Они', socket)

    // ==== 1. Подключение к чату ====
    socket.on('joinChat', async ({user} = {}) => {
      try {
        const history = await Model.query(
          'SELECT name, message, created_at FROM chat_messages ORDER BY id ASC'
        );

        const formattedHistory = history.map(m => ({
          from: m.name,
          message: m.message,
          created_at: m.created_at
        }));

        socket.emit('chatHistory', formattedHistory);
      } catch (e) {
        console.error('history error:', e.message);
      }
    });




    // ==== 2. Отправка нового сообщения ====
    socket.on('sendMessage', async ({from, message}) => {
      const text = (message || '').toString().trim();

      // проверка: не пустое и не длиннее 500 символов
      if (!text || !from || text.length > 500) return;

      try {
        const timestamp = Math.floor(Date.now() / 1000);

        await Model.query(
          'INSERT INTO chat_messages (name, message, created_at) VALUES (?, ?, ?)',
          [from, text, timestamp]
        );

        io.emit('newMessage', {
          from,
          message: text,
          created_at: timestamp
        });
        sendToTelegram(text, from, socket)
      } catch (e) {
        console.error('insert error:', e.message);
      }
    });
  });
};
