// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Compose = require("../core");
const Header = require("./Header");
const http = require("../http");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

let postsData = [];

function get_json_data() {
    http.get("https://jsonplaceholder.typicode.com/comments?postId=1")
        .then(function onSuccess(response) {
            postsData = response;

            MyProgram.update(ComposeDemo(appState, postsData));
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

function post_data() {
    let testBody = { myTest: true };

    http.post("https://jsonplaceholder.typicode.com/posts")
        .then(function onSuccess(response) {
            console.log(response);
        })
        .catch(function onError(error) {
            console.error(error);
        });
}

function update_dom() {
    // Just a POC on changing state. This is not final nor functional!
    appState.showContent = !appState.showContent;

    MyProgram.update(ComposeDemo(appState, postsData));
}

// A custom button component
function button (state) {
    count = state || "";

    return Compose.component("button", {
        className: "my-button-class",
        id: "test",
        onclick: get_json_data,
    }, "Get Posts");
}

function PostComponent(post) {
    return Compose.component("div", {
        style: {
            backgroundColor: "#cccccc",
            border: "1px",
            borderColor: "black",
            padding: "10px",
            margin: "5px"
        }
    }, [
        Compose.component("h2", post.name),
        Compose.component("h3", post.email),
        Compose.component("p", post.body)
    ]);
}

function PostListComponent(posts) {
    let children = posts.map(function (post) {
        return PostComponent(post);
    });

    return Compose.component("div", children);
}

// A Compose framework demo Component
function ComposeDemo(appState, posts) {
    let contentComponent = "Current content state is: " + appState.showContent;
    let anotherChild = "";

    if (appState.showContent) {
        anotherChild = Compose.component(
            "p",
            "This is another component that only is shown when the state changes"
        );
    }

    return Compose.component("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Compose Demo: ",
        button(),
        Compose.component("button", { onClick: update_dom }, "Change State"),
        contentComponent,
        anotherChild,
        undefined,
        PostListComponent(posts)
    ]);
}

let appState = {
    showContent: false
};

const MyProgram = Compose.application(ComposeDemo(appState, postsData), document.getElementById("root"));

/*
Compose.application = function (rootComponent, DOMNode, options);
rootComponent: Layout component or routes,
DOMNode: Element where the app will be rendered.
options: Object

   const MyProgram = Compose.application(MyComponent, document.getElementById("root"), {
       update:
   });
*/
