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
