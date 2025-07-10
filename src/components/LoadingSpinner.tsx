import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-muted rounded', className)} />
);

export const PropertyCardSkeleton = () => (
  <div className="card-enhanced p-0 overflow-hidden">
    <LoadingSkeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-5 w-1/3" />
        <LoadingSkeleton className="h-4 w-1/4" />
      </div>
      <div className="flex gap-2">
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);