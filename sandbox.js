(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const emptyProperties = {};
const emptyChildren = [];

const type = "PurNode";

function PurNode(tagName, properties, children, key) {
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
}

PurNode.prototype.type = type;

module.exports = PurNode;

},{}],2:[function(require,module,exports){
function PurText(text) {
    this.text = String(text);
}

PurText.prototype.type = "PurText";

module.exports = PurText;

},{}],3:[function(require,module,exports){
const errors = require("./errors");
const PurNode = require("./PurNode");
const PurText = require("./PurText");
const utils = require("./utils");

function createComponent(tagName, properties, children) {
    let childNodes = [];
    let tags, props, key, namespace;

    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
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

    return new PurNode(tag, props, childNodes, key);
}

function parseChild(child, tag, properties) {
    if (typeof child === "string" || typeof child === "number") {
        return new PurText(child);
    } else if (utils.isChild(child)) {
        return child;
    } else if (child === undefined || child === null) {
        return;
    } else {
        throw errors.UnexpectedElement({
            element: child,
            parent: {
                tag: tag,
                properties: properties
            }
        });
    }
}

module.exports = createComponent;

},{"./PurNode":1,"./PurText":2,"./errors":4,"./utils":8}],4:[function(require,module,exports){
function UnexpectedElement(data) {
    let err = new Error();

    // Fix error message.
    err.type = "purjs.unexpected.element";
    err.message = "Trying to render unexpected element " + data.element + "."
    err.node = data.element;

    return err;
}

module.exports = {
    UnexpectedElement: UnexpectedElement
};

},{}],5:[function(require,module,exports){
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

    if (!(utils.isPurNode(renderedBuffer) || utils.isPurText(renderedBuffer))) {
        throw Error("Not valid node in buffer");
    }

    return renderedBuffer;
}

module.exports = handleBuffers;

},{"./utils":8}],6:[function(require,module,exports){
const createComponent = require("./create-component");
const render = require("./render");

module.exports = {
    createComponent: createComponent,
    render: render
};

},{"./create-component":3,"./render":7}],7:[function(require,module,exports){
// TODO: Add docs
// element should be a PurNode or PurText.
const utils = require("./utils");
const handleBuffers = require("./handle-buffers");

function render(element, context, errorHandler) {
    let doc = context || document;

    //element = handleBuffers(element).a;

    if (utils.isPurText(element)) {
        return doc.createTextNode(element.text);
    } else if (!utils.isPurNode(element)) {
        if (errorHandler) {
            errorHandler("Element not valid:", element);
        }

        return null;
    }

    let node = doc.createElement(element.tagName);
    let props = element.properties;

    // TODO: This is only applying string properties. Will error with any other kind of property. There should be a parser in here.
    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            // TODO: Should remove property
        } else if (typeof propValue === "function") {
            // TODO: Handle functions
        } else {
            if (propValue instanceof Object && !(propValue instanceof Array)) {
                // TODO: Handle object-like props
            } else {
                node[propName] = propValue;
            }
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

},{"./handle-buffers":5,"./utils":8}],8:[function(require,module,exports){
// TODO: Add docs
const PurNode = require("./PurNode");
const PurText = require("./PurText");

const purNodeType = "PurNode";
const purTextType = "PurText";

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    return isPurNode(element) || isPurText(element);
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

function isPurNode(element) {
    return element.type === purNodeType;
}

function isPurText(element) {
    return element.type === purTextType;
}

module.exports = {
    isBuffer: isBuffer,
    isChild: isChild,
    isChildren: isChildren,
    isPurNode: isPurNode,
    isPurText: isPurText
};

},{"./PurNode":1,"./PurText":2}],9:[function(require,module,exports){
// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Pur = require("../core");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

// A custom button componentn
function button (state) {
    count = state || "";

    return Pur.createComponent("button", {
        className: "my-button-class"
    }, ["My Button Component", count]);
}

// A purJsDemo Component
function purJsDemo() {
    return Pur.createComponent("div", {
        className: "my-div"
    }, [
        "This is a PurJS Demo: ",
        withIndex(button),
        withIndex(button),
        button(),
        Pur.createComponent("button", "I Love PurJS")
    ]);
}

document.body.appendChild(Pur.render(purJsDemo()));

},{"../core":6}]},{},[9]);
