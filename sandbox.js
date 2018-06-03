(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./init-application":9,"./utils":15}],3:[function(require,module,exports){
const Component = require("./Component");
const errors = require("./errors");
const Text = require("./Text");
const utils = require("./utils");

function ComposeComponent(tagName, properties, children) {
    let childNodes = [];
    let tag, props, key, namespace;

    // If second parameter is children instead of prop.
    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = parseProperties(props || properties || {});
    tag = tagName;

    // Support and save key.
    if (props.hasOwnProperty("key")) {
        key = props.key;
        props.key = undefined;
    }

    if (children !== undefined && children !== null) {
        if (Array.isArray(children)) {
            for (let index = 0; index < children.length; index++) {
                childNodes.push(parseChild(children[index], tag, props));
            }
        } else {
            childNodes.push(parseChild(children, tag, props));
        }
    }

    return new Component(tag, props, childNodes, key);
}

function parseChild(child, tag, properties) {
    switch(typeof child) {
    case "undefined":
        return;
    case "string":
        return new Text(child);
    case "number":
        return new Text(child);
    case "function":
        if (utils.isChild(child())) return child();
    case "object":
        if (utils.isChild(child)) return child;
    default:
        throw errors.UnexpectedElement({
            element: child,
            parent: {
                tag: tag,
                properties: properties
            }
        });
    }
}

/**
 * @function parseProperties
 * @description Parses properties and understand which kind of property is and what should do in the Component.
 * @return {Object} a properties object to assign to the Component.
 */
function parseProperties(properties) {
    let result = {};

    for (let propName in properties) {
        const propValue = properties[propName];

        switch (typeof propValue) {
        case "function":
            result[propName.toLowerCase()] = propValue;
        case "object":
            if (propValue instanceof Object && !Array.isArray(propValue)) {
                result[propName] = propValue;
            } else if (Array.isArray(propValue)) {
                result[propName] = propValue.join(" ");
            }
            break;
        default:
            result[propName] = propValue;
        }
    }

    return result;
}

module.exports = ComposeComponent;

},{"./Component":1,"./Text":4,"./errors":7,"./utils":15}],4:[function(require,module,exports){
function Text(text) {
    this.text = String(text);
}

Text.prototype.type = "Text";

module.exports = Text;

},{}],5:[function(require,module,exports){
function UpdateOperation(type, node, changes) {
    this.type = Number(type);
    this.component = node;
    this.changes = changes;
}

UpdateOperation.NONE = 0;
UpdateOperation.TEXT = 1;
UpdateOperation.COMPONENT = 2;
UpdateOperation.PROPS = 3;
UpdateOperation.ORDER = 4;
UpdateOperation.INSERT = 5;
UpdateOperation.REMOVE = 6;

UpdateOperation.prototype.type = "UpdateOperation";

module.exports = UpdateOperation;

},{}],6:[function(require,module,exports){
const UpdateOperation = require("./UpdateOperation");
const utils = require("./utils");

function diff(a, b) {
    let changes = { a: a };

    getDifferencesByMappingTree(a, b, changes, 0);

    return changes;
}

function getDifferencesByMappingTree(a, b, changes, index) {
    if (a === b) {
        return;
    }

    let apply = changes[index];
    let applyClear = false;

    if (utils.isComponent(b)) {
        // b is a component
        if (utils.isComponent(a)) {
            if (a.tagName === b.tagName && a.key === b.key) {
                let propsChanges = calculatePropChanges(a.properties, b.properties);

                if (propChanges) {
                    apply = appendChange(apply, new UpdateOperation(UpdateOperation.PROPS, a, propChanges));
                }

                apply = calculateChildrenDifferences(a, b, changes, apply, index);
            } else {
                apply = appendChange(apply, new UpdateOperation(UpdateOperation.COMPONENT, a, b));
                applyClear = true;
            }
        } else {
            apply = appendChange(apply, new UpdateOperation(UpdateOperation.COMPONENT, a, b));
            applyClear = true;
        }
    } else if (utils.isText(b)) {
        if (!utils.isText(a)) {
            apply = appendChange(apply, new UpdateOperation(UpdateOperation.TEXT, a, b));
            applyClear = true;
        } else if (a.text !== b.text) {
            apply = appendChange(apply, new UpdateOperation(UpdateOperation.TEXT, a, b));
        }
    }

    if (apply) {
        changes[index] = apply;
    }

    if (applyClear) {
        clearState(a, changes, index);
    }
}

function calculateChildrenDifferences(a, b, changes, apply, index) {
    let childrenA = a.children;
    let orderedSet = reorder(childrenA, b.children);
    let childrenB = orderedSet.children;

    let lengthA = childrenA.length;
    let lengthB = childrenB.length;
    let highestLength = (lengthA > lengthB) ? lengthA : lengthB;

    for (let localIndex = 0; localIndex < highestLength; localIndex++) {
        let leftNode = childrenA[localIndex];
        let rightNode = childrenB[localIndex];
        index += 1;

        if (!leftNode) {
            if (rightNode) {
                // New node in b
                apply = appendChange(apply, new UpdateOperation(UpdateOperation.INSERT, null, rightNode));
            }
        } else {
            getDifferencesByMappingTree(leftNode, rightNode, changes, index);
        }

        if (utils.isComponent(leftNode) && leftNode.count) {
            index += leftNode.count;
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes
        apply = appendChange(apply, new UpdateOperation(UpdateOperation.ORDER, a, orderedSet.moves));
    }

    return apply;
}

function clearState(component, changes, index) {
    // TODO: Clear any saved state
}

function reorder(childrenA, childrenB) {
    let bChildIndex = keyIndex(childrenB);
    let keysB = bChildIndex.keys;
    let freeB = bChildIndex.free;

    if (freeB.length === childrenB.length) {
        return {
            children: childrenB,
            moves: null
        };
    }

    let aChildIndex = keyIndex(childrenA);
    let keysA = aChildIndex.keys;
    let freeA = aChildIndex.free;

    if (freeA.length === childrenB.length) {
        return {
            children: childrenB,
            moves: null
        };
    }

    let newChildren = [];
    let freeIndex = 0;
    let freeCount = freeB.length;
    let deletedItems = 0;

    for (let index = 0; index < childrenA.length; index++) {
        let itemA = childrenA[index];
        let itemIndex;

        if (itemA.key) {
            if (keysB.hasOwnProperty(itemA.key)) {
                // Match old keys
                itemIndex = keysB[itemA.key];
                newChildren.push(childrenB[itemIndex]);
            } else {
                // Remove old keyed items
                itemIndex = index - deletedItems++;
                newChildren.push(null);
            }
        } else {
            // Match item in a with next free item in b
            if (freeIndex < freeCount) {
                itemIndex = freeB[freeIndex++];
                newChildren.push(childrenB[itemIndex]);
            } else {
                // Delete extra nodes because there are no free items in b to match with a
                itemIndex = index - deletedItems++;
                newChildren.push(null);
            }
        }
    }

    let lastFreeIndex = freeIndex >= freeB.length
        ? childrenB.length
        : freeB[freeIndex];

    // Iterate through b. Append new keys
    for (let index = 0; index < childrenB.length; index++) {
        let newItem = childrenB[index];

        if (newItem.key) {
            if (!keysA.hasOwnProperty(newItem.key)) {
                // Add new keyed items.
                newChildren.push(newItem);
            }
        } else if (index >= lastFreeIndex) {
            newChildren.push(newItem);
        }
    }

    let simulate = newChildren.slice();
    let simulateIndex = 0;
    let removes = [];
    let inserts = [];
    let simulateItem;

    for (let index = 0; index < childrenB.length;) {
        let wantedItem = childrenB[index];
        simulateItem = simulate[simulateIndex];

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null));
            simulateItem = simulate[simulateIndex];
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    if (keysB[simulateItem.key] !== index + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key));
                        simulateItem = simulate[simulateIndex];

                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: index });
                        } else {
                            simulateIndex++;
                        }
                    } else {
                        inserts.push({ key: wantedItem.key, to: index });
                    }
                } else {
                    inserts.push({ key: wantedItem.key, to: index });
                }

                index++;
            } else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key));
            }
        } else {
            simulateIndex++;
            index++;
        }
    }

    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex];
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
    }

    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        };
    }

    return {
        children: newChildren,
        moves: {
            inserts: inserts,
            removes: removes
        }
    };
}

function remove(array, index, key) {
    array.splice(index, 1);

    return {
        from: index,
        key: key
    };
}

function keyIndex(children) {
    let free = [];
    let keys = {};
    let length = children.length;

    for (let index = 0; index < length; index++) {
        let child = children[index];

        if (child.key) {
            keys[child.key] = index;
        } else {
            free.push(index);
        }
    }

    return {
        free: free,
        keys: keys
    };
}

function appendChange(apply, changes) {
    let newApply = apply;

    if (apply) {
        if (Array.isArray(apply)) {
            newApply.push(changes);
        } else {
            newApply = [ apply, changes ];
        }
    } else {
        newApply = changes;
    }

    return newApply;
}

// PROP CHANGES

function calculatePropChanges(propertiesA, propertiesB) {
    let diff;

    for (let keyA in propertiesA) {
        if (!(keyA in propertiesB)) {
            diff = diff || {};
            diff[keyA] = undefined;
        }

        let valueA = propertiesA[keyA];
        let valueB = propertiesB[keyB];

        if (valueA === valueB) {
            continue;
        } else if (valueA instanceof Object && valueB instanceof Object) {
            if (getPrototype(valueB) !== getPrototype(valueA)) {
                diff = diff || {};
                diff[keyA] = valueB;
            } else {
                let objectDiff = calculatePropChanges(valueA, valueB);

                if (objectDiff) {
                    diff = diff || {};
                    diff[keyA] = objectDiff;
                }
            }
        } else {
            diff = diff || {};
            diff[keyA] = valueB;
        }
    }

    for (let keyB in b) {
        if (!(keyB in a)) {
            diff = diff || {};
            diff[keyB] = b[keyB];
        }
    }

    return diff;
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

module.exports = diff;

},{"./UpdateOperation":5,"./utils":15}],7:[function(require,module,exports){
function UnexpectedElement(data) {
    let err = new Error();

    // Fix error message.
    err.type = "compose.unexpected.element";
    err.message = "Trying to render unexpected element " + JSON.stringify(data.element) + "."
    err.node = data.element;

    return err;
}

module.exports = {
    UnexpectedElement: UnexpectedElement
};

},{}],8:[function(require,module,exports){
/**
 * The Core module.
 * @module @compose/core
 * @see module:@compose/core
 */
const ComposeApplication = require("./ComposeApplication");
const ComposeComponent = require("./ComposeComponent");

module.exports = {
    application: ComposeApplication,
    component: ComposeComponent
};

},{"./ComposeApplication":2,"./ComposeComponent":3}],9:[function(require,module,exports){
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

},{"./diff":6,"./render":13,"./update":14,"./utils":15,"elnawejs":10}],10:[function(require,module,exports){
module.exports = {
    assign: require("./src/assign"),
    clone: require("./src/clone")
};

},{"./src/assign":11,"./src/clone":12}],11:[function(require,module,exports){
const clone = require("./clone");

/**
 * @function assign
 * @description Creates a new object changing the values of the `obj` with the ones in `source`.
 * @param {Object} obj - The original object.
 * @param {Object} source - An object that will overwrite (or add) values from the original object.
 * @returns {Object} a new object with new assigned values.
 */
function assign(obj, source) {
    let newObj = clone(obj);
    let baseAssign = Object.assign;

    if (!baseAssign) {
        baseAssign = function manualAssign(obj, source) {
            for (let key in source) {
                obj[key] = source[key];
            }
        }
    }

    return baseAssign(newObj, source);
}

module.exports = assign;

},{"./clone":12}],12:[function(require,module,exports){
/**
 * @function clone
 * @description Creates a shallow or deep clone of an object.
 * @param {Object} obj - The original object to clone.
 * @param {Boolean} deepClone - A flag to toggle the deepClone.
 * @returns {Object} a new object cloned from the previous one.
 */
function clone(obj, deepClone) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = clone;

},{}],13:[function(require,module,exports){
const elnawejs = require("elnawejs");
const utils = require("./utils");

function render(element, options) {
    let doc = options ? options.document || document : document;
    let warning = options ? options.warning : null;
    let renderedElement = element;

    if (typeof element === "function") {
        renderedElement = element();
    }

    if (renderedElement) {
        if (utils.isText(renderedElement)) {
            return doc.createTextNode(renderedElement.text);
        } else if (!utils.isComponent(renderedElement)) {
            if (warning) {
                warning("Element not valid: ", renderedElement);
            }

            return null;
        }
    } else {
        if (warning) {
            warning("Element not valid: ", renderedElement);
        }

        return null;
    }

    let node = doc.createElement(renderedElement.tagName);
    let props = renderedElement.properties;

    // Add properties to the node.
    for (let propName in props) {
        const propValue = props[propName];

        if (propValue === undefined) {
            // TODO: check this! Should be safer
            node[propName] = undefined;
        } else if (typeof propValue === "object") {
            if (propName === "style") {
                for (let key in propValue) {
                    node.style[key] = propValue[key];
                }
            } else {
                elnawe.assign(node[propName], propValue);
            }
        } else {
            node[propName] = props[propName];
        }
    }

    let children = renderedElement.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = render(children[index], options);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

module.exports = render;

},{"./utils":15,"elnawejs":10}],14:[function(require,module,exports){
const render = require("./render");
const UpdateOperation = require("./UpdateOperation");

const noChild = {};

/**
 * Selects the way the app is going to update. If the user provides an `update` function, use that. If not, use the default `recursiveUpdate`.
 */
function update(rootNode, changes) {
    let options = {};

    options.update = (options.update && options.update !== update)
        ? options.update
        : recursiveUpdate;
    options.render = options.render || render;

    return recursiveUpdate(rootNode, changes, options);
}

function recursiveUpdate(rootNode, changes, options) {
    let record = getChangesRecord(changes);

    if (record.length === 0) {
        return rootNode;
    }

    let domIndex = virtualDOM(rootNode, changes.a, record);
    let ownerDocument = rootNode.ownerDocument;

    if (!options.document && ownerDocument !== document) {
        options.document = ownerDocument;
    }

    for (let index = 0; index < record.length; index++) {
        let nodeIndex = record[index];

        rootNode = applyUpdate(rootNode, domIndex[nodeIndex], changes[nodeIndex], options);
    }

    return rootNode;
}

function applyUpdate(rootNode, domNode, changesList, options) {
    if (!domNode) {
        return rootNode
    };

    let newNode;

    if (Array.isArray(changesList)) {
        for (let index = 0; index < changesList.length; index++) {
            newNode = doUpdateOperation(changesList[index], domNode, options);

            if (domNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = doUpdateOperation(changesList, domNode, options);

        if (domNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function getChangesRecord(changes) {
    let record = [];

    for (let key in changes) {
        if (key !== "a") {
            record.push(Number(key));
        }
    }

    return record;
}

function doUpdateOperation(updateOperation, domNode, options) {
    let type = updateOperation.type;
    let component = updateOperation.component;
    let changes = updateOperation.changes;

    switch (type) {
    case UpdateOperation.REMOVE:
        return removeNode(domNode, component);
    case UpdateOperation.INSERT:
        return insertNode(domNode, changes, options);
    case UpdateOperation.TEXT:
        return changeString(domNode, component, changes, options);
    case UpdateOperation.COMPONENT:
        return changeComponent(domNode, component, changes, options);
    case UpdateOperation.ORDER:
        reorderChildren(domNode, changes);
        return domNode;
    case UpdateOperation.PROPS:
        addProperties(domNode, changes, component.properties);
        return domNode;
    default:
        return domNode;
    }
}

function removeNode(domNode, component) {
    let parentNode = domNode.parentNode;

    if (parentNode) {
        parentNode.removeChild(domNode);
    }

    return null;
}

function insertNode(parentNode, component, options) {
    let newNode = options.render(component, options);

    if (parentNode) {
        parentNode.appendChild(newNode);
    }

    return parentNode;
}

function changeString(domNode, leftComponent, textComponent, options) {
    let newNode;

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, textComponent.text);
        newNode = domNode;
    } else {
        let parentNode = domNode.parentNode;
        newNode = options.render(textComponent, options);

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode);
        }
    }

    return newNode;
}

function changeComponent(domNode, leftComponent, component, options) {
    let parentNode = domNode.parentNode;
    let newNode = options.render(component, options);

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode);
    }

    return newNode;
}

function reorderChildren(domNode, moves) {
    let childNodes = domNode.childNodes;
    let keyMap = {};
    let node;
    let remove;
    let insert;

    for (let index = 0; index < moves.removes.length; index++) {
        remove = moves.removes[index];
        node = childNodes[remove.from];

        if (remove.key) {
            keyMap[remove.key] = node;
        }

        domNode.removeChild(node);
    }

    let length = childNodes.length;

    for (let index = 0; index < moves.inserts.length; index++) {
        insert = moves.inserts[index];
        node = keyMap[insert.key];

        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
    }
}

function virtualDOM(rootNode, tree, record, nodes) {
    if (!record || record.length === 0) {
        return {};
    } else {
        record.sort(ascending);

        return recurse(rootNode, tree, record, nodes, 0);
    }
}

function recurse(rootNode, tree, record, nodes, rootIndex) {
    nodes = nodes || {};

    if (rootNode) {
        if (indexInRange(record, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode;
        }

        let treeChildren = tree.children;

        if (treeChildren) {
            let childNodes = rootNode.childNodes;

            for (let index = 0; index < treeChildren.length; index++) {
                rootIndex += 1;

                let treeChild = treeChildren[index] || noChild;
                let nextIndex = rootIndex + (treeChild.count || 0);

                // skip recursion if tere are no nodes.
                if (indexInRange(record, rootIndex, nextIndex)) {
                    recurse(childNodes[index], treeChild, record, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}

// Dumb binary search for an index in the interval [left to right]
function indexInRange(record, left, right) {
    if (record.length === 0) {
        return false;
    }

    let minIndex = 0;
    let maxIndex = record.length - 1;
    let currentIndex;
    let currentItem;

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0;
        currentItem = record[currentIndex];

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right;
        } else if (currentItem < left) {
            minIndex = currentIndex + 1;
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1;
        } else {
            return true;
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1;
}

module.exports = update;

},{"./UpdateOperation":5,"./render":13}],15:[function(require,module,exports){
// TODO: Add docs
const Component = require("./Component");
const Text = require("./Text");

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    // TODO The {} in element({}) is a workaround for the initial state of the app.
    // This is not clean anymore and will have to find a better solution to not force this check.
    // Isn't that bad passing an "empty" state since it's actually the one used when the app runs first,
    // but if I want to give a change to the user to start with a custom initial state I will need to fix this.
    return isComponent(element) || isText(element) || (typeof element === "function" && isChild(element({})));
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

function isComponent(element) {
    return element.type === "Component";
}

function isText(element) {
    return element.type === "Text";
}

module.exports = {
    isBuffer: isBuffer,
    isChild: isChild,
    isChildren: isChildren,
    isComponent: isComponent,
    isText: isText
};

},{"./Component":1,"./Text":4}],16:[function(require,module,exports){
/**
 * @function get
 * @description Get function.
 * @param {String} url - The URL/URI.
 * @returns {Promise} A JavaScript Promise.
 */
function get(url) {
    return new Promise(function getPromise(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);

        xhr.onload = function onLoad() {
            if (this.status >= 200 && this.status < 300) {
                let response = parseResponse(this.response);

                resolve(response);
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        };

        xhr.onerror = function onError() {
            reject({
                status: this.status,
                statusText: this.statusText
            });
        };

        xhr.send(null);
    });
}

function parseResponse(response) {
    let newResponse;

    try {
        newResponse = JSON.parse(response);
    } catch (error) {
        newResponse = response;
    }

    return newResponse;
}

module.exports = get;

},{}],17:[function(require,module,exports){
/**
 * The Http module
 * @module @compose/http
 * @see module:@compose/http
 */
const get = require("./get");
const post = require("./post");

module.exports = {
    get: get,
    post: post
};

},{"./get":16,"./post":18}],18:[function(require,module,exports){
/**
 * Post request module.
 * @module @compose/http/post
 * @see module:@compose/http/post
 */

/**
 * @function post
 * @description Post function.
 * @param {String} url - The URL/URI.
 * @param {Object} body - The call body.
 * @param {Object} headers - Extra headers.
 * @returns {Promise} A JavaScript Promise.
 */
function post(url, body, headers) {
    return new Promise(function postPromise(resolve, reject) {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", url, true);

        // Parsing headers
        if (headers && headers instanceof Object) {
            headers.each(function addHeaders(value, key) {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.onload = function onLoad() {
            if (this.status >= 200 && this.status < 300) {
                let response = parseResponse(this.response);

                resolve(response);
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        };

        xhr.send(JSON.stringify(body));
    });
}

function parseResponse(response) {
    let newResponse;

    try {
        newResponse = JSON.parse(response);
    } catch (error) {
        newResponse = response;
    }

    return newResponse;
}

module.exports = post;

},{}],19:[function(require,module,exports){
const Compose = require("../core");

function Header() {
    return Compose.component("div", {
        className: "header",
        style: {
            backgroundColor: "blue",
            color: "yellow",
            paddingLeft: "10px"
        }
    }, Title);
}

function Title() {
    return Compose.component("h1", "CMPS");
}

module.exports = Header;

},{"../core":8}],20:[function(require,module,exports){
// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Compose = require("../core");
const Header = require("./Header");
const http = require("../http");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

function get_json_data() {
    http.get("https://jsonplaceholder.typicode.com/comments?postId=1")
        .then(function onSuccess(response) {
            MyProgram.setState({ posts: response });
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

function post_data() {
    let testBody = { myTest: true };

    http.post("https://jsonplaceholder.typicode.com/posts")
        .then(function onSuccess(response) {
            console.log(response);
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

let showContent = false;

function update_dom() {
    showContent = !showContent;

    MyProgram.setState({ showContent: showContent });
}

// A custom button component
function button (state) {
    return Compose.component("button", {
        className: "my-button-class",
        id: "test",
        onclick: get_json_data,
    }, "Get Posts");
}

function PostComponent(post) {
    return Compose.component("div", {
        style: {
            backgroundColor: "#cccccc",
            border: "1px",
            borderColor: "black",
            padding: "10px",
            margin: "5px"
        }
    }, [
        Compose.component("h2", post.name),
        Compose.component("h3", post.email),
        Compose.component("p", post.body)
    ]);
}

function PostListComponent(posts) {
    let children = [];

    if (posts && posts.length) {
        children = posts.map(function (post) {
            return PostComponent(post);
        });
    }

    return Compose.component("div", children);
}

// A Compose framework demo Component
function ComposeDemo(state) {
    let contentComponent = "Current content state is: " + state.showContent;
    let anotherChild = "";

    if (state.showContent) {
        anotherChild = Compose.component(
            "p",
            "This is another component that only is shown when the state changes"
        );
    }

    return Compose.component("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Compose Demo: ",
        button(),
        Compose.component("button", { onClick: update_dom }, "Change State"),
        contentComponent,
        anotherChild,
        undefined,
        PostListComponent(state.posts)
    ]);
}

const MyProgram = Compose.application(ComposeDemo, document.getElementById("root"));

/*
Compose.application = function (rootComponent, DOMNode, options);
rootComponent: Layout component or routes,
DOMNode: Element where the app will be rendered.
options: Object

   const MyProgram = Compose.application(MyComponent, document.getElementById("root"), {
       update:
   });
*/

},{"../core":8,"../http":17,"./Header":19}]},{},[20]);
