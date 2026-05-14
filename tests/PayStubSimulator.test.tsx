import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PayStubSimulator } from '../components/PayStubSimulator';

describe('<PayStubSimulator />', () => {
  it('renders the default gross salary preset', () => {
    render(<PayStubSimulator onClose={() => {}} />);
    // 6,000 is the initial slider value
    expect(screen.getByText(/6,000 ₪/)).toBeInTheDocument();
  });

  it('clicking "גלה כמה" reveals the deductions card', () => {
    render(<PayStubSimulator onClose={() => {}} />);
    const reveal = screen.getByRole('button', { name: /גלה כמה באמת מגיע/ });
    fireEvent.click(reveal);
    expect(screen.getByText(/ביטוח לאומי/)).toBeInTheDocument();
    expect(screen.getByText(/מס הכנסה/)).toBeInTheDocument();
    expect(screen.getByText(/פנסיה חובה/)).toBeInTheDocument();
  });

  it('"הבנתי" fires onComplete and onClose', () => {
    const onComplete = vi.fn();
    const onClose = vi.fn();
    render(<PayStubSimulator onClose={onClose} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /גלה כמה באמת מגיע/ }));
    fireEvent.click(screen.getByRole('button', { name: /הבנתי/ }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('preset salary buttons swap the gross', () => {
    render(<PayStubSimulator onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /משרה מלאה/ }));
    expect(screen.getByText(/12,000 ₪/)).toBeInTheDocument();
  });
});
