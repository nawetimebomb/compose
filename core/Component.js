const EventPropertyHook = require("./EventPropertyHook");

const emptyProperties = {};
const emptyChildren = [];

const type = "Component";

function Component(tagName, properties, children, key) {
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

            if (isEvent(property)) {
                if (!hooks) {
                    hooks = {};
                }

                hooks[propName] = property;
            }
        }
    }

    this.count = count;
    this.hooks = hooks;
}

function isEvent(prop) {
    return prop instanceof EventPropertyHook && prop.attach && prop.detach;
}

Component.prototype.type = type;

module.exports = Component;
