const UpdateOperation = require("./UpdateOperation");

// TODO: Rename
function changesOperation(change, DOMNode, renderOptions) {
    let type = change.type;

    switch(type) {
    case UpdateOperationEnum.REMOVE:
        return removeNode(DOMNode, node);
    }
}

module.exports = changesOperation;
