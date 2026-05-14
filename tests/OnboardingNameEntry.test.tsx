import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingNameEntry } from '../components/OnboardingNameEntry';

describe('<OnboardingNameEntry />', () => {
  it('disables submit until a non-empty name is typed', () => {
    render(<OnboardingNameEntry onSubmit={() => {}} />);
    const button = screen.getByRole('button', { name: /בוא נתחיל/ });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/השם שלי הוא/), { target: { value: 'דניאל' } });
    expect(button).not.toBeDisabled();
  });

  it('trims whitespace before submitting', () => {
    const onSubmit = vi.fn();
    render(<OnboardingNameEntry onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/השם שלי הוא/), { target: { value: '  שני  ' } });
    fireEvent.click(screen.getByRole('button', { name: /בוא נתחיל/ }));
    expect(onSubmit).toHaveBeenCalledWith('שני');
  });

  it('whitespace-only input keeps the button disabled', () => {
    render(<OnboardingNameEntry onSubmit={() => {}} />);
    fireEvent.change(screen.getByLabelText(/השם שלי הוא/), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: /בוא נתחיל/ })).toBeDisabled();
  });
});
