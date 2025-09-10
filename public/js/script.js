$(document).ready(function () {


  // открываем поиск
  $('#search').on('click', function () {
    $('.search').toggleClass('show');
    $('#searchBox').focus();
    // показываем результаты, только если не пусто
    if ($('#results').children().length > 0) {
      $('#results').slideDown(555);
    }
  });

  $("#searchBox").on("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // предотвращаем переход на новую строку
      $(this).trigger("input"); // вызывает уже существующий обработчик input
      return false;
    }
  });

  //поиск
  $("#searchBox").on("input", function () {
    let q = $(this).text().trim();
    let lang = window.location.pathname.split("/")[1];
    console.log(lang);
    if (q.length < 3) {
      $("#results").hide().empty();
      return;
    }

    $.ajax({
      url: "/search",
      type: "POST",
      data:  {q: q, lang: lang},
      success: function (data) {
        $("#results").html(data).show();
      }
    });
  });

  $('body').on('click', '.flags img:first-child', function (){
    $('.flags a').css('display', 'inline-block')
  })

  function setMenuTop() {
    let headerHeight = $('.site-header').outerHeight(); // высота шапки с паддингами/бордерами
    $('#menu').css('top', headerHeight + 'px');
  }

  setMenuTop();

  // Пересчёт при ресайзе окна
  $(window).on('resize', function () {
    setMenuTop();
  });


  $('#six').on('click', function () {
    $(this).toggleClass('rotated');
    let $menu = $('#menu');
    let $links = $('#inside a');

    if (!$menu.hasClass('active')) {
      // меню выкатывается справа
      $menu.addClass('active');

      // ссылки прилетают слева по очереди
      $links.each(function (i) {
        let $link = $(this);
        setTimeout(function () {
          $link.addClass('flyin');
        }, i * 200); // задержка по 0.2с
      });

    } else {
      // закрываем меню и сбрасываем ссылки
      $menu.removeClass('active');
      $links.removeClass('flyin').css({
        opacity: 0,
        transform: 'translateX(-100%)'
      });
    }
  });



  // скрытие по клику вне элемента
  $(document).bind('click', function (e) {

    if (!$(e.target).closest(".flags").length)
    {
      $('.flags a').hide()
    }

    if (!$(e.target).closest("#searchBox").length && !$(e.target).closest("#search").length && !$(e.target).closest("#results").length) {
      $('.search').removeClass('show');
      $('#results').hide()
    }

    if (!$(e.target).closest("#menu").length && !$(e.target).closest("#six").length) {
      $('#menu').removeClass('active');
      $('#six').removeClass('rotated');
      $('#inside a').each(function () {
        $(this).removeClass('flyin').css({
          opacity: 0,
          transform: 'translateX(-100%)'
        });
      })
    }
  })




  $(document).bind('keydown', function (e) {
    if (event.key == "Escape") {
      $('.search').removeClass('show');
      $('#results').hide()
      $('#menu').removeClass('active');
      $('#six').removeClass('rotated');
      $('#inside a').each(function () {
        $(this).removeClass('flyin').css({
          opacity: 0,
          transform: 'translateX(-100%)'
        });
      })

      $('.flags a').hide()
    }
  })


  $('.forLightBox').lightBox()

  $('#link').on('click', function () {
    location = '/'
  })



  $(".file-input").on("change", function (e) {
    const input = this; // native DOM element
    if (input.files.length > 3) {
      alert("Можно выбрать максимум 3 файла!");
      $(input).val(''); // очищаем input
    }
  });


// показать кнопку для прокрутки вверх
  $(window).bind('scroll', function () {
    scroll = $(window).scrollTop();
    offset = $(window).height() * 2;

    if (scroll >= offset) {
      $("#to_top").css("bottom", "11px");
    } else $("#to_top").css("bottom", "-90px");
  });

  $("#to_top").bind('click', function (e) {
    e.preventDefault();
    $('html, body').animate({scrollTop: 0}, 777);
  });


// отправка формы комментариев
  $('body').on('submit', '.comment-form', function (e) {
    e.preventDefault(); // чтобы не было стандартной отправки формы

    const $form = $(this);
    const formData = new FormData(this); // включает все input и файлы
    formData.append('slug', $form.data('slug'))
    setTimeout(function () {
      $form[0].reset();
    }, 11)
    $.ajax({
      url: '/comments',
      type: 'POST',
      data: formData,
      processData: false,  // важно для FormData
      contentType: false,  // важно для FormData
      success: function (res) {
        if (res.success) {
          const $comment = $(res.html);
          const date = new Date();
          const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          const $dateSpan = $('<span>').addClass('comment-date').text(timeStr);
          $comment.append($dateSpan);
          $('.comments-list').prepend($comment);
          $('.forLightBox').lightBox()
          $('html, body').animate({scrollTop: $('#comments-wrap').offset().top - 7}, 600);
        } else {
          alert('Ошибка: ' + res.message);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('jqXHR:', jqXHR);
        console.error('textStatus:', textStatus);
        console.error('errorThrown:', errorThrown);
        console.error('Ошибка при отправке формы:\n' +
          'Status: ' + jqXHR.status + '\n' +
          'TextStatus: ' + textStatus + '\n' +
          'Error: ' + errorThrown + '\n' +
          'Response: ' + jqXHR.responseText);
        alert(
          'Ошибка при отправке формы:\n' +
          'Status: ' + jqXHR.status + '\n' +
          'TextStatus: ' + textStatus + '\n' +
          'Error: ' + errorThrown + '\n' +
          'Response: ' + jqXHR.responseText
        );
      }
    });
  });


  const $input = $('#chat-input');
  const $wrap = $input.parent();
  /*

    $input.on('input', function () {
        // Сбрасываем высоту, чтобы корректно посчитать scrollHeight
        this.style.height = 'auto';
        // Устанавливаем высоту textarea по содержимому
        this.style.height = this.scrollHeight + 'px';
        // Подгоняем высоту родителя под textarea
        $wrap.height(this.scrollHeight);
    });
  */


  /*// Вешаем клик на строки таблицы с td
  $('table tr').not(':first').on('click', function (e) {
    // Если клик по ссылке, кнопке или input — выходим
    if ($(e.target).is('a, button, input, textarea, select, label')) {
      return;
    }

    // Ищем индекс колонки с slug
    const slugIndex = $(this).closest('table').find('th').filter(function () {
      return $(this).text().trim().toLowerCase() === 'slug';
    }).index();

    // Берём slug из нужного td
    const slug = $(this).find('td').eq(slugIndex).text().trim();

    if (slug) {
      window.location.href = '/buy/' + slug;
    }
  });
  */


  $(document).on('click', '#chat', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $panel = $('#chatPanel');
    $panel.toggleClass('open');

    if ($panel.hasClass('open')) {
      setTimeout(function () {
        ($('#chat-input').length ? $('#chat-input') : $('#chatInput')).trigger('focus');
      }, 300);
    } else {
    }
  });

  $(document).on('click', '#chatPanel', function (e) {
    e.stopPropagation();
  });

  $(document).on('click', function (e) {
    var $t = $(e.target);
    var insidePanel = $t.closest('#chatPanel').length > 0;
    var isButton = $t.closest('#chat').length > 0;

    if (!insidePanel && !isButton) {
      $('#chatPanel').removeClass('open');
    }
  });


});
