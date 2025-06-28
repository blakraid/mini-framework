import { createApp, defineComponent, h, hFragment } from 'https://unpkg.com/<fwk-name>@3';

const App = defineComponent({
  state() {
    return {
      todos: ['Walk the dog', 'Water the plants'],
      currentTodo: '',
      edit: {
        idx: null,
        original: null,
        edited: null,
      },
    };
  },
  render() {
    return hFragment([
      h('h1', {}, ['My TODOs']),
      h(CreateTodo, {
        currentTodo: this.state.currentTodo,
        on: {
          'update-current-todo': (newVal) => this.updateState({ currentTodo: newVal }),
          'add-todo': () => this.updateState({
            todos: [...this.state.todos, this.state.currentTodo],
            currentTodo: '',
          }),
        },
      }),
      h(TodoList, {
        todos: this.state.todos,
        edit: this.state.edit,
        on: {
          'start-editing': (idx) => this.updateState({
            edit: {
              idx,
              original: this.state.todos[idx],
              edited: this.state.todos[idx],
            }
          }),
          'edit-todo': (newValue) => this.updateState({ edit: { ...this.state.edit, edited: newValue } }),
          'save-edited-todo': () => {
            const todos = [...this.state.todos];
            todos[this.state.edit.idx] = this.state.edit.edited;
            this.updateState({
              todos,
              edit: { idx: null, original: null, edited: null },
            });
          },
          'cancel-editing': () => this.updateState({ edit: { idx: null, original: null, edited: null } }),
          'remove-todo': (idx) => this.updateState({
            todos: this.state.todos.filter((_, i) => i !== idx),
          })
        },
      }),
    ]);
  },
});

const CreateTodo = defineComponent({
  render() {
    const { currentTodo } = this.props;
    return h('div', {}, [
      h('label', { for: 'todo-input' }, ['New TODO']),
      h('input', {
        type: 'text',
        id: 'todo-input',
        value: currentTodo,
        on: {
          input: ({ target }) => this.emit('update-current-todo', target.value),
          keydown: ({ key }) => {
            if (key === 'Enter' && currentTodo.length >= 3) {
              this.emit('add-todo');
            }
          },
        },
      }),
      h(
        'button',
        {
          disabled: currentTodo.length < 3,
          on: { click: () => this.emit('add-todo') },
        },
        ['Add']
      ),
    ]);
  },
});

const TodoList = defineComponent({
  render() {
    const { todos, edit } = this.props;
    return h('ul', {}, todos.map((todo, i) =>
      h(TodoItem, {
        key: `todo-${i}`,
        todo,
        i,
        edit,
        on: {
          'start-editing': (idx) => this.emit('start-editing', idx),
          'edit-todo': (newValue) => this.emit('edit-todo', newValue),
          'save-edited-todo': () => this.emit('save-edited-todo'),
          'cancel-editing': () => this.emit('cancel-editing'),
          'remove-todo': (idx) => this.emit('remove-todo', idx),
        }
      })
    ));
  }
});

const TodoItem = defineComponent({
  render() {
    const { todo, i, edit } = this.props;
    const isEditing = edit.idx === i;

    return isEditing
      ? h('li', {}, [
          h('input', {
            value: edit.edited,
            on: {
              input: ({ target }) => this.emit('edit-todo', target.value),
            },
          }),
          h('button', { on: { click: () => this.emit('save-edited-todo') } }, ['Save']),
          h('button', { on: { click: () => this.emit('cancel-editing') } }, ['Cancel']),
        ])
      : h('li', {}, [
          h('span', { on: { dblclick: () => this.emit('start-editing', i) } }, [todo]),
          h('button', { on: { click: () => this.emit('remove-todo', i) } }, ['Done']),
        ]);
  }
});

createApp(App).mount(document.body);