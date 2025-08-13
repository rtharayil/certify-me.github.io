var page = 1;
function value_seeker(value){
    page = value;
}
function sendPostRequest(event, actionType, string) {
        event.preventDefault();
        
        var badgeIdName = event.currentTarget.getAttribute('data-badge-idName');
        var endpoint;

        if (actionType === 'downloads') {
         window.open(event.currentTarget.href, '_blank');
         
         endpoint = '/stats/downloads/' + badgeIdName;
        
        } else if (actionType === 'share') {
          var linkShare = document.createElement('a');
           
          if (event.currentTarget.id === 'Lshare') {
              if (page === 1) {
                linkShare.href = event.currentTarget.href + 'verify/' + string;
                linkShare.target = '_blank';
              } else {
                  linkShare.href = event.currentTarget.href + 'b/' + string + '/2';
                  linkShare.target = '_blank';
              }
          }
          linkShare.click();
          // console.log(linkShare.href);
  
          endpoint = '/stats/share/' + badgeIdName;

        } else if (actionType === 'addToProfile' || actionType === 'addTo2Profile') {
            window.open(event.currentTarget.href, '_blank');
            endpoint = '/stats/' + actionType + '/' + badgeIdName;
        } else {
            console.error('Invalid action type');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('request successful!');
            } else if (xhr.readyState === 4) {
                console.error('Error:', xhr.status);
            }
        };

        xhr.send();
}


function sendVerifyCredentialRequest(badgeIdName, source) {
    // Construct the endpoint
    var endpoint = '/stats/verifyCredential/' + badgeIdName;
    // Create the XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var redirectUrl = '/QRVerify/' + encodeURIComponent(badgeIdName) + '?source=' + encodeURIComponent(source);
                window.location.href = redirectUrl;
            } else {
                console.error('Error:', xhr.status);
                var redirectUrl = '/QRVerify/' + encodeURIComponent(badgeIdName) + '?source=' + encodeURIComponent(source);
                window.location.href = redirectUrl;
            }
        }
    };
    xhr.send();
}


function sendlogoRequest(badeIdName){
    var endpoint = '/stats/navLogo/' + badeIdName;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('request successful!');
        } else if (xhr.readyState === 4) {
            console.error('Error:', xhr.status);
        }
    };
    xhr.send();
}

function sendAdvSmallRequest(badeIdName){
    var endpoint = '/stats/adsSmall/' + badeIdName;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('request successful!');
        } else if (xhr.readyState === 4) {
            console.error('Error:', xhr.status);
        }
    };
    xhr.send();
}