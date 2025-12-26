'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive">Oops!</h1>
        <h2 className="mt-4 text-2xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
