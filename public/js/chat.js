(function () {

  const socket = io({
    transports: ['websocket'],
   // secure: true
  });

  const $input = $('#chat-input');

  // Получаем имя пользователя из localStorage (если есть)
  let currentUser = localStorage.getItem('userName');

  // Если имя уже есть, сразу удаляем поле и подключаем к чату
  if (currentUser) {
    $('#userName').remove();
    socket.emit('joinChat', {user: currentUser});
  } else {
    socket.emit('joinChat', {});
  }

  // ==== История чата ====
  socket.on('chatHistory', (list) => {
    list.forEach(addMsg);
    scrollBottom();
  });

  // ==== Новое сообщение ====
  socket.on('newMessage', (msg) => {
    addMsg(msg);
    scrollBottom();
  });

  // ==== Отправка сообщения ====
  $('#chat-send').on('click', send);

  // Enter = отправка, Ctrl+Enter = перенос строки
  $input.on('keydown', function (e) {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      send();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const value = $(this).val();
      $(this).val(value.substring(0, start) + "\n" + value.substring(end));
      this.selectionStart = this.selectionEnd = start + 1;
      $(this).trigger('input');
    }
  });

  function send() {
    const text = $input.val().trim();
    if (!text || text.length > 333) return;

    // Если имени пользователя ещё нет, берём из инпута
    if (!currentUser) {
      currentUser = $('#userName').val()?.trim();
      if (!currentUser) return;
      localStorage.setItem('userName', currentUser);
      $('#userName').remove();
      socket.emit('joinChat', {user: currentUser});
    }

    socket.emit('sendMessage', {from: currentUser, message: text});
    $input.val('');
  }

  function addMsg(msg) {
    const $wrap = $('#chat-messages');

    // Определяем отправителя
    let sender = msg.from === currentUser ? 'Вы' : msg.from;
    const className = msg.from === currentUser ? 'from-user' : 'from-admin';

    // Создаём блок сообщения
    const $el = $('<div>').addClass('chat-message ' + className)
      .html(`<span class="name">${sender}:</span> <span class="message">${msg.message}</span>`);

    // Время
    const date = msg.created_at ? new Date(msg.created_at * 1000) : new Date();

    const now = new Date();

    // Helper для формата DD.MM.YYYY
    const formatDate = d => {
      const day   = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year  = d.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Helper для HH:MM
    const formatTime = d => {
      const hours   = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    let timeText;

    // Проверяем, сегодняшний ли день
    if (date.toDateString() === now.toDateString()) {
      timeText = formatTime(date); // только время
    } else {
      timeText = `${formatDate(date)} ${formatTime(date)}`; // дата + время
    }

    const $timeEl = $('<div>').addClass('chat-time').text(timeText);
    $el.append($timeEl);


    $wrap.append($el);
  }

  function scrollBottom() {
    const wrap = document.getElementById('chat-messages');
    wrap.scrollTop = wrap.scrollHeight;
  }


  $(document).on('keydown', function (e) {
    if (e.key === "Escape") {
      $('#chatPanel').removeClass('open');
    }
  });

})();
