const diff = require("./diff");
const elnawejs = require("elnawejs");
const render = require("./render");
const update = require("./update");
const utils = require("./utils");
const application = require("./Application");

function initApplication(appComponent, ownerDOMElement) {
    // private variables
    const component = appComponent;
    let rootNode;

    // render initial application
    rootNode = (function renderInitialApplication(component, owner) {
        const rootComponent = instantiateComponent();
        const node = render(rootComponent);

        application.subscribe(shouldUpdateApp);

        owner.appendChild(node);

        return node;
    })(component, ownerDOMElement);

    // clean-up unnecessary memory allocation.
    (function cleanUpMemoryAllocation() {
        appComponent = undefined;
        ownerDOMElement = undefined;
    })();

    // private functions
    function instantiateComponent() {
        return component(application.getState(component.displayName), component.commands);
    }

    function shouldUpdateApp(oldState, newState) {
        // Should check state
        if (true) {
            updateApp();
        }
    }

    function updateApp() {
        let newComponent = instantiateComponent();
        let changes = diff(rootNode, newComponent);

        rootNode = update(rootNode, changes);
    }
}

module.exports = initApplication;
