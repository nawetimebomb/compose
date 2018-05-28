const EventPropertyHook = require("./EventPropertyHook");

/**
 * Properties Parser
 * @description Parses properties and understand which kind of property is and what should do in the Component.
 * @return {Object} a properties object to assign to the Component.
 */
function propertiesParser(properties) {
    let result = {};

    for (let propName in properties) {
        const propValue = properties[propName];

        switch (typeof propValue) {
        case "undefined":
            // TODO should remove prop
            console.log("prop should be removed");
            break;
        case "function":
            // TODO: Perform this better.
            result[propName.toLowerCase()] = propValue;
            break;
        case "object":
            if (propValue instanceof Object && !(propValue instanceof Array)) {
                if (propName === "style") result[propName] = parseStyleProperty(propValue);
            } else if (propValue instanceof Array) {
                result[propName] = propValue.join(" ");
            }
            break;
        case "string":
            result[propName] = propValue;
            break;
        }
    }

    return result;
}

function parseStyleProperty(styleProperties) {
    let style = [];

    for (let key in styleProperties) {
        let styleKey = getStyleDOMKey(key);

        style.push(`${styleKey}:${styleProperties[key]};`);
    }

    return style.join(" ");
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

module.exports = propertiesParser;
