const ComposeApplication = require("./ComposeApplication");
const ComposeComponent = require("./ComposeComponent");
const createComponent = require("./create-component");

module.exports = {
    createComponent: createComponent,
    jsx: ComposeComponent,
    run: ComposeApplication
};
