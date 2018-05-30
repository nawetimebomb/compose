const render = require("./render");
const utils = require("./utils");

/**
 * ComposeApplication
 * @param {Component} rootComponent - Root Component that will be rendered.
 * @param {HTMLElement | String} ownerDOMElement - An HTMLElement or String that hosts the app.
 * @param {Object} options - The options object.
 * @returns {Object} api - Compose api.
 */
module.exports = function ComposeApplication(rootComponent, ownerDOMElement, options) {
    const api = {};
    let owner = ownerDOMElement;
    let rootNode;

    if (typeof ownerDOMElement === "string") {
        owner = document.getElementById(ownerDOMElement);
    }

    if (owner === undefined || owner === null) {
        throw Error("Not an owner node");
    }

    // Safety check the component
    if (rootComponent && utils.isChild(rootComponent)) {
        owner.appendChild(render(rootComponent));
    } else {
        throw Error("Not a component");
    }

    return api;
};
