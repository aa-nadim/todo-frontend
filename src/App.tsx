import React, { useEffect, useState } from 'react';
import { todoService, Todo } from './services/todo';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import './styles/App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await todoService.getAll();
        setTodos(response);
        setError(null);
      } catch (err) {
        setError('Failed to load todos');
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const pollForTodo = async (todoId: string, tempId: string, maxAttempts = 5) => {
    let attempts = 0;
    const poll = async () => {
      try {
        const todos = await todoService.getAll();
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
          setTodos(t => t.filter(td => String(td.id).indexOf('temp-') !== 0));
          setTodos(t => [...t, todo]);
          return;
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('404') && attempts < maxAttempts) {
          attempts++;
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 16000);
          setTimeout(poll, delay);
          return;
        }
        throw err;
      }
    };
    await poll();
  };

  const handleAdd = async (title: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const tempTodo: Todo = {
        id: `temp-${Date.now()}`,
        title,
        status: 'creating',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTodos(t => [...t, tempTodo]);

      const response = await todoService.create({ title });
      await pollForTodo(response.todo_id, tempTodo.id);
      setError(null);
    } catch (err) {
      setTodos(t => t.filter(td => String(td.id).indexOf('temp-') !== 0));
      setError('Failed to add todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    try {
      const tempTodo: Todo = {
        ...todoToDelete,
        id: `temp-${Date.now()}`,
        status: 'deleting'
      };
      setTodos(t => {
        const filtered = t.filter(td => td.id !== id);
        return [...filtered, tempTodo];
      });

      await todoService.delete(id);
      await pollForTodo(id, tempTodo.id);
      setError(null);
    } catch (err) {
      setTodos(t => t.map(td => String(td.id).indexOf('temp-') === 0 ? todoToDelete : td));
      setError('Failed to delete todo');
    }
  };

  const handleToggle = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      try {
        const tempTodo: Todo = {
          ...todo,
          id: `temp-${Date.now()}`,
          status: todo.status === 'pending' ? 'completing' : 'pending'
        };
        setTodos(t => t.map(td => td.id === id ? tempTodo : td));

        await todoService.update(id, { status: todo.status === 'pending' ? 'completed' : 'pending' });
        await pollForTodo(id, tempTodo.id);
        setError(null);
      } catch (err) {
        setTodos(t => t.map(td => String(td.id).indexOf('temp-') === 0 ? todo : td));
        setError('Failed to update todo');
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Todo App</h1>
      {error && <p className="error-message">{error}</p>}
      <TodoForm onSubmit={handleAdd} isSubmitting={isSubmitting} />
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <TodoList
          todos={todos}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}

export default App;
