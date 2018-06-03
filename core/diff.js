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
