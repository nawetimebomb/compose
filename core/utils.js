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
