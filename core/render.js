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
