// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Compose = require("../core");
const Header = require("./Header");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

function log() {
    console.log("My button is clicked");
}

// A custom button component
function button (state) {
    count = state || "";

    return Compose.component("button", {
        className: "my-button-class",
        id: "test",
        onclick: () => {
            log();
        }
    }, ["My Button Component", count]);
}

// A Compose framework demo Component
function ComposeDemo() {
    return Compose.component("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Compose Demo: ",
        button(),
        Compose.component("button", "I Love Compose")
    ]);
}

const MyProgram = Compose.application(ComposeDemo, document.getElementById("root"));

/*
Compose.application = function (rootComponent, DOMNode, options);
rootComponent: Layout component or routes,
DOMNode: Element where the app will be rendered.
options: Object

   const MyProgram = Compose.application(MyComponent, document.getElementById("root"), {
       update:
   });
*/
