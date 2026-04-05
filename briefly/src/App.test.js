import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home headline', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /read what matters/i })
  ).toBeInTheDocument();
});
