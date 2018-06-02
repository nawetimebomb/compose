const render = require("./render");
const utils = require("./utils");
const UpdateOperation = require("./UpdateOperation");

/**
 * ComposeApplication
 * @param {Component} rootComponent - Root Component that will be rendered.
 * @param {HTMLElement | String} ownerDOMElement - An HTMLElement or String that hosts the app.
 * @param {Object} options - The options object.
 * @returns {Object} api - Compose api.
 */
function ComposeApplication(appComponent, ownerDOMElement, options) {
    const api = {};
    let owner = ownerDOMElement;
    let rootNode;

    options = options || {};

    if (typeof ownerDOMElement === "string") {
        owner = document.querySelector(ownerDOMElement);
    }

    if (owner === undefined || owner === null) {
        throw Error("Not an owner node");
    }

    // Safety check the component
    if (appComponent && utils.isChild(appComponent)) {
        rootNode = render(appComponent);

        owner.appendChild(rootNode);
    } else {
        throw Error("Not a component");
    }

    return {
        update: function (newComponent) {
            let changes = calculateDifferences(rootNode, newComponent);
            rootNode = update(rootNode, changes, options);
        }
    };
};

module.exports = ComposeApplication;

/**************************************\
|                                      |
|** TODO   MOVE THIS INTO A NEW FILE **|
|                                      |
\**************************************/

function calculateDifferences(a, b) {
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

/**
 * Selects the way the app is going to update. If the user provides an `update` function, use that. If not, use the default `recursiveUpdate`.
 */
function update(rootNode, changes, options) {
    let newOptions = options || {};

    newOptions.update = (newOptions.update && newOptions.update !== update)
        ? newOptions.update
        : recursiveUpdate;
    newOptions.render = newOptions.render || render;

    return newOptions.update(rootNode, changes, newOptions);
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

const noChild = {};

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
