// REFACTOR THIS
const noChild = {};

function domMapper(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {};
    } else {
        indices.sort(ascending);

        return recursive(rootNode, tree, indices, nodes, 0);
    }
}

function recursive(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {};

    if (rootNode) {
        if (indexInRange(indeces, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode;
        }

        let children = tree.children;

        if (children) {
            let childNodes = rootNode.childNodes;

            for (let index = 0; index < tree.children.length; index++) {
                rootIndex++;

                let child = children[i] || noChild;
                let nextIndex = rootIndex + (child.count || 0);

                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recursive(childNodes[i], child, indices, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}

// a binary search of indices.
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false;
    }

    let minIndex = 0;
    let maxIndex = indices.length - 1;
    let currentIndex, currentItem;

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0;
        currentItem = indices[currentIndex];

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
