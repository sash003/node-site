-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Сен 10 2025 г., 01:22
-- Версия сервера: 10.3.13-MariaDB-log
-- Версия PHP: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `nodesite`
--

-- --------------------------------------------------------

--
-- Структура таблицы `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` int(10) UNSIGNED NOT NULL,
  `slug` varchar(222) NOT NULL,
  `name` varchar(100) NOT NULL,
  `comment` text NOT NULL,
  `files_html` text DEFAULT NULL,
  `created_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `posts_en`
--

CREATE TABLE `posts_en` (
  `id` int(10) UNSIGNED NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `href` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `watch` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `likes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `posts_en`
--

INSERT INTO `posts_en` (`id`, `category`, `title`, `href`, `description`, `watch`, `likes`, `created_at`) VALUES
(1, 'Node.js', 'MVC application on Node.js', 'Node_MVC', 'In modern web development, it is very important to maintain a clean and understandable project structure. The MVC (Model–View–Controller) architecture allows you to divide the code into three main parts: Model is responsible for working with data and the database, View is responsible for displaying information to the user, and Controller manages the application logic and connects the model with the view.', 0, 0, 1698624973),
(2, 'Node2.js', 'Node.js proxy setup via nginx', '_proxy_', 'In this article, we will look at how to properly proxy a Node.js application through Nginx. You will see how to check ports and configuration files, run Node.js using pm2, and configure proxying so that all traffic goes through Nginx, and statics are served directly.', 0, 0, 1705364240),
(3, 'Node.js', 'What is Node.js and why do you need it?', 'what_is_Node.js', 'Node.js is a server-side JavaScript runtime that lets you build fast, scalable web applications. Unlike traditional languages ​​like PHP or Python, Node.js is asynchronous and uses an event loop, making it especially efficient when handling a large number of simultaneous requests. In this article, we\'ll look at how asynchrony works, why an event loop is needed, and how Node.js differs from traditional server technologies.', 0, 0, 1705539809),
(4, 'Node4.js', 'Asynchrony in Node.js: callbacks, promises and async/await', 'async', 'Asynchrony is a key feature of Node.js, which allows it to handle multiple requests simultaneously without blocking the main program. Understanding how asynchronous code works is important for anyone writing in Node.js.', 0, 0, 1707267904),
(5, 'Node3.js', 'Working with the file system in Node.js: reading, writing and asynchrony', 'fs', 'Node.js and the fs module give you full control over your server\'s file system. Knowing how to use asynchrony, streams, and promises, you can build robust applications with logging, file uploads, content generation, and folder management without the risk of your server getting locked out.', 0, 0, 1707354352),
(6, 'Node5', 'Connecting a Database (MySQL, PostgreSQL, MongoDB) in Node.js and CRUD Example', 'db', 'We\'ll figure out how to manage dependencies in JavaScript projects using npm and Yarn. We\'ll learn how to install packages, update them, create your own, and simplify working with a project.', 0, 0, 0),
(7, 'Node6', 'Package managers npm and yarn - how to install dependencies and write your own', 'npm', 'We\'ll figure out how to manage dependencies in JavaScript projects using npm and Yarn. We\'ll learn how to install packages, update them, create your own, and simplify working with a project.', 0, 0, 1707528194),
(8, 'Node7', 'Sending Emails and Telegram Notifications in Node.js', 'mail_tel', 'It\'s easy to set up automatic notifications in Node.js: sending emails via SMTP using Nodemailer and messages to Telegram via the Bot API. We\'ll tell you how to quickly connect both methods so that users and administrators are always up to date.', 0, 0, 1708132030),
(9, 'Node8', 'WebSocket Chat with Rooms in Node.js', 'WebSockets', 'In this article, we\'ll look at how to make a real chat with rooms on Node.js and socket.io. Connecting, sending messages, working with users, and basic WebSocket techniques — all with code and examples.', 0, 0, 1715908099),
(10, 'Node.js', 'Optimizing the performance of Node.js applications', 'optimize', 'We analyze key techniques for speeding up Node.js applications: asynchronicity, caching, load balancing, query optimization, and monitoring. These tips will help make the server faster and more stable even under high load.', 0, 0, 1716080938),
(11, 'Node2.js', 'Clustering and Scaling Node.js: cluster module and PM2', 'clusters', 'Learn how to use all CPU cores in Node.js with cluster, and for production, manage processes and scale an application with PM2. Simple examples and tips for stable server operation.', 0, 0, 1717895390),
(12, 'Node3.js', 'Authentication and sessions - JWT, Passport.js, cookies vs localStorage', 'auth', 'JWT, Passport.js and sessions in Node.js are the basis for secure user authentication. Let\'s look at approaches and differences between storing data in cookies and localStorage.', 0, 0, 1717884000),
(13, 'Node9', 'Raising a Server on Socket.IO with SSL Support', 'ssl_socket', 'In this article, we will take a detailed look at how to properly set up a server on Socket.IO using SSL encryption for secure data exchange. We will configure the environment so that connections between clients and the server are protected by modern protocols.', 0, 0, 1721419191),
(14, 'Node.js', 'How to Use Redis to Speed ​​Up and Scale Applications', 'redis', 'Redis is a high-performance in-memory data store that is ideal for caching, session management, task queues, and API load limiting. In this article, we will look at the main Redis use cases, data structures, and implementation examples in Node.js for high-load projects.', 0, 0, 1722013781),
(15, 'Docker', 'What is Docker and why is it needed?', 'docker', 'Docker is a containerization platform that packages an application with its dependencies into a lightweight, isolated containerContainers start quickly, work the same on any server, and simplify development, testing, and deploymentIn this article, we will look at installing Docker on Windows, basic commands, working with images and containers, and creating your own images via Dockerfile and Compose', 0, 0, 1722616433),
(16, 'graphQL', 'GraphQL is the future of APIs for fast and convenient queries', 'graphQL', 'GraphQL is a modern way of working with data that allows the client to get exactly the fields they need in a single request. Unlike REST, it simplifies the structure of requests, reduces the load on the server, and speeds up frontend development.', 0, 0, 1722916433),
(17, 'Node11', 'Optimization of work with the database and caching (Redis, LRU cache, GraphQL DataLoader).', 'redis_graph', 'In this article, we\'ll look at how to speed up Node.js applications when working with a database using Redis caching, the LRU strategy, and GraphQL DataLoader to reduce the number of queries and combat the N+1 problem.', 0, 0, 1723016433);

-- --------------------------------------------------------

--
-- Структура таблицы `posts_ru`
--

CREATE TABLE `posts_ru` (
  `id` int(10) UNSIGNED NOT NULL,
  `category` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `href` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `watch` int(11) NOT NULL DEFAULT 0,
  `likes` int(11) NOT NULL DEFAULT 0,
  `created_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `posts_ru`
--

INSERT INTO `posts_ru` (`id`, `category`, `title`, `href`, `description`, `watch`, `likes`, `created_at`) VALUES
(1, 'Node.js', 'MVC-приложение на Node.js', 'Node_MVC', 'В современном веб-разработке очень важно поддерживать чистую и понятную структуру проекта. Архитектура MVC (Model–View–Controller) позволяет разделить код на три основные части: Model отвечает за работу с данными и базой, View отвечает за отображение информации пользователю, а Controller управляет логикой приложения и связывает модель с представлением.', 0, 0, 1698624973),
(2, 'Node2.js', 'Node.js настройка прокси через nginx', '_proxy_', 'В этой статье мы разберём, как правильно проксировать Node.js приложение через Nginx. Вы увидите, как проверить порты и файлы конфигурации, запустить Node.js с помощью pm2 и настроить проксирование, чтобы весь трафик шёл через Nginx, а статика отдавалась напрямую.', 0, 0, 1705364240),
(3, 'Node.js', 'Что такое Node.js и зачем он нужен?', 'what_is_Node.js', 'Node.js — это среда выполнения JavaScript на сервере, которая позволяет создавать быстрые и масштабируемые веб-приложения. В отличие от традиционных языков вроде PHP или Python, Node.js работает асинхронно и использует событийный цикл, что делает его особенно эффективным при большом количестве одновременных запросов. В статье разберём, как устроена асинхронность, зачем нужен событийный цикл и чем Node.js отличается от привычных серверных технологий.', 0, 0, 1705539809),
(4, 'Node4.js', 'Асинхронность в Node.js: callbacks, promises и async/await', 'async', 'Асинхронность — это ключевая особенность Node.js, которая позволяет обрабатывать множество запросов одновременно без блокировки основной программы. Понимание того, как работает асинхронный код, важно каждому, кто пишет на Node.js.', 0, 0, 1707267904),
(5, 'Node3.js', 'Работа с файловой системой в Node.js: чтение, запись и асинхронность', 'fs', 'Node.js и модуль fs дают полный контроль над файловой системой сервера. Зная, как использовать асинхронность, потоки и промисы, можно строить надёжные приложения с логами, загрузкой файлов, генерацией контента и управлением папками без риска блокировки сервера.', 0, 0, 1707354352),
(6, 'Node5', 'Подключение базы данных (MySQL, PostgreSQL, MongoDB) в Node.js и пример CRUD', 'db', 'В этой статье показано, как подключить MySQL, PostgreSQL и MongoDB к Node.js, настроить окружение и реализовать полноценный CRUD на Express.  Ты узнаешь базовые примеры запросов, увидишь структуру проекта и получишь советы по безопасности и производительности.', 0, 0, 1707527194),
(7, 'Node6', 'Менеджеры пакетов npm и yarn — как ставить зависимости и писать свои', 'npm', 'Разбираемся, как управлять зависимостями в проектах на JavaScript с помощью npm и Yarn. Учимся устанавливать пакеты, обновлять их, создавать свои собственные и упрощать работу с проектом.', 0, 0, 1707528194),
(8, 'Node7', 'Отправка писем и телеграм-уведомлений в Node.js', 'mail_tel', 'В Node.js легко настроить автоматические уведомления: отправку писем через SMTP с помощью Nodemailer и сообщения в Telegram через Bot API. Рассказываем, как быстро подключить оба способа, чтобы пользователи и администраторы всегда были в курсе событий.', 0, 0, 1708132030),
(9, 'Node8', 'Чат на WebSocket с комнатами в Node.js', 'WebSockets', 'В этой статье разбираем, как на Node.js и socket.io сделать реальный чат с комнатами. Подключение, отправка сообщений, работа с пользователями и базовые приёмы WebSocket — всё с кодом и примерами.', 0, 0, 1715908099),
(10, 'Node.js', 'Оптимизация производительности Node.js приложений', 'optimize', 'Разбираем ключевые приёмы ускорения Node.js приложений: асинхронность, кэширование, балансировка нагрузки, оптимизация запросов и мониторинг. Эти советы помогут сделать сервер быстрее и стабильнее даже при высокой нагрузке.', 0, 0, 1716080938),
(11, 'Node2.js', 'Кластеризация и масштабирование Node.js: cluster модуль и PM2', 'clusters', 'Узнай, как использовать все ядра процессора в Node.js с помощью cluster, а для продакшна — управлять процессами и масштабировать приложение через PM2. Простые примеры и советы по стабильной работе серверов.', 0, 0, 1716895390),
(12, 'Node3.js', 'Аутентификация и сессии — JWT, Passport.js, cookie vs localStorage', 'auth', 'JWT, Passport.js и сессии в Node.js — это основа для безопасной аутентификации пользователей. Разберём подходы и различия между хранением данных в cookie и localStorage.', 0, 0, 1717884000),
(14, 'Node9', 'Подъём сервера на Socket.IO с поддержкой SSL', 'ssl_socket', 'В этой статье мы подробно рассмотрим, как правильно поднять сервер на Socket.IO с использованием SSL-шифрования для безопасного обмена данными. Мы будем настраивать окружение так, чтобы соединения между клиентами и сервером были защищены современными протоколами.', 0, 0, 1721419191),
(15, 'Node.js', 'Как использовать Redis для ускорения и масштабирования приложений', 'redis', 'Redis — это высокопроизводительное хранилище данных в памяти, которое идеально подходит для кэширования, управления сессиями, очередей задач и ограничения нагрузки на API. В статье разберём основные сценарии использования Redis, структуры данных и примеры реализации в Node.js для высоконагруженных проектов.', 0, 0, 1722013781),
(16, 'Docker', 'Что такое Docker и зачем он нужен', 'docker', 'Docker — это платформа контейнеризации, которая упаковывает приложение с зависимостями в лёгкий изолированный контейнерКонтейнеры стартуют быстро, работают одинаково на любом сервере и упрощают разработку, тестирование и деплойВ статье мы разберём установку Docker на Windows, базовые команды, работу с образами и контейнерами, а также создание своих образов через Dockerfile и Compose', 0, 0, 1722616433),
(17, 'graphQL', 'GraphQL — будущее API для быстрых и удобных запросов', 'graphQL', 'GraphQL — это современный способ работы с данными, который позволяет клиенту получать именно те поля, которые нужны, в одном запросе. В отличие от REST, он упрощает структуру запросов, снижает нагрузку на сервер и ускоряет разработку фронтенда.', 0, 0, 1722916433),
(18, 'Node11', 'Оптимизация работы с базой данных и кэширование (Redis, LRU-кэш, GraphQL DataLoader).', 'redis_graph', 'В статье мы разберём, как ускорить работу Node.js-приложений при работе с базой данных, используя кэширование через Redis, стратегию LRU, а также GraphQL DataLoader для уменьшения количества запросов и борьбы с проблемой N+1.', 0, 0, 1723016433);

-- --------------------------------------------------------

--
-- Структура таблицы `posts_ua`
--

CREATE TABLE `posts_ua` (
  `id` int(10) UNSIGNED NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `href` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `watch` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `likes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `posts_ua`
--

INSERT INTO `posts_ua` (`id`, `category`, `title`, `href`, `description`, `watch`, `likes`, `created_at`) VALUES
(1, 'Node.js', 'MVC-программа на Node.js', 'Node_MVC', 'У сучасній веб-розробці дуже важливо підтримувати чисту та зрозумілу структуру проекту. Архітектура MVC (Model-View-Controller) дозволяє розділити код на три основні частини: Model відповідає за роботу з даними та базою, View відповідає за відображення інформації користувачеві, а Controller керує логікою програми та пов\'язує модель з поданням.', 0, 0, 1698624973),
(2, 'Node2.js', 'Node.js налаштування проксі через nginx', '_proxy_', 'У цій статті ми розберемо, як правильно проксирувати Node.js програму через Nginx. Ви побачите, як перевірити порти та файли конфігурації, запустити Node.js за допомогою pm2 і налаштувати проксіювання, щоб весь трафік йшов через Nginx, а статика віддавалася безпосередньо.', 0, 0, 1705364240),
(3, 'Node.js', 'Що таке Node.js і навіщо він потрібний?', 'what_is_Node.js', 'Node.js — це середовище виконання JavaScript на сервері, яке дозволяє створювати швидкі та масштабовані веб-програми. На відміну від традиційних мов на кшталт PHP або Python, Node.js працює асинхронно і використовує цикл подій, що робить його особливо ефективним при великій кількості одночасних запитів. У статті розберемо, як влаштована асинхронність, навіщо потрібен подійний цикл і чим Node.js відрізняється від звичних серверних технологій.', 0, 0, 1705539809),
(4, 'Node4.js', 'Асинхронність у Node.js: callbacks, promises та async/await', 'async', 'Асинхронність – це ключова особливість Node.js, що дозволяє обробляти безліч запитів одночасно без блокування основної програми. Розуміння того, як працює асинхронний код, важливе для кожного, хто пише на Node.js.', 0, 0, 1707267904),
(5, 'Node3.js', 'Робота з файловою системою в Node.js: читання, запис та асинхронність', 'fs', 'Node.js та модуль fs дають повний контроль над файловою системою сервера. Знаючи, як використовувати асинхронність, потоки та проміси, можна будувати надійні програми з логами, завантаженням файлів, генерацією контенту та керуванням папками без ризику блокування сервера.', 0, 0, 1707354352),
(6, 'Node5', 'Підключення бази даних (MySQL, PostgreSQL, MongoDB) у Node.js та приклад CRUD', 'db', 'У цій статті показано, як підключити MySQL, PostgreSQL та MongoDB до Node.js, налаштувати оточення та реалізувати повноцінний CRUD на Express. Ти дізнаєшся базові приклади запитів, побачиш структуру проекту та отримаєш поради щодо безпеки та продуктивності.', 0, 0, 1707527194),
(7, 'Node6', 'Менеджери пакетів npm та yarn - як ставити залежності та писати свої', 'npm', 'Розбираємось, як керувати залежностями у проектах на JavaScript за допомогою npm та Yarn. Вчимося встановлювати пакети, оновлювати їх, створювати свої власні та спрощувати роботу з проектом.', 0, 0, 1707528194),
(8, 'Node7', 'Надсилання листів та телеграм-повідомлень у Node.js', 'mail_tel', 'У Node.js легко налаштувати автоматичні повідомлення: надсилання листів через SMTP за допомогою Nodemailer і повідомлення Telegram через Bot API. Розповідаємо, як швидко підключити обидва способи, щоб користувачі та адміністратори завжди були в курсі подій.', 0, 0, 1708132030),
(9, 'Node8', 'Чат на WebSocket з кімнатами у Node.js', 'WebSockets', 'У цій статті розбираємо, як на Node.js та socket.io зробити реальний чат із кімнатами. Підключення, надсилання повідомлень, робота з користувачами та базові прийоми WebSocket – все з кодом та прикладами.', 0, 0, 1715908099),
(10, 'Node.js', 'Оптимізація продуктивності Node.js додатків', 'optimize', 'Розбираємо ключові прийоми прискорення Node.js програм: асинхронність, кешування, балансування навантаження, оптимізація запитів та моніторинг. Ці поради допоможуть зробити сервер швидшим і стабільнішим навіть при високому навантаженні.', 0, 0, 1716080938),
(11, 'Node2.js', 'Кластеризація та масштабування Node.js: cluster модуль та PM2', 'clusters', 'Дізнайся, як використовувати всі ядра процесора в Node.js за допомогою cluster, а для продакшна — керувати процесами та масштабувати програму через PM2. Прості приклади та поради щодо стабільної роботи серверів.', 0, 0, 1717895390),
(12, 'Node3.js', 'Аутентифікація та сесії - JWT, Passport.js, cookie vs localStorage', 'auth', 'JWT, Passport.js та сесії в Node.js – це основа для безпечної автентифікації користувачів. Розберемо підходи та відмінності між зберіганням даних у cookie та localStorage.', 0, 0, 1717884000),
(13, 'Node9', 'Підйом сервера на Socket.IO з підтримкою SSL', 'ssl_socket', 'У цій статті ми докладно розглянемо, як правильно підняти сервер на Socket.IO за допомогою SSL-шифрування для безпечного обміну даними. Ми будемо налаштовувати оточення так, щоб з\'єднання між клієнтами та сервером були захищені сучасними протоколами.', 0, 0, 1717854000),
(14, 'Node.js', 'Як використовувати Redis для прискорення та масштабування програм', 'redis', 'Redis – це високопродуктивне сховище даних у пам\'яті, яке ідеально підходить для кешування, керування сесіями, черг завдань та обмеження навантаження на API. У статті розберемо основні сценарії використання Redis, структури даних та приклади реалізації Node.js для високонавантажених проектів.', 0, 0, 1722013781),
(15, 'Docker', 'Що таке Docker і навіщо він потрібний', 'docker', 'Docker — це платформа контейнеризації, яка упаковує додаток із залежностями у легкий ізольований контейнерКонтейнери стартують швидко, працюють однаково на будь-якому сервері та спрощують розробку, тестування та деплой.У статті ми розберемо встановлення Docker на Windows, базові команди, роботу з образами та контейнерами, а також створення своїх образів через Dockerfile та Compose', 0, 0, 1722616433),
(16, 'graphQL', 'GraphQL – майбутнє API для швидких та зручних запитів', 'graphQL', 'GraphQL - це сучасний спосіб роботи з даними, що дозволяє клієнту отримувати саме ті поля, які потрібні в одному запиті. На відміну від REST, він полегшує структуру запитів, знижує навантаження на сервер і прискорює розробку фронтенда.', 0, 0, 1722916433),
(17, 'Node11', 'Оптимізація роботи з базою даних та кешування (Redis, LRU-кеш, GraphQL DataLoader).', 'redis_graph', 'У статті ми розберемо, як прискорити роботу Node.js-додатків під час роботи з базою даних, використовуючи кешування через Redis, стратегію LRU, а також GraphQL DataLoader для зменшення кількості запитів та боротьби з проблемою N+1.', 0, 0, 1723016433);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `posts_en`
--
ALTER TABLE `posts_en`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `posts_ru`
--
ALTER TABLE `posts_ru`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `posts_ua`
--
ALTER TABLE `posts_ua`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `posts_en`
--
ALTER TABLE `posts_en`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблицы `posts_ru`
--
ALTER TABLE `posts_ru`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT для таблицы `posts_ua`
--
ALTER TABLE `posts_ua`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
