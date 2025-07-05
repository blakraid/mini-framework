# Mini-Framework

Welcome to Mini-Framework! A lightweight, educational frontend framework built from scratch to demonstrate core concepts like the Virtual DOM, state management, and event handling.

## Features

This framework implements several key features inspired by modern libraries like React and Vue.

* **DOM Abstraction (Virtual DOM)**: Instead of manipulating the browser's DOM directly, you describe your UI using JavaScript objects. The framework then efficiently calculates the minimum number of changes needed and applies them to the real DOM. This is known as reconciliation.
* **State Management**: It features a centralized, predictable state management system. The entire state of your app is held in a single object. To change the state, you dispatch commands which are handled by pure functions called "reducers".
* **Event Handling**: A declarative way to handle user events like clicks and keyboard input, integrated directly into your UI description.
* **Routing System**: A simple hash-based router to synchronize the application's UI with the URL.

## How It Works

The framework is built on a few core ideas:

* **The View as a Function of State**: Your entire UI is a pure function of the current application state. When the state changes, the framework re-runs the view function to get a new description of the UI and efficiently updates the DOM to match.
* **Unidirectional Data Flow**: State flows down from the main application to its components. To change the state, components emit commands that flow up to be processed by reducers. This makes the application logic easier to reason about.
* **Reconciliation**: The framework's `patchDOM()` function is the heart of its efficiency. It compares the old Virtual DOM tree with the new one and performs a minimal set of operations (add, remove, move) on the actual DOM, avoiding costly full-page re-renders.

## API and Usage

### Getting Started

To use the framework, import the necessary functions from the `index.js` file:

```javascript
import { createApp, h, hFragment, Router } from './framework/index.js'
```

### Creating Elements (`h` function)

The `h` function (short for hyperscript) is used to create virtual element nodes.

**Signature**: `h(tagName, props, children)`

* `tagName` (string): The HTML tag name (e.g., `'div'`, `'button'`).
* `props` (object): An object of attributes, styles, and event handlers.
* `children` (array): An array of child nodes (other `h` calls or strings).

**Example: Create a Div with a Class**

```javascript
// Creates: <div class="container">Hello World</div>
const myDiv = h(
  'div', 
  { class: 'container' }, 
  ['Hello World']
);
```

### Nesting Elements

To nest elements, simply place `h` calls inside the `children` array of a parent element.

```javascript
// Creates: <main><h1>Title</h1><p>A paragraph.</p></main>
const content = h('main', {}, [
  h('h1', {}, ['Title']),
  h('p', {}, ['A paragraph.'])
]);
```

### Adding Attributes

Attributes are passed in the `props` object. This includes standard HTML attributes like `id`, `href`, `type`, and `disabled`.

```javascript
// Creates: <input type="text" placeholder="Enter name..." disabled>
const myInput = h('input', { 
  type: 'text',
  placeholder: 'Enter name...',
  disabled: true 
});
```

### Event Handling

To handle events, add an `on` property to the `props` object. The value of `on` is another object where keys are event names (e.g., `click`, `input`) and values are the handler functions.

Inside a handler, use the `emit` function to dispatch a command.

```javascript
// Example from within a component view function
function MyButton(state, emit) {
  return h('button', {
    on: {
      click: () => emit('increment-counter', 1)
    }
  }, ['Click me']);
}
```

### Creating an Application (`createApp`)

The `createApp` function initializes your application and connects the state, reducers, and view.

**Signature**: `createApp({ state, reducers, view })`

* `state` (object): The initial state of your application.
* `reducers` (object): An object mapping command names to reducer functions. A reducer takes the current state and a payload and returns the new state.
* `view` (function): The top-level component function that receives the current `state` and the `emit` function and returns a virtual DOM tree.

The `createApp` call returns an application instance with a `.mount()` method.

**Example: A Simple Counter**

```javascript
import { createApp, h } from './framework/index.js';

// 1. Define initial state
const initialState = { count: 0 };

// 2. Define reducers
const reducers = {
  'increment': (state, payload) => ({
    ...state,
    count: state.count + payload
  })
};

// 3. Define the view
function App(state, emit) {
  return h('div', {}, [
    h('h1', {}, [`Count is: ${state.count}`]),
    h('button', { on: { click: () => emit('increment', 1) } }, ['+1'])
  ]);
}

// 4. Create and mount the app
createApp({
  state: initialState,
  reducers: reducers,
  view: App
}).mount(document.body);
```
### Routing

The `Router` helps you link the URL hash to state changes.

**Signature**: `Router({ routes })`

* `routes` (object): An object mapping URL hashes (e.g., `'#/'`, `'#/about'`) to handler functions. These handlers should typically `emit` a command to change the application's filter state.

**Example: Setting up Routes**

```javascript
// In your main application file
const app = createApp({ ... });

const router = Router({
  routes: {
    '#/': () => app.emit('change-filter', 'all'),
    '#/active': () => app.emit('change-filter', 'active'),
  }
});

app.mount(document.body);
router.start(); // The router needs to be started
```