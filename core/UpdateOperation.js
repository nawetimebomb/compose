function UpdateOperation(type, node, change) {
    this.type = Number(type);
    this.node = node;
    this.change = change;
}

UpdateOperation.NONE = 0;
UpdateOperation.TEXT = 1;
UpdateOperation.NODE = 2;
UpdateOperation.REMOVE = 9;

UpdateOperation.prototype.type = "UpdateOperation";

module.exports = UpdateOperation;
