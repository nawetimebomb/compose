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
