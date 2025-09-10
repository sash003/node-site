$(function () {

  console.log(new Date()/1000 - 30*24*3600)

  // при загрузке страницы
  if (!history.state) {
    history.replaceState({ page: window.location.pathname }, "", window.location.pathname);
  }


  function loadPage(url) {
    $.get(url, function(data){
      console.log(data);
      $("#main").html(data.table);
      document.title = data.title;
      $('meta[name=description]').attr('content', data.description)
      $('.logo a').attr('href', "/"+data.lang);
      $('.flags').html(data.flags);
      if (window.Prism) Prism.highlightAll();
      if($('.postH1').length){
        $('html, body').animate({
          scrollTop: $('.postH1').offset().top - 33
        }, 777);
      }
      $('.forLightBox').lightBox()
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
    });
  }

  $("body").on("click", '.ajax-link', function(e){
    e.preventDefault();
    const url = $(this).attr("href");
    loadPage(url);
    history.pushState({ page: url }, "", url);
  });

  window.addEventListener("popstate", function(event){
    if(event.state && event.state.page){
      loadPage(event.state.page);
    }
  });

})