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
