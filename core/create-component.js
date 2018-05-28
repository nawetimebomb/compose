const errors = require("./errors");
const Component = require("./Component");
const propertiesParser = require("./properties-parser");
const Text = require("./Text");
const utils = require("./utils");

function createComponent(tagName, properties, children) {
    let childNodes = [];
    let tag, props, key, namespace;

    // If second parameter is children instead of prop.
    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = propertiesParser(props || properties || {});
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

module.exports = createComponent;
