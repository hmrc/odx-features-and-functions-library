import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/helpers/errorBoundary';

describe('Given a ErrorBoundary', () => {
  const ThrowError: React.FC = () => {
    throw new Error('Test error');
  };

  describe('When no error occurs', () => {
    it('Should render its children', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">No Error</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child').textContent).toBe('No Error');
    });
  });

  describe('When a child throws an error', () => {
    it('Should call onError and render the fallback UI', () => {
      const onError = jest.fn();
      const fallbackRender = (error: Error, info: React.ErrorInfo) => (
        <div data-testid="fallback">{error.message}</div>
      );

      // Suppress error output in test
      jest.spyOn(console, 'error').mockImplementation(() => { });

      render(
        <ErrorBoundary fallbackRender={fallbackRender} onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('fallback').textContent).toBe('Test error');
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );

      (console.error as jest.Mock).mockRestore();
    });
  });
});