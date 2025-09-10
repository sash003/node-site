const express = require('express');
const app = express();
const port = 4320;
const path = require('path');
const Model = require('./models/Model');
const http = require('http');
const server = http.createServer(app);
const multer = require('multer');
const fs = require('fs');
const FileType = require('file-type');
const session = require('express-session');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const clearAllCache = require('./clearCache'); // функция очистки Redis
ejs.cache = null;





/*

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Docs",
      version: "1.0.0",
      description: "Документация для твоего API"
    },
  },
  apis: ["./controllers/*.js"], // где Swagger будет искать комменты
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

*/

require('./chat')(server, Model); // подключаем чат

delete require.cache[require.resolve('ejs')];


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Полностью очищаем require.cache для views
app.use((req, res, next) => {
  Object.keys(require.cache).forEach(function (key) {
    if (key.includes('/views/')) {
      delete require.cache[key];
    }
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));


// EJS шаблонизатор
app.set('view engine', 'ejs');
// отключаем кэш EJS-шаблонов
app.set('view cache', false);


app.use(session({
  secret: 'supersecretkey', // ключ для подписи cookie
  resave: false,            // не сохранять сессию, если не изменялась
  saveUninitialized: false, // не создавать пустые сессии
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 час
  }
}));


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Разрешённые MIME-типы
const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/ogg',
  'application/pdf'
];

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = path.join(__dirname, 'public', 'uploads');
    if (file.fieldname === 'avatar') {
      uploadDir = path.join(uploadDir, 'avatars'); // отдельная папка для аватарок
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'avatar') {
      const baseName = req.body.name || Date.now();
      cb(null, baseName + ext);
    } else {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }
});

// Общий upload для проверки MIME
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Недопустимый формат файла'), false);
    }
    cb(null, true);
  }
});

// Мидлвари для аватарки и файлов
const avatarUpload = upload.single('avatar');
const filesUpload  = upload.array('files[]', 3);

// Функция для безопасного текста
function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => (
    {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[s]
  ));
}

// Проверка реального типа файла через file-type
async function checkFileType(filePath) {
  const stream = fs.createReadStream(filePath);
  const type = await FileType.fromStream(stream);
  stream.destroy();
  return type ? type.mime : null;
}





app.post('/reset-password', async (req, res) => {
  try {
    console.log(req.body);
    const { reset_email, new_password, new_password_confirmation } = req.body;

    if (!reset_email || !new_password || !new_password_confirmation) {
      return res.json({ status: 'error', message: 'Заполните все поля' });
    }

    // ищем пользователя и проверяем, что email подтверждён
    const users = await Model.query(
      'SELECT * FROM users WHERE email = ? AND email_verified_at IS NOT NULL',
      [reset_email]
    );

    if (users.length === 0) {
      return res.json({ status: 'error', message: 'Пользователь не найден или email не подтверждён' });
    }

    const user = users[0];

    // хэшируем новый пароль
    const hashed = await bcrypt.hash(new_password, 10);

    // обновляем пароль в базе
    await Model.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashed, user.id]
    );

    return res.json({ status: 'success', message: 'Пароль успешно обновлён' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Ошибка сервера' });
  }
});




// универсальный маршрут регистрации и авторизации
app.post('/auth', async (req, res) => {

  avatarUpload(req, res, async (err) => {
    if (err) return res.json({ status: 'error', message: err.message });

    const { name, email, password, password_confirmation } = req.body;

    try {
      // --- регистрация ---
      if (name && password && password_confirmation && email) {
        if (password !== password_confirmation)
          return res.json({ status: 'error', message: 'Пароли не совпадают' });

        const users = await Model.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0)
          return res.json({ status: 'error', message: 'Такой email уже зарегистрирован' });

        const hashed = await bcrypt.hash(password, 10);

        // --- аватарка ---
        let avatarPath = '/uploads/avatars/default.png';
        if (req.file) {
          const ext = path.extname(req.file.originalname).toLowerCase();
          const safeName = name.replace(/[^a-z 0-9]/gi, '_');
          const newFileName = `${safeName}${ext}`;
          const newPath = path.join(__dirname, 'public', 'uploads', 'avatars', newFileName);

          await fs.promises.rename(req.file.path, newPath);
          avatarPath = `/uploads/avatars/${newFileName}`;
        }

        await Model.query(
          'INSERT INTO users (name, email, password, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [name, email, hashed, avatarPath]
        );

        // --- письмо подтверждения ---
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: 'sash3003@gmail.com', pass: 'gokc mbrb mejt ilnb' }
        });

        const protocol = req.protocol;
        const host = req.get('host');
        const verifyUrl = `${protocol}://${host}/verify?email=${encodeURIComponent(email)}`;

        await transporter.sendMail({
          from: '"Node.js Site" <web4myself@gmail.com>',
          to: email,
          subject: 'Подтверждение регистрации',
          html: `
            <h2>Здравствуйте, ${name}!</h2>
            <p>Подтвердите свой email:</p>
            <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#28a745;color:white;text-decoration:none;border-radius:5px;">Подтвердить email</a>
          `
        });

        return res.json({ status: 'success', type: 'register', message: 'Регистрация успешна, проверьте почту' });
      }

      // --- вход ---
      if (!email || !password)
        return res.json({ status: 'error', message: 'Заполните email и пароль' });

      const users = await Model.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0)
        return res.json({ status: 'error', message: 'Пользователь не найден' });

      const user = users[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res.json({ status: 'error', message: 'Неверный пароль' });

      if (!user.email_verified_at)
        return res.json({ status: 'error', message: 'Подтвердите email' });

      // --- смена аватарки при входе ---
      let avatarPath = '';
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const safeName = user.name.replace(/[^a-z 0-9]/gi, '_');
        const newFileName = `${safeName}${ext}`;
        const newPath = path.join(__dirname, 'public', 'uploads', 'avatars', newFileName);

        await fs.promises.rename(req.file.path, newPath);
        avatarPath = `/uploads/avatars/${newFileName}`;

        await Model.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, user.id]);
      }

      req.session.userId = user.id;

      res.cookie('user', JSON.stringify({
        id: user.id,
        name: user.name,
        avatar: avatarPath || user.avatar
      }), {
        maxAge: 777 * 24 * 60 * 60 * 1000,
        httpOnly: false, // чтобы JS мог читать (если true – только сервер)
        sameSite: 'Lax'
      });

      return res.json({ status: 'success', type: 'login', message: 'Успешный вход', avatar: avatarPath });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Ошибка сервера' });
    }
  });

});


// подтверждение email
app.get('/verify', async (req, res) => {
  const { email } = req.query;

  try {
    const users = await Model.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) return res.send(`
      <h2 style="text-align:center; margin-top:50px; color:red;">Пользователь не найден</h2>
    `);

    const user = users[0];

    // Помечаем email как подтверждённый
    await Model.query('UPDATE users SET email_verified_at = NOW() WHERE email = ?', [email]);

    // Сохраняем сессию
    req.session.userId = user.id;

    // Делаем куки
    const avatarPath = user.avatar || '/img/default-avatar.png';
    res.cookie('user', JSON.stringify({
      id: user.id,
      name: user.name,
      avatar: avatarPath
    }), {
      maxAge: 777 * 24 * 60 * 60 * 1000, // почти 2 года
      httpOnly: false,
      sameSite: 'Lax'
    });

    // Отправляем минималистичный HTML с JS для localStorage и редиректа
    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Email подтверждён</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            background: #f2f2f2; 
          }
          h2 { color: #4CAF50; }
          .avatar { width: 100px; height: 100px; border-radius: 50%; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h2>Email подтверждён!</h2>
        <img src="${avatarPath}" alt="Аватар" class="avatar">
        <script>
          // Сохраняем данные пользователя в localStorage
          localStorage.setItem('userName', '${user.name}');
          localStorage.setItem('avatar', '${avatarPath}');
          
          // Редирект на главную через 3 секунды
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <h2 style="text-align:center; margin-top:50px; color:red;">
        Ошибка подтверждения. Попробуйте позже.
      </h2>
    `);
  }
});





// Обработчик комментариев
app.post('/comments', (req, res) => {
  filesUpload(req, res, async (err) => {
    try {
      // Ошибки Multer (лимиты и т.п.)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.json({success: false, message: 'Файл слишком большой (макс. 10 МБ)'});
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.json({success: false, message: 'Можно загрузить максимум 3 файла!'});
        }
        return res.json({success: false, message: 'Ошибка загрузки файла: ' + err.message});
      } else if (err) {
        return res.json({success: false, message: 'Ошибка: ' + err.message});
      }

      const {name = '', comment = '', slug = ''} = req.body;

      // Универсально собираем файлы: поддержка .any() (массив) и .fields() (объект)
      let files = [];
      if (Array.isArray(req.files)) {
        files = req.files;
      } else if (req.files && Array.isArray(req.files['files[]'])) {
        files = req.files['files[]'];
      } else if (req.files && typeof req.files === 'object') {
        for (const k of Object.keys(req.files)) {
          const v = req.files[k];
          if (Array.isArray(v)) files.push(...v);
        }
      }

      const fileHtmlParts = [];

      for (const f of files) {
        const filePath = path.join(f.destination, f.filename);
        let mime = null;

        try {
          mime = await checkFileType(filePath);
        } catch (_) {
          // если не получилось определить тип — считаем недопустимым
        }

        if (!mime || !ALLOWED_MIME.includes(mime)) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {
          }
          return res.json({success: false, message: 'Недопустимый формат файла'});
        }

        const fileUrl = `/uploads/${encodeURIComponent(f.filename)}`;

        if (mime.startsWith('image/')) {
          fileHtmlParts.push(`<img src="${fileUrl}" alt="${escapeHtml(f.originalname)}" class="comment-img">`);
        } else if (mime.startsWith('video/')) {
          fileHtmlParts.push(`<video controls src="${fileUrl}" class="comment-video"></video>`);
        } else if (mime.startsWith('audio/')) {
          fileHtmlParts.push(`<audio controls src="${fileUrl}" class="comment-audio"></audio>`);
        } else if (mime === 'application/pdf') {
          fileHtmlParts.push(`<a href="${fileUrl}" target="_blank">${escapeHtml(f.originalname)}</a>`);
        } else {
          // на всякий случай — ссылка на прочие типы
          fileHtmlParts.push(`<a href="${fileUrl}" target="_blank">${escapeHtml(f.originalname)}</a>`);
        }
      }

      const filesHtml = fileHtmlParts.join(' ');
      const html = `
        <div class="comment">
          <b>${escapeHtml(name)}</b>: <span class="comment-text">${escapeHtml(comment)}</span><br>
          ${filesHtml}
        </div>
      `;

      await Model.query(
        'INSERT INTO comments (slug, name, comment, files_html, created_at) VALUES (?,?,?,?,?)',
        [slug, name, comment, filesHtml, Math.floor(Date.now() / 1000)]
      );

      return res.json({success: true, html});
    } catch (e) {
      console.error(e);
      return res.json({success: false, message: 'Ошибка сервера: ' + e.message});
    }
  });
});



// поиск
function normalize(str) {
  return str.toLowerCase();
}

app.post('/search', async (req, res) => {
  let search = req.body.q,
    lang = req.body.lang,
    table = 'posts_' + lang;

  let results = [];
  const normSearch = normalize(search);

  // 1. Поиск в базе
  try {
    const posts = await Model.query(
      "SELECT * FROM `" + table + "` WHERE href LIKE ? OR title LIKE ? OR description LIKE ?",
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );

    posts.forEach(post => {
      results.push({ href: post.href, title: post.title });
    });
  } catch (err) {
    console.error('Ошибка запроса к базе:', err);
  }

  // 2. Поиск внутри файлов
  const dir = path.join(__dirname, 'views', 'posts', lang);
  try {
    const files = fs.readdirSync(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (normalize(content).includes(normSearch)) {
        const name = file.replace(/\.[^/.]+$/, "");
        // Проверяем, нет ли уже такого href
        if (!results.find(r => r.href === name)) {
          // Берём title из базы по href = name
          let title = name; // по умолчанию имя файла
          try {
            const [row] = await Model.query(
              "SELECT title FROM `" + table + "` WHERE href = ? LIMIT 1",
              [name]
            );
            if (row) title = row.title;
          } catch (err) {
            console.error('Ошибка получения title из базы:', err);
          }
          results.push({ href: name, title });
        }
      }
    }
  } catch (err) {
    console.error('Ошибка чтения файлов:', err);
  }

  // 3. Формируем HTML
  let html = '';
  if (results.length) {
    results.forEach(item => {
      html += `<a class="ajax-link search-link" href="/${lang}/post/${item.href}">${item.title}</a>`;
    });
  } else {
    html = 'Ничего не найдено';
  }

  return res.send(html);
});


// Очистка кэша (только для админов или при разработке!)
app.get('/clearCache', async (req, res) => {
  try {
    await clearAllCache();
    res.send('✅ Все ключи Redis очищены');
  } catch (err) {
    res.status(500).send('Ошибка очистки Redis: ' + err.message);
  }
});


app.get('/', (req, res) => {
  res.redirect('/ru');
});


// Middleware, который обрабатывает входящий путь и подключает нужные роуты
app.use((req, res, next) => {

  res.setHeader('Cache-Control', 'no-store');

  // Разбиваем путь на части и фильтруем пустые
  const parts = req.path.split('/').filter(Boolean);

  // Определяем язык
  const langs = ['ru', 'en', 'ua'];
  let lang = 'ru'; // язык по умолчанию
  if (parts.length && langs.includes(parts[0])) {
    lang = parts.shift(); // удаляем язык из массива
  }
  req.lang = lang; // передаем язык в контроллер

  // "/" или "/about" → общий Routes.js
  if (parts.length === 0 || (parts.length === 1 && parts[0] !== 'admin')) {
    req.page = parts[0] || 'home';
    return require('./routes/Routes')(req, res, next);
  }

  // "/post/slug" → detailRoutes.js
  if (parts[0] === 'post' && parts[1]) {
    req.postSlug = parts[1];
    return require('./routes/detailRoutes')(req, res, next);
  }

  // "/admin/..." → adminRoutes.js
  if (parts[0] === 'admin') {
    return require('./routes/adminRoutes')(req, res, next);
  }

  // Всё остальное → ищем routes/${name}Routes.js
  try {
    const route = require(`./routes/${parts[0]}Routes`);
    return route(req, res, next);
  } catch (err) {
    return next(); // если нет файла роутов → 404 или другое middleware
  }
});



server.listen(port, '0.0.0.0', () => {
  console.log(`Server + Socket.IO running on http://0.0.0.0:${port}`);
});

server.listen(port, '::', () => {
  console.log(`Server running on http://[::]:${port}`);
});

// Настраиваем таймауты
server.timeout = 5 * 60 * 1000;         // 5 минут на всю обработку запроса
server.headersTimeout = 6 * 60 * 1000; // чуть больше таймаута соединения
server.keepAliveTimeout = 60 * 1000;   // 60 секунд для keep-alive соединений