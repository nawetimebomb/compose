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
