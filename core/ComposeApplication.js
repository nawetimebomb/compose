const initApplication = require("./init-application");
const utils = require("./utils");

/**
 * ComposeApplication
 * @param {Component} rootComponent - Root Component that will be rendered.
 * @param {HTMLElement | String} ownerDOMElement - An HTMLElement or String that hosts the app.
 * @param {Object} options - The options object.
 * @returns {Object} api - Compose api.
 */
function ComposeApplication(appComponent, ownerDOMElement) {
    let owner = ownerDOMElement;

    if (typeof ownerDOMElement === "string") {
        owner = document.querySelector(ownerDOMElement);
    }

    if (owner === undefined || owner === null) {
        throw Error("Not an owner node");
    }

    if (!appComponent || !utils.isChild(appComponent)) {
        throw Error("Not a component");
    }

    return initApplication(appComponent, owner);
};

module.exports = ComposeApplication;
