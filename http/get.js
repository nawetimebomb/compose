/**
 * @function get
 * @description Get function
 * @param {String} url - The URL/URI.
 * @returns {Promise} A JavaScript Promise.
 */
function get(url) {
    return new Promise(function getPromise(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);

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

        xhr.onerror = function onError() {
            reject({
                status: this.status,
                statusText: this.statusText
            });
        };

        xhr.send(null);
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

module.exports = get;
