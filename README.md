# COMPOSE: One-way Data Flow JavaScript Framework

Sometime ago I started playing with Elm and really enjoyed it. The problem was that I didn't really wanted to learn a whole new language to do the same I was doing with JavaScript already, so I wanted to bring that same functional programming experience into a JavaScript framework. That's when I started working with COMPOSE.

Originally a functional programming oriented framework, then a One-way Data Flow with some functional aspects. Afterwards I started to work on a project with React and decided to add JSX support to the framework since the syntax is fun.

This framework is not ready for production and its a just-for-fun project. It supports most of the things a framework should (needing proper configuration on other things) and has cross-browser support (at least all modern browsers). The only reason why this framework can't be used on Internet Explorer is because the `http` package uses `Promise`, so adding babel and a polyfill should fix the issue.

## COMPOSE features

- Virtual DOM Tree: Just like React. The application checks for what changed and only re-renders what's needed.
- Lifecycles: Events that run when rendering and re-rendering the application.
- Commands: Functions that can be passed to events in order to change the application's state. Only way to change data.
- Dev-mode: Activate warnings and helpful debug information.
- Other goodies:
  - Really small `Hello World` application.
  - No Memory Allocations.

### Virtual DOM Tree

The application is represented in a JavaScript object that is passed to the real HTML DOM to be rendered. If any change should occur, the bidirectional search algorithm that manages the Virtual Tree will look for the changes and update accordingly, only changing the real HTML DOM where it matters. This is similar to what React does to an extent, but only attaches needed lifecycle which makes it much more cleaner (though less customizable).

### Lifecycles

You create your own lifecycles. Instead of running every lifecycle method of every component you are free to attach your own lifecycle to the render and re-render process. This gives control to the user, no more "what's going on?". The lifecycle methods are usually used to get data from a service and has access to the component's commands.

### Commands

Much like functional programming and insired in Elm, Commands are the only way to update and change data in the application. Data flows from here to the framework and the to the application. There are 2 types of Commands: The unbinded commands that don't receive the application state (more common, functions that run other stuff or return results) and the ones that have the state binded and are able to use it for general purposes.

### Dev-mode

When running COMPOSE you're able to attach an `options` object with some configurations for your likings. One of the configurations is `warning`. This configuration gives you access to the debugging methods and you'll start seeing messages about your development.

### Other goodies

- COMPOSE has one of the smallest `Hello World` application bundle.
- Very careful thoughtout to not allocate memory implicitely.

## Inspiration

- React with the JSX syntax and the Virtual DOM,
- The Elm Language with the functional programming and commands,
- A really boring week at work.

## Copyright and License

Nahuel Jesús Sacchetti (c) 2017-2020. Any questions: me@nsacchetti.com

Licensed under GNU GPL v3. Read the LICENSE file.
