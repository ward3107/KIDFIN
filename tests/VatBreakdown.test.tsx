import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VatBreakdown } from '../components/VatBreakdown';

describe('<VatBreakdown />', () => {
  it('hides the breakdown panel by default', () => {
    render(<VatBreakdown price={100} />);
    expect(screen.queryByText(/מע״מ \(18%\)/)).not.toBeInTheDocument();
  });

  it('opens on info-button click', () => {
    render(<VatBreakdown price={118} />);
    fireEvent.click(screen.getByLabelText(/פירוט מע״מ/));
    expect(screen.getByText(/מתוך 118 ₪/)).toBeInTheDocument();
    expect(screen.getByText(/מע״מ \(18%\)/)).toBeInTheDocument();
  });

  it('splits 118 ₪ as 100 + 18 (at 18% rate)', () => {
    render(<VatBreakdown price={118} />);
    fireEvent.click(screen.getByLabelText(/פירוט מע״מ/));
    expect(screen.getByText(/100\.00 ₪/)).toBeInTheDocument();
    expect(screen.getByText(/18\.00 ₪/)).toBeInTheDocument();
  });

  it('closes when the X button is clicked', () => {
    render(<VatBreakdown price={50} />);
    fireEvent.click(screen.getByLabelText(/פירוט מע״מ/));
    expect(screen.getByText(/מתוך 50 ₪/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/סגור/));
    expect(screen.queryByText(/מתוך 50 ₪/)).not.toBeInTheDocument();
  });
});
