const redisClient = require('./redisClient');

/**
 * Универсальный кэш для страниц / статей
 * @param {string} key - уникальный ключ для Redis, например "page:en:home"
 * @param {function} callback - асинхронная функция, возвращающая объект данных
 * @param {number} ttl - время жизни кэша в секундах (по умолчанию 60)
 */
async function cachePage(key, callback, ttl = 60) {
  try {
    // Пробуем достать из Redis
    const cached = await redisClient.get(key);

    if (cached) {
      console.log(`Отдаём из Redis: ${key}`);
      return JSON.parse(cached);
    }

    // Генерим новые данные
    const data = await callback();

    // Кладём в Redis (с TTL)
    await redisClient.setEx(key, ttl, JSON.stringify(data));

    console.log(`Сохранили в Redis: ${key} (ttl=${ttl}s)`);
    return data;

  } catch (err) {
    console.error('Ошибка cachePage:', err);
    // если Redis недоступен — работаем напрямую
    return callback();
  }
}


async function clearAllCache() {
  try {
    await redisClient.flushAll();
    console.log('✅ Все ключи Redis очищены');
  } catch (err) {
    console.error('Ошибка очистки Redis:', err);
  }
}


module.exports = cachePage;
