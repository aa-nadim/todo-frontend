import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todo from '../Todo';
import { todoService } from '../../services/todo';

// Mock the todo service
jest.mock('../../services/todo');

describe('Todo Component', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    due_date: '2024-03-20T00:00:00Z',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z'
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders todo details correctly', () => {
    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Due: Mar 20, 2024')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('handles todo completion toggle', async () => {
    (todoService.update as jest.Mock).mockResolvedValueOnce({
      message: 'Todo update has been queued',
      todo_id: '1'
    });

    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith('1', { completed: true });
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles todo deletion', async () => {
    (todoService.delete as jest.Mock).mockResolvedValueOnce({
      message: 'Todo deletion has been queued',
      todo_id: '1'
    });

    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(todoService.delete).toHaveBeenCalledWith('1');
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  it('handles edit mode', () => {
    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('handles todo update', async () => {
    (todoService.update as jest.Mock).mockResolvedValueOnce({
      message: 'Todo update has been queued',
      todo_id: '1'
    });

    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Update fields
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });

    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(todoService.update).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
        description: 'Updated Description'
      });
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    (todoService.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Error updating todo')).toBeInTheDocument();
    });
  });

  it('displays loading state during operations', async () => {
    (todoService.update as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<Todo todo={mockTodo} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(screen.getByText('Updating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    });
  });
});
