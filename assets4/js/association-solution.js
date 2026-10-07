(() => {
  const video = document.querySelector("#as-page [data-as-video]");
  const play = video?.querySelector("[data-as-play]");
  if (!video || !play) return;

  play.hidden = false;
  play.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/TJMwk6qIxSc?rel=0";
    frame.title = "CertifyMe product overview";
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.tabIndex = 0;
    video.replaceChildren(frame);
    frame.focus();
  }, { once: true });
})();
