function Text(text) {
    this.text = String(text);
}

Text.prototype.type = "Text";

module.exports = Text;
