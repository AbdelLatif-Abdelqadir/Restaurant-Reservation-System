import { render, screen } from '@testing-library/react';
import App from './app';

test('renders reservation app with role options', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Burger Bonanza/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Customer/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Staff/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Admin/i })).toBeInTheDocument();
});
