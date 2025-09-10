const path = require('path');
const Model = require('../models/Model');
const fs = require("fs");
const cachePage = require('../cashePage');

/**
 * @swagger
 * /posts/{slug}:
 *   get:
 *     summary: Получение статьи с комментариями
 *     description: |
 *       Возвращает статью с комментариями.
 *       - Если запрос AJAX (`req.xhr = true`), то ответ в формате JSON.
 *       - Если обычный запрос, то возвращается готовая HTML-страница.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный идентификатор статьи (href)
 *     responses:
 *       '200':
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Заголовок страницы - заголовок статьи"
 *                 description:
 *                   type: string
 *                   example: "Короткое описание статьи"
 *                 table:
 *                   type: string
 *                   description: HTML статьи из файла
 *                   example: "<div id='post'>...</div>"
 *                 lang:
 *                   type: string
 *                   example: "ru"
 *                 flags:
 *                   type: string
 *                   description: HTML с флагами
 *                   example: "<div class='flags'><img src='/flags/ru.png'></div>"
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><head><title>Redis Cache</title></head><body>...разметка статьи...</body></html>"
 *       '404':
 *         description: Статья не найдена
 *       '500':
 *         description: Ошибка сервера
 */
exports.renderPostDetail = async (req, res) => {
  const lang = req.lang;
  const slug = req.postSlug;
  const cacheKey = `post:${lang}:${slug}`;

  try {
    // кэшируем только статью и метаданные (без комментариев)
    const cached = await cachePage(cacheKey, async () => {
      const flags = await Model.setFlags(req);
      const [post] = await Model.query(
        "SELECT * FROM `posts_" + lang + "` WHERE href = ? LIMIT 1",
        [slug]
      );

      if (!post) throw new Error('Статья не найдена');

      const articlePath = path.join(__dirname, "../views/posts", lang, slug + ".html");
      const articleContent = fs.existsSync(articlePath)
        ? Model.setCode(fs.readFileSync(articlePath, "utf-8"))
        : "";

      return { post, articleContent, flags };
    }, 600); // ttl

    const comments = await Model.getCommentsHtml(slug);

    if (req.xhr) {
      const html = `<div id="post">
      <h1 class="postH1">${cached.post.title}</h1>
      <div class="article-text">${cached.articleContent}</div>
      <br><br>
      <div id="comments-wrap">
          <h3>Комментарии</h3>

          <div class="forLightBox">${comments}</div>

          <form class="comment-form" enctype="multipart/form-data" data-slug="${slug}">
              <input type="text" name="name" placeholder="Ваше имя" class="comment-name" required>
              <textarea name="comment" placeholder="Ваш комментарий..." class="comment-text" required></textarea>

              <div class="comment-controls">
                  <label class="file-label">
                      Выбрать файл
                      <input type="file" name="files[]" class="file-input" multiple>
                  </label>

                  <button type="submit" class="comment-btn">
                      <img src="/img/button2.png" alt="Отправить">
                  </button>
              </div>
          </form>
      </div>
  </div>`;

      return res.json({
        title: cached.post.title,
        description: cached.post.description,
        table: html,
        lang: lang,
        flags: cached.flags,
      });
    } else {
      return res.render("layout2", {
        title: cached.post.title,
        description: cached.post.description,
        content: cached.articleContent,
        comments: comments,
        slug: slug,
        lang: lang,
        flags: cached.flags
      });
    }

  } catch (err) {
    res.status(500).send("Ошибка сервера: " + err.message);
  }
};



/**
 * @swagger
 * /lang:
 *   get:
 *     summary: Получение основной страницы сайта на разныч языках (список статей)
 *     description: |
 *       Возвращает контент страницы с постами и флагами.
 *       - Если запрос AJAX (`req.xhr = true`), то ответ в формате JSON.
 *       - Если обычный запрос, то рендерится HTML-шаблон страницы.
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: page
 *         required: false
 *         schema:
 *           type: string
 *           default: home
 *         description: В данном случае рендерится шаблон layout подключая /views/pages/{lang}/home
 *     responses:
 *       '200':
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Главная"
 *                 table:
 *                   type: string
 *                   description: HTML-контент постов или шаблон
 *                   example: "<div class='post'>...</div>"
 *                 lang:
 *                   type: string
 *                   example: "ru"
 *                 flags:
 *                   type: string
 *                   description: HTML с флагами
 *                   example: "<div class='flags'><img src='/flags/ru.png'></div>"
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><head><title>Главная</title></head><body>...разметка страницы...</body></html>"
 *       '500':
 *         description: Ошибка сервера
 */

//основная страница
exports.renderPage = async (req, res) => {
  const pageKey = req.page || 'home';
  const lang = req.lang;
  const cacheKey = `page:${lang}:${pageKey}`;

  try {
    const data = await cachePage(cacheKey, async () => {
      const flags = await Model.setFlags(req);
      const title = Model.getTitleByKey(pageKey);
      const descKey = lang + "_" + pageKey;
      const description = Model.getDescByKey(descKey);
      const table = await Model.getPosts(
        'SELECT * FROM `' + 'posts_' + lang + '` ORDER BY `id` DESC',
        [],
        ['id'],
        lang
      );

      return {
        page: `pages/${lang}/${pageKey}`,
        title: title,
        description: description,
        table: table,
        lang: lang,
        slug: '',
        flags: flags
      };
    }, 600); // ttl

    if (req.xhr) return res.json(data);
    res.render('layout', data);

  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера: ' + err.message);
  }
};

/*
const redisClient = require('../redisClient');

exports.renderPage = async (req, res) => {
  try {
    const pageKey = req.page || 'home';
    const lang = req.lang;
    const cacheKey = `page:${lang}:${pageKey}`; // уникальный ключ для Redis

    // 1. Проверяем кэш
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Отдаём главную страницу из Redis');
      const data = JSON.parse(cached);

      if (req.xhr) return res.json(data);
      return res.render('layout', data);
    }

    // 2. Если нет кэша — тянем из базы
    const flags = await Model.setFlags(req);
    const title = Model.getTitleByKey(pageKey);
    const descKey = lang + "_" + pageKey;
    const description = Model.getDescByKey(descKey);
    const table = await Model.getPosts(
      'SELECT * FROM `' + 'posts_' + lang + '` ORDER BY `id` DESC',
      [],
      ['id'],
      lang
    );

    const data = {
      page: `pages/${lang}/${pageKey}`,
      title: title,
      description: description,
      table: table,
      lang: lang,
      slug: '',
      flags: flags
    };

    // 3. Кладём в Redis на 60 секунд (можно увеличить)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

    // 4. Отдаём
    if (req.xhr) return res.json(data);
    res.render('layout', data);

  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера: ' + err.message);
  }
};


exports.renderPostDetail = async (req, res) => {
  try {
    const lang = req.lang;
    const tableSQL = 'posts_' + lang;
    const cacheKey = `post:${lang}:${req.postSlug}`; // кэшируем только статью

    // 1. Проверяем кэш статьи
    const cached = await redisClient.get(cacheKey);
    let post, articleContent, flags;
    if (cached) {
      console.log('Отдаём статью из Redis');
      ({ post, articleContent, flags } = JSON.parse(cached));
    } else {
      // если нет в кэше — тянем из базы
      flags = await Model.setFlags(req);
      [post] = await Model.query(
        "SELECT * FROM `" + tableSQL + "` WHERE href = ? LIMIT 1",
        [req.postSlug]
      );

      if (!post) return res.status(404).send("Статья не найдена");

      // читаем статью как HTML
      const articlePath = path.join(__dirname, "../views/posts", lang, req.postSlug + ".html");
      articleContent = fs.existsSync(articlePath)
        ? Model.setCode(fs.readFileSync(articlePath, "utf-8"))
        : "";

      // кладём в кэш только статью и метаданные (без комментариев)
      await redisClient.setEx(cacheKey, 300, JSON.stringify({ post, articleContent, flags }));
    }

    // комментарии всегда берём свежие
    const comments = await Model.getCommentsHtml(req.postSlug);

    if (req.xhr) {
      const html = `<div id="post">
          <h1 class="postH1">${post.title}</h1>
          <div class="article-text">${articleContent}</div>
          <br><br>
          <div id="comments-wrap">
              <h3>Комментарии</h3>
              <div class="forLightBox">${comments}</div>
              <form class="comment-form" enctype="multipart/form-data" data-slug="${req.postSlug}">
                  <input type="text" name="name" placeholder="Ваше имя" class="comment-name" required>
                  <textarea name="comment" placeholder="Ваш комментарий..." class="comment-text" required></textarea>
                  <div class="comment-controls">
                      <label class="file-label">Выбрать файл
                          <input type="file" name="files[]" class="file-input" multiple>
                      </label>
                      <button type="submit" class="comment-btn">
                          <img src="/img/button2.png" alt="Отправить">
                      </button>
                  </div>
              </form>
          </div>
      </div>`;

      return res.json({
        title: post.title,
        description: post.description,
        table: html,
        lang: lang,
        flags: flags,
      });
    } else {
      return res.render("layout2", {
        title: post.title,
        description: post.description,
        content: articleContent,
        comments: comments,
        slug: req.postSlug,
        lang: lang,
        flags: flags,
      });
    }
  } catch (err) {
    res.status(500).send("Ошибка сервера: " + err.message);
  }
};

*/