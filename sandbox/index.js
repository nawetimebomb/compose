// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Cmps = require("../core");
const Header = require("./Header");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

function log(text) {
    console.log(text);
}

// A custom button componentn
function button (state) {
    count = state || "";

    return Cmps.createComponent("button", {
        className: "my-button-class",
        onClick: log,
    }, ["My Button Component", count]);
}

// A purJsDemo Component
function purJsDemo() {
    return Cmps.createComponent("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Cmps Demo: ",
        withIndex(button),
        withIndex(button),
        button(),
        Cmps.createComponent("button", "I Love Cmps")
    ]);
}

document.body.appendChild(Cmps.render(purJsDemo()));
