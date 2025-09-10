$(function () {



  $('#resetForm').on('submit', function (event) {
    event.preventDefault();
    let $this = $(this);
    const email = $this.find('input[name="reset_email"]').val().trim();
    const password = $this.find('input[name="new_password"]').val();
    const passwordConfirm = $this.find('input[name="new_password_confirmation"]').val();

    // проверка email регуляркой
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Введите корректный email');
      return;
    }

    // проверка совпадения паролей
    if (password !== passwordConfirm) {
      alert('Пароли не совпадают');
      return;
    }

    // проверка минимальной длины пароля (по желанию)
    if (password.length < 3) {
      alert('Пароль должен быть не менее 3 символов');
      return;
    }


    // собираем данные формы
    let formData2 = $(this).serialize();


    $.ajax({
      url: '/reset-password',
      type: 'POST',
      data: formData2,
      dataType: 'json',
      success: function (response) {
        console.log(response);
        if (response.status === 'success') {
          alert(response.message);
          clearForm($this)
          $('#authModal').addClass('hidden'); // закрыть модалку
        } else {
          // ошибки валидации
          let errors = response.errors || {};
          let msg = Object.values(errors).flat().join("\n");
          alert(msg || response.message);
        }
      },
      error: function (xhr) {
        alert('Ошибка сервера, попробуйте позже');
        console.log(xhr.responseText);
      }
    });
  })



  // 1. Берём все куки как одну строку вида: "user=%7B...%7D; theme=dark; token=123"
  let rawCookies = document.cookie;

  // 2. Разбиваем по ";" чтобы получить массив ["user=...", " theme=dark", " token=123"]
  let cookieArray = rawCookies.split(';');

  // 3. Превращаем массив в объект {user: "...", theme: "dark", token: "123"}
  let cookies = cookieArray.reduce((acc, c) => {
    // c.trim() — убираем пробелы (" theme=dark" → "theme=dark")
    let [k, v] = c.trim().split('='); // делим по "=" → k="user", v="%7B...%7D"

    // decodeURIComponent(v) — декодируем значение из url-формата (%7B → "{")
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});

  // 4. Проверяем, есть ли кука "user"
  let user = cookies.user ? JSON.parse(cookies.user) : null;

  // 5. Если пользователь найден — выводим его в консоль
  if (user) {
    console.log("ID:", user.id);
    console.log("Имя:", user.name);
    console.log("Аватар:", user.avatar);

    // 6. Дополнительно можно вставить в HTML
    //document.getElementById("username").innerText = user.name;
    //document.getElementById("avatar").src = user.avatar;
  } else {
    console.log("Пользователь не залогинен");
  }






  if(localStorage.getItem('userName')){
    let userName = localStorage.getItem('userName');
    $('.comment-name').val(userName).hide();
    $('.comment-form').prepend('<h3 id="commName"><span>' + userName + '</span></h3>');

  }

  if(localStorage.getItem('avatar')){
    let ava = localStorage.getItem('avatar');
    $('#enter').attr('src', ava);
    $('#commName').prepend('<img class="commAva" src="'+ava+'" alt="'+ava+'">');
  }


  //let isRegister = false;


  $('#avatara').on('click', function() {
    $('#avatar').click();
  });

  $('#avatar').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#avatara').attr('src', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });



  $('#authForm').on('submit', function (e) {
    e.preventDefault();
    let $this2 = $(this);
    // собираем данные формы
    let formData = new FormData(this); // собирает всё, включая файлы

    // отправка на один маршрут
    $.ajax({
      url: '/auth', // универсальный маршрут
      type: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,  // важно для FormData
      contentType: false,  // важно для FormData
      success: function (response) {
        console.log(response);
        if (response.status === 'success') {
          alert(response.message);
          clearForm($this2)
          $('#authModal').addClass('hidden'); // закрыть модалку
          if(response.avatar){
            localStorage.setItem('avatar', response.avatar);
            $('#enter').attr('src', response.avatar);
          }
        } else {
          // ошибки валидации
          let errors = response.errors || {};
          let msg = Object.values(errors).flat().join("\n");
          alert(msg || response.message);
        }
      },
      error: function (xhr) {
        alert('Ошибка сервера, попробуйте позже');
        console.log(xhr.responseText);
      }
    });
  });


  // открыть модалку
  $('#enter').on('click', function () {
    $('#authModal').removeClass('hidden');
  });

  // закрыть
  $('.close').on('click', function () {
    $('#authModal').addClass('hidden');
  });

  // переключение регистрация <-> вход
  $('#toggleForm').on('click', function (e) {
    e.preventDefault();
    let isLogin = $('#submitBtn').text() === 'Войти';

    if (isLogin) {
      $('#formTitle').text('Регистрация');
      $('#submitBtn').text('Зарегистрироваться');
      $('.reg-only').removeClass('hidden');
      $('#toggleForm').text('Уже есть аккаунт? Войти');
    } else {
      $('#formTitle').text('Вход');
      $('#submitBtn').text('Войти');
      $('.reg-only').addClass('hidden');
      $('#toggleForm').text('Нет аккаунта? Регистрация');
    }
  });

  // переключение на форму сброса пароля
  $('#forgotPassword').on('click', function (e) {
    e.preventDefault();
    $('#authForm').addClass('hidden');
    $('#resetForm').removeClass('hidden');
    $('#formTitle').text('Сброс пароля');
  });

  // возврат к авторизации
  $('#backToLogin').on('click', function (e) {
    e.preventDefault();
    $('#resetForm').addClass('hidden');
    $('#authForm').removeClass('hidden');
    $('#formTitle').text('Вход');
    $('#submitBtn').text('Войти');
    $('.reg-only').addClass('hidden');
    $('#toggleForm').text('Нет аккаунта? Регистрация');
  });

  // закрытие по клику вне окна
  $(document).on('click', function (e) {
    if ($(e.target).is('#authModal')) {
      $('#authModal').addClass('hidden');
    }
  });

  // закрытие по Esc
  $(document).on('keyup', function (e) {
    if (e.key === "Escape") {
      $('#authModal').addClass('hidden');
    }
  });

})



function clearForm($form) {
  // текст, пароль, email, number и т.п.
  $form.find('input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="url"], input[type="tel"]').val('');

  // textarea
  $form.find('textarea').val('');

  // select
  $form.find('select').prop('selectedIndex', 0);

  // чекбоксы и радио
  $form.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);

  // файлы
  $form.find('input[type="file"]').each(function() {
    $(this).val(''); // основной способ
    // Если нужно надёжно, можно клонировать:
    // $(this).replaceWith($(this).clone());
  });
}



// Функция получения куки по имени
function getCookie(name) {
  // Разбиваем строку document.cookie на массив "ключ=значение"
  const cookies = document.cookie.split('; ');

  // Ищем нужную пару по имени
  const found = cookies.find(row => row.startsWith(name + '='));
  if (!found) return null; // если нет такой куки — возвращаем null

  // Берём значение (правую часть после "=")
  const value = found.split('=')[1];

  try {
    // Декодируем и парсим (если это JSON)
    return JSON.parse(decodeURIComponent(value));
  } catch (e) {
    // Если это не JSON, просто возвращаем строку
    return decodeURIComponent(value);
  }
}
