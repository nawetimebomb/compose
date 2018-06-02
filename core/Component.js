const emptyProperties = {};
const emptyChildren = [];

const type = "Component";

function Component(tagName, properties, children, key) {
    this.tagName = tagName;
    this.properties = properties || emptyProperties;
    this.children = children || emptyChildren;
    this.key = key != null ? String(key) : undefined;

    let count = this.children.length;
    let descendants = 0;
    let hooks;

    for (let propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            let property = properties[propName];
        }
    }

    for (let index = 0; index < count; index++) {
        let child = children[index];

        if (child && child.type === type) {
            descendants += child.count || 0;
        }
    }

    this.count = count + descendants;
    this.hooks = hooks;
}

Component.prototype.type = type;

module.exports = Component;
