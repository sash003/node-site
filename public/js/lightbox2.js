;
(function ($) {
  "use strict";

  /* Опции по умолчанию */
  var options = {
    selector: 'img',
    divId: 'closeLightBox',
    activeId: 'activeLightBox',
    activeClass: '.activeLightBox',
    // вычислим событие, которое Возбуждается при прокрутке колесом мыши
    weelEvt: (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll.lightBox' : 'mousewheel.lightBox'
  };

  /* Объект методов для работы плагина */
  var methods = {
    // функция инициализации плагина
    init: function (o) {
      // применяет для каждого элемента methods.Action
      return this.each(methods.Action);
    },

    // создаём блок с картинкой в нём с пустым src (наше модальное окно)
    makeModalWindow: function () {
      var id = options.divId;
      options.modalId = '#' + id;
      options.modalImgI = options.modalId + ' img';
      if ($(options.modalId).length === 0) {
        $('body').append($('<div id="' + id + '"><img src="" alt="" style="transform: scale(1.0);"/></div>'));
      }
      options.modal = $(options.modalId);
      options.modalImg = $(options.modalImgI);
    },

    // вешаем обработчики событий 
    initHandlers: function () {
      // клик на блоке, на который вешается lightBox
      options.block.bind('click.lightBox', function () {
        $('body').find(options.activeClass).removeClass(options.activeId);
        $(this).addClass(options.activeId);
      });

      // клик по картинке
      options.images.bind('click.lightBox', methods.functions.imgsClickHandler);

      // скрытие картинки по клику вне 
      options.modal.bind('mousedown.lightBox', function (e) {
        var div = options.modalImg;
        if (!div.is(e.target) // если клик был не по нашему блоку
          &&
          div.has(e.target).length === 0) { // и не по его дочерним элементам

          // снимается клик, события клавиатуры и мыши
          options.modalImg.unbind('click.lightBox', methods.functions.clickHandler);
          $(window).unbind('keydown.lightBox', methods.functions.keyDownHandler);
          options.modal.unbind(options.weelEvt, methods.functions.mouseWheelHandler);
          $('body').find(options.activeClass).removeClass(options.activeId);
          options.modal.hide();
        }
      });
    },

    // no comments
    functions: {

      preventdefault: function (e) {
        e = e || window.event;
        if (e.preventDefault) e.preventDefault();
        else e.returnValue = false;
      },

      nextElem: function () {
        Array.prototype.nextElem = function (el, n) {
          var i = this.indexOf(el);
          if (n == 'next') {
            return this[i + 1] !== undefined ? this[i + 1] : this[0];
          } else if (n == 'prev') {
            return this[i - 1] !== undefined ? this[i - 1] : this[this.length - 1];
          }
        }
      },

      clickHandler: function () {
        var $this = $(this),
          src = $this.attr('src'),
          nextEl = options.imgsArr.nextElem(src, 'next');
        $this.attr('src', nextEl);
        setTimeout(methods.functions.setWidth(), 1);
      },

      imgsClickHandler: function () {
        var $this = $(this),
          src = $this.attr('src');
        // уже после добавления класса activeLightBox сработает обработчк клика по картинке
        setTimeout(function () {
          // выберем все указанные картинки из блока, на который вешается метод
          options.activeImgs = $(options.activeClass).find(options.selector);
          // вернём массив с путями к картинкам
          options.imgsArr = $.map(options.activeImgs, function (el) {
            return $(el).attr('src');
          });

          if (options.imgsArr.length) {
            options.modal.show();
            options.modalImg.attr('src', src);
            methods.functions.setWidth();
          }

          // вешается клик, события клавиатуры и мыши
          $(window).bind('keydown.lightBox', methods.functions.keyDownHandler);
          options.modalImg.bind('click.lightBox', methods.functions.clickHandler);
          options.modal.bind(options.weelEvt, methods.functions.mouseWheelHandler);

        }, 11);

      },

      keyDownHandler: function (e) {
        e = e || window.event;
        if (e.which == 27) {
          options.modalImg.unbind('click.lightBox', methods.functions.clickHandler);
          $(window).unbind('keydown.lightBox', methods.functions.keyDownHandler);
          options.modal.unbind(options.weelEvt, methods.functions.mouseWheelHandler);
          $('body').find(options.activeClass).removeClass(options.activeId);
          options.modal.hide();
        }
        if (e.which == 37 || e.which == 40) {
          methods.functions.preventdefault(e);
          var src = options.modalImg.attr('src'),
            nextEl = options.imgsArr.nextElem(src, 'prev');
          options.modalImg.attr('src', nextEl);
          methods.functions.setWidth()
        }
        if (e.which == 38 || e.which == 39) {
          methods.functions.preventdefault(e);
          var src = options.modalImg.attr('src'),
            nextEl = options.imgsArr.nextElem(src, 'next');
          options.modalImg.attr('src', nextEl);
          methods.functions.setWidth()
        }
        if (e.which == 107) {
          methods.functions.resize("+");
        }
        if (e.which == 109) {
          methods.functions.resize("-");
        }

      },

      // прокрутка колесом мыши
      mouseWheelHandler: function (e) {
        methods.functions.preventdefault(e);
        var evt = e.originalEvent ? e.originalEvent : e,
          delta = evt.detail ? evt.detail * (-40) : evt.wheelDelta;
        if (delta > 0) {
          methods.functions.resize("+");
        }
        if (delta < 0) {
          methods.functions.resize("-");
        }
      },

      resize: function (direction) {
        console.log(options.modalImg.attr('style'))
        var style = options.modalImg.attr('style'),
          newTransform = style.replace(
            /(scale.)(\d(\.\d)?)/,
            function (match, value, value2) {
              var n = parseFloat(value2),
                nn;
              if (direction === "+") {
                nn = n + 0.1;
                if (nn < 1.7) {
                  return value + nn.toFixed(1);
                }
              }
              if (direction === "-") {
                nn = n - 0.1;
                if (nn > 0.5) {
                  return value + nn.toFixed(1);
                }
              }
              return value + n;
            });
        options.modalImg.attr('style', newTransform);
      },

      // рассчёт размеров картинок в зависимости от многих факторов
      setWidth: function () {
        const modal = options.modal;
        const img = options.modalImg;

        // Сбрасываем размеры, чтобы пересчитать
        img.css({
          width: '',
          height: '',
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          position: 'absolute'
        });

        modal.css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          padding: 0
        });

        function resizeImage() {
          const wW = window.innerWidth;
          const wH = window.innerHeight;
          const naturalW = img[0].naturalWidth;
          const naturalH = img[0].naturalHeight;

          if (!naturalW || !naturalH) {
            requestAnimationFrame(resizeImage);
            return;
          }

          const aspectRatio = naturalW / naturalH;
          let maxW = wW * 0.9;
          let maxH = wH * 0.9;
          let finalW, finalH;

          if (aspectRatio > 1) {
            finalW = Math.min(maxW, naturalW * 3);
            finalH = finalW / aspectRatio;
            if (finalH > maxH) {
              finalH = maxH;
              finalW = finalH * aspectRatio;
            }
          } else {
            finalH = Math.min(maxH, naturalH * 3);
            finalW = finalH * aspectRatio;
            if (finalW > maxW) {
              finalW = maxW;
              finalH = finalW / aspectRatio;
            }
          }

          // Малые экраны
          if (wW <= 480) {
            finalW = wW * 0.94;
            finalH = 'auto';
          }

          img.css({
            width: finalW,
            height: finalH,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          });
        }

        requestAnimationFrame(resizeImage);
      }


    },

    // и вот он, весь наш запакованный экшн
    Action: function (o) {
      // $.extend Объединяет содержимое двух или более объектов (расширяет исходный объект, дополняя его свойствами объектов источников):
      options = $.extend(options, o);
      options.block = $(this);
      options.images = $(options.selector, this);
      methods.makeModalWindow();
      if (![].nextElem) methods.functions.nextElem();
      methods.initHandlers();
    }
  };

  ///////////////////////////////////////////
  /* Главное чудо собственной персоной */
  // расширим джейкверю на наш метод loghtBox
  $.fn.lightBox = function (opts) {
    if (publicMethods[opts]) {
      return publicMethods[opts].apply(this, [].slice.call(arguments, 1));
    } else if (typeof opts === 'object' || !opts) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Метод с именем "' + opts + '" не существует!');
    }
  };

  /* Методы для пользователя */
  var publicMethods = {
    // отключение плагина
    disable: function () {
      this.each(function () {
        // снимаем все обработчики событий нашего плагина
        $(this).unbind(".lightBox");
      });
    },
    // перезапуск плагина
    restart: function () {
      return this.each(function () {
        // снимем обработчики и заново что-то намутил, но главное IT WORKS! :)
        $(this).unbind(".lightBox");
        $(this).bind('click.lightBox', function () {
          $('body').find(options.activeClass).removeClass(options.activeId);
          $(this).addClass(options.activeId);
        });
      });
    }
  };

}(jQuery)); // That`s all folks
