import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          
          // Variant styles
          variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
          variant === 'secondary' && 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800',
          variant === 'outline' && 'border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-900 dark:text-gray-100',
          variant === 'ghost' && 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-200 text-gray-900 dark:text-gray-100',
          variant === 'danger' && 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
          
          // Size styles
          size === 'sm' && 'h-9 px-4 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';