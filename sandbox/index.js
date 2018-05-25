// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
function createPurNode(tagName, properties, children) {
    let childNodes = [];
    let tags, props, key, namespace;

    if (!children && isChildren(properties)) {
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
    } else if (isChild(child)) {
        return child;
    } else if (child === undefined || child === null) {
        return;
    } else {
        throw UnexpectedElement({
            element: child,
            parent: {
                tag: tag,
                properties: properties
            }
        });
    }
}

function UnexpectedElement(data) {
    let err = new Error();

    // Fix error message.
    err.type = "purjs.unexpected.element";
    err.message = "Trying to render unexpected element " + data.element + "."
    err.node = data.element;

    return err;
}

/**
 * Pur Text
 */
function PurText(text) {
    this.text = String(text);
}

PurText.prototype.type = "PurText";
// End Pur Text

/**
 * Pur Node
 */
let emptyProperties = {};
let emptyChildren = [];

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
}

PurNode.prototype.type = "PurNode";
// End Virtual Node

function isPurText(element) {
    return element.type === "PurText";
}

function isPurNode(element) {
    return element.type === "PurNode";
}

function isChild(element) {
    return isPurNode(element) || isPurText(element);
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

// element should be a PurNode;
function createElement(element, context, warning) {
    let doc = context && context.document || document;

    if (isPurText(element)) {
        return doc.createTextNode(element.text);
    } else if (!isPurNode(element)) {
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

    return createPurNode("button", {
        className: "my-button-class"
    }, ["My Button Component", count]);
}

// A purJsDemo Component
function purJsDemo() {
    return createPurNode("div", {
        className: "my-div"
    }, [
        "This is a PurJS Demo: ",
        withIndex(button),
        withIndex(button),
        button(),
        createPurNode("button", "I Love PurJS")
    ]);
}

document.body.appendChild(createElement(purJsDemo()));
