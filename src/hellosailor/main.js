const Compose = require("../../core");

function HelloSailor() {
    return Compose.component("span", "Hello, Sailor");
}

Compose.application(HelloSailor, document.body);
