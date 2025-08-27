import React, { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => void;
  isSubmitting?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isSubmitting) {
      onSubmit(title.trim());
      setTitle('');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isSubmitting}
      />
      <button type="submit" className="todo-button" disabled={isSubmitting}>
        Add
      </button>
    </form>
  );
};

export default TodoForm;
