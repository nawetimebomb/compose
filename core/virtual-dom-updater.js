const changesOperation = require("./changes-operation");
const render = require("./render");
const virtualDOM = require("./virtual-dom");

function updateVirtualDOM(rootNode, changes, renderOptions) {
    renderOptions = renderOptions || {};
    renderOptions.update = renderOptions.update && renderOptions.update !== updateVirtualDOM
        ? renderOptions.update
        : recursiveUpdate;
    renderOptions.render = renderOptions.render || render;

    return renderOptions.update(rootNode, changes, renderOptions);
}

function recursiveUpdate(rootNode, changes, renderOptions) {
    let record = getChangesRecord(changes);

    if (record.length === 0) {
        return rootNode;
    }

    let virtualDOMTree = virtualDOM(rootNode, changes.a, record);
    let owner = rootNode.ownerDocument; // TODO

    if (!renderOptions.document && owner !== document) {
        renderOptions.document = owner;
    }

    for (let index = 0; index < record.length; index++) {
        let nodeIndex = record[index];

        rootNode = applyChange(
            rootNode,
            virtualDOMTree[nodeIndex],
            changes[nodeIndex],
            renderOptions
        );
    }

    return rootNode;
}

function applyChange(rootNode, DOMNode, changesList, renderOptions) {
    if (!DOMNode) return rootNode;

    let newNode;

    if (Array.isArray(changesList)) {
        for (let index = 0; index < changesList.length; index++) {
            newNode = changeOperation(changesList[index], DOMNode, renderOptions);

            if (DOMNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = changeOperation(changesList, DOMNode, renderOptions);

        if (DOMNode === rootNode) {
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

module.exports = updateVirtualDOM;
