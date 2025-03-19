import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface AsyncButtonProps extends ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

export const AsyncButton = React.forwardRef<
  HTMLButtonElement,
  AsyncButtonProps
>(({ onClick, disabled, children, ...props }, ref) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsLoading(true);
      await onClick?.(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      ref={ref}
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="animate-spin mr-2 size-4" />}
      {children}
    </Button>
  );
});

AsyncButton.displayName = 'AsyncButton';
