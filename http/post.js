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

        xhr.onload = function onLoad() {
            if (this.status >= 200 && this.status < 300) {
                let response = parseResponse(this.response);

                resolve(response);
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        };

        xhr.send(JSON.stringify(body));
    });
}

function parseResponse(response) {
    let newResponse;

    try {
        newResponse = JSON.parse(response);
    } catch (error) {
        newResponse = response;
    }

    return newResponse;
}

module.exports = post;
