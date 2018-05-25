const utils = require("./utils");

function handleBuffers(a, b) {
    let renderedBufferA = a;
    let renderedBufferB = b;

    if (utils.isBuffer(b)) {
        renderedBufferB = renderBuffer(b);
    }

    if (utils.isBuffer(a)) {
        rendererdBufferA = renderBuffer(a);
    }

    return {
        a: renderedBufferA,
        b: renderedBufferB
    };
}

function renderBuffer(buffer, previous) {
    let renderedBuffer = buffer.purNode;

    if (!renderedBuffer) {
        renderedBuffer = buffer.purNode = buffer.render(previous);
    }

    if (!(utils.isPurNode(renderedBuffer) || utils.isPurText(renderedBuffer))) {
        throw Error("Not valid node in buffer");
    }

    return renderedBuffer;
}

module.exports = handleBuffers;
