const EventStore = require("ev-store");

function EventPropertyHook(propertyValue) {
    if (!(this instanceof EventPropertyHook)) {
        return new EventPropertyHook(propertyValue);
    }

    this.value = propertyValue;
    console.log(this.value);
}

EventPropertyHook.prototype.attach = function (node, propertyName) {
    let elementEvents = EventStore(node);
    let eventName = propertyName.substr(2).toLowerCase(); // onClick -> click
    console.log("Event " + propertyName + " attached with value: ", this.value);

    elementEvents[eventName] = this.value;
}

EventPropertyHook.prototype.detach = function (node, propertyName) {
    let elementEvents = EventStore(node);
    let eventName = propertyName.substr(2).toLowerCase();
    console.log("Event " + propertyName + " detached");

    elementEvents[eventName] = undefined;
}

module.exports = EventPropertyHook;
