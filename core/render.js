// TODO: Add docs
// element should be a Component or Text.
const utils = require("./utils");
const handleBuffers = require("./handle-buffers");

function render(element, context, errorHandler) {
    let doc = context || document;

    //element = handleBuffers(element).a;

    if (utils.isText(element)) {
        return doc.createTextNode(element.text);
    } else if (!utils.isComponent(element)) {
        if (errorHandler) {
            errorHandler("Element not valid: ", element);
        }

        return null;
    }

    let node = doc.createElement(element.tagName);
    let props = element.properties;

    // TODO: This is only applying string properties. Will error with any other kind of property. There should be a parser in here.
    for (let propName in props) {
        let propValue = props[propName];

        switch (typeof propValue) {
        case undefined:
            // TODO should remove class
            console.log("prop should be removed");
            break;
        case "function":
            // TODO: should hook function
            console.log("prop is a function");
            break;
        case "object":
            // TODO should handle arrays and objects
            if (propValue instanceof Object && !(propValue instanceof Array)) {
                // TODO should parse props, now I'm just assigning by default
                console.log("prop is an object", propName, propValue);
                let result = [];

                for (let key in propValue) {
                    let styleKey = getStyleDOMKey(key);

                    result.push(`${styleKey}:${propValue[key]};`);
                }

                node[propName] = result.join(" ");
            } else if (propValue instanceof Array) {
                // TODO should handle array props
            } else {
                // TODO prop is null, should be removed?
            }
            break;
        case "string":
            node[propName] = propValue;
            break;
        }
    }

    let children = element.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = render(children[index], context, errorHandler);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

function getStyleDOMKey(key) {
    const styleKey = {
        backgroundColor: "background-color",

        flexDirection: "flex-direction",

        marginBottom: "margin-bottom",
        marginLeft: "margin-left",
        marginRight: "margin-right",
        marginTop: "margin-top",

        paddingBottom: "padding-bottom",
        paddingLeft: "padding-left",
        paddingRight: "padding-right",
        paddingTop: "padding-top"
    };

    return styleKey[key] || key;
}

module.exports = render;
