// Based on tinyxhr by Shimon Doodkin (https://gist.github.com/4706967)

function xhr(url, callback, method, data, contenttype) {
    var requestTimeout, 
    	method = (method ? method : "get").toUpperCase(),
    	contentType = (contenttype ? contenttype : 'application/x-www-form-urlencoded'),
    	xhr;
    
    try {
        xhr = new XMLHttpRequest();
    } catch (e) {
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            // XHR not supported
            return null;
        }
    }

    requestTimeout = setTimeout(function () {
        xhr.abort();
        callback(new Error("xhr: aborted by a timeout"), "", xhr);
    }, 10000);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        clearTimeout(requestTimeout);
        callback(xhr.status != 200 ? new Error("xhr: server respnse status is " + xhr.status) : false, xhr.responseText, xhr);
    };

    xhr.open(method, url, true);

    if (!data) {
    	xhr.send();
    }
    else {
        xhr.setRequestHeader('Content-type', contentType);
        xhr.send(data)
    }
}