import { createApp, h, hFragment, Router } from '../framework/index.js'

// --- STATE ---
const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

const initialState = {
  todos: [],
  currentTodo: '',
  filter: FILTERS.ALL,
  editingId: null,
  editingText: '',
}

// --- REDUCERS ---
const reducers = {
  'update-current-todo': (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),

  'add-todo': (state) => ({
    ...state,
    currentTodo: '',
    todos: [
      ...state.todos,
      {
        id: Date.now(),
        text: state.currentTodo,
        completed: false,
      },
    ],
  }),

  'toggle-todo': (state, todoId) => ({
    ...state,
    todos: state.todos.map((todo) =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ),
  }),

  'destroy-todo': (state, todoId) => ({
    ...state,
    todos: state.todos.filter((todo) => todo.id !== todoId),
  }),
  
  'clear-completed': (state) => ({
    ...state,
    todos: state.todos.filter(todo => !todo.completed),
  }),

  'change-filter': (state, filter) => ({
    ...state,
    filter,
  }),

  'start-editing': (state, { id, text }) => ({
    ...state,
    editingId: id,
    editingText: text,
  }),

  'update-editing-text': (state, text) => ({
    ...state,
    editingText: text,
  }),

  'save-edit': (state) => ({
    ...state,
    editingId: null,
    editingText: '',
    todos: state.todos.map((todo) =>
      todo.id === state.editingId 
        ? { ...todo, text: state.editingText.trim() }
        : todo
    ),
  }),

  'cancel-edit': (state) => ({
    ...state,
    editingId: null,
    editingText: '',
  }),
};

// --- VIEW ---
function TodoItem({ todo, isEditing, editingText }, emit) {
  const classes = [];
  if (todo.completed) classes.push('completed');
  if (isEditing) classes.push('editing');

  return h('li', { 
    class: classes.join(' '),
    // Add a key attribute for stable identity
    key: todo.id 
  }, [
    h('div', { class: 'view' }, [
      h('input', {
        class: 'toggle',
        type: 'checkbox',
        checked: todo.completed,
        on: { 
          change: () => emit('toggle-todo', todo.id)          
        },
      }),
      h('label', {
        on: { 
          dblclick: () => emit('start-editing', { id: todo.id, text: todo.text })
        }
      }, [todo.text]),
      h('button', {
        class: 'destroy',
        on: { click: () => emit('destroy-todo', todo.id) },
      }),
    ]),
    isEditing ? h('input', {
      class: 'edit',
      value: editingText,
      on: {
        input: ({ target }) => emit('update-editing-text', target.value),
        blur: () => {
          if (editingText.trim()) {
            emit('save-edit');
          } else {
            emit('cancel-edit');
          }
        },
        keydown: ({ key }) => {
          if (key === 'Enter') {
            if (editingText.trim()) {
              emit('save-edit');
            } else {
              emit('cancel-edit');
            }
          } else if (key === 'Escape') {
            emit('cancel-edit');
          }
        },
      },
    }) : null,
  ]);
}

function App(state, emit) {
  const filteredTodos = state.todos.filter(todo => {
    switch (state.filter) {
      case FILTERS.ACTIVE:
        return !todo.completed;
      case FILTERS.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  const itemsLeft = state.todos.filter(t => !t.completed).length;
  const hasCompletedTodos = state.todos.some(t => t.completed);

  return h('section', { class: 'todoapp' }, [
    h('header', { class: 'header' }, [
      h('h1', {}, ['todos']),
      h('input', {
        class: 'new-todo',
        placeholder: 'What needs to be done?',
        value: state.currentTodo,
        on: {
          input: ({ target }) => emit('update-current-todo', target.value),
          keydown: ({ key }) => {
            if (key === 'Enter' && state.currentTodo.trim()) {
              emit('add-todo');
            }
          },
        },
      }),
    ]),
    
    state.todos.length > 0 ? h('section', { class: 'main' }, [
      h('ul', { class: 'todo-list' }, 
        filteredTodos.map(todo => 
          TodoItem({ 
            todo, 
            isEditing: state.editingId === todo.id,
            editingText: state.editingText 
          }, emit)
        )
      )
    ]) : null,
    
    state.todos.length > 0 ? h('footer', { class: 'footer' }, [
      h('span', { class: 'todo-count' }, [
        h('strong', {}, [itemsLeft.toString()]),
        ` item${itemsLeft !== 1 ? 's' : ''} left`
      ]),
      h('ul', { class: 'filters' }, [
        h('li', {}, [
          h('a', {
            href: '#/',
            class: state.filter === FILTERS.ALL ? 'selected' : ''
          }, ['All'])
        ]),
        h('li', {}, [
          h('a', {
            href: '#/active',
            class: state.filter === FILTERS.ACTIVE ? 'selected' : ''
          }, ['Active'])
        ]),
        h('li', {}, [
          h('a', {
            href: '#/completed',
            class: state.filter === FILTERS.COMPLETED ? 'selected' : ''
          }, ['Completed'])
        ]),
      ]),
      hasCompletedTodos ? h('button', {
        class: 'clear-completed',
        on: { click: () => emit('clear-completed') }
      }, ['Clear completed']) : null
    ]) : null
  ]);
}

// --- INITIALIZATION ---
const app = createApp({
  state: initialState,
  reducers: reducers,
  view: App,
});

const router = Router({
  routes: {
    '#/': () => app.emit('change-filter', FILTERS.ALL),
    '#/active': () => app.emit('change-filter', FILTERS.ACTIVE),
    '#/completed': () => app.emit('change-filter', FILTERS.COMPLETED),
  }
});

app.mount(document.body);
router.start();