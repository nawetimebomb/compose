// TODO: Add docs
// element should be a PurNode or PurText.
const utils = require("./utils");

function createElement(element, context, warning) {
    let doc = context && context.document || document;

    if (utils.isPurText(element)) {
        return doc.createTextNode(element.text);
    } else if (!utils.isPurNode(element)) {
        if (warning) {
            warning("Element not valid:", element);
        }

        return null;
    }

    let node = doc.createElement(element.tagName);
    let props = element.properties;

    // TODO: This is only applying string properties. Will error with any other kind of property. There should be a parser in here.
    for (let propName in props) {
        let propValue = props[propName];

        node[propName] = propValue;
    }

    let children = element.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = createElement(children[index], context, warning);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

module.exports = createElement;
