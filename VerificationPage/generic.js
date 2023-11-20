var page = 1;
function value_seeker(value) {
  page = value;
}
function sendPostRequest(event, actionType, string) {
  event.preventDefault();

  var badgeIdName = event.currentTarget.getAttribute("data-badge-idName");
  var endpoint;

  if (actionType === "downloads") {
    window.open(event.currentTarget.href, "_blank");

    endpoint = "/stats/downloads/" + badgeIdName;
  } else if (actionType === "share") {
    var linkShare = document.createElement("a");

    if (event.currentTarget.id === "Lshare") {
      if (page === 1) {
        linkShare.href = event.currentTarget.href + "verify/" + string;
        linkShare.target = "_blank";
      } else {
        linkShare.href = event.currentTarget.href + "b/" + string + "/2";
        linkShare.target = "_blank";
      }
    }
    linkShare.click();
    // console.log(linkShare.href);

    endpoint = "/stats/share/" + badgeIdName;
  } else if (actionType === "addToProfile" || actionType === "addTo2Profile") {
    window.open(event.currentTarget.href, "_blank");
    endpoint = "/stats/" + actionType + "/" + badgeIdName;
  } else {
    console.error("Invalid action type");
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", endpoint, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log("GET request successful!");
    } else if (xhr.readyState === 4) {
      console.error("Error:", xhr.status);
    }
  };

  xhr.send();
}

// Function to open the default city (London) when the page loads
window.onload = function () {
  document.querySelector(".tablink").click();
};
function openCity(evt, cityName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("city");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(
      " w3-border-indigo",
      ""
    );
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-border-indigo";
}
// function to copy to clipboard
function copyToClipboard() {
  const linkText = document.getElementById("certLink").innerText;
  const tempInput = document.createElement("input");
  tempInput.setAttribute("value", linkText);
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  alert("Link copied to clipboard!");
}
// function for responsive width and height
function generateOptions(selectId, range) {
  var selectElement = document.getElementById(selectId);
  for (var i = 1; i <= range; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    selectElement.appendChild(option);
  }
}
document.getElementById("widthRange").addEventListener("input", function () {
  var range = parseInt(this.value);
  generateOptions("widthSelect", range);
});
document.getElementById("heightRange").addEventListener("input", function () {
  var range = parseInt(this.value);
  generateOptions("heightSelect", range);
});
function updateWidth() {
  var widthValue = document.getElementById("widthRange").value;
  document.getElementById("widthValue").innerText = widthValue;
}
function updateHeight() {
  var heightValue = document.getElementById("heightRange").value;
  document.getElementById("heightValue").innerText = heightValue;
}

function searchButtons() {
  var input, filter, container, buttons, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  container = document.getElementsByClassName("button-container")[0];
  buttons = container.getElementsByTagName("a");

  for (i = 0; i < buttons.length; i++) {
    txtValue = buttons[i].textContent || buttons[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      buttons[i].style.display = "";
    } else {
      buttons[i].style.display = "none";
    }
  }
}

function setupTics() {
  setTimeout(() => {
    const box = document.getElementById("Num3");
    box.style.visibility = "visible";
  }, 2500);

  setTimeout(() => {
    const box = document.getElementById("sig1");
    box.style.visibility = "visible";
  }, 3500);

  setTimeout(() => {
    const box = document.getElementById("name4");
    box.style.visibility = "visible";
  }, 4000);

  setTimeout(() => {
    const box = document.getElementById("dat2");
    box.style.visibility = "visible";
  }, 2000);
}
