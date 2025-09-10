

const mysql = require('mysql2/promise');
const { db } = require('../config/config'); // подключаем конфиг
const fs = require('fs').promises;
const path = require('path');


const pool = mysql.createPool(db);

// Проверка подключения
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL подключен через пул');
    conn.release();
  } catch (err) {
    console.error('❌ Ошибка подключения к MySQL:', err.message);
  }
})();



async function setFlags(req) {
  // Получаем путь и убираем слэши по краям
  let way = req.url.replace(/^\/|\/$/g, '');
  let parts = way.split('/');
  let lang = parts[0];

  if (!['ru', 'en', 'ua'].includes(lang)) return '';

  if (parts.length > 1) {
    way = way.substring(3); // убираем код языка и слэш
  } else {
    way = '';
  }

  let flags = '';
  const flagsDir = path.join(__dirname, '..', 'public', 'img', 'flags');
  let files = await fs.readdir(flagsDir);

  // Основной флаг текущего языка
  const currentLangIndex = files.findIndex(file => file.includes(lang));
  if (currentLangIndex !== -1) {
    flags = `<img src="/img/flags/${lang}.png" />`;
    files.splice(currentLangIndex, 1); // удаляем текущий язык
  }

  // Ссылки на остальные языки
  files.forEach(file => {
    const l = file.slice(0, 2);
    flags += `<br/><a class="ajax-link" href="/${l}/${way}"><img src="/img/flags/${file}" /></a>`;
  });

  return flags;
}



function setCode(text) {
  return text.replace(
    /(<code class="language-[a-z]{3,17}">)([\s\S]+?)(<\/code>)/gi,
    (_, openTag, codeContent, closeTag) => {
      // Экранируем специальные символы HTML
      const escaped = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return `${openTag}${escaped}${closeTag}`;
    }
  );
}


async function getPosts(sql, params = [], ignored = [], lang = 'ru') {
  const rows = await query(sql, params, ignored);
  if (!rows.length) return '<p>Нет данных</p>';

  const escapeHtml = str => String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  let html = '<div class="articles-container">';

  rows.forEach(row => {
    html += '<div class="article-card">';
    html += `<a href="/${lang}/post/${escapeHtml(row.href)}" class="read-more ajax-link">`;
    html += `<img src="/img/logo/${row.category}.png" alt="">`;
    html += `<h3>${escapeHtml(row.title)}</h3>`;
    html += `<p>${escapeHtml(row.description)}</p>`;
    const date = new Date(row.created_at * 1000); // переводим секунды → миллисекунды
    const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    html += `<p class="post-time">${dateStr}</p>`;
    html += `</a>`;
    html += '</div>'; // .article-card
  });
  html += '</div>'; // .articles-container

  return html;
}


/**/


async function getCommentsHtml(slug) {
  const rows = await query(
    `SELECT *
     FROM comments
     WHERE slug = ?
     ORDER BY created_at DESC`,
    [slug]
  );

  if (!rows.length) return '<div class="comments-list"></div>';

  let html = '<div class="comments-list">';
  rows.forEach(c => {
    const safeName = escapeHtml(c.name);
    const safeText = escapeHtml(c.comment);

    const date = new Date(c.created_at * 1000);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    let files = '';
    if (c.files_html) {
      files = `<br>${c.files_html}`;
    }
    html += `
      <div class="comment">
        <b>${safeName}:</b> <span class="comment-text"> ${safeText}</span>${files}<span class="comment-date">${dateStr}</span>
      </div>
    `;
  });
  html += '</div>';

  return html;
}


function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


async function getAllAdminChats() {
  // 1. Получаем все уникальные пары user + игра с последним сообщением
  const userGames = await query(`
      SELECT CASE
                 WHEN from_user = 'admin' THEN to_user
                 ELSE from_user
                 END         AS user_id,
             product_slug,
             MAX(created_at) AS last_msg
      FROM chat_messages
      WHERE to_user = 'admin'
         OR from_user = 'admin'
      GROUP BY user_id, product_slug
      ORDER BY last_msg DESC
  `);

  if (!userGames.length) return '<div class="chat-grid-admin"></div>';

  // 2. Для каждой пары получаем все сообщения
  const panels = await Promise.all(userGames.map(async (ug) => {
    const messages = await query(
      `SELECT from_user, to_user, message, created_at
       FROM chat_messages
       WHERE product_slug = ?
         AND (from_user = ? OR to_user = ? OR from_user = 'admin' OR to_user = 'admin')
       ORDER BY created_at ASC`,
      [ug.product_slug, ug.user_id, ug.user_id]
    );

    let panelHtml = `
      <div class="chat-panel-admin">
        <div class="chat-header-admin">
          <b>${ug.user_id}</b> | Игра: <b>${ug.product_slug}</b>
        </div>
        <div class="chat-messages-admin" id="${ug.product_slug}_${ug.user_id}">
    `;

    messages.forEach(m => {
      const date = new Date(m.created_at * 1000);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;

      panelHtml += `
        <div class="chat-message-admin ${m.from_user === 'admin' ? 'from-admin' : 'from-user'}">
          <span class="chat-from-admin">${m.from_user}:</span>
          ${m.message}
          <div class="chat-time-admin">${time}</div>
        </div>
      `;
    });

    panelHtml += `
        </div>
        <form class="chat-input-form-admin" data-slug="${ug.product_slug}" data-user="${ug.user_id}">
          <textarea class="chat-input-admin" placeholder="Введите сообщение..."></textarea>
          <button type="submit" class="chat-send-btn-admin">Отправить</button>
        </form>
      </div>
    `;

    return panelHtml;
  }));

  // 3. Возвращаем сетку панелей
  return `<div class="chat-grid-admin">${panels.join('')}</div>`;
}


/**
 * Универсальная функция для выполнения любых SQL-запросов
 * @param {string} sql - SQL-запрос
 * @param {Array} params - параметры для подготовленного запроса
 * @returns {Promise<any>}
 */
async function query(sql, params = [], ignoreFields = []) {
  try {
    const [results] = await pool.query(sql, params);

    if (/^\s*select/i.test(sql)) {
      let data = results;
      if (ignoreFields.length) {
        data = results.map(row => {
          ignoreFields.forEach(f => delete row[f]);
          return row;
        });
      }
      return data;
    } else {
      return {
        affectedRows: results.affectedRows,
        insertId: results.insertId || null
      };
    }
  } catch (err) {
    throw err;
  }
}



async function renderPost(slug) {
  try {
    const rows = await query('SELECT * FROM `posts` WHERE slug = ? LIMIT 1', [slug]);
    if (!rows.length) return '<p>Статья не найдена</p>';

    const g = rows[0];
    const escape = str => String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));

    return `
      <div class="game-card">
        <img class="game-card__image" src="/img/games/${escape(g.image)}" alt="${escape(g.title)}">
        <div class="game-card__info">
          <h2 class="game-card__title">${escape(g.title)}</h2>
          <p class="game-card__description">${escape(g.description)}</p>
          <p class="game-card__price">
            ${g.old_price ? `<span class="game-card__old-price">${escape(g.old_price)}₽</span> ` : ''}
            <strong class="game-card__current-price">${escape(g.price)}₽</strong>
          </p>
          <p class="game-card__stock">В наличии: ${escape(g.stock)}</p>
          <a class="game-card__buy-btn" href="/buy/${escape(g.slug)}">Купить</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    return '<p>Ошибка при загрузке игры</p>';
  }
}


async function queryAsTable(sql, params = [], ignored = []) {
  const rows = await query(sql, params, ignored);
  if (!rows.length) return '<p>Нет данных</p>';

  const escapeHtml = str => String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  let html = '<table class="data-table"><tr>';
  Object.keys(rows[0]).forEach(col => {
    html += `<th class="data-th">${escapeHtml(col)}</th>`;
  });
  html += '</tr>';

  rows.forEach(row => {
    html += '<tr>';
    Object.keys(row).forEach(key => {
      const val = row[key];

      if (key === 'image' && val) {
        html += `<td class="data-td"><img src="/img/games/${val}" alt="" ></td>`;
      } else {
        html += `<td class="data-td">${escapeHtml(val)}</td>`;
      }
    });
    html += '</tr>';
  });


  html += '</table>';
  return html;
}


function getDescByKey(key) {
  const descriptions = {
    ru_home: "Суперсайт на Node.js с высокой производительностью, динамическими страницами и современным MVC. Поддержка комментариев с мультизагрузкой файлов, AJAX-запросов и мультиязычных флагов.",
    en_home: "A Node.js supersite with high performance, dynamic pages and modern MVC. Support for comments with multiple file uploads, AJAX requests and multilingual flags.",
    ua_home: "Суперсайт на Node.js з високою продуктивністю, динамічними сторінками та сучасним MVC. Підтримка коментарів із мультизавантаженням файлів, AJAX-запитів та мультимовних прапорів."
  }
  return descriptions[key] || 'Страница'
}


function getTitleByKey(key) {
  const pages = {
    home: 'Node.js',
  };
  return pages[key] || 'Страница';
}

module.exports = {
  pool,
  query,
  getTitleByKey,
  getDescByKey,
  getPosts,
  getAllAdminChats,
  setCode,
  getCommentsHtml,
  setFlags
};
