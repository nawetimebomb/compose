// TODO: Add docs
const Component = require("./Component");
const Text = require("./Text");

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    // TODO The {} in element({}) is a workaround for the initial state of the app.
    // This is not clean anymore and will have to find a better solution to not force this check.
    // Isn't that bad passing an "empty" state since it's actually the one used when the app runs first,
    // but if I want to give a change to the user to start with a custom initial state I will need to fix this.
    return isComponent(element) || isText(element) || (typeof element === "function" && isChild(element({})));
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
