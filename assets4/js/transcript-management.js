(function () {
  "use strict";
  var page = document.getElementById("tm-page");
  if (!page) return;

  var button = page.querySelector("[data-tm-video-button]");
  var frame = page.querySelector("[data-tm-video]");
  if (button && frame) {
    button.addEventListener("click", function () {
      if (frame.querySelector("iframe")) return;
      var video = document.createElement("iframe");
      video.id = "tm-product-video";
      video.title = "EduTranscript - Product Explainer Video";
      video.src = "https://www.youtube-nocookie.com/embed/dWZx1b8BAq8?autoplay=1&rel=0";
      video.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      video.setAttribute("allowfullscreen", "");
      video.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      video.tabIndex = 0;
      frame.replaceChildren(video);
      video.focus({ preventScroll: true });
    });
  }
})();
