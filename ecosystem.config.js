module.exports = {
  apps: [
    {
      name: "web4myself",              // имя приложения (любое)
      script: "app.js",           // точка входа (или server.js)
      instances: 1,               // количество процессов (1 = обычный режим)
      autorestart: true,          // авто-ребут при падении
      watch: true,               // следить за файлами (лучше false на проде)
      watch_delay: 1000, // задержка чтобы не дергался постоянно
      max_memory_restart: "300M", // перезапуск если >300МБ памяти
      env: {
        NODE_ENV: "development",  // переменные окружения для dev
      },
      env_production: {
        NODE_ENV: "production"    // переменные окружения для prod
      },
      error_file: "./logs/err.log",  // ошибки
      out_file: "./logs/out.log",    // обычные логи
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
