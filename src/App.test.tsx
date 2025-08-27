import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders Todo App title and form', () => {
  render(<App />);
  expect(screen.getByText(/Todo App/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/add a new todo/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
});
