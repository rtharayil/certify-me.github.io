(function() {
  // Read configuration from the HTML
  const scriptTag = document.currentScript;
  const config = scriptTag.dataset;

  // Create badge element
  const badge = document.createElement("a");
  badge.href = config.linkUrl || "https://www.certifyme.online";
  badge.target = "_blank";
  badge.style.position = "fixed";
  badge.style.width = config.size || "50px";
  badge.style.height = config.size || "50px";
  badge.style.backgroundImage = `url(${config.imageUrl || "https://www.certifyme.online/assets4/images/Logo/CertifyMe-LOGO.jpg"})`;
  badge.style.backgroundSize = "cover";
  badge.style.backgroundPosition = "center";
  badge.style.cursor = "pointer";
  badge.style.zIndex = "1000";

  // Set position
  switch (config.position) {
    case "top-left":
      badge.style.top = "10px";
      badge.style.left = "10px";
      break;
    case "top-right":
      badge.style.top = "10px";
      badge.style.right = "10px";
      break;
    case "bottom-left":
      badge.style.bottom = "10px";
      badge.style.left = "10px";
      break;
    case "bottom-right":
    default:
      badge.style.bottom = "10px";
      badge.style.right = "10px";
      break;
  }

  // Append to the body
  document.body.appendChild(badge);
})();
