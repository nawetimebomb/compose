const Cmps = require("../core");

function Header() {
    return Cmps.createComponent("div", {
        className: "header",
        style: {
            backgroundColor: "blue",
            color: "yellow",
            paddingLeft: "10px"
        }
    }, Title());
}

function Title() {
    return Cmps.createComponent("h1", "CMPS");
}

module.exports = Header;
