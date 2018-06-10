const _ = require("lodash");
const application = require("./Application");
const Component = require("./Component");
const elnawejs = require("elnawejs");
const errors = require("./errors");
const Text = require("./Text");
const utils = require("./utils");

function ComposeComponent(tagName, properties) {
    let rest = [];
    let children = [];
    let length = arguments.length;
    let childNodes = [];
    let tag, props, key, namespace;

    while (length-- > 2) rest.push(arguments[length]);

    while (rest.length) {
        let node = rest.pop();

        if (node && node.pop) {
            for (length = node.length; length--; ) {
                rest.push(node[length]);
            }
        } else if (node != null && typeof node !== "boolean") {
            children.push(node);
        }
    }

    props = parseProperties(props || properties || {});
    tag = tagName;

    // Support and save key.
    if (props.hasOwnProperty("key")) {
        key = props.key;
        props.key = undefined;
    }

    if (Array.isArray(children)) {
        for (let index = 0; index < children.length; index++) {
            childNodes.push(parseChild(children[index], tag, props));
        }
    } else {
        childNodes.push(parseChild(children, tag, props));
    }

    return new Component(tag, props, childNodes, key);
}

function parseChild(child, tag, properties) {
    if (child == null) {
        return;
    } else if (typeof child === "string" || typeof child === "number") {
        return new Text(child);
    } else if (typeof child.tagName === "function") {
        let component = child.tagName;
        let commands = component.commands;

        // add children to props so component can transclude the content.
        let newProps = _.assign({}, child.properties, { children: child.children });

        // check for state. If exists, use state as first parameter, if not, use props.
        let props = child.properties;
        let state = application.getState(component.displayName);
        let stateOrProps = !_.isEmpty(state) ? state : newProps;

        return component(stateOrProps || {}, commands, newProps);
    } else if (utils.isChild(child)) {
        return child;
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
            result[propName] = propValue;
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
