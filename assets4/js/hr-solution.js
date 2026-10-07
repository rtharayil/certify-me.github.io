(() => {
  const video = document.querySelector("#hr-page [data-hr-video]");
  const play = video?.querySelector("[data-hr-play]");
  if (!video || !play) return;

  play.hidden = false;
  play.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/kXYADGPoars?rel=0";
    frame.title = "What is a Learning Path in CertifyMe?";
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.tabIndex = 0;
    video.replaceChildren(frame);
    frame.focus();
  }, { once: true });
})();
