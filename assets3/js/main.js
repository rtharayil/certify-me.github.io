/* ============= navbar white=========*/
$(document).ready(function () {
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
      $(".navbar-light").addClass('nav-white');
    }
    else {
      $(".navbar-light").removeClass('nav-white');
    }
  })
});

/* ============= Slick slider=========*/
$('.testimonial-slider').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false,
  prevArrow: $(".slick-arrow-left"),
  nextArrow: $(".slick-arrow-right"),
  focusOnSelect: true,
  fade: true,
});



/*========== page load animation===========*/
$('.animated').each(function () {
  $(this).appear(function () {

    var element = $(this);

    var animation = element.attr('data-animation');
    if (!element.hasClass('visible')) {
      var animationDelay = element.attr('data-animation-delay');
      setTimeout(function () {
        element.addClass(animation + ' visible');
      }, animationDelay
      );
    }
  });

});
/*========== Toggle button===========*/
function check() {
  var checkBox = document.getElementById("checbox");
  var text1 = document.getElementsByClassName("text1");
  var text2 = document.getElementsByClassName("text2");

  for (var i = 0; i < text1.length; i++) {
    if (checkBox.checked == true) {
      text1[i].style.display = "block";
      text2[i].style.display = "none";
    } else if (checkBox.checked == false) {
      text1[i].style.display = "none";
      text2[i].style.display = "block";
    }
  }
}
check();