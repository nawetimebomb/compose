(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const emptyProperties = {};
const emptyChildren = [];

const type = "Component";

function Component(tagName, properties, children, key) {
    this.tagName = tagName;
    this.properties = properties || emptyProperties;
    this.children = children || emptyChildren;
    this.key = key != null ? String(key) : undefined;

    let count = 0;
    let descendents = 0;
    let hooks;

    for (let propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            let property = properties[propName];
        }
    }

    this.count = count;
    this.hooks = hooks;
}

Component.prototype.type = type;

module.exports = Component;

},{}],2:[function(require,module,exports){
const render = require("./render");
const utils = require("./utils");

/**
 * ComposeApplication
 * @param {Component} rootComponent - Root Component that will be rendered.
 * @param {HTMLElement | String} ownerDOMElement - An HTMLElement or String that hosts the app.
 * @param {Object} options - The options object.
 * @returns {Object} api - Compose api.
 */
module.exports = function ComposeApplication(rootComponent, ownerDOMElement, options) {
    const api = {};
    let owner = ownerDOMElement;
    let rootNode;

    if (typeof ownerDOMElement === "string") {
        owner = document.getElementById(ownerDOMElement);
    }

    if (owner === undefined || owner === null) {
        throw Error("Not an owner node");
    }

    // Safety check the component
    if (rootComponent && utils.isChild(rootComponent)) {
        owner.appendChild(render(rootComponent));
    } else {
        throw Error("Not a component");
    }

    return api;
};

},{"./render":10,"./utils":11}],3:[function(require,module,exports){
const errors = require("./errors");
const Component = require("./Component");
const Text = require("./Text");
const utils = require("./utils");

function ComposeComponent(tagName, properties, children) {
    let childNodes = [];
    let tag, props, key, namespace;

    // If second parameter is children instead of prop.
    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = parseProperties(props || properties || {});
    tag = tagName;

    // Support and save key.
    if (props.hasOwnProperty("key")) {
        key = props.key;
        props.key = undefined;
    }

    if (children !== undefined && children !== null) {
        if (Array.isArray(children)) {
            for (let index = 0; index < children.length; index++) {
                childNodes.push(parseChild(children[index], tag, props));
            }
        } else {
            childNodes.push(parseChild(children, tag, props));
        }
    }

    return new Component(tag, props, childNodes, key);
}

function parseChild(child, tag, properties) {
    switch(typeof child) {
    case "string":
        return new Text(child);
    case "number":
        return new Text(child);
    case "function":
        if (utils.isChild(child())) return child();
    case "object":
        if (utils.isChild(child)) return child;
    case "undefined":
        return;
    default:
        throw errors.UnexpectedElement({
            element: child,
            parent: {
                tag: tag,
                properties: properties
            }
        });
    }
}

/**
 * @function parseProperties
 * @description Parses properties and understand which kind of property is and what should do in the Component.
 * @return {Object} a properties object to assign to the Component.
 */
function parseProperties(properties) {
    let result = {};

    for (let propName in properties) {
        const propValue = properties[propName];

        switch (typeof propValue) {
        case "function":
            result[propName.toLowerCase()] = propValue;
        case "object":
            if (propValue instanceof Object && !Array.isArray(propValue)) {
                result[propName] = propValue;
            } else if (Array.isArray(propValue)) {
                result[propName] = propValue.join(" ");
            }
            break;
        default:
            result[propName] = propValue;
        }
    }

    return result;
}

module.exports = ComposeComponent;

},{"./Component":1,"./Text":4,"./errors":5,"./utils":11}],4:[function(require,module,exports){
function Text(text) {
    this.text = String(text);
}

Text.prototype.type = "Text";

module.exports = Text;

},{}],5:[function(require,module,exports){
function UnexpectedElement(data) {
    let err = new Error();

    // Fix error message.
    err.type = "cmps.unexpected.element";
    err.message = "Trying to render unexpected element " + data.element + "."
    err.node = data.element;

    return err;
}

module.exports = {
    UnexpectedElement: UnexpectedElement
};

},{}],6:[function(require,module,exports){
const utils = require("./utils");

function handleBuffers(a, b) {
    let renderedBufferA = a;
    let renderedBufferB = b;

    if (utils.isBuffer(b)) {
        renderedBufferB = renderBuffer(b);
    }

    if (utils.isBuffer(a)) {
        rendererdBufferA = renderBuffer(a);
    }

    return {
        a: renderedBufferA,
        b: renderedBufferB
    };
}

function renderBuffer(buffer, previous) {
    let renderedBuffer = buffer.purNode;

    if (!renderedBuffer) {
        renderedBuffer = buffer.purNode = buffer.render(previous);
    }

    if (!(utils.isComponent(renderedBuffer) || utils.isText(renderedBuffer))) {
        throw Error("Not valid node in buffer");
    }

    return renderedBuffer;
}

module.exports = handleBuffers;

},{"./utils":11}],7:[function(require,module,exports){
/**
 * The Core module.
 * @module @compose/core
 * @see module:@compose/core
 */
const ComposeApplication = require("./ComposeApplication");
const ComposeComponent = require("./ComposeComponent");

module.exports = {
    application: ComposeApplication,
    component: ComposeComponent
};

},{"./ComposeApplication":2,"./ComposeComponent":3}],8:[function(require,module,exports){
var assign = require("./src/assign");

module.exports = {
    assign: assign
};

},{"./src/assign":9}],9:[function(require,module,exports){
/**
 * @function assign
 * @description Creates a new object changing the values of the `obj` with the ones in `source`.
 * @param {Object} obj - The original object.
 * @param {Object} source - An object that will overwrite (or add) values from the original object.
 * @returns {Object} a new object with new assigned values.
 */
function assign(obj, source) {
    // TODO: Use a copy of the original obj.
    let newObj = obj;
    let baseAssign = Object.assign;

    if (!baseAssign) {
        baseAssign = function manualAssign(obj, source) {
            for (let key in source) {
                obj[key] = source[key];
            }
        }
    }

    return baseAssign(newObj, source);
}

module.exports = assign;

},{}],10:[function(require,module,exports){
// TODO: Add docs
// TODO This will be part of the .application method.
// element should be a Component or Text.
const elnawejs = require("elnawejs");
const utils = require("./utils");
const handleBuffers = require("./handle-buffers");

function render(element, context, errorHandler) {
    let doc = context || document;

    if (typeof element === "function") {
        element = element();
    }

    //element = handleBuffers(element).a;

    if (utils.isText(element)) {
        return doc.createTextNode(element.text);
    } else if (!utils.isComponent(element)) {
        if (errorHandler) {
            errorHandler("Element not valid: ", element);
        }

        return null;
    }

    let node = doc.createElement(element.tagName);
    let props = element.properties;

    // Add properties to the node.
    for (let propName in props) {
        const propValue = props[propName];

        if (propValue === undefined) {
            // TODO: check this! Should be safer
            node[propName] = undefined;
        } else if (typeof propValue === "object") {
            elnawejs.assign(node[propName], propValue);
        } else {
            node[propName] = props[propName];
        }
    }

    let children = element.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = render(children[index], context, errorHandler);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

module.exports = render;

},{"./handle-buffers":6,"./utils":11,"elnawejs":8}],11:[function(require,module,exports){
// TODO: Add docs
const Component = require("./Component");
const Text = require("./Text");

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    return isComponent(element) || isText(element) || (typeof element === "function" && isChild(element()));
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

function isComponent(element) {
    return element.type === "Component";
}

function isText(element) {
    return element.type === "Text";
}

module.exports = {
    isBuffer: isBuffer,
    isChild: isChild,
    isChildren: isChildren,
    isComponent: isComponent,
    isText: isText
};

},{"./Component":1,"./Text":4}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/**
 * The Http module
 * @module @compose/http
 * @see module:@compose/http
 */
const get = require("./get");
const post = require("./post");

module.exports = {
    get: get,
    post: post
};

},{"./get":12,"./post":14}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
const Compose = require("../core");

function Header() {
    return Compose.component("div", {
        className: "header",
        style: {
            backgroundColor: "blue",
            color: "yellow",
            paddingLeft: "10px"
        }
    }, Title);
}

function Title() {
    return Compose.component("h1", "CMPS");
}

module.exports = Header;

},{"../core":7}],16:[function(require,module,exports){
// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Compose = require("../core");
const Header = require("./Header");
const http = require("../http");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

function get_json_data() {
    http.get("https://jsonplaceholder.typicode.com/posts")
        .then(function onSuccess(response) {
            console.log(response);
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

function get_text_data() {
    http.get("https://elnawe.com")
        .then(function onSuccess(response) {
            console.log(response);
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

function post_data() {
    let testBody = { myTest: true };

    http.post("https://jsonplaceholder.typicode.com/posts")
        .then(function onSuccess(response) {
            console.log(response);
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

// A custom button component
function button (state) {
    count = state || "";

    return Compose.component("button", {
        className: "my-button-class",
        id: "test",
        onclick: get_json_data,
    }, ["My Button Component", count]);
}

// A Compose framework demo Component
function ComposeDemo() {
    return Compose.component("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Compose Demo: ",
        button(),
        Compose.component("button", { onClick: get_text_data }, "I Love Compose"),
        Compose.component("button", { onClick: post_data }, "Posting Data")
    ]);
}



const MyProgram = Compose.application(ComposeDemo, document.getElementById("root"));

/*
Compose.application = function (rootComponent, DOMNode, options);
rootComponent: Layout component or routes,
DOMNode: Element where the app will be rendered.
options: Object

   const MyProgram = Compose.application(MyComponent, document.getElementById("root"), {
       update:
   });
*/

},{"../core":7,"../http":13,"./Header":15}]},{},[16]);
