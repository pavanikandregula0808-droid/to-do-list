/**
 * Manages Pure Immutable State Array Transformations
 */
export class StateManager {
    constructor(initialData = []) {
        this.todos = initialData;
    }

    create(text) {
        const item = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            text: text.trim(),
            completed: false,
            isEditing: false
        };
        this.todos = [...this.todos, item];
        return this.todos;
    }

    mutate(id, properties) {
        this.todos = this.todos.map(todo => 
            todo.id === id ? { ...todo, ...properties } : todo
        );
        return this.todos;
    }

    destroy(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        return this.todos;
    }

    select(filter) {
        return this.todos.filter(todo => {
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        });
    }

    countUnresolved() {
        return this.todos.filter(todo => !todo.completed).length;
    }
}