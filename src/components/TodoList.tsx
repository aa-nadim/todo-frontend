import React from 'react';
import type { Todo } from '../services/todo';

interface TodoListProps {
  todos: Todo[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos = [], onDelete, onToggle }) => {
  if (!todos || todos.length === 0) {
    return <p className="no-todos">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className={`todo-item ${todo.status === 'deleting' ? 'deleting' : ''}`}>
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={todo.status === 'completed'}
            onChange={() => onToggle(todo.id)}
            disabled={todo.status === 'creating' || todo.status === 'deleting'}
          />
          <span className={`todo-text ${todo.status === 'completed' ? 'completed' : ''} ${todo.status === 'creating' ? 'creating' : ''} ${todo.status === 'deleting' ? 'deleting' : ''}`}>
            {todo.title}
            {todo.status === 'creating' && ' (Creating...)'}
            {todo.status === 'deleting' && ' - Deleting'}
          </span>
          <div className="todo-actions">
            <button
              className="todo-button delete"
              onClick={() => onDelete(todo.id)}
              disabled={todo.status === 'creating' || todo.status === 'deleting'}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
