new WOW().init();

$('.reset').click(function(){
  new WOW().init();
});

$(document).ready(function(){
  $(window).scroll(function(){
  var scroll = $(window).scrollTop();
  if (scroll > 0) {
  $(".navbar-light").addClass('nav-white');
  }
  else{
  $(".navbar-light").removeClass('nav-white');
  }
  })
  });