const redisClient = require('./redisClient');

/**
 * Полная очистка Redis
 */
async function clearAllCache() {
  try {
    await redisClient.flushAll();
    console.log('✅ Все ключи Redis очищены');
  } catch (err) {
    console.error('Ошибка очистки Redis:', err);
  }
}

module.exports = clearAllCache;
