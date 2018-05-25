// TODO: Add docs
const PurNode = require("./PurNode");
const PurText = require("./PurText");

const purNodeType = "PurNode";
const purTextType = "PurText";

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    return isPurNode(element) || isPurText(element);
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

function isPurNode(element) {
    return element.type === purNodeType;
}

function isPurText(element) {
    return element.type === purTextType;
}

module.exports = {
    isBuffer: isBuffer,
    isChild: isChild,
    isChildren: isChildren,
    isPurNode: isPurNode,
    isPurText: isPurText
};
