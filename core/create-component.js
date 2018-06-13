const application = require("./Application");

module.exports = function createComponent(config) {
    let newCommands = {};
    let component = config.view;
    let name = config.displayName;
    let commands = config.commands;
    let state = config.state;

    if (!name && state) {
        throw Error("Component has no displayName. You should add displayName as a property of `Compose.createComponent`");
    }

    // Need to find a way to consistenly get the name of the component.
    if (name && state) {
        component.displayName = name;
        application.setStateByPath(name, state);

        // Validate that at least one command exists. If not, you cannot use state.
        if (commands) {
            for (let key in commands) {
                let command = commands[key];

                newCommands[key] = function newCommand() {
                    // FIXME This is a bug where I'm not passing through the number of arguments received by the function caller. Consider first one could be event.
                    let result = command(arguments[0]);

                    if (typeof result ===  "function") {
                        result = result(application.getState(name));
                    }

                    application.setStateByPath(name, result);
                }
            }

            component.commands = newCommands;
        } else {
            throw Error("Component has state but there are no commands to change it");
        }
    }

    if (application.isFirstRender && config.onCreate) {
        application.registerLifecycle(function onCreate() {
            config.onCreate(newCommands);
        });
    }

    return component;
};
