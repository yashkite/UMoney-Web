import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from 'primereact/button';

describe('Testing Setup Verification', () => {
  it('renders a button correctly', () => {
    render(<Button label="Test Button" />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('handles basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name');
  });
});
