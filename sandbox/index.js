// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Pur = require("../core");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

// A custom button componentn
function button (state) {
    count = state || "";

    return Pur.createComponent("button", {
        className: "my-button-class"
    }, ["My Button Component", count]);
}

// A purJsDemo Component
function purJsDemo() {
    return Pur.createComponent("div", {
        className: "my-div"
    }, [
        "This is a PurJS Demo: ",
        withIndex(button),
        withIndex(button),
        button(),
        Pur.createComponent("button", "I Love PurJS")
    ]);
}

document.body.appendChild(Pur.createElement(purJsDemo()));
