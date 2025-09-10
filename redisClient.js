const redis = require('redis');
//require('dotenv').config(); // загружает .env

// Singleton Redis клиент
let client;

function getRedisClient() {
  if (!client) {
    client = redis.createClient({
      url: 'redis://127.0.0.1:6379', // слушаем только локально,
      //password: process.env.REDIS_PASSWORD, // пароль из .env
      socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 500) // авто-переподключение
      }
    });

    // Логирование ошибок
    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    // Подключаемся
    client.connect()
      .then(() => console.log('Redis подключен ✅'))
      .catch(err => console.error('Ошибка подключения к Redis:', err));

    // Настройка безопасного кэширования (макс память + LRU)
    client.configSet('maxmemory', '256mb')
      .then(() => client.configSet('maxmemory-policy', 'allkeys-lru'))
      .then(() => console.log('Redis безопасно настроен для кэша ✅'))
      .catch(err => console.error('Ошибка настройки maxmemory:', err));
  }
  return client;
}

// Экспортируем клиент
module.exports = getRedisClient();

/*
Singleton — один клиент на весь проект, повторное require не создаёт новое подключение.

Локальное подключение — Redis слушает только 127.0.0.1.

Авто-переподключение — при обрыве соединения Node.js пытается переподключиться.

Безопасность памяти — maxmemory 256 МБ + политика allkeys-lru → старые ключи удаляются, чтобы не забивалась память.

Логирование — видно любые ошибки Redis.

Опционально пароль — можно включить requirepass для продакшена.
*/