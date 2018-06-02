/**
 * Post request module.
 * @module @compose/http/post
 * @see module:@compose/http/post
 */

/**
 * @function post
 * @description Post function
 * @param {String} url - The URL/URI.
 * @param {Object} body - The call body.
 * @param {Object} headers - Extra headers.
 * @returns {Promise} A JavaScript Promise.
 */
function post(url, body, headers) {
    return new Promise(function postPromise(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", url, true);

        // Parsing headers
        if (headers && headers instanceof Object) {
            headers.each(function addHeaders(value, key) {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.send(JSON.stringify(body));

        // Do processing after request finishes.
        xhr.onreadystatechange = function onReady() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                resolve(this.response);
            } else {
                reject( {
                    status: this.status,
                    statusText: this.statusText
                });
            }
        }
    });
}

module.exports = post;
