const _ = require("lodash");

function Application() {
    this.globalState = {};
    this.isFirstRender = true;
    this.lifecycles = [];
    this.subscribers = [];
}

Application.prototype.setStateByPath = function setStateByPath(name, state) {
    let newStateInPath = _.clone(this.getState(name));

    // need a way to set the state safely. Testing here. Managing partial states?
    for (let key in state) {
        newStateInPath[key] = state[key];
    }

    this.globalState[name] = newStateInPath;

    // Update subscribers
    // I'll probably update this to exclusive event types. It would be good if I only message the ones interested in this piece of change.
    this.subscribers.map(function (cb) {
        cb();
    });
};

Application.prototype.subscribe = function subscribe(cb) {
    this.subscribers.push(cb);
};

Application.prototype.getState = function getState(name) {
    return this.globalState[name] || {};
};

Application.prototype.registerLifecycle = function registerLifecycle(cb) {
    this.lifecycles.push(cb);
};

Application.prototype.runLifecycles = function runLifecycles() {
    _.forEach(this.lifecycles, function run(cb) {
        cb();
    });

    this.lifecycles = [];
};

Application.prototype.setupFirstRender = function setupFirstRender() {
    // runs just after the first render
    this.isFirstRender = false;
    this.runLifecycles();
}

module.exports = new Application();
