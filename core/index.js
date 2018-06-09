const ComposeApplication = require("./ComposeApplication");
const ComposeComponent = require("./ComposeComponent");
const createComponent = require("./create-component");

module.exports = {
    application: ComposeApplication,
    createComponent: createComponent,
    jsx: ComposeComponent
};
