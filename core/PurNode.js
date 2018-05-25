const emptyProperties = {};
const emptyChildren = [];

const type = "PurNode";

function PurNode(tagName, properties, children, key) {
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
        }
    }

    this.count = count;
}

PurNode.prototype.type = type;

module.exports = PurNode;
