<!-- Клиент Socket.IO -->
(function () {

    const socket = io();
    // админ подключается в свою общую комнату
    socket.on('connect', () => {
        socket.emit('joinAdmin'); // сервер добавляет в adminRoom
    });


    socket.on('newMessage', ({slug, from, to, message}) => {
        const userId = from === 'admin' ? to : from;
        const chatId = `${slug}_${userId}`;
        console.log(chatId)
        let $chatWrap = $(`#${chatId}`);
        console.log($chatWrap.length)
        if ($chatWrap.length === 0) {

            date = new Date();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            $chatWrap = $(`
      <div class="chat-panel-admin">
      <div class="chat-header-admin">
          <b>${userId}</b> | Игра: <b>${slug}</b>
        </div>
        <div class="chat-messages-admin from-user" id="${chatId}">
        
         <span class="chat-from-admin">${userId}:</span>
            ${message}
            <div class="chat-time-admin">${hours}:${minutes}</div>
        </div>
        <form class="chat-input-form-admin" data-slug="${slug}" data-user="${userId}">
          <textarea class="chat-input-admin" placeholder="Введите сообщение..."></textarea>
          <button type="submit" class="chat-send-btn-admin">Отправить</button>
        </form>
      </div>
    `);
            $('.chat-grid-admin').prepend($chatWrap);
            return
        }

        const $chat = $chatWrap;

        const senderClass = from === 'admin' ? 'from-admin' : 'from-user';

        const $msg = $(`
    <div class="chat-message-admin ${senderClass}">
      <span class="chat-from-admin">${from}:</span>
      ${message}
    </div>
  `);

        $chat.append($msg);
        $('.chat-messages-admin').each(function () {
            $(this).scrollTop($(this).prop("scrollHeight"));
        });

    });


    $(document).on('submit', '.chat-input-form-admin', function (e) {
        e.preventDefault();
        sendAdminMessage($(this));
    });


    function sendAdminMessage($form) {
        const $input = $form.find('.chat-input-admin');

        const text = $input.val().trim();
        if (!text) return;

        const slug = $form.data('slug');    // игра
        const userId = $form.data('user');  // пользователь
        const from = 'admin';          // всегда админ
        console.log(text, slug, userId)
        // Отправка через сокет
        socket.emit('sendMessage', {slug, from: from, to: userId, message: text});

        // Очистка textarea
        $input.val('');
        $input.css('height', 'auto');
    }

    $('.chat-messages-admin').each(function () {
        $(this).scrollTop($(this).prop("scrollHeight"));
    });

    /*
    // Автоувеличение textarea
    $input.on('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
      $wrap.height(this.scrollHeight);
    });

      // Подключение к уникальной комнате
      socket.emit('joinProductChat', { slug, userId });

      socket.on('chatHistory', (list) => {
      list.forEach(addMsg);
      scrollBottom();
    });

      socket.on('newMessage', (msg) => {
      addMsg(msg);
      scrollBottom();
    });

      $('#chat-send').on('click', send);

    // Enter = отправка, Ctrl+Enter = перенос строки
    $input.on('keydown', function (e) {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        send();
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = $(this).val();
        $(this).val(value.substring(0, start) + "\n" + value.substring(end));
        this.selectionStart = this.selectionEnd = start + 1;
        $(this).trigger('input'); // пересчёт высоты
      }
    });


    function send() {
      const text = $input.val().trim();
      if (!text) return;

      // Отправляем вместе с userId
      socket.emit('sendMessage', { slug, userId, message: text});

      // Очистка
      $input.val('');
      $input.css('height', 'auto');
      $wrap.css('height', '');
    }



    function addMsg(m) {
      const $wrap = $('#chat-messages');
        if (/^user_/.test(m.sender_name)) {
        m.sender_name = 'Вы';
      }


      // создаём блок сообщения с именем отправителя
      const $el = $('<div>').addClass('chat-message')
      .html(`<span class='name'>${m.sender_name}:</span> <span class='message'>${m.message}</span>`);

      // определяем время
      let date;
      if (m.created_at) {
      // если пришло время из базы (секунды UTC)
      date = new Date(m.created_at * 1000);
    } else {
      // иначе текущее время
      date = new Date();
    }

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      const $timeEl = $('<div>').addClass('chat-time')
      .text(`${hours}:${minutes}`);

      // добавляем время внутрь сообщения
      $el.append($timeEl);

      // добавляем сообщение в обёртку
      $wrap.append($el);
    }




      function scrollBottom() {
      const wrap = document.getElementById('chat-messages');
      wrap.scrollTop = wrap.scrollHeight;
    }

     */

})();