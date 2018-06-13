const _ = require("lodash");
const utils = require("./utils");

function render(element, options) {
    let doc = options ? options.document || document : document;
    let warning = options ? options.warning : null;
    let renderedElement = element;

    if (typeof element === "function") {
        renderedElement = element();
    }

    if (renderedElement) {
        if (utils.isText(renderedElement)) {
            return doc.createTextNode(renderedElement.text);
        } else if (!utils.isComponent(renderedElement)) {
            if (warning) {
                warning("Element not valid: ", renderedElement);
            }

            return null;
        }
    } else {
        if (warning) {
            warning("Element not valid: ", renderedElement);
        }

        return null;
    }

    let node = doc.createElement(renderedElement.tagName);
    let props = renderedElement.properties;

    // Add properties to the node.
    for (let propName in props) {
        const propValue = props[propName];

        if (propValue === undefined) {
            // TODO: check this! Should be safer
            node[propName] = undefined;
        } else if (typeof propValue === "function") {
            node[propName.toLowerCase()] = propValue;
        } else if (typeof propValue === "object") {
            if (propName === "style") {
                for (let key in propValue) {
                    node.style[key] = propValue[key];
                }
            } else if (propName === "className") {
                let classes = [];
                if (_.isArray(propValue)) {
                    classes = propValue;
                } else {
                    for (let key in propValue) {
                        if (propValue[key]) {
                            classes.push(key);
                        }
                    }
                }

                node.className = classes.join(" ");
            } else {
                node[propName] = propValue;
            }
        } else {
            node[propName] = props[propName];
        }
    }

    let children = renderedElement.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = render(children[index], options);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

module.exports = render;
