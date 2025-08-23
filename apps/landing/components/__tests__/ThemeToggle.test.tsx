import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('light');
    localStorageMock.setItem.mockClear();
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows sun icon for light theme', () => {
    localStorageMock.getItem.mockReturnValue('light');
    render(<ThemeToggle />);
    
    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
  });

  it('shows moon icon for dark theme', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    render(<ThemeToggle />);
    
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue('light');
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('applies dark theme class to document when toggled', () => {
    localStorageMock.getItem.mockReturnValue('light');
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    
    fireEvent.click(toggleButton);
    
    expect(document.documentElement).toHaveClass('dark');
  });

  it('removes dark theme class when toggled back to light', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    document.documentElement.classList.add('dark');
    
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    
    fireEvent.click(toggleButton);
    
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('uses system preference when theme is system', () => {
    localStorageMock.getItem.mockReturnValue('system');
    
    // Mock matchMedia for system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    render(<ThemeToggle />);
    
    // Should show moon icon for dark system preference
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('handles missing localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
