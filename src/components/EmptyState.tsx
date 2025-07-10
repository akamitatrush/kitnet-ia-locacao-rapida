import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) => {
  return (
    <Card className={`card-enhanced ${className}`}>
      <CardContent className="pt-8 pb-8 text-center">
        <div className="animate-in space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>
          
          {action && (
            <div className="pt-2">
              <Button 
                onClick={action.onClick}
                className="button-glow hover-lift"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};