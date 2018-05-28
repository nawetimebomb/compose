const Compose = require("../core");

function Header() {
    return Compose.component("div", {
        className: "header",
        style: {
            backgroundColor: "blue",
            color: "yellow",
            paddingLeft: "10px"
        }
    }, Title);
}

function Title() {
    return Compose.component("h1", "CMPS");
}

module.exports = Header;
