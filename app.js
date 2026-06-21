import { StorageService } from './Storage.js';
import { StateManager } from './StateManager.js';

class TodoApplication {
    constructor() {
        this.storage = new StorageService();
        this.state = new StateManager(this.storage.fetch());
        this.filter = 'all';

        // Strict Node DOM Caching Blueprint 
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.listContainer = document.getElementById('todo-list-target');
        this.counterNode = document.getElementById('metrics-counter');
        this.filterBar = document.querySelector('.filter-dashboard');

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this._handleAdd(e));
        this.filterBar.addEventListener('click', (e) => this._handleFilter(e));
        
        // Single Parent Element Event Delegation Mapping 
        this.listContainer.addEventListener('click', (e) => this._handleDelegatedActions(e));
        this.listContainer.addEventListener('keydown', (e) => this._handleInlineKeys(e));
    }

    _escape(str) {
        const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
        return str.replace(/[&<>"']/g, match => entityMap[match]);
    }

    _handleAdd(e) {
        e.preventDefault();
        const value = this.input.value.trim();
        if (!value) return;

        const nextState = this.state.create(value);
        this.storage.persist(nextState);
        this.input.value = '';
        this.render();
    }

    _handleFilter(e) {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        this.filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.filter = btn.dataset.filter;
        this.render();
    }

    _handleDelegatedActions(e) {
        const target = e.target;
        const row = target.closest('.todo-item');
        if (!row) return;
        
        const id = row.dataset.id;

        if (target.classList.contains('checkbox-node')) {
            this._updateState(id, { completed: target.checked });
        } else if (target.classList.contains('btn-delete')) {
            const nextState = this.state.destroy(id);
            this.storage.persist(nextState);
            this.render();
        } else if (target.classList.contains('btn-edit')) {
            this._updateState(id, { isEditing: true });
            const inputField = this.listContainer.querySelector(`[data-id="${id}"] .edit-mode-input`);
            inputField.focus();
            inputField.setSelectionRange(inputField.value.length, inputField.value.length);
        } else if (target.classList.contains('btn-save')) {
            this._commitEdit(row, id);
        } else if (target.classList.contains('btn-cancel')) {
            this._updateState(id, { isEditing: false });
        }
    }

    _handleInlineKeys(e) {
        if (!e.target.classList.contains('edit-mode-input')) return;
        const row = e.target.closest('.todo-item');
        
        if (e.key === 'Enter') {
            this._commitEdit(row, row.dataset.id);
        } else if (e.key === 'Escape') {
            this._updateState(row.dataset.id, { isEditing: false });
        }
    }

    _updateState(id, mutationProperties) {
        const nextState = this.state.mutate(id, mutationProperties);
        this.storage.persist(nextState);
        this.render();
    }

    _commitEdit(row, id) {
        const value = row.querySelector('.edit-mode-input').value.trim();
        const nextState = value ? this.state.mutate(id, { text: value, isEditing: false }) : this.state.destroy(id);
        this.storage.persist(nextState);
        this.render();
    }

    _buildTemplate(todo) {
        if (todo.isEditing) {
            return `
                <input type="text" class="edit-mode-input" value="${this._escape(todo.text)}">
                <div class="action-cluster">
                    <button class="btn btn-action btn-save">Save</button>
                    <button class="btn btn-action btn-cancel">Cancel</button>
                </div>
            `;
        }
        return `
            <label class="checkbox-hub">
                <input type="checkbox" class="checkbox-node" ${todo.completed ? 'checked' : ''}>
                <span class="box-mark"></span>
            </label>
            <span class="todo-text">${this._escape(todo.text)}</span>
            <div class="action-cluster">
                <button class="btn btn-action btn-edit">Edit</button>
                <button class="btn btn-action btn-danger btn-delete">Delete</button>
            </div>
        `;
    }

    render() {
        const viewSegment = this.state.select(this.filter);
        
        if (viewSegment.length === 0) {
            this.listContainer.innerHTML = `
                <li class="todo-item" style="justify-content: center; color: var(--text-muted); font-size: 13px; padding: 24px 0;">
                    No operations listed within this filtration scope.
                </li>`;
        } else {
            this.listContainer.innerHTML = viewSegment.map(todo => `
                <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    ${this._buildTemplate(todo)}
                </li>
            `).join('');
        }

        const remaining = this.state.countUnresolved();
        this.counterNode.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} unresolved`;
    }
}

// Instantiate App Sandbox Safeguard Loop
document.addEventListener('DOMContentLoaded', () => new TodoApplication());