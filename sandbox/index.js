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

function get_json_data() {
    http.get("https://jsonplaceholder.typicode.com/comments?postId=1")
        .then(function onSuccess(response) {
            MyProgram.setState({ posts: response });
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

let showContent = false;

function update_dom() {
    showContent = !showContent;

    MyProgram.setState({ showContent: showContent });
}

// A custom button component
function button (state) {
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
    let children = [];

    if (posts && posts.length) {
        children = posts.map(function (post) {
            return PostComponent(post);
        });
    }

    return Compose.component("div", children);
}

// A Compose framework demo Component
function ComposeDemo(state) {
    let contentComponent = "Current content state is: " + state.showContent;
    let anotherChild = "";

    if (state.showContent) {
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
        PostListComponent(state.posts)
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
