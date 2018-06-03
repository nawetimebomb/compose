const diff = require("./diff");
const elnawejs = require("elnawejs");
const render = require("./render");
const update = require("./update");
const utils = require("./utils");

function initApplication(appComponent, ownerDOMElement) {
    // private variables
    const component = appComponent;
    let rootNode;
    let state = {};

    // render initial application
    rootNode = (function renderInitialApplication (component, owner, initialState) {
        const rootComponent = component(initialState);
        const node = render(rootComponent);

        owner.appendChild(node);

        return node;
    })(component, ownerDOMElement, elnawejs.clone(state));

    // clean-up unnecessary memory.
    appComponent = undefined;
    ownerDOMElement = undefined;

    return {
        forceUpdate: function forceUpdate() {
            let newComponent = component(state);
            let changes = diff(rootNode, newComponent);

            rootNode = update(rootNode, changes);
        },
        getState: function getState() {
            return elnawejs.clone(state);
        },
        setState: function setState(stateChange) {
            let newState = elnawejs.assign(state, stateChange);

            if (this.shouldUpdate(newState)) {
                state = newState;
                this.forceUpdate();
            }
        },
        shouldUpdate: function shouldUpdate(newState) {
            // TODO: this shouldn't force the update.
            // It should check if newState is equal to the current existing app state.
            return true;
        }
    };
}

module.exports = initApplication;
